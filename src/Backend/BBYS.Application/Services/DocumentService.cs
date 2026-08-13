using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IUnitOfWork _unitOfWork;

    public DocumentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ManagementDocumentDto>> GetDocumentsAsync(int? requestId = null, int? tenderId = null, int? departmentId = null)
    {
        var query = _unitOfWork.Repository<ManagementDocument>().Query()
            .Include(d => d.Request)
                .ThenInclude(r => r!.Department)
            .Include(d => d.Tender)
            .Include(d => d.CreatedByUser)
            .AsQueryable();

        if (requestId.HasValue && requestId.Value > 0)
        {
            query = query.Where(d => d.RequestId == requestId.Value);
        }

        if (tenderId.HasValue && tenderId.Value > 0)
        {
            query = query.Where(d => d.TenderId == tenderId.Value);
        }

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(d => d.Request != null && d.Request.DepartmentId == departmentId.Value);
        }

        var list = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();

        return list.Select(d => new ManagementDocumentDto
        {
            Id = d.Id,
            DocumentNo = d.DocumentNo,
            DocumentType = d.DocumentType,
            RequestId = d.RequestId,
            RequestNo = d.Request?.RequestNo,
            TenderId = d.TenderId,
            TenderNo = d.Tender?.TenderNo,
            Title = d.Title,
            ContentJson = d.ContentJson,
            CreatedAt = d.CreatedAt,
            CreatedByUserId = d.CreatedByUserId,
            CreatedByUserName = d.CreatedByUser?.FullName ?? "",
            CreatedByUserTitle = d.CreatedByUser?.Title ?? "Şef"
        }).ToList();
    }

    public async Task<ManagementDocumentDto?> GetByIdAsync(int id)
    {
        var d = await _unitOfWork.Repository<ManagementDocument>().Query()
            .Include(doc => doc.Request)
            .Include(doc => doc.Tender)
            .Include(doc => doc.CreatedByUser)
            .FirstOrDefaultAsync(doc => doc.Id == id);

        if (d == null) return null;

        return new ManagementDocumentDto
        {
            Id = d.Id,
            DocumentNo = d.DocumentNo,
            DocumentType = d.DocumentType,
            RequestId = d.RequestId,
            RequestNo = d.Request?.RequestNo,
            TenderId = d.TenderId,
            TenderNo = d.Tender?.TenderNo,
            Title = d.Title,
            ContentJson = d.ContentJson,
            CreatedAt = d.CreatedAt,
            CreatedByUserId = d.CreatedByUserId,
            CreatedByUserName = d.CreatedByUser?.FullName ?? "",
            CreatedByUserTitle = d.CreatedByUser?.Title ?? "Şef"
        };
    }

    public async Task<ManagementDocumentDto> CreateDocumentAsync(CreateDocumentDto dto, int userId)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        var docNo = $"EVR-{dto.DocumentType.ToUpper()}-" + (new Random().Next(1000, 9999));

        var doc = new ManagementDocument
        {
            DocumentNo = docNo,
            DocumentType = dto.DocumentType,
            RequestId = dto.RequestId,
            TenderId = dto.TenderId,
            Title = dto.Title,
            ContentJson = dto.ContentJson,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        await _unitOfWork.Repository<ManagementDocument>().AddAsync(doc);

        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "CREATE_DOCUMENT",
            Module = "ManagementConsole",
            Details = $"Yeni evrak üretildi: {doc.DocumentNo} - {doc.Title}",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        return (await GetByIdAsync(doc.Id))!;
    }
}
