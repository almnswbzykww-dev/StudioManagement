#!/usr/bin/env python3
import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Generated: {path}")

# ==============================================================================
# StudioManagement.Application
# ==============================================================================
app_csproj = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\StudioManagement.Domain\\StudioManagement.Domain.csproj" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="FluentValidation" Version="11.11.0" />
  </ItemGroup>
</Project>
"""
write("StudioManagement.Application/StudioManagement.Application.csproj", app_csproj)

app_dtos = """using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Application.DTOs;

public record UserDto(int Id, string Username, string FullName, string Phone, bool IsActive, string RoleName, List<string> PermissionKeys);
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

public record EmployeeDto(int Id, string EmpNumber, string Name, string Role, string Phone, DateTime HireDate, decimal BaseSalary, bool IsActive, decimal PendingAdvances, string? Notes);
public record CreateEmployeeDto(string Name, string Role, string Phone, DateTime HireDate, decimal BaseSalary, string? Notes);
public record SalaryAdvanceDto(int Id, string AdvanceNumber, int EmployeeId, string EmployeeName, decimal Amount, DateTime AdvanceDate, string MonthTarget, bool IsDeducted, string? Notes, string ApprovedByName);
public record CreateSalaryAdvanceDto(int EmployeeId, decimal Amount, DateTime AdvanceDate, string MonthTarget, string? Notes);
public record SalaryDto(int Id, string PaymentNumber, int EmployeeId, string EmployeeName, string MonthYear, decimal BaseSalary, decimal Allowances, decimal Deductions, decimal AdvancesDeducted, decimal NetSalary, DateTime PaymentDate, string PaidByName);
public record ProcessSalaryDto(int EmployeeId, string MonthYear, decimal Allowances, decimal Deductions, DateTime PaymentDate, PaymentMethod Method, string? Notes);

public record StudioSettingsDto(string StudioName, string Tagline, string Address, string Phone, string? SecondaryPhone, string Whatsapp, string Email, string? CrNumber, string Currency, string? LogoPath, string InvoiceTitle, string InvoiceSubtitle, string InvoiceFooterNote, string InvoiceTerms, string PrintSize);
public record ServiceCardDto(int Id, ServiceType ServiceType, string Name, string Description, string Icon, int DisplayOrder, bool IsActive, decimal DefaultPrice, int OrdersCount);
public record AuditLogDto(int Id, string Action, string Module, string Details, string UserName, DateTime CreatedAt);
public record DashboardStatsDto(int TotalOrdersToday, int InProgressOrdersCount, int ReadyOrdersCount, decimal TotalRemainingDebts, decimal NetCashInTreasury, decimal TotalRevenueToday);
"""
write("StudioManagement.Application/DTOs/DTOs.cs", app_dtos)

app_interfaces = """using StudioManagement.Application.DTOs;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Application.Interfaces;

public interface ICurrentUserService
{
    UserDto? CurrentUser { get; set; }
    bool IsAuthenticated => CurrentUser != null;
    bool HasPermission(string permissionKey);
}

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(string username, string password);
    Task<List<UserDto>> GetActiveUsersForLoginAsync();
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}

public interface ICustomerService
{
    Task<List<CustomerDto>> GetAllAsync(string? search = null);
    Task<CustomerDto?> GetByIdAsync(int id);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
    Task<CustomerDto> UpdateAsync(UpdateCustomerDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<CustomerDto>> AutoCompleteAsync(string query);
}

public interface IOrderService
{
    Task<List<OrderDto>> GetAllAsync(ServiceType? serviceType = null, OrderStatus? status = null, string? search = null);
    Task<OrderDto?> GetByIdAsync(int id);
    Task<OrderDto> CreateOrderAsync(CreateOrderDto dto);
    Task<bool> UpdateStatusAsync(int orderId, OrderStatus newStatus, string? notes = null);
    Task<PaymentDto> AddPaymentAsync(CreatePaymentDto dto);
    Task<bool> DeleteAsync(int id);
    Task<List<OrderDto>> SearchInvoicesAsync(string? customerQuery, DateTime? fromDate, DateTime? toDate);
}

public interface INumberGeneratorService
{
    Task<string> NextCustomerNumberAsync();
    Task<string> NextOrderNumberAsync();
    Task<string> NextVoucherNumberAsync();
    Task<string> NextPurchaseNumberAsync();
    Task<string> NextAdvanceNumberAsync();
    Task<string> NextSalaryNumberAsync(string monthYear);
}

public interface IInventoryService
{
    Task<List<ProductDto>> GetAllProductsAsync(string? search = null);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto);
    Task<bool> RecordStockTransactionAsync(int productId, StockTransactionType type, int quantity, decimal unitPrice, string? reason);
    Task<List<ProductDto>> GetLowStockProductsAsync();
}

public interface IPurchaseService
{
    Task<List<PurchaseDto>> GetAllPurchasesAsync();
    Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto);
}

public interface IExpenseService
{
    Task<List<ExpenseDto>> GetAllExpensesAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto);
    Task<bool> DeleteAsync(int id);
}

public interface IAccountingService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<decimal> GetTreasuryBalanceAsync();
    Task<List<PaymentDto>> SearchVouchersAsync(DateTime? fromDate, DateTime? toDate, string? search);
}

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllEmployeesAsync();
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);
    Task<List<SalaryAdvanceDto>> GetAdvancesAsync(int? employeeId = null);
    Task<SalaryAdvanceDto> CreateAdvanceAsync(CreateSalaryAdvanceDto dto);
}

public interface IPayrollService
{
    Task<List<SalaryDto>> GetSalariesAsync(string? monthYear = null);
    Task<SalaryDto> ProcessSalaryAsync(ProcessSalaryDto dto);
}

public interface IStudioSettingsService
{
    Task<StudioSettingsDto> GetSettingsAsync();
    Task UpdateSettingsAsync(StudioSettingsDto dto);
}

public interface IServiceCardService
{
    Task<List<ServiceCardDto>> GetAllCardsAsync();
    Task<bool> ToggleActiveAsync(int id);
    Task UpdateCardAsync(int id, string name, string description, decimal defaultPrice, int displayOrder);
}

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetLogsAsync(int take = 200, string? search = null);
    Task LogAsync(string action, string module, string details, string? metadata = null);
}

public interface IBackupService
{
    Task<string> CreateBackupAsync(string destinationPath);
    Task<bool> RestoreBackupAsync(string backupFilePath);
}

public interface IInvoiceHtmlBuilder
{
    Task<string> BuildInvoiceHtmlAsync(int orderId);
}

public interface IReportHtmlBuilder
{
    Task<string> BuildSalesReportHtmlAsync(DateTime fromDate, DateTime toDate);
    Task<string> BuildProfitLossHtmlAsync(DateTime fromDate, DateTime toDate);
    Task<string> BuildCustomerDebtsHtmlAsync();
    Task<string> BuildInventoryReportHtmlAsync();
}

public interface IExcelExportService
{
    Task<byte[]> ExportToExcelAsync<T>(IEnumerable<T> data, string sheetName);
}
"""
write("StudioManagement.Application/Interfaces/Interfaces.cs", app_interfaces)

# ==============================================================================
# StudioManagement.Infrastructure
# ==============================================================================
infra_csproj = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\StudioManagement.Domain\\StudioManagement.Domain.csproj" />
    <ProjectReference Include="..\\StudioManagement.Application\\StudioManagement.Application.csproj" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.8">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.Data.SqlClient" Version="5.2.2" />
    <PackageReference Include="FluentValidation" Version="11.11.0" />
  </ItemGroup>
</Project>
"""
write("StudioManagement.Infrastructure/StudioManagement.Infrastructure.csproj", infra_csproj)

infra_dbcontext = """using Microsoft.EntityFrameworkCore;
using StudioManagement.Domain.Entities;

namespace StudioManagement.Infrastructure.Data;

public class StudioDbContext : DbContext
{
    public StudioDbContext(DbContextOptions<StudioDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<SalaryAdvance> SalaryAdvances => Set<SalaryAdvance>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<StudioSettings> StudioSettings => Set<StudioSettings>();
    public DbSet<StudioService> StudioServices => Set<StudioService>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StudioDbContext).Assembly);
    }
}
"""
write("StudioManagement.Infrastructure/Data/StudioDbContext.cs", infra_dbcontext)

