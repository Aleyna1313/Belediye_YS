using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Material : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public int MaterialTypeId { get; set; }
    public MaterialType? MaterialType { get; set; }

    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public decimal StockQuantity { get; set; }
    public string Unit { get; set; } = "Adet";
    public decimal UnitPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<RequestItem> RequestItems { get; set; } = new List<RequestItem>();
}
