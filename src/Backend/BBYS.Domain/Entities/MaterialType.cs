using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class MaterialType : BaseEntity
{
    public string Code { get; set; } = string.Empty; // "150", "255"
    public string Name { get; set; } = string.Empty; // "150 Sarf Malzemesi", "255 Demirbaş"
    public string Description { get; set; } = string.Empty;

    public ICollection<Material> Materials { get; set; } = new List<Material>();
}
