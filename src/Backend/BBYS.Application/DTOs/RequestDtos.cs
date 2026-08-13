namespace BBYS.Application.DTOs;

public class RequestItemDto
{
    public int Id { get; set; }
    public int RequestId { get; set; }
    public int MaterialId { get; set; }
    public string MaterialCode { get; set; } = string.Empty;
    public string MaterialName { get; set; } = string.Empty;
    public string MaterialTypeName { get; set; } = string.Empty;
    public string MaterialTypeCode { get; set; } = string.Empty; // "150" or "255"
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal EstimatedUnitPrice { get; set; }
    public decimal TotalEstimatedPrice => Quantity * EstimatedUnitPrice;
    public string Notes { get; set; } = string.Empty;
}

public class RequestDto
{
    public int Id { get; set; }
    public string RequestNo { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserTitle { get; set; } = string.Empty; // "Şef" veya "Teminci"
    public string FileCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BudgetType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal TotalEstimatedAmount { get; set; }

    public List<RequestItemDto> Items { get; set; } = new();
    public TenderDto? Tender { get; set; }
}

public class CreateRequestItemDto
{
    public int MaterialId { get; set; }
    public decimal Quantity { get; set; }
    public decimal EstimatedUnitPrice { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class CreateRequestDto
{
    public string FileCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BudgetType { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public List<CreateRequestItemDto> Items { get; set; } = new();
}

public class UpdateRequestStatusDto
{
    public string Status { get; set; } = string.Empty;
}
