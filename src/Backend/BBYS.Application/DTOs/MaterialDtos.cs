namespace BBYS.Application.DTOs;

public class MaterialTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // "150", "255"
    public string Name { get; set; } = string.Empty; // "150 Sarf Malzemesi", "255 Demirbaş"
    public string Description { get; set; } = string.Empty;
}

public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
}

public class MaterialDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MaterialTypeId { get; set; }
    public string MaterialTypeCode { get; set; } = string.Empty;
    public string MaterialTypeName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public decimal StockQuantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMaterialDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MaterialTypeId { get; set; }
    public int WarehouseId { get; set; }
    public decimal StockQuantity { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal UnitPrice { get; set; }
}
