using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class ManagementDocument : BaseEntity
{
    public string DocumentNo { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty; // TalepYazisi, GorevYazisi, IhaleOnayBelgesi, TeklifMektubu
    
    public int? RequestId { get; set; }
    public Request? Request { get; set; }

    public int? TenderId { get; set; }
    public Tender? Tender { get; set; }

    public string Title { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }
}
