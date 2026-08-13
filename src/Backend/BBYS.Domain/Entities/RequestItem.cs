using BBYS.Domain.Common;

namespace BBYS.Domain.Entities;

public class RequestItem : BaseEntity
{
    public int RequestId { get; set; }
    public Request? Request { get; set; }

    public int MaterialId { get; set; }
    public Material? Material { get; set; }

    public decimal Quantity { get; set; }
    public decimal EstimatedUnitPrice { get; set; }
    public string Notes { get; set; } = string.Empty;
}
