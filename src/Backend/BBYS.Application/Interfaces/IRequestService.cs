using BBYS.Application.DTOs;

namespace BBYS.Application.Interfaces;

public interface IRequestService
{
    Task<List<RequestDto>> GetRequestsAsync(int? departmentId = null, string? status = null);
    Task<RequestDto?> GetByIdAsync(int id);
    Task<RequestDto> CreateRequestAsync(CreateRequestDto dto, int userId, int departmentId);
    Task<bool> UpdateStatusAsync(int id, string status, int userId);
}
