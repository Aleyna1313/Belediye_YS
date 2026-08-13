using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class MaterialService : IMaterialService
{
    private readonly IUnitOfWork _unitOfWork;

    public MaterialService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<MaterialDto>> GetMaterialsAsync(int? warehouseId = null, int? materialTypeId = null, int? departmentId = null)
    {
        var query = _unitOfWork.Repository<Material>().Query()
            .Include(m => m.MaterialType)
            .Include(m => m.Warehouse)
            .AsQueryable();

        if (warehouseId.HasValue && warehouseId.Value > 0)
        {
            query = query.Where(m => m.WarehouseId == warehouseId.Value);
        }

        if (materialTypeId.HasValue && materialTypeId.Value > 0)
        {
            query = query.Where(m => m.MaterialTypeId == materialTypeId.Value);
        }

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(m => m.Warehouse!.DepartmentId == null || m.Warehouse.DepartmentId == departmentId.Value);
        }

        var materials = await query.ToListAsync();

        return materials.Select(m => new MaterialDto
        {
            Id = m.Id,
            Code = m.Code,
            Name = m.Name,
            MaterialTypeId = m.MaterialTypeId,
            MaterialTypeCode = m.MaterialType?.Code ?? "",
            MaterialTypeName = m.MaterialType?.Name ?? "",
            WarehouseId = m.WarehouseId,
            WarehouseName = m.Warehouse?.Name ?? "",
            StockQuantity = m.StockQuantity,
            Unit = m.Unit,
            UnitPrice = m.UnitPrice,
            CreatedAt = m.CreatedAt
        }).ToList();
    }

    public async Task<MaterialDto?> GetByIdAsync(int id)
    {
        var m = await _unitOfWork.Repository<Material>().Query()
            .Include(mat => mat.MaterialType)
            .Include(mat => mat.Warehouse)
            .FirstOrDefaultAsync(mat => mat.Id == id);

        if (m == null) return null;

        return new MaterialDto
        {
            Id = m.Id,
            Code = m.Code,
            Name = m.Name,
            MaterialTypeId = m.MaterialTypeId,
            MaterialTypeCode = m.MaterialType?.Code ?? "",
            MaterialTypeName = m.MaterialType?.Name ?? "",
            WarehouseId = m.WarehouseId,
            WarehouseName = m.Warehouse?.Name ?? "",
            StockQuantity = m.StockQuantity,
            Unit = m.Unit,
            UnitPrice = m.UnitPrice,
            CreatedAt = m.CreatedAt
        };
    }

    public async Task<MaterialDto> CreateMaterialAsync(CreateMaterialDto dto, int userId)
    {
        var materialType = await _unitOfWork.Repository<MaterialType>().GetByIdAsync(dto.MaterialTypeId);
        if (materialType == null)
            throw new Exception("Geçersiz malzeme türü.");

        var warehouse = await _unitOfWork.Repository<Warehouse>().GetByIdAsync(dto.WarehouseId);
        if (warehouse == null)
            throw new Exception("Geçersiz ambar.");

        var code = string.IsNullOrWhiteSpace(dto.Code) 
            ? $"MAL-{materialType.Code}-" + (new Random().Next(1000, 9999))
            : dto.Code;

        var entity = new Material
        {
            Code = code,
            Name = dto.Name,
            MaterialTypeId = dto.MaterialTypeId,
            WarehouseId = dto.WarehouseId,
            StockQuantity = dto.StockQuantity,
            Unit = dto.Unit,
            UnitPrice = dto.UnitPrice,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<Material>().AddAsync(entity);
        
        // Audit log
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = userId,
            Username = user?.Username ?? "System",
            Action = "CREATE_MATERIAL",
            Module = "Materials",
            Details = $"Yeni malzeme eklendi: {entity.Code} - {entity.Name} ({materialType.Name})",
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync();

        return new MaterialDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            MaterialTypeId = entity.MaterialTypeId,
            MaterialTypeCode = materialType.Code,
            MaterialTypeName = materialType.Name,
            WarehouseId = entity.WarehouseId,
            WarehouseName = warehouse.Name,
            StockQuantity = entity.StockQuantity,
            Unit = entity.Unit,
            UnitPrice = entity.UnitPrice,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<List<WarehouseDto>> GetWarehousesAsync(int? departmentId = null)
    {
        var query = _unitOfWork.Repository<Warehouse>().Query()
            .Include(w => w.Department)
            .AsQueryable();

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(w => w.DepartmentId == null || w.DepartmentId == departmentId.Value);
        }

        var warehouses = await query.ToListAsync();

        return warehouses.Select(w => new WarehouseDto
        {
            Id = w.Id,
            Name = w.Name,
            Location = w.Location,
            DepartmentId = w.DepartmentId,
            DepartmentName = w.Department?.Name
        }).ToList();
    }

    public async Task<List<MaterialTypeDto>> GetMaterialTypesAsync()
    {
        var types = await _unitOfWork.Repository<MaterialType>().GetAllAsync();
        return types.Select(t => new MaterialTypeDto
        {
            Id = t.Id,
            Code = t.Code,
            Name = t.Name,
            Description = t.Description
        }).ToList();
    }
}
