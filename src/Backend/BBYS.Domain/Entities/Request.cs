using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Request : BaseEntity
{
    public string RequestNo { get; set; } = string.Empty;
    
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string FileCode { get; set; } = string.Empty; // Temin Dosya Kodu
    public string Description { get; set; } = string.Empty; // İşlem Tanımı / Gerekçe
    public string BudgetType { get; set; } = string.Empty; // Bütçe Kalemi

    public string Status { get; set; } = "Draft"; // Draft, PendingApproval, InProcurement, InTender, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<RequestItem> RequestItems { get; set; } = new List<RequestItem>();
    public Tender? Tender { get; set; }
    public ICollection<ManagementDocument> Documents { get; set; } = new List<ManagementDocument>();
}
