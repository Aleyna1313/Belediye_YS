namespace BBYS.Domain.Enums;

public enum DocumentTypeEnum
{
    TalepYazisi = 1,
    GorevYazisi = 2,
    IhaleOnayBelgesi = 3,
    TeklifMektubu = 4
}

public enum RequestStatusEnum
{
    Draft = 1,
    PendingApproval = 2,
    InProcurement = 3,
    InTender = 4,
    Completed = 5,
    Cancelled = 6
}

public enum TenderStatusEnum
{
    Draft = 1,
    Active = 2,
    Evaluating = 3,
    Completed = 4,
    Cancelled = 5
}
