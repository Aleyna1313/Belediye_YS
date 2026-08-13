using BBYS.Application.DTOs;

namespace BBYS.Application.Interfaces;

public interface ITenderService
{
    Task<List<TenderDto>> GetTendersAsync(int? departmentId = null, string? status = null);
    Task<TenderDto?> GetByIdAsync(int id);
    Task<TenderDto> CreateTenderAsync(CreateTenderDto dto, int userId);
    Task<List<FirmDto>> GetFirmsAsync();
    Task<FirmDto> CreateFirmAsync(FirmDto dto);
    Task<FirmOfferDto> AddOfferAsync(CreateFirmOfferDto dto, int userId);
    Task<OfferComparisonDto?> GetOfferComparisonAsync(int tenderId);
    Task<TenderDto> CompleteTenderAsync(int tenderId, CompleteTenderDto dto, int userId);
}