infra_configs = """using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudioManagement.Domain.Entities;

namespace StudioManagement.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Username).HasMaxLength(50).IsRequired();
        builder.HasIndex(u => u.Username).IsUnique();
        builder.Property(u => u.FullName).HasMaxLength(100).IsRequired();
    }
}

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
        builder.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        builder.HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);
    }
}

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });
        builder.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
        builder.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
    }
}

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.CustomerNumber).HasMaxLength(20).IsRequired();
        builder.HasIndex(c => c.CustomerNumber).IsUnique();
        builder.Property(c => c.Name).HasMaxLength(150).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(30).IsRequired();
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).HasMaxLength(30).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Discount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.PaidAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.RemainingAmount).HasColumnType("decimal(18,2)");

        builder.HasOne(o => o.Customer).WithMany(c => c.Orders).HasForeignKey(o => o.CustomerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.CreatedByUser).WithMany().HasForeignKey(o => o.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(o => o.AssignedToUser).WithMany().HasForeignKey(o => o.AssignedToUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(oi => oi.TotalPrice).HasColumnType("decimal(18,2)");
        builder.HasOne(oi => oi.Order).WithMany(o => o.Items).HasForeignKey(oi => oi.OrderId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)");
        builder.HasOne(p => p.Order).WithMany(o => o.Payments).HasForeignKey(p => p.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(p => p.ReceivedByUser).WithMany().HasForeignKey(p => p.ReceivedByUserId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class SalaryConfiguration : IEntityTypeConfiguration<Salary>
{
    public void Configure(EntityTypeBuilder<Salary> builder)
    {
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => new { s.EmployeeId, s.MonthYear }).IsUnique();
        builder.Property(s => s.BaseSalary).HasColumnType("decimal(18,2)");
        builder.Property(s => s.NetSalary).HasColumnType("decimal(18,2)");
        builder.HasOne(s => s.Employee).WithMany(e => e.Salaries).HasForeignKey(s => s.EmployeeId).OnDelete(DeleteBehavior.Restrict);
    }
}
"""
write("StudioManagement.Infrastructure/Data/Configurations/Configurations.cs", infra_configs)

infra_initializer = """using Microsoft.EntityFrameworkCore;
using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(StudioDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync())
        {
            var adminRole = new Role { Name = "مدير النظام", Description = "صلاحيات إدارية وفنية ومالية كاملة" };
            var cashierRole = new Role { Name = "كاشير ومبيعات", Description = "إدخال العملاء، الطلبات، والتحصيل المالي" };
            context.Roles.AddRange(adminRole, cashierRole);
            await context.SaveChangesAsync();

            var adminUser = new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                FullName = "المهندس زكريا فيصل العزعزي",
                Phone = "777000111",
                IsActive = true
            };

            var cashierUser = new User
            {
                Username = "cashier",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                FullName = "أحمد عبد الله المحمدي",
                Phone = "777111222",
                IsActive = true
            };

            context.Users.AddRange(adminUser, cashierUser);
            await context.SaveChangesAsync();

            context.UserRoles.AddRange(
                new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id },
                new UserRole { UserId = cashierUser.Id, RoleId = cashierRole.Id }
            );

            // Seed Studio Settings
            context.StudioSettings.Add(new StudioSettings());

            // Seed Default Product Category
            var cat = new ProductCategory { Name = "عام", Description = "خامات ومستلزمات استديو عامة" };
            context.ProductCategories.Add(cat);
            await context.SaveChangesAsync();

            // Seed Default Products
            context.Products.AddRange(
                new Product { Code = "PRD-001", Name = "ورق كوداك فوتوغرافي لماع A4", CategoryId = cat.Id, CurrentQuantity = 50, MinimumQuantity = 10, CostPrice = 6500, SellingPrice = 12000, Unit = "باكت" },
                new Product { Code = "PRD-002", Name = "طقم أحبار كانون وإبسون 6 ألوان", CategoryId = cat.Id, CurrentQuantity = 8, MinimumQuantity = 3, CostPrice = 42000, SellingPrice = 70000, Unit = "طقم" },
                new Product { Code = "PRD-003", Name = "ألواح أكريليك شفاف 80×120 سم", CategoryId = cat.Id, CurrentQuantity = 15, MinimumQuantity = 5, CostPrice = 18000, SellingPrice = 35000, Unit = "لوح" },
                new Product { Code = "PRD-004", Name = "أكواب سحرية سبلميشن", CategoryId = cat.Id, CurrentQuantity = 24, MinimumQuantity = 6, CostPrice = 1200, SellingPrice = 3000, Unit = "حبة" }
            );

            // Seed Default Services
            var services = new List<StudioService>
            {
                new() { ServiceType = ServiceType.WeddingBoard, Name = "لوحات العرسان الفاخرة", Description = "تصميم وطباعة اللوحات الملكية الكبيرة بإطارات خشبية وإضاءة LED", Icon = "HeartHandshake", DisplayOrder = 1, DefaultPrice = 95000 },
                new() { ServiceType = ServiceType.StudioPhotos, Name = "الصور وجلسات الاستديو", Description = "جلسات بورتريه شخصية، عائلية، تخرج، وصور رسمية", Icon = "Camera", DisplayOrder = 2, DefaultPrice = 45000 },
                new() { ServiceType = ServiceType.Advertising, Name = "الدعاية والإعلان والبنرات", Description = "طباعة بنرات فليكس، فينيل، ستيكرات، ورول اب", Icon = "Megaphone", DisplayOrder = 3, DefaultPrice = 75000 },
                new() { ServiceType = ServiceType.GraphicDesign, Name = "التصميمات والشعارات", Description = "هويات تجارية، كروت، بروشورات، وبطاقات دعوات رقمية", Icon = "Palette", DisplayOrder = 4, DefaultPrice = 35000 },
                new() { ServiceType = ServiceType.PhotoAlbums, Name = "ألبومات الصور الفاخرة", Description = "ألبومات زفاف ديجيتال حرارية جلد إيطالي وأكريليك", Icon = "BookOpen", DisplayOrder = 5, DefaultPrice = 120000 },
                new() { ServiceType = ServiceType.VideoMontage, Name = "الفيديو والمونتاج", Description = "تصوير سينمائي 4K، تصوير درون جوي ومونتاج تيزرات", Icon = "Film", DisplayOrder = 6, DefaultPrice = 150000 },
                new() { ServiceType = ServiceType.OutdoorPhoto, Name = "التصوير الخارجي والمناسبات", Description = "جلسات تصوير في حدائق ومنتجعات وتغطية الأفراح", Icon = "Image", DisplayOrder = 7, DefaultPrice = 85000 },
                new() { ServiceType = ServiceType.ThermalPrint, Name = "الطباعة الحرارية والهدايا", Description = "طباعة سبلميشن للتيشيرتات والأكواب والدروع التذكارية", Icon = "Flame", DisplayOrder = 8, DefaultPrice = 25000 }
            };
            context.StudioServices.AddRange(services);

            // Seed Initial Customer
            var cust = new Customer
            {
                CustomerNumber = "C-000001",
                Name = "عمار ياسين الشميري",
                Phone = "771234567",
                Address = "صنعاء - حي الأصبحي",
                Notes = "عميل مميز - حفل زفاف"
            };
            context.Customers.Add(cust);
            await context.SaveChangesAsync();

            // Seed Initial Order
            var order = new Order
            {
                OrderNumber = "ORD-2026-000001",
                CustomerId = cust.Id,
                ServiceType = ServiceType.WeddingBoard,
                ServiceTitle = "لوحات العرسان الفاخرة",
                Subtotal = 110000,
                Discount = 5000,
                TotalAmount = 105000,
                PaidAmount = 70000,
                RemainingAmount = 35000,
                Status = OrderStatus.InPrinting,
                OrderDate = DateTime.Now.AddDays(-5),
                DeliveryDate = DateTime.Now.AddDays(3),
                DeliveryTime = "06:00 م",
                CreatedByUserId = adminUser.Id,
                Notes = "لوحة ملكية 80×120 سم مع إضاءة دافئة LED"
            };
            order.Items.Add(new OrderItem
            {
                ServiceType = ServiceType.WeddingBoard,
                Title = "لوحة عرسان ملكية فاخرة مقاس 80×120 سم إضاءة LED",
                Quantity = 1,
                UnitPrice = 110000,
                TotalPrice = 110000
            });
            order.Payments.Add(new Payment
            {
                Amount = 70000,
                Method = PaymentMethod.BankWallet,
                WalletType = WalletType.Kuraimi,
                WalletName = "كريمي / إم فلوس",
                TransactionNumber = "TX-9988231",
                ReceivedByUserId = cashierUser.Id,
                Notes = "دفعة أولى عند توقيع الطلب"
            });
            context.Orders.Add(order);

            await context.SaveChangesAsync();
        }
    }
}
"""
write("StudioManagement.Infrastructure/Data/DbInitializer.cs", infra_initializer)

