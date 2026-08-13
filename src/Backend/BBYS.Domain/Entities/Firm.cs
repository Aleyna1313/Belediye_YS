using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class Firm : BaseEntity
{
    public string TaxNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<FirmOffer> Offers { get; set; } = new List<FirmOffer>();
}
