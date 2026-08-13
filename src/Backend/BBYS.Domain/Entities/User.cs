using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
    
    // Görev / Unvan: Yalnızca "Şef" veya "Teminci"
    public string Title { get; set; } = "Şef"; 
    public string Role { get; set; } = "User"; // "Admin" / "User"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigations
    public ICollection<Request> Requests { get; set; } = new List<Request>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
