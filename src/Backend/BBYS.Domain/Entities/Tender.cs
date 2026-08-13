using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Tender : BaseEntity
{
    public string TenderNo { get; set; } = string.Empty;

    public int RequestId { get; set; }
    public Request? Request { get; set; }

    public string Title { get; set; } = string.Empty;
    public DateTime TenderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Active"; // Active, Evaluating, Completed, Cancelled

    public int? WinningFirmId { get; set; }
    public Firm? WinningFirm { get; set; }

    public decimal? WinningAmount { get; set; }
    public DateTime? CompletedAt { get; set; }

    public ICollection<FirmOffer> Offers { get; set; } = new List<FirmOffer>();
    public ICollection<ManagementDocument> Documents { get; set; } = new List<ManagementDocument>();
}
