using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Application.DTOs;

public record UserDto(int Id, int UserNumber, string Username, string FullName, string Phone, bool IsActive, string RoleName, List<string> PermissionKeys);
public record LoginRequestDto(string Username, string Password);
public record LoginResponseDto(bool Success, string Message, UserDto? User);

public record CustomerDto(int Id, string CustomerNumber, string Name, string Phone, string? SecondaryPhone, string? Address, string? Notes, int OrdersCount, decimal TotalSpent, decimal TotalPaid, decimal TotalRemaining, DateTime? LastOrderDate);
public record CreateCustomerDto(string Name, string Phone, string? SecondaryPhone, string? Address, string? Notes);
public record UpdateCustomerDto(int Id, string Name, string Phone, string? SecondaryPhone, string? Address, string? Notes);

public record OrderItemDto(int Id, ServiceType ServiceType, string Title, string? Description, int Quantity, decimal UnitPrice, decimal TotalPrice, string? DetailsJson);
public record CreateOrderItemDto(ServiceType ServiceType, string Title, string? Description, int Quantity, decimal UnitPrice, string? DetailsJson);
public record PaymentDto(int Id, int OrderId, string OrderNumber, decimal Amount, DateTime PaymentDate, PaymentMethod Method, WalletType? WalletType, string? WalletName, string? TransactionNumber, string? TransferNumber, string? SenderName, string? SenderPhone, string? Notes, string ReceivedByName);
public record CreatePaymentDto(int OrderId, decimal Amount, PaymentMethod Method, WalletType? WalletType, string? WalletName, string? TransactionNumber, string? TransferNumber, string? SenderName, string? SenderPhone, string? Notes);

public record OrderDto(
    int Id,
    string OrderNumber,
    int CustomerId,
    string CustomerName,
    string CustomerPhone,
    string? CustomerAddress,
    ServiceType ServiceType,
    string ServiceTitle,
    decimal Subtotal,
    decimal Discount,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    OrderStatus Status,
    DateTime OrderDate,
    DateTime DeliveryDate,
    string? DeliveryTime,
    string? Notes,
    string CreatedByName,
    string? AssignedToName,
    List<OrderItemDto> Items,
    List<PaymentDto> Payments
);

public record CreateOrderDto(
    int CustomerId,
    ServiceType ServiceType,
    string ServiceTitle,
    decimal Subtotal,
    decimal Discount,
    DateTime OrderDate,
    DateTime DeliveryDate,
    string? DeliveryTime,
    string? Notes,
    int? AssignedToUserId,
    List<CreateOrderItemDto> Items,
    CreatePaymentDto? InitialPayment
);

public record ProductDto(int Id, string Code, string Name, int CategoryId, string CategoryName, string Unit, int CurrentQuantity, int MinimumQuantity, decimal CostPrice, decimal SellingPrice, string? Location, string? SupplierName);
public record CreateProductDto(string Name, int CategoryId, string Unit, int InitialQuantity, int MinimumQuantity, decimal CostPrice, decimal SellingPrice, string? Location, string? SupplierName);

public record SupplierDto(int Id, string SupplierNumber, string Name, string CompanyName, string Phone, string? Address, string Category, decimal TotalPurchases, decimal TotalPaid, decimal BalanceDebt, string? Notes);
public record CreateSupplierDto(string Name, string CompanyName, string Phone, string? Address, string Category, string? Notes);

public record PurchaseItemDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal TotalPrice);
public record CreatePurchaseDto(int SupplierId, List<PurchaseItemDto> Items, decimal PaidAmount, PaymentMethod Method, string? InvoiceReference, string? Notes);
public record PurchaseDto(int Id, string PurchaseNumber, int SupplierId, string SupplierName, decimal TotalAmount, decimal PaidAmount, decimal RemainingAmount, DateTime PurchaseDate, string? InvoiceReference, string CreatedByName, List<PurchaseItemDto> Items);

