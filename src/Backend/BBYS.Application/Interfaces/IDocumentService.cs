using BBYS.Application.DTOs;

namespace BBYS.Application.Interfaces;

public interface IDocumentService
{
    Task<List<ManagementDocumentDto>> GetDocumentsAsync(int? requestId = null, int? tenderId = null, int? departmentId = null);
    Task<ManagementDocumentDto?> GetByIdAsync(int id);
    Task<ManagementDocumentDto> CreateDocumentAsync(CreateDocumentDto dto, int userId);
}
