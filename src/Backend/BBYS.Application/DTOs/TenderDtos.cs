namespace BBYS.Application.DTOs;

public class FirmDto
{
    public int Id { get; set; }
    public string TaxNumber { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class FirmOfferDto
{
    public int Id { get; set; }
    public int TenderId { get; set; }
    public int FirmId { get; set; }
    public string FirmName { get; set; } = string.Empty;
    public string FirmTaxNumber { get; set; } = string.Empty;
    public decimal OfferAmount { get; set; }
    public DateTime OfferDate { get; set; }
    public bool IsWinning { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class TenderDto
{
    public int Id { get; set; }
    public string TenderNo { get; set; } = string.Empty;
    public int RequestId { get; set; }
    public string RequestNo { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime TenderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? WinningFirmId { get; set; }
    public string? WinningFirmName { get; set; }
    public decimal? WinningAmount { get; set; }
    public DateTime? CompletedAt { get; set; }

    public List<FirmOfferDto> Offers { get; set; } = new();
}

public class CreateTenderDto
{
    public int RequestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime TenderDate { get; set; }
}

public class CreateFirmOfferDto
{
    public int TenderId { get; set; }
    public int FirmId { get; set; }
    public decimal OfferAmount { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class CompleteTenderDto
{
    public int WinningFirmOfferId { get; set; }
}

public class OfferComparisonDto
{
    public int TenderId { get; set; }
    public string TenderNo { get; set; } = string.Empty;
    public string RequestNo { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public decimal EstimatedTotalAmount { get; set; }
    public List<FirmOfferDto> Offers { get; set; } = new();
    public int LowestOfferFirmId { get; set; }
    public decimal LowestOfferAmount { get; set; }
}
