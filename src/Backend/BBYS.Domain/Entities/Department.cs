using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
    public ICollection<Request> Requests { get; set; } = new List<Request>();
}
