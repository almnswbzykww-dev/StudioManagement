using StudioManagement.Domain.Enums;

namespace StudioManagement.Domain.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}

public class User : BaseEntity
{
    public int UserNumber { get; set; } = 1;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public string? DirectPermissionsJson { get; set; }
}

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class Permission : BaseEntity
{
    public string Key { get; set; } = string.Empty; // e.g. "Orders:View", "Orders:Create"
    public string Module { get; set; } = string.Empty; // e.g. "Orders", "Customers"
    public string Description { get; set; } = string.Empty;
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class UserRole
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

public class RolePermission
{
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public int PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class Customer : BaseEntity
{
    public string CustomerNumber { get; set; } = string.Empty; // C-000001
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? SecondaryPhone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty; // ORD-2026-000001
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public ServiceType ServiceType { get; set; }
    public string ServiceTitle { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime OrderDate { get; set; } = DateTime.Now;
    public DateTime DeliveryDate { get; set; }
    public string? DeliveryTime { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public int? AssignedToUserId { get; set; }
    public User? AssignedToUser { get; set; }
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<OrderStatusHistory> StatusHistories { get; set; } = new List<OrderStatusHistory>();
}

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public ServiceType ServiceType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? DetailsJson { get; set; } // Specific options (dimensions, LED, album sheets, etc.)
}

public class OrderStatusHistory : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public OrderStatus OldStatus { get; set; }
    public OrderStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public int ChangedByUserId { get; set; }
    public User ChangedByUser { get; set; } = null!;
}

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    public PaymentMethod Method { get; set; } = PaymentMethod.Cash;
    public WalletType? WalletType { get; set; }
    public string? WalletName { get; set; }
    public string? TransactionNumber { get; set; }
    public string? TransferNumber { get; set; }
    public string? SenderName { get; set; }
    public string? SenderPhone { get; set; }
    public string? Notes { get; set; }
    public int ReceivedByUserId { get; set; }
    public User ReceivedByUser { get; set; } = null!;
}

public class ProductCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product : BaseEntity
{
    public string Code { get; set; } = string.Empty; // PRD-001
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public ProductCategory Category { get; set; } = null!;
    public string Unit { get; set; } = "حبة";
    public int CurrentQuantity { get; set; }
    public int MinimumQuantity { get; set; } = 5;
    public decimal CostPrice { get; set; }
    public decimal SellingPrice { get; set; }
    public string? Location { get; set; }
    public string? SupplierName { get; set; }
    public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
}

public class InventoryTransaction : BaseEntity
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public StockTransactionType Type { get; set; }
    public int Quantity { get; set; }
    public int PreviousQuantity { get; set; }
    public int NewQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public int PerformedByUserId { get; set; }
    public User PerformedByUser { get; set; } = null!;
}

