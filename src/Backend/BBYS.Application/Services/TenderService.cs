using System.Text.Json;
using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class TenderService : ITenderService
{
    private readonly IUnitOfWork _unitOfWork;

    public TenderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<TenderDto>> GetTendersAsync(int? departmentId = null, string? status = null)
    {
        var query = _unitOfWork.Repository<Tender>().Query()
            .Include(t => t.Request)
                .ThenInclude(r => r!.Department)
            .Include(t => t.WinningFirm)
            .Include(t => t.Offers)
                .ThenInclude(o => o.Firm)
            .AsQueryable();

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(t => t.Request!.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var tenders = await query.OrderByDescending(t => t.TenderDate).ToListAsync();
        return tenders.Select(MapToDto).ToList();
    }

    public async Task<TenderDto?> GetByIdAsync(int id)
    {
        var t = await _unitOfWork.Repository<Tender>().Query()
            .Include(ten => ten.Request)
                .ThenInclude(r => r!.Department)
            .Include(ten => ten.Request)
                .ThenInclude(r => r!.RequestItems)
                    .ThenInclude(ri => ri.Material)
            .Include(ten => ten.WinningFirm)
            .Include(ten => ten.Offers)
                .ThenInclude(o => o.Firm)
            .FirstOrDefaultAsync(ten => ten.Id == id);

        if (t == null) return null;
        return MapToDto(t);
    }

    public async Task<TenderDto> CreateTenderAsync(CreateTenderDto dto, int userId)
    {
        var req = await _unitOfWork.Repository<Request>().Query()
            .Include(r => r.Department)
            .Include(r => r.User)
            .Include(r => r.RequestItems)
                .ThenInclude(ri => ri.Material)
            .FirstOrDefaultAsync(r => r.Id == dto.RequestId);

        if (req == null) throw new Exception("İlişkili talep bulunamadı.");

        var tenderNo = $"IHL-{DateTime.UtcNow.Year}-" + (new Random().Next(1000, 9999));
        var tender = new Tender
        {
            TenderNo = tenderNo,
            RequestId = dto.RequestId,
            Title = string.IsNullOrWhiteSpace(dto.Title) ? $"{req.RequestNo} Nolu Satın Alma İhalesi" : dto.Title,
            TenderDate = dto.TenderDate != default ? dto.TenderDate : DateTime.UtcNow.AddDays(7),
            Status = "Active"
        };

        await _unitOfWork.Repository<Tender>().AddAsync(tender);
        
        // Talep durumunu "InTender" yapalım
        req.Status = "InTender";
        _unitOfWork.Repository<Request>().Update(req);

        await _unitOfWork.SaveChangesAsync();

        // 1. "İhale Onay Belgesi" Otomatik Üretimi
        var onayDocNo = $"EVR-ONAY-{tender.Id:D4}";
        var onayContent = new
        {
            TenderNo = tender.TenderNo,
            RequestNo = req.RequestNo,
            DepartmentName = req.Department?.Name ?? "",
            Title = tender.Title,
            EstimatedBudget = req.RequestItems.Sum(i => i.Quantity * i.EstimatedUnitPrice),
            TenderDate = tender.TenderDate.ToString("dd.MM.yyyy"),
            Date = DateTime.UtcNow.ToString("dd.MM.yyyy"),
            ApproverTitle = "Müdür / İhale Yetkilisi"
        };

        await _unitOfWork.Repository<ManagementDocument>().AddAsync(new ManagementDocument
        {
            DocumentNo = onayDocNo,
            DocumentType = "IhaleOnayBelgesi",
            TenderId = tender.Id,
            RequestId = req.Id,
            Title = $"{tender.TenderNo} Nolu İhale Onay Belgesi",
            ContentJson = JsonSerializer.Serialize(onayContent),
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        });

        // 2. "Teklif Mektubu" Şablon Evrak Üretimi
        var teklifDocNo = $"EVR-TEKLIF-{tender.Id:D4}";
        var teklifContent = new
        {
            TenderNo = tender.TenderNo,
            RequestNo = req.RequestNo,
            DepartmentName = req.Department?.Name ?? "",
            Subject = $"{tender.Title} Fiyat Teklif Cetveli",
            Date = DateTime.UtcNow.ToString("dd.MM.yyyy"),
            Items = req.RequestItems.Select(i => new
            {
                MaterialCode = i.Material?.Code,
                MaterialName = i.Material?.Name,
                Unit = i.Material?.Unit,
                Quantity = i.Quantity
            })
        };

        await _unitOfWork.Repository<ManagementDocument>().AddAsync(new ManagementDocument
        {
            DocumentNo = teklifDocNo,
            DocumentType = "TeklifMektubu",
            TenderId = tender.Id,
            RequestId = req.Id,
            Title = $"{tender.TenderNo} Nolu Resmi Teklif Mektubu Şablonu",
            ContentJson = JsonSerializer.Serialize(teklifContent),
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = userId
        });

        // Audit Log
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "CREATE_TENDER",
            Module = "Tenders",
            Details = $"Yeni ihale başlatıldı: {tender.TenderNo} ({req.RequestNo})",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();
        return (await GetByIdAsync(tender.Id))!;
    }

    public async Task<List<FirmDto>> GetFirmsAsync()
    {
        var firms = await _unitOfWork.Repository<Firm>().GetAllAsync();
        return firms.Select(f => new FirmDto
        {
            Id = f.Id,
            TaxNumber = f.TaxNumber,
            Name = f.Name,
            ContactPerson = f.ContactPerson,
            Phone = f.Phone,
            Email = f.Email,
            Address = f.Address
        }).ToList();
    }

    public async Task<FirmDto> CreateFirmAsync(FirmDto dto)
    {
        var firm = new Firm
        {
            TaxNumber = dto.TaxNumber,
            Name = dto.Name,
            ContactPerson = dto.ContactPerson,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address
        };
        await _unitOfWork.Repository<Firm>().AddAsync(firm);
        await _unitOfWork.SaveChangesAsync();

        return new FirmDto
        {
            Id = firm.Id,
            TaxNumber = firm.TaxNumber,
            Name = firm.Name,
            ContactPerson = firm.ContactPerson,
            Phone = firm.Phone,
            Email = firm.Email,
            Address = firm.Address
        };
    }

    public async Task<FirmOfferDto> AddOfferAsync(CreateFirmOfferDto dto, int userId)
    {
        var tender = await _unitOfWork.Repository<Tender>().GetByIdAsync(dto.TenderId);
        if (tender == null) throw new Exception("İhale bulunamadı.");

        var firm = await _unitOfWork.Repository<Firm>().GetByIdAsync(dto.FirmId);
        if (firm == null) throw new Exception("Firma bulunamadı.");

        var offer = new FirmOffer
        {
            TenderId = dto.TenderId,
            FirmId = dto.FirmId,
            OfferAmount = dto.OfferAmount,
            OfferDate = DateTime.UtcNow,
            Notes = dto.Notes
        };

        await _unitOfWork.Repository<FirmOffer>().AddAsync(offer);

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "SUBMIT_OFFER",
            Module = "Tenders",
            Details = $"{tender.TenderNo} ihaleli için {firm.Name} firmasından {dto.OfferAmount:N2} TL teklif alındı.",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        return new FirmOfferDto
        {
            Id = offer.Id,
            TenderId = offer.TenderId,
            FirmId = offer.FirmId,
            FirmName = firm.Name,
            FirmTaxNumber = firm.TaxNumber,
            OfferAmount = offer.OfferAmount,
            OfferDate = offer.OfferDate,
            IsWinning = offer.IsWinning,
            Notes = offer.Notes
        };
    }

    public async Task<OfferComparisonDto?> GetOfferComparisonAsync(int tenderId)
    {
        var tender = await _unitOfWork.Repository<Tender>().Query()
            .Include(t => t.Request)
                .ThenInclude(r => r!.Department)
            .Include(t => t.Request)
                .ThenInclude(r => r!.RequestItems)
            .Include(t => t.Offers)
                .ThenInclude(o => o.Firm)
            .FirstOrDefaultAsync(t => t.Id == tenderId);

        if (tender == null) return null;

        var offers = tender.Offers.Select(o => new FirmOfferDto
        {
            Id = o.Id,
            TenderId = o.TenderId,
            FirmId = o.FirmId,
            FirmName = o.Firm?.Name ?? "",
            FirmTaxNumber = o.Firm?.TaxNumber ?? "",
            OfferAmount = o.OfferAmount,
            OfferDate = o.OfferDate,
            IsWinning = o.IsWinning,
            Notes = o.Notes
        }).OrderBy(o => o.OfferAmount).ToList();

        var lowestOffer = offers.FirstOrDefault();

        return new OfferComparisonDto
        {
            TenderId = tender.Id,
            TenderNo = tender.TenderNo,
            RequestNo = tender.Request?.RequestNo ?? "",
            DepartmentName = tender.Request?.Department?.Name ?? "",
            EstimatedTotalAmount = tender.Request?.RequestItems.Sum(i => i.Quantity * i.EstimatedUnitPrice) ?? 0,
            Offers = offers,
            LowestOfferFirmId = lowestOffer?.FirmId ?? 0,
            LowestOfferAmount = lowestOffer?.OfferAmount ?? 0
        };
    }

    public async Task<TenderDto> CompleteTenderAsync(int tenderId, CompleteTenderDto dto, int userId)
    {
        var tender = await _unitOfWork.Repository<Tender>().Query()
            .Include(t => t.Offers)
            .Include(t => t.Request)
                .ThenInclude(r => r!.RequestItems)
            .FirstOrDefaultAsync(t => t.Id == tenderId);

        if (tender == null) throw new Exception("İhale bulunamadı.");

        var winningOffer = tender.Offers.FirstOrDefault(o => o.Id == dto.WinningFirmOfferId);
        if (winningOffer == null) throw new Exception("Seçilen teklif bulunamadı.");

        foreach (var offer in tender.Offers)
        {
            offer.IsWinning = (offer.Id == winningOffer.Id);
            _unitOfWork.Repository<FirmOffer>().Update(offer);
        }

        tender.WinningFirmId = winningOffer.FirmId;
        tender.WinningAmount = winningOffer.OfferAmount;
        tender.Status = "Completed";
        tender.CompletedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Tender>().Update(tender);

        if (tender.Request != null)
        {
            tender.Request.Status = "Completed";
            tender.Request.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<Request>().Update(tender.Request);

            // Stok Güncelleme
            foreach (var item in tender.Request.RequestItems)
            {
                var material = await _unitOfWork.Repository<Material>().GetByIdAsync(item.MaterialId);
                if (material != null)
                {
                    material.StockQuantity += item.Quantity; // Temin edilen malzeme stoka eklendi
                    _unitOfWork.Repository<Material>().Update(material);
                }
            }
        }

        var winningFirm = await _unitOfWork.Repository<Firm>().GetByIdAsync(winningOffer.FirmId);
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);

        await _unitOfWork.Repository<Notification>().AddAsync(new Notification
        {
            UserId = userId,
            Title = "İhale Tamamlandı",
            Message = $"{tender.TenderNo} numaralı ihale tamamlanmıştır. Kazanan Firma: {winningFirm?.Name} ({winningOffer.OfferAmount:N2} TL)",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "COMPLETE_TENDER",
            Module = "Tenders",
            Details = $"İhale sonuçlandırıldı: {tender.TenderNo} - Kazanan: {winningFirm?.Name} ({winningOffer.OfferAmount:N2} TL)",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        return (await GetByIdAsync(tenderId))!;
    }

    private static TenderDto MapToDto(Tender t)
    {
        return new TenderDto
        {
            Id = t.Id,
            TenderNo = t.TenderNo,
            RequestId = t.RequestId,
            RequestNo = t.Request?.RequestNo ?? "",
            Title = t.Title,
            TenderDate = t.TenderDate,
            Status = t.Status,
            WinningFirmId = t.WinningFirmId,
            WinningFirmName = t.WinningFirm?.Name,
            WinningAmount = t.WinningAmount,
            CompletedAt = t.CompletedAt,
            Offers = t.Offers.Select(o => new FirmOfferDto
            {
                Id = o.Id,
                TenderId = o.TenderId,
                FirmId = o.FirmId,
                FirmName = o.Firm?.Name ?? "",
                FirmTaxNumber = o.Firm?.TaxNumber ?? "",
                OfferAmount = o.OfferAmount,
                OfferDate = o.OfferDate,
                IsWinning = o.IsWinning,
                Notes = o.Notes
            }).ToList()
        };
    }
}
