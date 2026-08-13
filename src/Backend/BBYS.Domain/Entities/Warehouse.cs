using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Warehouse : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    
    public int? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public ICollection<Material> Materials { get; set; } = new List<Material>();
}
