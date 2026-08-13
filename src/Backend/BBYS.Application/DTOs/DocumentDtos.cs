namespace BBYS.Application.DTOs;

public class ManagementDocumentDto
{
    public int Id { get; set; }
    public string DocumentNo { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty; // TalepYazisi, GorevYazisi, IhaleOnayBelgesi, TeklifMektubu
    public int? RequestId { get; set; }
    public string? RequestNo { get; set; }
    public int? TenderId { get; set; }
    public string? TenderNo { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public string CreatedByUserTitle { get; set; } = string.Empty;
}

public class CreateDocumentDto
{
    public string DocumentType { get; set; } = string.Empty; // TalepYazisi, GorevYazisi, IhaleOnayBelgesi, TeklifMektubu
    public int? RequestId { get; set; }
    public int? TenderId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ContentJson { get; set; } = string.Empty;
}

public class NotificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