public class Supplier : BaseEntity
{
    public string SupplierNumber { get; set; } = string.Empty; // SUP-001
    public string Name { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal TotalPurchases { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal BalanceDebt { get; set; }
    public string? Notes { get; set; }
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}

public class Purchase : BaseEntity
{
    public string PurchaseNumber { get; set; } = string.Empty; // PUR-2026-000001
    public int SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime PurchaseDate { get; set; } = DateTime.Now;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? InvoiceReference { get; set; }
    public string? Notes { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public ICollection<PurchaseItem> Items { get; set; } = new List<PurchaseItem>();
}

public class PurchaseItem : BaseEntity
{
    public int PurchaseId { get; set; }
    public Purchase Purchase { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class Expense : BaseEntity
{
    public string VoucherNumber { get; set; } = string.Empty; // EXP-2026-000001
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.Now;
    public string Recipient { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public WalletType? WalletType { get; set; }
    public int RecordedByUserId { get; set; }
    public User RecordedByUser { get; set; } = null!;
}

public class Employee : BaseEntity
{
    public string EmpNumber { get; set; } = string.Empty; // EMP-001
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime HireDate { get; set; } = DateTime.Now;
    public decimal BaseSalary { get; set; }
    public decimal InitialDebt { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    public ICollection<SalaryAdvance> SalaryAdvances { get; set; } = new List<SalaryAdvance>();
    public ICollection<EmployeeDeduction> Deductions { get; set; } = new List<EmployeeDeduction>();
    public ICollection<EmployeeDebt> Debts { get; set; } = new List<EmployeeDebt>();
    public ICollection<EmployeePayment> Payments { get; set; } = new List<EmployeePayment>();
}

public class EmployeeDebt : BaseEntity
{
    public string DebtNumber { get; set; } = string.Empty; // DEBT-2026-0001
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.Now;
    public string Reason { get; set; } = string.Empty;
    public bool IsSettled { get; set; } = false;
    public decimal SettledAmount { get; set; } = 0;
    public int RecordedByUserId { get; set; }
    public User RecordedByUser { get; set; } = null!;
    public string? Notes { get; set; }
}

public class EmployeePayment : BaseEntity
{
    public string PaymentNumber { get; set; } = string.Empty; // EPAY-2026-0001
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.Now;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public WalletType? WalletType { get; set; }
    public string Description { get; set; } = string.Empty;
    public int? RelatedDebtId { get; set; }
    public EmployeeDebt? RelatedDebt { get; set; }
    public int RecordedByUserId { get; set; }
    public User RecordedByUser { get; set; } = null!;
    public string? Notes { get; set; }
}

public class SalaryAdvance : BaseEntity
{
    public string AdvanceNumber { get; set; } = string.Empty; // ADV-2026-0001
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime AdvanceDate { get; set; } = DateTime.Now;
    public string MonthTarget { get; set; } = string.Empty; // 2026-10
    public bool IsDeducted { get; set; } = false;
    public int? DeductedFromSalaryId { get; set; }
    public Salary? DeductedFromSalary { get; set; }
    public string? Notes { get; set; }
    public int ApprovedByUserId { get; set; }
    public User ApprovedByUser { get; set; } = null!;
}

public class Salary : BaseEntity
{
    public string PaymentNumber { get; set; } = string.Empty; // SAL-2026-10-001
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public string MonthYear { get; set; } = string.Empty; // 2026-10
    public decimal BaseSalary { get; set; }
    public decimal Allowances { get; set; }
    public decimal Deductions { get; set; }
    public decimal AdvancesDeducted { get; set; }
    public decimal NetSalary { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? Notes { get; set; }
    public int PaidByUserId { get; set; }
    public User PaidByUser { get; set; } = null!;
    public ICollection<SalaryAdvance> DeductedAdvances { get; set; } = new List<SalaryAdvance>();
}

public class StudioSettings : BaseEntity
{
    public string StudioName { get; set; } = "استديو الفن 3";
    public string SystemManagerName { get; set; } = "المهندس زكريا فيصل العزعزي";
    public string Tagline { get; set; } = "لتصوير الفيديو والإعلانات والطباعة الرقمية والحرارية";
    public string Address { get; set; } = "صنعاء - حدة - جولة الرويشان";
    public string Phone { get; set; } = "01-445566";
    public string? SecondaryPhone { get; set; } = "777111222";
    public string Whatsapp { get; set; } = "777000111";
    public string Email { get; set; } = "info@artstudio3.ye";
    public string? Description { get; set; } = "استديو تصوير سينمائي متكامل ومونتاج إعلانات وطباعة حرارية فاخرة";
    public string? CrNumber { get; set; } = "CR-1049284";
    public string Currency { get; set; } = "ر.ي";
    public string? LogoPath { get; set; }
    public string? LogoBase64 { get; set; }
    public string InvoiceTitle { get; set; } = "فاتورة ضريبية / سند تسليم خدمات";
    public string InvoiceSubtitle { get; set; } = "استديو الفن 3 للإنتاج الإعلامي والطباعة";
    public string InvoiceFooterNote { get; set; } = "نشكركم لاختيار استديو الفن 3. نسعد دائماً بتخليد أجمل لحظاتكم.";
    public string ReceiptFooter { get; set; } = "سند رسمي صادر ومعتمد من إدارة استديو الفن 3.";
    public string InvoiceTerms { get; set; } = "1. تسليم الأعمال خلال الموعد.\n2. التعديلات المتاحة مرتين كحد أقصى.\n3. يحفظ الأرشيف 60 يوماً.";
    public string PrintSize { get; set; } = "A4";

    // إعدادات التنبيهات والإشعارات
    public bool EnableOrderNotifications { get; set; } = true;
    public bool EnableDeliveryDeadlineAlerts { get; set; } = true;
    public bool EnablePaymentAlerts { get; set; } = true;
    public bool EnableFinancialAlerts { get; set; } = true;
    public bool EnableBackupAlerts { get; set; } = true;
    public int DaysBeforeDeliveryAlert { get; set; } = 1;
}


public class StudioService : BaseEntity
{
    public ServiceType ServiceType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "Camera";
    public string ImagePath { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal DefaultPrice { get; set; }
}

public class AuditLog : BaseEntity
{
    public string Action { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Metadata { get; set; }
}

public class Voucher : BaseEntity
{
    public string VoucherNumber { get; set; } = string.Empty; // e.g. REC-2026-0001 / PAY-2026-0001
    public VoucherType Type { get; set; } = VoucherType.Receipt;
    public DateTime Date { get; set; } = DateTime.Now;
    public string Time { get; set; } = DateTime.Now.ToString("hh:mm tt");
    public string BeneficiaryOrPayer { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string AmountWords { get; set; } = string.Empty; // التفقيط كتابة
    public string Description { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public WalletType? WalletType { get; set; }
    public string? TransactionReference { get; set; }
    public int? RelatedCustomerId { get; set; }
    public Customer? RelatedCustomer { get; set; }
    public int? RelatedEmployeeId { get; set; }
    public Employee? RelatedEmployee { get; set; }
    public int? RelatedSupplierId { get; set; }
    public Supplier? RelatedSupplier { get; set; }
    public int? RelatedOrderId { get; set; }
    public Order? RelatedOrder { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public string? Notes { get; set; }
}

public class CashboxTransaction : BaseEntity
{
    public string TransactionNumber { get; set; } = string.Empty; // CB-2026-000001
    public DateTime Date { get; set; } = DateTime.Now;
    public string Time { get; set; } = DateTime.Now.ToString("hh:mm tt");
    public CashboxType Type { get; set; } = CashboxType.In; // In / Out
    public string Category { get; set; } = string.Empty; // إيراد طلب، سلفة، راتب، مصروف، عهدة
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public WalletType? WalletType { get; set; }
    public string? Reference { get; set; }
    public decimal BalanceAfter { get; set; }
    public int? VoucherId { get; set; }
    public Voucher? Voucher { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
    public string? Notes { get; set; }
}

public class Account : BaseEntity
{
    public string AccountCode { get; set; } = string.Empty; // 101, 102, 201...
    public string AccountName { get; set; } = string.Empty;
    public AccountCategory Category { get; set; } = AccountCategory.Asset;
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public ICollection<AccountTransaction> Transactions { get; set; } = new List<AccountTransaction>();
}

public class AccountTransaction : BaseEntity
{
    public int AccountId { get; set; }
    public Account Account { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.Now;
    public string Time { get; set; } = DateTime.Now.ToString("hh:mm tt");
    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; } // مدين
    public decimal Credit { get; set; } // دائن
    public decimal BalanceAfter { get; set; }
    public string? ReferenceNumber { get; set; }
}

public class EmployeeDeduction : BaseEntity
{
    public string DeductionNumber { get; set; } = string.Empty; // DED-2026-0001
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.Now;
    public string MonthYear { get; set; } = string.Empty; // 2026-10
    public string Reason { get; set; } = string.Empty;
    public bool IsAppliedToSalary { get; set; } = false;
    public int RecordedByUserId { get; set; }
    public User RecordedByUser { get; set; } = null!;
    public string? Notes { get; set; }
}

public class BackupHistoryRecord : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public DateTime BackupDate { get; set; } = DateTime.Now;
    public long FileSizeBytes { get; set; }
    public string Type { get; set; } = "يدوي"; // يدوي / تلقائي
    public bool IsSuccessful { get; set; } = true;
    public string CreatedByUserName { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class Notification : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.General;
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsArchived { get; set; } = false;
    public int? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; } // "Order", "Customer", "Payment", "Expense", "Employee"
    public string? ActionTarget { get; set; } // "Orders", "Customers", "Accounting", "Employees"
    public int? TargetUserId { get; set; }
}

