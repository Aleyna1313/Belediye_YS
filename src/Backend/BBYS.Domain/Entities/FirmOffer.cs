using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class FirmOffer : BaseEntity
{
    public int TenderId { get; set; }
    public Tender? Tender { get; set; }

    public int FirmId { get; set; }
    public Firm? Firm { get; set; }

    public decimal OfferAmount { get; set; }
    public DateTime OfferDate { get; set; } = DateTime.UtcNow;
    public bool IsWinning { get; set; } = false;
    public string Notes { get; set; } = string.Empty;
}
