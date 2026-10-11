namespace StudioManagement.Domain.Enums;

public enum OrderStatus
{
    Pending,
    InDesign,
    InShooting,
    InPrinting,
    InMontage,
    Ready,
    Delivered,
    Cancelled
}

public enum ServiceType
{
    WeddingBoard,
    WeddingSession,
    StudioPhotos,
    PhotoAlbums,
    Advertising,
    GraphicDesign,
    PassportPhotos,
    PhotoRestoration,
    CanvasPrints,
    VideoMontage,
    OutdoorPhoto,
    ThermalPrint,
    GeneralService
}

public enum PaymentMethod
{
    Cash,
    BankWallet
}

public enum WalletType
{
    Kuraimi,
    Jeeb,
    Jawwali,
    OneCash,
    Floosak,
    Qutaibi,
    Ybk,
    BankTransfer
}

public enum StockTransactionType
{
    In,
    Out,
    Adjust,
    Return
}

public enum VoucherType
{
    Receipt,   // سند قبض
    Payment,   // سند صرف
    Salary,    // سند راتب
    Advance,   // سند سلفة
    Deduction  // سند خصم
}

public enum CashboxType
{
    In,  // توريد / قبض
    Out  // منصرف / صرف
}

public enum AccountCategory
{
    Asset,      // أصول (الصندوق، البنوك، المدينون)
    Liability,  // خصوم (الموردون، الالتزامات)
    Equity,     // حقوق الملكية
    Revenue,    // إيرادات
    Expense     // مصروفات
}

public enum NotificationType
{
    OrderCreated,
    OrderUpdated,
    OrderDeliveryApproaching,
    OrderDeliveryOverdue,
    OrderStatusChanged,
    PaymentReceived,
    RemainingBalanceDue,
    ExpenseAdded,
    RevenueAdded,
    SalaryAdvanceAdded,
    SalaryPaid,
    LowStockAlert,
    BackupFailed,
    SystemError,
    General
}

public enum NotificationPriority
{
    Normal,
    Warning,
    Urgent
}