public record ExpenseDto(int Id, string VoucherNumber, string Category, decimal Amount, DateTime ExpenseDate, string Recipient, string Description, PaymentMethod PaymentMethod, string RecordedByName);
public record CreateExpenseDto(string Category, decimal Amount, DateTime ExpenseDate, string Recipient, string Description, PaymentMethod PaymentMethod, WalletType? WalletType);

public record EmployeeDto(
    int Id, 
    string EmpNumber, 
    string Name, 
    string Role, 
    string Phone, 
    DateTime HireDate, 
    decimal BaseSalary, 
    bool IsActive, 
    decimal PendingAdvances, 
    decimal TotalDebts, 
    decimal TotalDeductions, 
    decimal NetDueSalary, 
    decimal InitialDebt,
    string? Notes
);
public record CreateEmployeeDto(string Name, string Role, string Phone, DateTime HireDate, decimal BaseSalary, decimal InitialDebt = 0, string? Notes = null, string? CustomEmpNumber = null);
public record SalaryAdvanceDto(int Id, string AdvanceNumber, int EmployeeId, string EmployeeName, decimal Amount, DateTime AdvanceDate, string MonthTarget, bool IsDeducted, string? Notes, string ApprovedByName);
public record CreateSalaryAdvanceDto(int EmployeeId, decimal Amount, DateTime AdvanceDate, string MonthTarget, string? Notes);
public record EmployeeDebtDto(int Id, string DebtNumber, int EmployeeId, string EmployeeName, decimal Amount, DateTime Date, string Reason, bool IsSettled, decimal SettledAmount, string? Notes, string RecordedByName);
public record CreateEmployeeDebtDto(int EmployeeId, decimal Amount, DateTime Date, string Reason, string? Notes);
public record EmployeePaymentDto(int Id, string PaymentNumber, int EmployeeId, string EmployeeName, decimal Amount, DateTime Date, PaymentMethod Method, WalletType? WalletType, string Description, int? RelatedDebtId, string? Notes, string RecordedByName);
public record CreateEmployeePaymentDto(int EmployeeId, decimal Amount, DateTime Date, PaymentMethod Method, WalletType? WalletType, string Description, int? RelatedDebtId, string? Notes)
{
    public PaymentMethod PaymentMethod => Method;
}
public record SalaryDto(int Id, string PaymentNumber, int EmployeeId, string EmployeeName, string MonthYear, decimal BaseSalary, decimal Allowances, decimal Deductions, decimal AdvancesDeducted, decimal NetSalary, DateTime PaymentDate, string PaidByName);
public record ProcessSalaryDto(int EmployeeId, string MonthYear, decimal Allowances, decimal Deductions, DateTime PaymentDate, PaymentMethod Method, string? Notes);

public record StudioSettingsDto(
    string StudioName, 
    string SystemManagerName,
    string Tagline, 
    string Address, 
    string Phone, 
    string? SecondaryPhone, 
    string Whatsapp, 
    string Email, 
    string? Description,
    string? CrNumber, 
    string Currency, 
    string? LogoPath, 
    string? LogoBase64,
    string InvoiceTitle, 
    string InvoiceSubtitle, 
    string InvoiceFooterNote, 
    string ReceiptFooter,
    string InvoiceTerms, 
    string PrintSize
);

public record AuthorizeUserDto(int UserId, string FullName, string RoleName, bool IsActive, List<string> SelectedPermissions);

public record CashierIncomeFilterDto(DateTime? FromDate, DateTime? ToDate, string? FromTime, string? ToTime, int? CashierId);

public record CashierOrderRowDto(
    string OrderNumber,
    string CustomerName,
    string ServiceTitle,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    string PaymentMethodName,
    string? WalletName,
    string DateFormatted,
    string TimeFormatted,
    string CashierName
);

public record CashierIncomeReportDto(
    string CashierName,
    string PeriodFormatted,
    int OrdersCount,
    int InvoicesCount,
    decimal TotalSales,
    decimal TotalCash,
    decimal TotalWallets,
    decimal TotalBank,
    decimal TotalDiscounts,
    decimal TotalReceived,
    decimal TotalRemaining,
    decimal NetIncome,
    List<CashierOrderRowDto> Orders
)
{
    public int TotalOrdersCount => OrdersCount;
};