infra_services = """using Microsoft.EntityFrameworkCore;
using StudioManagement.Application.DTOs;
using StudioManagement.Application.Interfaces;
using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;
using StudioManagement.Infrastructure.Data;

namespace StudioManagement.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    public UserDto? CurrentUser { get; set; }

    public bool HasPermission(string permissionKey)
    {
        if (CurrentUser == null) return false;
        if (CurrentUser.RoleName == "مدير النظام" || CurrentUser.PermissionKeys.Contains("all")) return true;
        return CurrentUser.PermissionKeys.Contains(permissionKey);
    }
}

public class AuthService : IAuthService
{
    private readonly StudioDbContext _db;
    public AuthService(StudioDbContext db) => _db = db;

    public async Task<LoginResponseDto> LoginAsync(string username, string password)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Username == username && u.IsActive && !u.IsDeleted);

        if (user == null)
            return new LoginResponseDto(false, "اسم المستخدم غير موجود أو الحساب معطل.", null);

        bool valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!valid)
            return new LoginResponseDto(false, "كلمة المرور غير صحيحة.", null);

        user.LastLoginAt = DateTime.Now;
        await _db.SaveChangesAsync();

        var role = user.UserRoles.FirstOrDefault()?.Role;
        var roleName = role?.Name ?? "مستخدم";
        var perms = role?.RolePermissions.Select(rp => rp.Permission.Key).ToList() ?? new List<string>();

        var dto = new UserDto(user.Id, user.Username, user.FullName, user.Phone, user.IsActive, roleName, perms);
        return new LoginResponseDto(true, "تم تسجيل الدخول بنجاح.", dto);
    }

    public async Task<List<UserDto>> GetActiveUsersForLoginAsync()
    {
        return await _db.Users
            .Where(u => u.IsActive && !u.IsDeleted)
            .Select(u => new UserDto(
                u.Id,
                u.Username,
                u.FullName,
                u.Phone,
                u.IsActive,
                u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "مستخدم",
                new List<string>()
            ))
            .ToListAsync();
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        return true;
    }
}

public class NumberGeneratorService : INumberGeneratorService
{
    private readonly StudioDbContext _db;
    public NumberGeneratorService(StudioDbContext db) => _db = db;

    public async Task<string> NextCustomerNumberAsync()
    {
        int count = await _db.Customers.CountAsync();
        return $"C-{(count + 1):D6}";
    }

    public async Task<string> NextOrderNumberAsync()
    {
        int count = await _db.Orders.CountAsync();
        return $"ORD-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextVoucherNumberAsync()
    {
        int count = await _db.Expenses.CountAsync();
        return $"EXP-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextPurchaseNumberAsync()
    {
        int count = await _db.Purchases.CountAsync();
        return $"PUR-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextAdvanceNumberAsync()
    {
        int count = await _db.SalaryAdvances.CountAsync();
        return $"ADV-{DateTime.Now.Year}-{(count + 1):D4}";
    }

    public async Task<string> NextSalaryNumberAsync(string monthYear)
    {
        int count = await _db.Salaries.Where(s => s.MonthYear == monthYear).CountAsync();
        return $"SAL-{monthYear}-{(count + 1):D3}";
    }
}

public class CustomerService : ICustomerService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly IAuditLogService _audit;

    public CustomerService(StudioDbContext db, INumberGeneratorService numGen, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _audit = audit;
    }

    public async Task<List<CustomerDto>> GetAllAsync(string? search = null)
    {
        var q = _db.Customers.Include(c => c.Orders).Where(c => !c.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(c => c.Name.ToLower().Contains(search) || c.Phone.Contains(search) || c.CustomerNumber.ToLower().Contains(search));
        }

        var list = await q.OrderByDescending(c => c.Id).ToListAsync();
        return list.Select(c =>
        {
            var activeOrders = c.Orders.Where(o => !o.IsDeleted).ToList();
            var totalSpent = activeOrders.Sum(o => o.TotalAmount);
            var totalPaid = activeOrders.Sum(o => o.PaidAmount);
            var lastOrder = activeOrders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate;

            return new CustomerDto(
                c.Id,
                c.CustomerNumber,
                c.Name,
                c.Phone,
                c.SecondaryPhone,
                c.Address,
                c.Notes,
                activeOrders.Count,
                totalSpent,
                totalPaid,
                Math.Max(0, totalSpent - totalPaid),
                lastOrder
            );
        }).ToList();
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var c = await _db.Customers.Include(x => x.Orders).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (c == null) return null;

        var activeOrders = c.Orders.Where(o => !o.IsDeleted).ToList();
        var totalSpent = activeOrders.Sum(o => o.TotalAmount);
        var totalPaid = activeOrders.Sum(o => o.PaidAmount);

        return new CustomerDto(
            c.Id,
            c.CustomerNumber,
            c.Name,
            c.Phone,
            c.SecondaryPhone,
            c.Address,
            c.Notes,
            activeOrders.Count,
            totalSpent,
            totalPaid,
            Math.Max(0, totalSpent - totalPaid),
            activeOrders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate
        );
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        string num = await _numGen.NextCustomerNumberAsync();
        var cust = new Customer
        {
            CustomerNumber = num,
            Name = dto.Name,
            Phone = dto.Phone,
            SecondaryPhone = dto.SecondaryPhone,
            Address = dto.Address,
            Notes = dto.Notes
        };
        _db.Customers.Add(cust);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إضافة عميل", "العملاء", $"تم إضافة العميل {cust.Name} برقم {cust.CustomerNumber}");
        return new CustomerDto(cust.Id, cust.CustomerNumber, cust.Name, cust.Phone, cust.SecondaryPhone, cust.Address, cust.Notes, 0, 0, 0, 0, null);
    }

    public async Task<CustomerDto> UpdateAsync(UpdateCustomerDto dto)
    {
        var cust = await _db.Customers.Include(c => c.Orders).FirstOrDefaultAsync(c => c.Id == dto.Id);
        if (cust == null) throw new InvalidOperationException("العميل غير موجود");

        cust.Name = dto.Name;
        cust.Phone = dto.Phone;
        cust.SecondaryPhone = dto.SecondaryPhone;
        cust.Address = dto.Address;
        cust.Notes = dto.Notes;
        cust.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("تعديل عميل", "العملاء", $"تم تعديل العميل {cust.Name}");

        var activeOrders = cust.Orders.Where(o => !o.IsDeleted).ToList();
        var totalSpent = activeOrders.Sum(o => o.TotalAmount);
        var totalPaid = activeOrders.Sum(o => o.PaidAmount);

        return new CustomerDto(cust.Id, cust.CustomerNumber, cust.Name, cust.Phone, cust.SecondaryPhone, cust.Address, cust.Notes, activeOrders.Count, totalSpent, totalPaid, Math.Max(0, totalSpent - totalPaid), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cust = await _db.Customers.FindAsync(id);
        if (cust == null) return false;
        cust.IsDeleted = true;
        cust.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف عميل", "العملاء", $"تم حذف العميل {cust.Name}");
        return true;
    }

    public async Task<List<CustomerDto>> AutoCompleteAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<CustomerDto>();
        query = query.Trim().ToLower();

        return await _db.Customers
            .Where(c => !c.IsDeleted && (c.Name.ToLower().Contains(query) || c.Phone.Contains(query) || c.CustomerNumber.ToLower().Contains(query)))
            .Take(15)
            .Select(c => new CustomerDto(c.Id, c.CustomerNumber, c.Name, c.Phone, c.SecondaryPhone, c.Address, c.Notes, 0, 0, 0, 0, null))
            .ToListAsync();
    }
}

public class OrderService : IOrderService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public OrderService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<OrderDto>> GetAllAsync(ServiceType? serviceType = null, OrderStatus? status = null, string? search = null)
    {
        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.CreatedByUser)
            .Include(o => o.AssignedToUser)
            .Include(o => o.Items)
            .Include(o => o.Payments).ThenInclude(p => p.ReceivedByUser)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (serviceType.HasValue) q = q.Where(o => o.ServiceType == serviceType.Value);
        if (status.HasValue) q = q.Where(o => o.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(o => o.OrderNumber.ToLower().Contains(search) || o.Customer.Name.ToLower().Contains(search) || o.Customer.Phone.Contains(search));
        }

        var orders = await q.OrderByDescending(o => o.Id).ToListAsync();
        return orders.Select(MapOrder).ToList();
    }

    public async Task<OrderDto?> GetByIdAsync(int id)
    {
        var o = await _db.Orders
            .Include(x => x.Customer)
            .Include(x => x.CreatedByUser)
            .Include(x => x.AssignedToUser)
            .Include(x => x.Items)
            .Include(x => x.Payments).ThenInclude(p => p.ReceivedByUser)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        return o == null ? null : MapOrder(o);
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
    {
        string num = await _numGen.NextOrderNumberAsync();
        decimal total = Math.Max(0, dto.Subtotal - dto.Discount);
        decimal paid = dto.InitialPayment?.Amount ?? 0;
        decimal remaining = Math.Max(0, total - paid);

        var order = new Order
        {
            OrderNumber = num,
            CustomerId = dto.CustomerId,
            ServiceType = dto.ServiceType,
            ServiceTitle = dto.ServiceTitle,
            Subtotal = dto.Subtotal,
            Discount = dto.Discount,
            TotalAmount = total,
            PaidAmount = paid,
            RemainingAmount = remaining,
            Status = OrderStatus.Pending,
            OrderDate = dto.OrderDate,
            DeliveryDate = dto.DeliveryDate,
            DeliveryTime = dto.DeliveryTime,
            Notes = dto.Notes,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            AssignedToUserId = dto.AssignedToUserId
        };

        foreach (var itm in dto.Items)
        {
            order.Items.Add(new OrderItem
            {
                ServiceType = itm.ServiceType,
                Title = itm.Title,
                Description = itm.Description,
                Quantity = itm.Quantity,
                UnitPrice = itm.UnitPrice,
                TotalPrice = itm.Quantity * itm.UnitPrice,
                DetailsJson = itm.DetailsJson
            });
        }

        if (dto.InitialPayment != null && dto.InitialPayment.Amount > 0)
        {
            order.Payments.Add(new Payment
            {
                Amount = dto.InitialPayment.Amount,
                Method = dto.InitialPayment.Method,
                WalletType = dto.InitialPayment.WalletType,
                WalletName = dto.InitialPayment.WalletName,
                TransactionNumber = dto.InitialPayment.TransactionNumber,
                TransferNumber = dto.InitialPayment.TransferNumber,
                SenderName = dto.InitialPayment.SenderName,
                SenderPhone = dto.InitialPayment.SenderPhone,
                Notes = dto.InitialPayment.Notes,
                ReceivedByUserId = _currentUser.CurrentUser?.Id ?? 1
            });
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إنشاء طلب", order.ServiceTitle, $"تم إنشاء الطلب {order.OrderNumber} بمبلغ {order.TotalAmount}");
        return (await GetByIdAsync(order.Id))!;
    }

    public async Task<bool> UpdateStatusAsync(int orderId, OrderStatus newStatus, string? notes = null)
    {
        var o = await _db.Orders.FindAsync(orderId);
        if (o == null) return false;

        var old = o.Status;
        o.Status = newStatus;
        o.UpdatedAt = DateTime.Now;

        _db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = o.Id,
            OldStatus = old,
            NewStatus = newStatus,
            Notes = notes,
            ChangedByUserId = _currentUser.CurrentUser?.Id ?? 1
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("تغيير حالة طلب", o.ServiceTitle, $"تم تغيير حالة {o.OrderNumber} من {old} إلى {newStatus}");
        return true;
    }

    public async Task<PaymentDto> AddPaymentAsync(CreatePaymentDto dto)
    {
        var o = await _db.Orders.Include(x => x.Payments).FirstOrDefaultAsync(x => x.Id == dto.OrderId);
        if (o == null) throw new InvalidOperationException("الطلب غير موجود");

        var payment = new Payment
        {
            OrderId = o.Id,
            Amount = dto.Amount,
            PaymentDate = DateTime.Now,
            Method = dto.Method,
            WalletType = dto.WalletType,
            WalletName = dto.WalletName,
            TransactionNumber = dto.TransactionNumber,
            TransferNumber = dto.TransferNumber,
            SenderName = dto.SenderName,
            SenderPhone = dto.SenderPhone,
            Notes = dto.Notes,
            ReceivedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        o.Payments.Add(payment);
        o.PaidAmount = o.Payments.Sum(p => p.Amount);
        o.RemainingAmount = Math.Max(0, o.TotalAmount - o.PaidAmount);
        o.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("سداد دفعة", "المدفوعات", $"تم تحصيل دفعة بقيمة {payment.Amount} للطلب {o.OrderNumber}");

        var user = await _db.Users.FindAsync(payment.ReceivedByUserId);
        return new PaymentDto(payment.Id, o.Id, o.OrderNumber, payment.Amount, payment.PaymentDate, payment.Method, payment.WalletType, payment.WalletName, payment.TransactionNumber, payment.TransferNumber, payment.SenderName, payment.SenderPhone, payment.Notes, user?.FullName ?? "");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var o = await _db.Orders.FindAsync(id);
        if (o == null) return false;
        o.IsDeleted = true;
        o.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف طلب", o.ServiceTitle, $"تم حذف الطلب {o.OrderNumber}");
        return true;
    }

    public async Task<List<OrderDto>> SearchInvoicesAsync(string? customerQuery, DateTime? fromDate, DateTime? toDate)
    {
        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Items)
            .Include(o => o.Payments).ThenInclude(p => p.ReceivedByUser)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(customerQuery))
        {
            customerQuery = customerQuery.Trim().ToLower();
            q = q.Where(o => o.Customer.Name.ToLower().Contains(customerQuery) || o.OrderNumber.ToLower().Contains(customerQuery));
        }

        if (fromDate.HasValue) q = q.Where(o => o.OrderDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(o => o.OrderDate <= toDate.Value);

        var list = await q.OrderByDescending(o => o.Id).ToListAsync();
        return list.Select(MapOrder).ToList();
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CustomerId,
        o.Customer.Name,
        o.Customer.Phone,
        o.Customer.Address,
        o.ServiceType,
        o.ServiceTitle,
        o.Subtotal,
        o.Discount,
        o.TotalAmount,
        o.PaidAmount,
        o.RemainingAmount,
        o.Status,
        o.OrderDate,
        o.DeliveryDate,
        o.DeliveryTime,
        o.Notes,
        o.CreatedByUser.FullName,
        o.AssignedToUser?.FullName,
        o.Items.Select(i => new OrderItemDto(i.Id, i.ServiceType, i.Title, i.Description, i.Quantity, i.UnitPrice, i.TotalPrice, i.DetailsJson)).ToList(),
        o.Payments.Select(p => new PaymentDto(p.Id, o.Id, o.OrderNumber, p.Amount, p.PaymentDate, p.Method, p.WalletType, p.WalletName, p.TransactionNumber, p.TransferNumber, p.SenderName, p.SenderPhone, p.Notes, p.ReceivedByUser.FullName)).ToList()
    );
}

public class InventoryService : IInventoryService
{
    private readonly StudioDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public InventoryService(StudioDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<List<ProductDto>> GetAllProductsAsync(string? search = null)
    {
        var q = _db.Products.Include(p => p.Category).Where(p => !p.IsDeleted).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(search) || p.Code.ToLower().Contains(search) || p.Category.Name.ToLower().Contains(search));
        }

        return await q.Select(p => new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, p.Category.Name, p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName)).ToListAsync();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        int count = await _db.Products.CountAsync();
        var p = new Product
        {
            Code = $"PRD-{(count + 1):D3}",
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            Unit = dto.Unit,
            CurrentQuantity = dto.InitialQuantity,
            MinimumQuantity = dto.MinimumQuantity,
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            Location = dto.Location,
            SupplierName = dto.SupplierName
        };

        _db.Products.Add(p);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إضافة صنف مخزون", "المخزون", $"تم إضافة الصنف {p.Name} بكود {p.Code}");
        var cat = await _db.ProductCategories.FindAsync(p.CategoryId);
        return new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, cat?.Name ?? "", p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName);
    }

    public async Task<bool> RecordStockTransactionAsync(int productId, StockTransactionType type, int quantity, decimal unitPrice, string? reason)
    {
        var p = await _db.Products.FindAsync(productId);
        if (p == null) return false;

        int prev = p.CurrentQuantity;
        int next = type == StockTransactionType.In ? prev + quantity : Math.Max(0, prev - quantity);
        p.CurrentQuantity = next;
        p.UpdatedAt = DateTime.Now;

        _db.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductId = p.Id,
            Type = type,
            Quantity = quantity,
            PreviousQuantity = prev,
            NewQuantity = next,
            UnitPrice = unitPrice,
            Notes = reason,
            PerformedByUserId = _currentUser.CurrentUser?.Id ?? 1
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("حركة مخزون", "المخزون", $"تعديل كمية {p.Name} من {prev} إلى {next} ({reason})");
        return true;
    }

    public async Task<List<ProductDto>> GetLowStockProductsAsync()
    {
        return await _db.Products
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted && p.CurrentQuantity <= p.MinimumQuantity)
            .Select(p => new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, p.Category.Name, p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName))
            .ToListAsync();
    }
}

public class PurchaseService : IPurchaseService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public PurchaseService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<PurchaseDto>> GetAllPurchasesAsync()
    {
        return await _db.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.CreatedByUser)
            .Include(p => p.Items).ThenInclude(i => i.Product)
            .OrderByDescending(p => p.Id)
            .Select(p => new PurchaseDto(
                p.Id,
                p.PurchaseNumber,
                p.SupplierId,
                $"{p.Supplier.Name} - {p.Supplier.CompanyName}",
                p.TotalAmount,
                p.PaidAmount,
                p.RemainingAmount,
                p.PurchaseDate,
                p.InvoiceReference,
                p.CreatedByUser.FullName,
                p.Items.Select(i => new PurchaseItemDto(i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList()
            ))
            .ToListAsync();
    }

    public async Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto)
    {
        var supplier = await _db.Suppliers.FindAsync(dto.SupplierId);
        if (supplier == null) throw new InvalidOperationException("المورد غير موجود");

        string num = await _numGen.NextPurchaseNumberAsync();
        decimal total = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
        decimal rem = Math.Max(0, total - dto.PaidAmount);

        var pur = new Purchase
        {
            PurchaseNumber = num,
            SupplierId = supplier.Id,
            TotalAmount = total,
            PaidAmount = dto.PaidAmount,
            RemainingAmount = rem,
            PurchaseDate = DateTime.Now,
            PaymentMethod = dto.Method,
            InvoiceReference = dto.InvoiceReference,
            Notes = dto.Notes,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        foreach (var itm in dto.Items)
        {
            pur.Items.Add(new PurchaseItem
            {
                ProductId = itm.ProductId,
                Quantity = itm.Quantity,
                UnitPrice = itm.UnitPrice,
                TotalPrice = itm.Quantity * itm.UnitPrice
            });

            // Increment stock
            var prod = await _db.Products.FindAsync(itm.ProductId);
            if (prod != null)
            {
                prod.CurrentQuantity += itm.Quantity;
                prod.CostPrice = itm.UnitPrice;
                prod.UpdatedAt = DateTime.Now;
            }
        }

        supplier.TotalPurchases += total;
        supplier.TotalPaid += dto.PaidAmount;
        supplier.BalanceDebt += rem;

        _db.Purchases.Add(pur);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("فاتورة مشتريات", "الموردون", $"شراء خامات بقيمة {pur.TotalAmount} من المورد {supplier.CompanyName}");
        return (await GetAllPurchasesAsync()).First(p => p.Id == pur.Id);
    }
}

public class ExpenseService : IExpenseService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public ExpenseService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<ExpenseDto>> GetAllExpensesAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var q = _db.Expenses.Include(e => e.RecordedByUser).Where(e => !e.IsDeleted).AsQueryable();
        if (fromDate.HasValue) q = q.Where(e => e.ExpenseDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(e => e.ExpenseDate <= toDate.Value);

        return await q.OrderByDescending(e => e.Id)
            .Select(e => new ExpenseDto(e.Id, e.VoucherNumber, e.Category, e.Amount, e.ExpenseDate, e.Recipient, e.Description, e.PaymentMethod, e.RecordedByUser.FullName))
            .ToListAsync();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
    {
        string num = await _numGen.NextVoucherNumberAsync();
        var exp = new Expense
        {
            VoucherNumber = num,
            Category = dto.Category,
            Amount = dto.Amount,
            ExpenseDate = dto.ExpenseDate,
            Recipient = dto.Recipient,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        _db.Expenses.Add(exp);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("سند صرف", "المحاسبة", $"صرف مبلغ {exp.Amount} للمستلم {exp.Recipient} بند ({exp.Category})");
        var user = await _db.Users.FindAsync(exp.RecordedByUserId);
        return new ExpenseDto(exp.Id, exp.VoucherNumber, exp.Category, exp.Amount, exp.ExpenseDate, exp.Recipient, exp.Description, exp.PaymentMethod, user?.FullName ?? "");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var exp = await _db.Expenses.FindAsync(id);
        if (exp == null) return false;
        exp.IsDeleted = true;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف سند صرف", "المحاسبة", $"حذف سند الصرف {exp.VoucherNumber}");
        return true;
    }
}

public class AccountingService : IAccountingService
{
    private readonly StudioDbContext _db;
    public AccountingService(StudioDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.Today;
        var orders = await _db.Orders.Where(o => !o.IsDeleted).ToListAsync();
        var expenses = await _db.Expenses.Where(e => !e.IsDeleted).ToListAsync();
        var payments = await _db.Payments.Where(p => !p.IsDeleted).ToListAsync();

        int todayOrders = orders.Count(o => o.OrderDate.Date == today);
        int inProgress = orders.Count(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Ready);
        int ready = orders.Count(o => o.Status == OrderStatus.Ready);
        decimal remainingDebt = orders.Sum(o => o.RemainingAmount);

        decimal totalIn = payments.Sum(p => p.Amount);
        decimal totalOut = expenses.Sum(e => e.Amount);
        decimal netCash = totalIn - totalOut;

        decimal todayRevenue = payments.Where(p => p.PaymentDate.Date == today).Sum(p => p.Amount);

        return new DashboardStatsDto(todayOrders, inProgress, ready, remainingDebt, netCash, todayRevenue);
    }

    public async Task<decimal> GetTreasuryBalanceAsync()
    {
        decimal totalIn = await _db.Payments.Where(p => !p.IsDeleted).SumAsync(p => p.Amount);
        decimal totalOut = await _db.Expenses.Where(e => !e.IsDeleted).SumAsync(e => e.Amount);
        return totalIn - totalOut;
    }

    public async Task<List<PaymentDto>> SearchVouchersAsync(DateTime? fromDate, DateTime? toDate, string? search)
    {
        var q = _db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .Include(p => p.ReceivedByUser)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (fromDate.HasValue) q = q.Where(p => p.PaymentDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(p => p.PaymentDate <= toDate.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(p => p.Order.OrderNumber.ToLower().Contains(search) || p.Order.Customer.Name.ToLower().Contains(search));
        }

        return await q.OrderByDescending(p => p.Id)
            .Select(p => new PaymentDto(p.Id, p.OrderId, p.Order.OrderNumber, p.Amount, p.PaymentDate, p.Method, p.WalletType, p.WalletName, p.TransactionNumber, p.TransferNumber, p.SenderName, p.SenderPhone, p.Notes, p.ReceivedByUser.FullName))
            .ToListAsync();
    }
}

public class EmployeeService : IEmployeeService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public EmployeeService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<EmployeeDto>> GetAllEmployeesAsync()
    {
        var emps = await _db.Employees.Include(e => e.SalaryAdvances).Where(e => !e.IsDeleted).ToListAsync();
        return emps.Select(e =>
        {
            decimal pending = e.SalaryAdvances.Where(a => !a.IsDeducted).Sum(a => a.Amount);
            return new EmployeeDto(e.Id, e.EmpNumber, e.Name, e.Role, e.Phone, e.HireDate, e.BaseSalary, e.IsActive, pending, e.Notes);
        }).ToList();
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        int count = await _db.Employees.CountAsync();
        var emp = new Employee
        {
            EmpNumber = $"EMP-{(count + 1):D3}",
            Name = dto.Name,
            Role = dto.Role,
            Phone = dto.Phone,
            HireDate = dto.HireDate,
            BaseSalary = dto.BaseSalary,
            Notes = dto.Notes
        };
        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إضافة موظف", "الموظفون", $"تم إضافة الموظف {emp.Name}");
        return new EmployeeDto(emp.Id, emp.EmpNumber, emp.Name, emp.Role, emp.Phone, emp.HireDate, emp.BaseSalary, emp.IsActive, 0, emp.Notes);
    }

    public async Task<List<SalaryAdvanceDto>> GetAdvancesAsync(int? employeeId = null)
    {
        var q = _db.SalaryAdvances.Include(a => a.Employee).Include(a => a.ApprovedByUser).AsQueryable();
        if (employeeId.HasValue) q = q.Where(a => a.EmployeeId == employeeId.Value);

        return await q.OrderByDescending(a => a.Id)
            .Select(a => new SalaryAdvanceDto(a.Id, a.AdvanceNumber, a.EmployeeId, a.Employee.Name, a.Amount, a.AdvanceDate, a.MonthTarget, a.IsDeducted, a.Notes, a.ApprovedByUser.FullName))
            .ToListAsync();
    }

    public async Task<SalaryAdvanceDto> CreateAdvanceAsync(CreateSalaryAdvanceDto dto)
    {
        var emp = await _db.Employees.FindAsync(dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        string num = await _numGen.NextAdvanceNumberAsync();
        var adv = new SalaryAdvance
        {
            AdvanceNumber = num,
            EmployeeId = emp.Id,
            Amount = dto.Amount,
            AdvanceDate = dto.AdvanceDate,
            MonthTarget = dto.MonthTarget,
            Notes = dto.Notes,
            ApprovedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        _db.SalaryAdvances.Add(adv);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("صرف سلفة", "الرواتب", $"صرف سلفة بمبلغ {adv.Amount} للموظف {emp.Name}");
        var user = await _db.Users.FindAsync(adv.ApprovedByUserId);
        return new SalaryAdvanceDto(adv.Id, adv.AdvanceNumber, emp.Id, emp.Name, adv.Amount, adv.AdvanceDate, adv.MonthTarget, false, adv.Notes, user?.FullName ?? "");
    }
}

public class PayrollService : IPayrollService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public PayrollService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<SalaryDto>> GetSalariesAsync(string? monthYear = null)
    {
        var q = _db.Salaries.Include(s => s.Employee).Include(s => s.PaidByUser).AsQueryable();
        if (!string.IsNullOrWhiteSpace(monthYear)) q = q.Where(s => s.MonthYear == monthYear);

        return await q.OrderByDescending(s => s.Id)
            .Select(s => new SalaryDto(s.Id, s.PaymentNumber, s.EmployeeId, s.Employee.Name, s.MonthYear, s.BaseSalary, s.Allowances, s.Deductions, s.AdvancesDeducted, s.NetSalary, s.PaymentDate, s.PaidByUser.FullName))
            .ToListAsync();
    }

    public async Task<SalaryDto> ProcessSalaryAsync(ProcessSalaryDto dto)
    {
        var emp = await _db.Employees.Include(e => e.SalaryAdvances).FirstOrDefaultAsync(e => e.Id == dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        bool exists = await _db.Salaries.AnyAsync(s => s.EmployeeId == emp.Id && s.MonthYear == dto.MonthYear);
        if (exists) throw new InvalidOperationException($"تم صرف راتب شهر {dto.MonthYear} لهذا الموظف مسبقاً.");

        var pendingAdvances = emp.SalaryAdvances.Where(a => !a.IsDeducted).ToList();
        decimal advTotal = pendingAdvances.Sum(a => a.Amount);
        decimal net = Math.Max(0, emp.BaseSalary + dto.Allowances - dto.Deductions - advTotal);

        string num = await _numGen.NextSalaryNumberAsync(dto.MonthYear);

        var salary = new Salary
        {
            PaymentNumber = num,
            EmployeeId = emp.Id,
            MonthYear = dto.MonthYear,
            BaseSalary = emp.BaseSalary,
            Allowances = dto.Allowances,
            Deductions = dto.Deductions,
            AdvancesDeducted = advTotal,
            NetSalary = net,
            PaymentDate = dto.PaymentDate,
            PaymentMethod = dto.Method,
            Notes = dto.Notes,
            PaidByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        foreach (var adv in pendingAdvances)
        {
            adv.IsDeducted = true;
            adv.DeductedFromSalary = salary;
        }

        _db.Salaries.Add(salary);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("صرف راتب", "الرواتب", $"صرف راتب شهر {dto.MonthYear} للموظف {emp.Name} بصافي {net}");
        var user = await _db.Users.FindAsync(salary.PaidByUserId);
        return new SalaryDto(salary.Id, salary.PaymentNumber, emp.Id, emp.Name, salary.MonthYear, salary.BaseSalary, salary.Allowances, salary.Deductions, salary.AdvancesDeducted, salary.NetSalary, salary.PaymentDate, user?.FullName ?? "");
    }
}

public class StudioSettingsService : IStudioSettingsService
{
    private readonly StudioDbContext _db;
    public StudioSettingsService(StudioDbContext db) => _db = db;

    public async Task<StudioSettingsDto> GetSettingsAsync()
    {
        var s = await _db.StudioSettings.FirstOrDefaultAsync() ?? new StudioSettings();
        return new StudioSettingsDto(s.StudioName, s.Tagline, s.Address, s.Phone, s.SecondaryPhone, s.Whatsapp, s.Email, s.CrNumber, s.Currency, s.LogoPath, s.InvoiceTitle, s.InvoiceSubtitle, s.InvoiceFooterNote, s.InvoiceTerms, s.PrintSize);
    }

    public async Task UpdateSettingsAsync(StudioSettingsDto dto)
    {
        var s = await _db.StudioSettings.FirstOrDefaultAsync();
        if (s == null)
        {
            s = new StudioSettings();
            _db.StudioSettings.Add(s);
        }

        s.StudioName = dto.StudioName;
        s.Tagline = dto.Tagline;
        s.Address = dto.Address;
        s.Phone = dto.Phone;
        s.SecondaryPhone = dto.SecondaryPhone;
        s.Whatsapp = dto.Whatsapp;
        s.Email = dto.Email;
        s.CrNumber = dto.CrNumber;
        s.Currency = dto.Currency;
        s.LogoPath = dto.LogoPath;
        s.InvoiceTitle = dto.InvoiceTitle;
        s.InvoiceSubtitle = dto.InvoiceSubtitle;
        s.InvoiceFooterNote = dto.InvoiceFooterNote;
        s.InvoiceTerms = dto.InvoiceTerms;
        s.PrintSize = dto.PrintSize;
        s.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
    }
}

public class ServiceCardService : IServiceCardService
{
    private readonly StudioDbContext _db;
    public ServiceCardService(StudioDbContext db) => _db = db;

    public async Task<List<ServiceCardDto>> GetAllCardsAsync()
    {
        var list = await _db.StudioServices.OrderBy(s => s.DisplayOrder).ToListAsync();
        var counts = await _db.Orders.Where(o => !o.IsDeleted).GroupBy(o => o.ServiceType).Select(g => new { ServiceType = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.ServiceType, x => x.Count);

        return list.Select(s => new ServiceCardDto(
            s.Id,
            s.ServiceType,
            s.Name,
            s.Description,
            s.Icon,
            s.DisplayOrder,
            s.IsActive,
            s.DefaultPrice,
            counts.TryGetValue(s.ServiceType, out int c) ? c : 0
        )).ToList();
    }

    public async Task<bool> ToggleActiveAsync(int id)
    {
        var s = await _db.StudioServices.FindAsync(id);
        if (s == null) return false;
        s.IsActive = !s.IsActive;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task UpdateCardAsync(int id, string name, string description, decimal defaultPrice, int displayOrder)
    {
        var s = await _db.StudioServices.FindAsync(id);
        if (s == null) return;
        s.Name = name;
        s.Description = description;
        s.DefaultPrice = defaultPrice;
        s.DisplayOrder = displayOrder;
        await _db.SaveChangesAsync();
    }
}

public class AuditLogService : IAuditLogService
{
    private readonly StudioDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(StudioDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<AuditLogDto>> GetLogsAsync(int take = 200, string? search = null)
    {
        var q = _db.AuditLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(l => l.Action.ToLower().Contains(search) || l.Module.ToLower().Contains(search) || l.Details.ToLower().Contains(search) || l.UserName.ToLower().Contains(search));
        }

        return await q.OrderByDescending(l => l.Id).Take(take)
            .Select(l => new AuditLogDto(l.Id, l.Action, l.Module, l.Details, l.UserName, l.CreatedAt))
            .ToListAsync();
    }

    public async Task LogAsync(string action, string module, string details, string? metadata = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Action = action,
            Module = module,
            Details = details,
            UserId = _currentUser.CurrentUser?.Id ?? 1,
            UserName = _currentUser.CurrentUser?.FullName ?? "مدير النظام",
            Metadata = metadata
        });
        await _db.SaveChangesAsync();
    }
}

public class BackupService : IBackupService
{
    private readonly StudioDbContext _db;
    public BackupService(StudioDbContext db) => _db = db;

    public async Task<string> CreateBackupAsync(string destinationPath)
    {
        var dbName = _db.Database.GetDbConnection().Database;
        var fileName = Path.Combine(destinationPath, $"StudioManagement_{DateTime.Now:yyyyMMdd_HHmmss}.bak");
        var sql = $"BACKUP DATABASE [{dbName}] TO DISK = @path WITH FORMAT, INIT";
        var param = new Microsoft.Data.SqlClient.SqlParameter("@path", fileName);

        await _db.Database.ExecuteSqlRawAsync(sql, param);
        return fileName;
    }

    public async Task<bool> RestoreBackupAsync(string backupFilePath)
    {
        var dbName = _db.Database.GetDbConnection().Database;
        var sql = $@"
            ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
            RESTORE DATABASE [{dbName}] FROM DISK = @path WITH REPLACE;
            ALTER DATABASE [{dbName}] SET MULTI_USER;
        ";
        var param = new Microsoft.Data.SqlClient.SqlParameter("@path", backupFilePath);
        await _db.Database.ExecuteSqlRawAsync(sql, param);
        return true;
    }
}
"""
write("StudioManagement.Infrastructure/Services/Services.cs", infra_services)

