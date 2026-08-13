using BBYS.Application.DTOs;

namespace BBYS.Application.Interfaces;

public interface IMaterialService
{
    Task<List<MaterialDto>> GetMaterialsAsync(int? warehouseId = null, int? materialTypeId = null, int? departmentId = null);
    Task<MaterialDto?> GetByIdAsync(int id);
    Task<MaterialDto> CreateMaterialAsync(CreateMaterialDto dto, int userId);
    Task<List<WarehouseDto>> GetWarehousesAsync(int? departmentId = null);
    Task<List<MaterialTypeDto>> GetMaterialTypesAsync();
}