public record TodayIncomeSummaryDto(
    int TotalOrdersCount,
    int TotalInvoicesCount,
    decimal TotalSales,
    decimal TotalPaid,
    decimal TotalCash,
    decimal TotalBankAndWallets,
    decimal TotalRemaining
);

public record ServiceCardDto(int Id, ServiceType ServiceType, string Name, string Description, string Icon, int DisplayOrder, bool IsActive, decimal DefaultPrice, int OrdersCount, string ImagePath = "");
public record AuditLogDto(int Id, string Action, string Module, string Details, string UserName, DateTime CreatedAt);
public record DashboardStatsDto(int TotalOrdersToday, int InProgressOrdersCount, int ReadyOrdersCount, decimal TotalRemainingDebts, decimal NetCashInTreasury, decimal TotalRevenueToday);

// Detailed Accounting System DTOs
public record VoucherDto(
    int Id,
    string VoucherNumber,
    VoucherType Type,
    string TypeName,
    DateTime Date,
    string Time,
    string BeneficiaryOrPayer,
    decimal Amount,
    string AmountWords,
    string Description,
    PaymentMethod PaymentMethod,
    WalletType? WalletType,
    string? TransactionReference,
    string CreatedByName,
    string? Notes
);

public record CreateVoucherDto(
    VoucherType Type,
    string BeneficiaryOrPayer,
    decimal Amount,
    string Description,
    PaymentMethod PaymentMethod,
    WalletType? WalletType,
    string? TransactionReference,
    int? RelatedCustomerId,
    int? RelatedEmployeeId,
    int? RelatedSupplierId,
    int? RelatedOrderId,
    string? Notes
);

public record CashboxTransactionDto(
    int Id,
    string TransactionNumber,
    DateTime Date,
    string Time,
    CashboxType Type,
    string TypeTitle,
    string Category,
    decimal Amount,
    string Description,
    PaymentMethod PaymentMethod,
    WalletType? WalletType,
    string? Reference,
    decimal BalanceAfter,
    string CreatedByName,
    string? Notes
);

public record CreateCashboxTransactionDto(
    CashboxType Type,
    string Category,
    decimal Amount,
    string Description,
    PaymentMethod PaymentMethod,
    WalletType? WalletType,
    string? Reference,
    string? Notes
);

public record AccountDto(
    int Id,
    string AccountCode,
    string AccountName,
    AccountCategory Category,
    string CategoryName,
    decimal CurrentBalance,
    bool IsActive,
    string? Notes
);

public record AccountStatementRowDto(
    DateTime Date,
    string Time,
    string Description,
    decimal Debit,
    decimal Credit,
    decimal Balance,
    string? ReferenceNumber
);

public record AccountStatementDto(
    string AccountOrEntityName,
    string AccountType,
    DateTime FromDate,
    DateTime ToDate,
    decimal OpeningBalance,
    decimal TotalDebit,
    decimal TotalCredit,
    decimal ClosingBalance,
    List<AccountStatementRowDto> Rows
);

public record EmployeeFinancialSummaryDto(
    int EmployeeId,
    string EmployeeName,
    string Role,
    decimal BaseSalary,
    decimal CurrentSalaryDue,
    decimal TotalAdvances,
    decimal UnpaidAdvances,
    decimal TotalDeductions,
    decimal TotalPaid,
    decimal NetBalanceDue
);

public record EmployeeTransactionRowDto(
    DateTime Date,
    string Time,
    string OperationType,
    string Description,
    decimal Amount,
    decimal Debit,
    decimal Credit,
    decimal RunningBalance,
    string CreatedByName
);

public record EmployeeDeductionDto(
    int Id,
    string DeductionNumber,
    int EmployeeId,
    string EmployeeName,
    decimal Amount,
    DateTime Date,
    string MonthYear,
    string Reason,
    bool IsAppliedToSalary,
    string RecordedByName,
    string? Notes
);

