#!/usr/bin/env python3
"""
StudioManagement C# .NET WPF Solution Generator
Builds the complete 5-project enterprise solution with clean architecture:
- StudioManagement.sln
- StudioManagement.Domain
- StudioManagement.Application
- StudioManagement.Infrastructure
- StudioManagement.Reports
- StudioManagement.WPF
- installer
"""

import os
import sys

def write_file(path, content):
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Created: {path}")

# ==============================================================================
# 1. Solution File
# ==============================================================================
sln_content = """
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.10.35013.160
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "StudioManagement.Domain", "StudioManagement.Domain\\StudioManagement.Domain.csproj", "{A1000000-0000-0000-0000-000000000001}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "StudioManagement.Application", "StudioManagement.Application\\StudioManagement.Application.csproj", "{A1000000-0000-0000-0000-000000000002}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "StudioManagement.Infrastructure", "StudioManagement.Infrastructure\\StudioManagement.Infrastructure.csproj", "{A1000000-0000-0000-0000-000000000003}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "StudioManagement.Reports", "StudioManagement.Reports\\StudioManagement.Reports.csproj", "{A1000000-0000-0000-0000-000000000005}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "StudioManagement.WPF", "StudioManagement.WPF\\StudioManagement.WPF.csproj", "{A1000000-0000-0000-0000-000000000004}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{A1000000-0000-0000-0000-000000000001}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000001}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000001}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A1000000-0000-0000-0000-000000000001}.Release|Any CPU.Build.0 = Release|Any CPU
		{A1000000-0000-0000-0000-000000000002}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000002}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000002}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A1000000-0000-0000-0000-000000000002}.Release|Any CPU.Build.0 = Release|Any CPU
		{A1000000-0000-0000-0000-000000000003}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000003}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000003}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A1000000-0000-0000-0000-000000000003}.Release|Any CPU.Build.0 = Release|Any CPU
		{A1000000-0000-0000-0000-000000000005}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000005}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000005}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A1000000-0000-0000-0000-000000000005}.Release|Any CPU.Build.0 = Release|Any CPU
		{A1000000-0000-0000-0000-000000000004}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000004}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{A1000000-0000-0000-0000-000000000004}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{A1000000-0000-0000-0000-000000000004}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
	GlobalSection(SolutionProperties) = preSolution
		HideSolutionNode = FALSE
	EndGlobalSection
EndGlobal
"""
write_file("StudioManagement.sln", sln_content)

# ==============================================================================
# 2. StudioManagement.Domain Project
# ==============================================================================
domain_csproj = """
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
"""
write_file("StudioManagement.Domain/StudioManagement.Domain.csproj", domain_csproj)

domain_enums = """
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
    StudioPhotos,
    Advertising,
    GraphicDesign,
    PhotoAlbums,
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
    Floosak
}

public enum StockTransactionType
{
    In,
    Out,
    Adjust,
    Return
}
"""
write_file("StudioManagement.Domain/Enums/Enums.cs", domain_enums)

domain_entities = """
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
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
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
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    public ICollection<SalaryAdvance> SalaryAdvances { get; set; } = new List<SalaryAdvance>();
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
    public string StudioName { get; set; } = "استديو الأضواء الملكية";
    public string Tagline { get; set; } = "فنون التصوير والطباعة الرقمية والحرارية";
    public string Address { get; set; } = "صنعاء - حدة - جولة الرويشان";
    public string Phone { get; set; } = "01-445566";
    public string? SecondaryPhone { get; set; }
    public string Whatsapp { get; set; } = "777000111";
    public string Email { get; set; } = "info@royal-studio.ye";
    public string? CrNumber { get; set; }
    public string Currency { get; set; } = "ر.ي";
    public string? LogoPath { get; set; }
    public string InvoiceTitle { get; set; } = "فاتورة ضريبية / سند تسليم خدمات";
    public string InvoiceSubtitle { get; set; } = "استديو الأضواء الملكية للخدمات الفنية والطباعة";
    public string InvoiceFooterNote { get; set; } = "نشكركم لاختيار استديو الأضواء الملكية.";
    public string InvoiceTerms { get; set; } = "1. تسليم الأعمال خلال الموعد.\\n2. التعديلات المتاحة مرتين كحد أقصى.";
    public string PrintSize { get; set; } = "A4";
}

public class StudioService : BaseEntity
{
    public ServiceType ServiceType { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "Camera";
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
"""
write_file("StudioManagement.Domain/Entities/Entities.cs", domain_entities)

print("Domain project generated successfully.")