# ==============================================================================
# StudioManagement.Reports
# ==============================================================================
reports_csproj = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\StudioManagement.Application\\StudioManagement.Application.csproj" />
    <ProjectReference Include="..\\StudioManagement.Domain\\StudioManagement.Domain.csproj" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="ClosedXML" Version="0.102.3" />
  </ItemGroup>
</Project>
"""
write("StudioManagement.Reports/StudioManagement.Reports.csproj", reports_csproj)

reports_builders = """using System.Text;
using ClosedXML.Excel;
using StudioManagement.Application.Interfaces;

namespace StudioManagement.Reports;

public class InvoiceHtmlBuilder : IInvoiceHtmlBuilder
{
    private readonly IOrderService _orderService;
    private readonly IStudioSettingsService _settingsService;

    public InvoiceHtmlBuilder(IOrderService orderService, IStudioSettingsService settingsService)
    {
        _orderService = orderService;
        _settingsService = settingsService;
    }

    public async Task<string> BuildInvoiceHtmlAsync(int orderId)
    {
        var order = await _orderService.GetByIdAsync(orderId);
        if (order == null) return "<h3>الطلب غير موجود</h3>";

        var settings = await _settingsService.GetSettingsAsync();
        var sb = new StringBuilder();

        sb.Append($@"<!DOCTYPE html>
<html dir=""rtl"" lang=""ar"">
<head>
<meta charset=""utf-8""/>
<title>فاتورة {order.OrderNumber}</title>
<style>
body {{ font-family: Segoe UI, Tahoma, Arial, sans-serif; direction: rtl; margin: 20px; color: #1e293b; background: #fff; }}
.header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px; }}
.title {{ font-size: 22px; font-weight: bold; color: #1e3a8a; margin: 0; }}
.sub {{ color: #64748b; font-size: 13px; margin: 2px 0; }}
.meta-box {{ display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px; }}
table {{ width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }}
th, td {{ border: 1px solid #cbd5e1; padding: 8px 10px; text-align: right; }}
th {{ background: #1e3a8a; color: #fff; }}
.totals {{ width: 280px; margin-right: auto; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; }}
.totals-row {{ display: flex; justify-content: space-between; padding: 4px 0; }}
.grand {{ font-weight: bold; font-size: 15px; color: #1e3a8a; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 6px; }}
.footer {{ margin-top: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; white-space: pre-line; }}
@media print {{ body {{ margin: 0; }} }}
</style>
</head>
<body>
<div class=""header"">
    <div>
        <h1 class=""title"">{settings.StudioName}</h1>
        <p class=""sub"">{settings.Tagline}</p>
        <p class=""sub"">{settings.Address} | هاتف: {settings.Phone} | واتساب: {settings.Whatsapp}</p>
    </div>
    <div style=""text-align: left;"">
        <h2 style=""margin: 0; color: #1e3a8a;"">{settings.InvoiceTitle}</h2>
        <p class=""sub"">رقم الفاتورة: <strong>{order.OrderNumber}</strong></p>
        <p class=""sub"">تاريخ الطلب: {order.OrderDate:yyyy/MM/dd}</p>
    </div>
</div>

<div class=""meta-box"">
    <div>
        <p style=""margin: 0 0 4px 0;""><strong>العميل:</strong> {order.CustomerName}</p>
        <p style=""margin: 0;""><strong>الهاتف:</strong> {order.CustomerPhone}</p>
        <p style=""margin: 4px 0 0 0;""><strong>العنوان:</strong> {order.CustomerAddress ?? ""-""}</p>
    </div>
    <div style=""text-align: left;"">
        <p style=""margin: 0 0 4px 0;""><strong>الخدمة:</strong> {order.ServiceTitle}</p>
        <p style=""margin: 0;""><strong>موعد التسليم:</strong> {order.DeliveryDate:yyyy/MM/dd} {order.DeliveryTime}</p>
        <p style=""margin: 4px 0 0 0;""><strong>الكاشير:</strong> {order.CreatedByName}</p>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>الخدمة والمواصفات</th>
            <th style=""text-align:center;"">الكمية</th>
            <th style=""text-align:left;"">سعر الوحدة</th>
            <th style=""text-align:left;"">الإجمالي</th>
        </tr>
    </thead>
    <tbody>"");

        int idx = 1;
        foreach (var itm in order.Items)
        {
            sb.Append($@"<tr>
                <td>{idx++}</td>
                <td><strong>{itm.Title}</strong><br/><small style=""color:#64748b;"">{itm.Description}</small></td>
                <td style=""text-align:center;"">{itm.Quantity}</td>
                <td style=""text-align:left;"">{itm.UnitPrice:N0} {settings.Currency}</td>
                <td style=""text-align:left;"">{itm.TotalPrice:N0} {settings.Currency}</td>
            </tr>");
        }

        sb.Append($@"</tbody>
</table>

<div class=""totals"">
    <div class=""totals-row""><span>المجموع:</span><span>{order.Subtotal:N0} {settings.Currency}</span></div>
    <div class=""totals-row"" style=""color:#b45309;""><span>الخصم:</span><span>-{order.Discount:N0} {settings.Currency}</span></div>
    <div class=""totals-row grand""><span>الإجمالي المستحق:</span><span>{order.TotalAmount:N0} {settings.Currency}</span></div>
    <div class=""totals-row"" style=""color:#15803d; font-weight:bold;""><span>المدفوع:</span><span>{order.PaidAmount:N0} {settings.Currency}</span></div>
    <div class=""totals-row"" style=""color:#b91c1c; font-weight:bold; border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px;"">
        <span>المتبقي للتسليم:</span><span>{order.RemainingAmount:N0} {settings.Currency}</span>
    </div>
</div>

<div class=""footer"">
    <p>{settings.InvoiceFooterNote}</p>
    <p>{settings.InvoiceTerms}</p>
    <p style=""color:#94a3b8; font-size:10px;"">تاريخ الطباعة: {DateTime.Now:yyyy/MM/dd hh:mm tt} — نظام StudioManagement</p>
</div>
</body>
</html>");

        return sb.ToString();
    }
}

public class ReportHtmlBuilder : IReportHtmlBuilder
{
    private readonly IOrderService _orderService;
    private readonly IExpenseService _expenseService;
    private readonly ICustomerService _customerService;
    private readonly IInventoryService _inventoryService;
    private readonly IStudioSettingsService _settings;

    public ReportHtmlBuilder(IOrderService orderService, IExpenseService expenseService, ICustomerService customerService, IInventoryService inventoryService, IStudioSettingsService settings)
    {
        _orderService = orderService;
        _expenseService = expenseService;
        _customerService = customerService;
        _inventoryService = inventoryService;
        _settings = settings;
    }

    public async Task<string> BuildSalesReportHtmlAsync(DateTime fromDate, DateTime toDate)
    {
        var orders = await _orderService.GetAllAsync();
        var filtered = orders.Where(o => o.OrderDate.Date >= fromDate.Date && o.OrderDate.Date <= toDate.Date).ToList();
        var s = await _settings.GetSettingsAsync();

        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html><html dir=""rtl"" lang=""ar""><head><meta charset=""utf-8""/><title>تقرير المبيعات</title>
        <style>body {{ font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#1e3a8a; color:#fff; }}</style></head><body>");
        sb.Append($"<h2>تقرير مبيعات استديو {s.StudioName}</h2><p>الفترة من {fromDate:yyyy/MM/dd} إلى {toDate:yyyy/MM/dd}</p>");
        sb.Append("<table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الخدمة</th><th>التاريخ</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>");
        foreach (var o in filtered)
        {
            sb.Append($"<tr><td>{o.OrderNumber}</td><td>{o.CustomerName}</td><td>{o.ServiceTitle}</td><td>{o.OrderDate:yyyy/MM/dd}</td><td>{o.TotalAmount:N0}</td><td>{o.PaidAmount:N0}</td><td>{o.RemainingAmount:N0}</td></tr>");
        }
        sb.Append($"</tbody></table><p><strong>الإجمالي: {filtered.Sum(x => x.TotalAmount):N0} {s.Currency}</strong> | <strong>المحصل: {filtered.Sum(x => x.PaidAmount):N0} {s.Currency}</strong></p></body></html>");
        return sb.ToString();
    }

    public async Task<string> BuildProfitLossHtmlAsync(DateTime fromDate, DateTime toDate)
    {
        var orders = await _orderService.GetAllAsync();
        var expenses = await _expenseService.GetAllExpensesAsync(fromDate, toDate);
        var s = await _settings.GetSettingsAsync();

        var paidOrders = orders.Where(o => o.OrderDate.Date >= fromDate.Date && o.OrderDate.Date <= toDate.Date).Sum(o => o.PaidAmount);
        var totalExp = expenses.Sum(e => e.Amount);
        var net = paidOrders - totalExp;

        return $@"<!DOCTYPE html><html dir=""rtl"" lang=""ar""><head><meta charset=""utf-8""/><title>الأرباح والمصروفات</title>
        <style>body {{ font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; margin: 20px; }} .box {{ border:1px solid #ccc; padding:15px; border-radius:8px; margin-bottom:10px; }}</style></head><body>
        <h2>تقرير الأرباح والمصروفات - {s.StudioName}</h2><p>الفترة: {fromDate:yyyy/MM/dd} إلى {toDate:yyyy/MM/dd}</p>
        <div class=""box""><h3>المقبوضات الفعلية: {paidOrders:N0} {s.Currency}</h3></div>
        <div class=""box""><h3>إجمالي المصروفات: {totalExp:N0} {s.Currency}</h3></div>
        <div class=""box"" style=""background:#f0fdf4;""><h2>صافي الربح: {net:N0} {s.Currency}</h2></div>
        </body></html>";
    }

    public async Task<string> BuildCustomerDebtsHtmlAsync()
    {
        var customers = await _customerService.GetAllAsync();
        var debts = customers.Where(c => c.TotalRemaining > 0).ToList();
        var s = await _settings.GetSettingsAsync();

        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html><html dir=""rtl"" lang=""ar""><head><meta charset=""utf-8""/><title>مديونية العملاء</title>
        <style>body {{ font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#b91c1c; color:#fff; }}</style></head><body>");
        sb.Append($"<h2>كشف مديونية العملاء - {s.StudioName}</h2>");
        sb.Append("<table><thead><tr><th>رقم العميل</th><th>اسم العميل</th><th>الهاتف</th><th>إجمالي المبيعات</th><th>المسدد</th><th>المتبقي بذمته</th></tr></thead><tbody>");
        foreach (var c in debts)
        {
            sb.Append($"<tr><td>{c.CustomerNumber}</td><td>{c.Name}</td><td>{c.Phone}</td><td>{c.TotalSpent:N0}</td><td>{c.TotalPaid:N0}</td><td style=""color:red; font-weight:bold;"">{c.TotalRemaining:N0}</td></tr>");
        }
        sb.Append($"</tbody></table><h3>إجمالي الديون المعلقة: {debts.Sum(x => x.TotalRemaining):N0} {s.Currency}</h3></body></html>");
        return sb.ToString();
    }

    public async Task<string> BuildInventoryReportHtmlAsync()
    {
        var products = await _inventoryService.GetAllProductsAsync();
        var s = await _settings.GetSettingsAsync();

        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html><html dir=""rtl"" lang=""ar""><head><meta charset=""utf-8""/><title>تقرير المخزون</title>
        <style>body {{ font-family: Segoe UI, Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#d97706; color:#fff; }}</style></head><body>");
        sb.Append($"<h2>تقرير أرصدة المخزون - {s.StudioName}</h2>");
        sb.Append("<table><thead><tr><th>الكود</th><th>الصنف</th><th>التصنيف</th><th>الرصيد الحالي</th><th>الحد الأدنى</th><th>سعر التكلفة</th><th>سعر البيع</th></tr></thead><tbody>");
        foreach (var p in products)
        {
            var isLow = p.CurrentQuantity <= p.MinimumQuantity;
            sb.Append($"<tr style=\"{(isLow ? "background:#fee2e2;" : "")}\"><td>{p.Code}</td><td>{p.Name}</td><td>{p.CategoryName}</td><td><strong>{p.CurrentQuantity}</strong></td><td>{p.MinimumQuantity}</td><td>{p.CostPrice:N0}</td><td>{p.SellingPrice:N0}</td></tr>");
        }
        sb.Append($"</tbody></table></body></html>");
        return sb.ToString();
    }
}

public class ExcelExportService : IExcelExportService
{
    public Task<byte[]> ExportToExcelAsync<T>(IEnumerable<T> data, string sheetName)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add(sheetName);
        ws.RightToLeft = true;

        var props = typeof(T).GetProperties();
        for (int col = 0; col < props.Length; col++)
        {
            var cell = ws.Cell(1, col + 1);
            cell.Value = props[col].Name;
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1E3A8A");
            cell.Style.Font.FontColor = XLColor.White;
        }

        int row = 2;
        foreach (var item in data)
        {
            for (int col = 0; col < props.Length; col++)
            {
                var val = props[col].GetValue(item)?.ToString() ?? "";
                ws.Cell(row, col + 1).Value = val;
            }
            row++;
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }
}
"""
write("StudioManagement.Reports/ReportsBuilders.cs", reports_builders)

# ==============================================================================
# StudioManagement.WPF
# ==============================================================================
wpf_csproj = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <ApplicationIcon>Assets\\AppIcon.ico</ApplicationIcon>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\\StudioManagement.Domain\\StudioManagement.Domain.csproj" />
    <ProjectReference Include="..\\StudioManagement.Application\\StudioManagement.Application.csproj" />
    <ProjectReference Include="..\\StudioManagement.Infrastructure\\StudioManagement.Infrastructure.csproj" />
    <ProjectReference Include="..\\StudioManagement.Reports\\StudioManagement.Reports.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="CommunityToolkit.Mvvm" Version="8.4.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.8" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Json" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
    <PackageReference Include="Microsoft.Extensions.Hosting" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <None Update="appsettings.json">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <Resource Include="Assets\\AppIcon.ico" />
  </ItemGroup>
</Project>
"""
write("StudioManagement.WPF/StudioManagement.WPF.csproj", wpf_csproj)

wpf_appsettings = """{
  "ConnectionStrings": {
    "StudioDb": "Server=.\\\\SQLEXPRESS;Database=StudioManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "StudioSettings": {
    "AutoBackup": true,
    "BackupFolder": "C:\\\\StudioBackups"
  }
}
"""
write("StudioManagement.WPF/appsettings.json", wpf_appsettings)

wpf_app_xaml = """<Application x:Class="StudioManagement.WPF.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:StudioManagement.WPF"
             xmlns:vm="clr-namespace:StudioManagement.WPF.ViewModels"
             xmlns:views="clr-namespace:StudioManagement.WPF.Views">
    <Application.Resources>
        <!-- Brand Theme Colors -->
        <SolidColorBrush x:Key="BrandPrimaryBrush" Color="#0B132B" />
        <SolidColorBrush x:Key="BrandSecondaryBrush" Color="#1C2541" />
        <SolidColorBrush x:Key="BrandAccentBlueBrush" Color="#2563EB" />
        <SolidColorBrush x:Key="BrandAccentGoldBrush" Color="#D97706" />
        <SolidColorBrush x:Key="BrandSuccessBrush" Color="#16A34A" />
        <SolidColorBrush x:Key="BrandDangerBrush" Color="#DC2626" />
        <SolidColorBrush x:Key="SurfaceBrush" Color="#0F172A" />
        <SolidColorBrush x:Key="CardBrush" Color="#1E293B" />
        <SolidColorBrush x:Key="TextLightBrush" Color="#F8FAFC" />
        <SolidColorBrush x:Key="TextMutedBrush" Color="#94A3B8" />
        <SolidColorBrush x:Key="BorderLightBrush" Color="#334155" />

        <!-- DataTemplates for Page Navigation -->
        <DataTemplate DataType="{x:Type vm:DashboardViewModel}">
            <views:DashboardView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:CustomersViewModel}">
            <views:CustomersView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:OrdersViewModel}">
            <views:OrdersView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:InventoryViewModel}">
            <views:InventoryView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:SuppliersViewModel}">
            <views:SuppliersView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:AccountingViewModel}">
            <views:AccountingView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:ReportsViewModel}">
            <views:ReportsView />
        </DataTemplate>
        <DataTemplate DataType="{x:Type vm:SettingsViewModel}">
            <views:SettingsView />
        </DataTemplate>
    </Application.Resources>
</Application>
"""
write("StudioManagement.WPF/App.xaml", wpf_app_xaml)

wpf_app_cs = """using System.Windows;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StudioManagement.Application.Interfaces;
using StudioManagement.Infrastructure.Data;
using StudioManagement.Infrastructure.Services;
using StudioManagement.Reports;
using StudioManagement.WPF.ViewModels;
using StudioManagement.WPF.Views;

namespace StudioManagement.WPF;

public partial class App : System.Windows.Application
{
    private IHost? _host;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        _host = Host.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                var connStr = context.Configuration.GetConnectionString("StudioDb") 
                    ?? "Server=.\\\\SQLEXPRESS;Database=StudioManagementDb;Trusted_Connection=True;TrustServerCertificate=True;";

                services.AddDbContext<StudioDbContext>(options =>
                    options.UseSqlServer(connStr));

                // Application Services
                services.AddSingleton<ICurrentUserService, CurrentUserService>();
                services.AddScoped<IAuthService, AuthService>();
                services.AddScoped<INumberGeneratorService, NumberGeneratorService>();
                services.AddScoped<ICustomerService, CustomerService>();
                services.AddScoped<IOrderService, OrderService>();
                services.AddScoped<IInventoryService, InventoryService>();
                services.AddScoped<IPurchaseService, PurchaseService>();
                services.AddScoped<IExpenseService, ExpenseService>();
                services.AddScoped<IAccountingService, AccountingService>();
                services.AddScoped<IEmployeeService, EmployeeService>();
                services.AddScoped<IPayrollService, PayrollService>();
                services.AddScoped<IStudioSettingsService, StudioSettingsService>();
                services.AddScoped<IServiceCardService, ServiceCardService>();
                services.AddScoped<IAuditLogService, AuditLogService>();
                services.AddScoped<IBackupService, BackupService>();

                // Reports
                services.AddScoped<IInvoiceHtmlBuilder, InvoiceHtmlBuilder>();
                services.AddScoped<IReportHtmlBuilder, ReportHtmlBuilder>();
                services.AddScoped<IExcelExportService, ExcelExportService>();

                // ViewModels
                services.AddSingleton<MainViewModel>();
                services.AddTransient<LoginViewModel>();
                services.AddTransient<DashboardViewModel>();
                services.AddTransient<CustomersViewModel>();
                services.AddTransient<OrdersViewModel>();
                services.AddTransient<OrderWizardViewModel>();
                services.AddTransient<InventoryViewModel>();
                services.AddTransient<PurchaseFormViewModel>();
                services.AddTransient<SuppliersViewModel>();
                services.AddTransient<AccountingViewModel>();
                services.AddTransient<ReportsViewModel>();
                services.AddTransient<SettingsViewModel>();

                // Views
                services.AddTransient<MainWindow>();
                services.AddTransient<LoginWindow>();
            })
            .Build();

        await _host.StartAsync();

        // Ensure database is seeded
        using (var scope = _host.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<StudioDbContext>();
            await DbInitializer.SeedAsync(db);
        }

        // Show Login
        var loginWindow = _host.Services.GetRequiredService<LoginWindow>();
        loginWindow.Show();
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        if (_host != null)
        {
            await _host.StopAsync();
            _host.Dispose();
        }
        base.OnExit(e);
    }
}
"""
write("StudioManagement.WPF/App.xaml.cs", wpf_app_cs)

# Installer Files
installer_iss = """[Setup]
AppName=StudioManagement
AppVersion=2.5.0
DefaultDirName={autopf}\\StudioManagement
DefaultGroupName=StudioManagement
OutputDir=Output
OutputBaseFilename=StudioManagement-Setup
Compression=lzma
SolidCompression=yes
SetupIconFile=..\\StudioManagement.WPF\\Assets\\AppIcon.ico

[Files]
Source: "..\\StudioManagement.WPF\\bin\\Release\\net8.0-windows\\publish\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\StudioManagement"; Filename: "{app}\\StudioManagement.WPF.exe"
Name: "{autodesktop}\\StudioManagement"; Filename: "{app}\\StudioManagement.WPF.exe"
"""
write("installer/StudioSetup.iss", installer_iss)

installer_readme = """# دليل تثبيت ونشر برنامج StudioManagement

1. متطلبات التشغيل:
   - Windows 10 أو Windows 11 (64-bit)
   - .NET 8.0 Desktop Runtime أو .NET 9.0
   - Microsoft SQL Server Express (محلي أو شبكي LAN)

2. أمر البناء والنشر النهائي:
   ```bash
   dotnet publish StudioManagement.WPF/StudioManagement.WPF.csproj -c Release -r win-x64 --self-contained false -o installer/publish
   ```

3. تجميع برنامج التثبيت (Inno Setup):
   افتح ملف `installer/StudioSetup.iss` في Inno Setup Compiler واضغط Run لإنشاء `StudioManagement-Setup.exe`.
"""
write("installer/README-INSTALLER.md", installer_readme)

print("All projects and core files written successfully.")