public record CreateEmployeeDeductionDto(
    int EmployeeId,
    decimal Amount,
    DateTime Date,
    string MonthYear,
    string Reason,
    string? Notes
);

public record ProcessPartialSalaryDto(
    int EmployeeId,
    string MonthYear,
    decimal AmountPaid,
    PaymentMethod Method,
    WalletType? WalletType,
    string? TransactionRef,
    string? Notes
);

public record BackupHistoryDto(
    int Id,
    string FileName,
    string FilePath,
    DateTime BackupDate,
    long FileSizeBytes,
    string FileSizeFormatted,
    string Type,
    bool IsSuccessful,
    string CreatedByUserName,
    string? Notes
);

public record AccountingDashboardStatsDto(
    decimal CurrentCashboxBalance,
    decimal TodayRevenues,
    decimal MonthRevenues,
    decimal TodayExpenses,
    decimal MonthExpenses,
    decimal NetIncomeMonth,
    decimal TotalCustomerDebts,
    decimal TotalEmployeeSalariesDue,
    decimal TotalPendingAdvances,
    decimal TotalSupplierDebts,
    int TodayTransactionsCount,
    List<CashboxTransactionDto> RecentTransactions,
    List<ExpenseDto> RecentExpenses,
    List<PaymentDto> RecentIncomes,
    List<string> FinancialAlerts
);

public record NotificationDto(
    int Id,
    string Title,
    string Message,
    NotificationType Type,
    NotificationPriority Priority,
    DateTime CreatedAt,
    bool IsRead,
    DateTime? ReadAt,
    bool IsArchived,
    int? RelatedEntityId,
    string? RelatedEntityType,
    string? ActionTarget
)
{
    public string CreatedAtFormatted => CreatedAt.ToString("yyyy/MM/dd hh:mm tt");
    public string PriorityColor => Priority switch
    {
        NotificationPriority.Urgent => "#EF4444",
        NotificationPriority.Warning => "#F59E0B",
        _ => "#3B82F6"
    };
    public string TypeIcon => Type switch
    {
        NotificationType.OrderCreated => "📦",
        NotificationType.OrderDeliveryApproaching => "⏳",
        NotificationType.OrderDeliveryOverdue => "🚨",
        NotificationType.OrderStatusChanged => "🔄",
        NotificationType.PaymentReceived => "💰",
        NotificationType.RemainingBalanceDue => "⚠️",
        NotificationType.ExpenseAdded => "💸",
        NotificationType.RevenueAdded => "📥",
        NotificationType.SalaryAdvanceAdded => "💼",
        NotificationType.SalaryPaid => "💵",
        NotificationType.BackupFailed => "❌",
        _ => "🔔"
    };
}

public record CreateNotificationDto(
    string Title,
    string Message,
    NotificationType Type,
    NotificationPriority Priority = NotificationPriority.Normal,
    int? RelatedEntityId = null,
    string? RelatedEntityType = null,
    string? ActionTarget = null,
    int? TargetUserId = null
);

public record NotificationSettingsDto(
    bool EnableOrderNotifications,
    bool EnableDeliveryDeadlineAlerts,
    bool EnablePaymentAlerts,
    bool EnableFinancialAlerts,
    bool EnableBackupAlerts,
    int DaysBeforeDeliveryAlert
);

public record PrintDocumentData(
    string DocumentTypeTitle,
    string DocumentNumber,
    DateTime Date,
    string Time,
    string DayName,
    string StudioName,
    string StudioAddress,
    string StudioPhone,
    string? LogoPath,
    string RecipientName,
    string RecipientPhone,
    string? RecipientAddress,
    List<PrintItemRow> Items,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal RemainingAmount,
    string PaymentMethodDisplay,
    string? ReferenceNumber,
    string Currency,
    string? Notes,
    string? Terms,
    string CreatedByName,
    int CopiesCount,
    string PaperSize,
    DateTime? DeliveryDate = null,
    string? DeliveryTime = null
);

public record PrintItemRow(
    int Index,
    string Description,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);

