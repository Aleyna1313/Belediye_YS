using System.Text.Json;
using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class RequestService : IRequestService
{
    private readonly IUnitOfWork _unitOfWork;

    public RequestService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<RequestDto>> GetRequestsAsync(int? departmentId = null, string? status = null)
    {
        var query = _unitOfWork.Repository<Request>().Query()
            .Include(r => r.Department)
            .Include(r => r.User)
            .Include(r => r.RequestItems)
                .ThenInclude(ri => ri.Material)
                    .ThenInclude(m => m!.MaterialType)
            .Include(r => r.Tender)
            .AsQueryable();

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(r => r.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

        return requests.Select(MapToDto).ToList();
    }

    public async Task<RequestDto?> GetByIdAsync(int id)
    {
        var r = await _unitOfWork.Repository<Request>().Query()
            .Include(req => req.Department)
            .Include(req => req.User)
            .Include(req => req.RequestItems)
                .ThenInclude(ri => ri.Material)
                    .ThenInclude(m => m!.MaterialType)
            .Include(req => req.Tender)
                .ThenInclude(t => t!.Offers)
                    .ThenInclude(o => o.Firm)
            .FirstOrDefaultAsync(req => req.Id == id);

        if (r == null) return null;

        return MapToDto(r);
    }

    public async Task<RequestDto> CreateRequestAsync(CreateRequestDto dto, int userId, int departmentId)
    {
        var user = await _unitOfWork.Repository<User>().Query()
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new Exception("Kullanıcı bulunamadı.");

        var requestNo = $"TAL-{DateTime.UtcNow.Year}-" + (new Random().Next(1000, 9999));
        var fileCode = string.IsNullOrWhiteSpace(dto.FileCode) ? $"DOSYA-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}" : dto.FileCode;

        var request = new Request
        {
            RequestNo = requestNo,
            DepartmentId = departmentId,
            UserId = userId,
            FileCode = fileCode,
            Description = dto.Description,
            BudgetType = dto.BudgetType,
            Status = "PendingApproval",
            CreatedAt = DateTime.UtcNow
        };

        foreach (var itemDto in dto.Items)
        {
            var mat = await _unitOfWork.Repository<Material>().GetByIdAsync(itemDto.MaterialId);
            request.RequestItems.Add(new RequestItem
            {
                MaterialId = itemDto.MaterialId,
                Quantity = itemDto.Quantity,
                EstimatedUnitPrice = itemDto.EstimatedUnitPrice > 0 ? itemDto.EstimatedUnitPrice : (mat?.UnitPrice ?? 0),
                Notes = itemDto.Notes
            });
        }

        await _unitOfWork.Repository<Request>().AddAsync(request);
        await _unitOfWork.SaveChangesAsync();

        // 1. Otomatik "Talep Yazısı" Evrak Üretimi (Yönetim Konsolu için)
        var docNo = $"EVR-TALEP-{request.Id:D4}";
        var docContent = new
        {
            RequestNo = request.RequestNo,
            DepartmentName = user.Department?.Name ?? "",
            UserName = user.FullName,
            UserTitle = user.Title,
            FileCode = request.FileCode,
            Description = request.Description,
            BudgetType = request.BudgetType,
            Date = DateTime.UtcNow.ToString("dd.MM.yyyy"),
            Items = request.RequestItems.Select(i => new
            {
                MaterialName = i.Material?.Name ?? "",
                Quantity = i.Quantity,
                UnitPrice = i.EstimatedUnitPrice,
                TotalPrice = i.Quantity * i.EstimatedUnitPrice
            })
        };

        var doc = new ManagementDocument
        {
            DocumentNo = docNo,
            DocumentType = "TalepYazisi",
            RequestId = request.Id,
            Title = $"{request.RequestNo} Nolu Satın Alma Talep Yazısı",
            ContentJson = JsonSerializer.Serialize(docContent),
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };
        await _unitOfWork.Repository<ManagementDocument>().AddAsync(doc);

        // 2. Gerekli durumlarda "Görev Yazısı" üretimi
        var gorevDocNo = $"EVR-GOREV-{request.Id:D4}";
        var gorevDocContent = new
        {
            RequestNo = request.RequestNo,
            DepartmentName = user.Department?.Name ?? "",
            AssignedUser = user.FullName,
            AssignedUserTitle = user.Title, // "Şef" veya "Teminci"
            Subject = $"{request.RequestNo} Nolu İhtiyaç Malzemelerinin Temini Görevlendirmesi",
            Date = DateTime.UtcNow.ToString("dd.MM.yyyy")
        };
        await _unitOfWork.Repository<ManagementDocument>().AddAsync(new ManagementDocument
        {
            DocumentNo = gorevDocNo,
            DocumentType = "GorevYazisi",
            RequestId = request.Id,
            Title = $"{request.RequestNo} Nolu Piyasa Fiyat Araştırması Görev Yazısı",
            ContentJson = JsonSerializer.Serialize(gorevDocContent),
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        });

        // 3. Bildirim ve AuditLog
        await _unitOfWork.Repository<Notification>().AddAsync(new Notification
        {
            UserId = userId,
            Title = "Yeni Talep Oluşturuldu",
            Message = $"{request.RequestNo} numaralı satın alma talebiniz başarıyla oluşturulmuştur.",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user.Username,
            Action = "CREATE_REQUEST",
            Module = "Requests",
            Details = $"Yeni talep oluşturuldu: {request.RequestNo} - {user.Department?.Name}",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        return (await GetByIdAsync(request.Id))!;
    }

    public async Task<bool> UpdateStatusAsync(int id, string status, int userId)
    {
        var req = await _unitOfWork.Repository<Request>().GetByIdAsync(id);
        if (req == null) return false;

        req.Status = status;
        req.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Request>().Update(req);

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "UPDATE_REQUEST_STATUS",
            Module = "Requests",
            Details = $"Talep durumu güncellendi: {req.RequestNo} -> {status}",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    private static RequestDto MapToDto(Request r)
    {
        return new RequestDto
        {
            Id = r.Id,
            RequestNo = r.RequestNo,
            DepartmentId = r.DepartmentId,
            DepartmentName = r.Department?.Name ?? "",
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "",
            UserTitle = r.User?.Title ?? "Şef",
            FileCode = r.FileCode,
            Description = r.Description,
            BudgetType = r.BudgetType,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt,
            TotalEstimatedAmount = r.RequestItems.Sum(i => i.Quantity * i.EstimatedUnitPrice),
            Items = r.RequestItems.Select(i => new RequestItemDto
            {
                Id = i.Id,
                RequestId = i.RequestId,
                MaterialId = i.MaterialId,
                MaterialCode = i.Material?.Code ?? "",
                MaterialName = i.Material?.Name ?? "",
                MaterialTypeName = i.Material?.MaterialType?.Name ?? "",
                MaterialTypeCode = i.Material?.MaterialType?.Code ?? "",
                Unit = i.Material?.Unit ?? "Adet",
                Quantity = i.Quantity,
                EstimatedUnitPrice = i.EstimatedUnitPrice,
                Notes = i.Notes
            }).ToList(),
            Tender = r.Tender != null ? new TenderDto
            {
                Id = r.Tender.Id,
                TenderNo = r.Tender.TenderNo,
                RequestId = r.Tender.RequestId,
                Title = r.Tender.Title,
                TenderDate = r.Tender.TenderDate,
                Status = r.Tender.Status,
                WinningFirmId = r.Tender.WinningFirmId,
                WinningFirmName = r.Tender.WinningFirm?.Name,
                WinningAmount = r.Tender.WinningAmount,
                CompletedAt = r.Tender.CompletedAt
            } : null
        };
    }
}
