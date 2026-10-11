using StudioManagement.Application.DTOs;
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
    Task<LoginResponseDto> LoginAsync(string usernameOrNumber, string password);
    Task<UserDto?> FindUserByNumberOrUsernameAsync(string identifier);
    Task<List<UserDto>> GetActiveUsersForLoginAsync();
    Task<List<UserDto>> GetAllUsersAsync();
    Task<bool> AuthorizeUserPermissionsAsync(int userId, List<string> permissionKeys, bool? isActive = null);
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
    
    // Comprehensive Accounting Methods
    Task<AccountingDashboardStatsDto> GetAccountingDashboardStatsAsync();
    Task<List<CashboxTransactionDto>> GetCashboxTransactionsAsync(DateTime? fromDate = null, DateTime? toDate = null, CashboxType? type = null);
    Task<CashboxTransactionDto> AddCashboxTransactionAsync(CreateCashboxTransactionDto dto);
    Task<List<AccountDto>> GetAccountsAsync();
    Task<AccountStatementDto> GetAccountStatementAsync(string accountType, int entityId, DateTime fromDate, DateTime toDate);
    Task<List<VoucherDto>> GetVouchersAsync(VoucherType? type = null, DateTime? fromDate = null, DateTime? toDate = null);
    Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto);
    Task<EmployeeFinancialSummaryDto> GetEmployeeFinancialSummaryAsync(int employeeId);
    Task<List<EmployeeTransactionRowDto>> GetEmployeeTransactionsAsync(int employeeId);
    Task<EmployeeDeductionDto> CreateEmployeeDeductionAsync(CreateEmployeeDeductionDto dto);
    Task<List<EmployeeDeductionDto>> GetEmployeeDeductionsAsync(int? employeeId = null);
    Task<SalaryDto> ProcessSalaryPaymentAsync(ProcessPartialSalaryDto dto);
    Task<string> ConvertNumberToWordsArabicAsync(decimal amount, string currency = "ريال يمني");
    Task<CashierIncomeReportDto> GetCashierIncomeReportAsync(CashierIncomeFilterDto filter);
    Task<TodayIncomeSummaryDto> GetTodayIncomeSummaryAsync();
}

public interface IEmployeeService
{
    Task<List<EmployeeDto>> GetAllEmployeesAsync();
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);
    Task<List<SalaryAdvanceDto>> GetAdvancesAsync(int? employeeId = null);
    Task<SalaryAdvanceDto> CreateAdvanceAsync(CreateSalaryAdvanceDto dto);
    Task<List<EmployeeDebtDto>> GetDebtsAsync(int? employeeId = null);
    Task<EmployeeDebtDto> CreateDebtAsync(CreateEmployeeDebtDto dto);
    Task<List<EmployeePaymentDto>> GetPaymentsAsync(int? employeeId = null);
    Task<EmployeePaymentDto> CreatePaymentAsync(CreateEmployeePaymentDto dto);
}

public interface IPayrollService
{
    Task<List<SalaryDto>> GetSalariesAsync(string? monthYear = null);
    Task<SalaryDto> ProcessSalaryAsync(ProcessSalaryDto dto);
}

public interface IStudioSettingsService
{
    event EventHandler<StudioSettingsDto>? SettingsChanged;
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
    Task<string> CreateBackupAsync(string? destinationFolder = null);
    Task<bool> RestoreBackupAsync(string backupFilePath);
    Task<List<BackupHistoryDto>> GetBackupHistoriesAsync();
    Task<bool> ResetAllDataAsync();
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

public interface INotificationService
{
    Task<List<NotificationDto>> GetActiveNotificationsAsync(int limit = 50);
    Task<int> GetUnreadCountAsync();
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync();
    Task DeleteNotificationAsync(int notificationId);
    Task ArchiveNotificationAsync(int notificationId);
    Task ClearAllAsync();
    Task CreateNotificationAsync(CreateNotificationDto dto);
    Task CheckApproachingDeadlinesAsync();
    Task<NotificationSettingsDto> GetSettingsAsync();
    Task UpdateSettingsAsync(NotificationSettingsDto settings);
}

public interface IPrintService
{
    Task<PrintDocumentData> PrepareOrderInvoicePrintDataAsync(int orderId, int copies = 1, string paperSize = "A4");
    Task<PrintDocumentData> PrepareReceiptVoucherPrintDataAsync(int voucherId, int copies = 1, string paperSize = "A4");
    Task<PrintDocumentData> PreparePaymentVoucherPrintDataAsync(int voucherId, int copies = 1, string paperSize = "A4");
    Task<PrintDocumentData> PrepareCustomerStatementPrintDataAsync(int customerId);
    Task<PrintDocumentData> PreparePayrollPrintDataAsync(string monthYear);
    Task<PrintDocumentData> PrepareEmployeeStatementPrintDataAsync(int employeeId);
    Task<PrintDocumentData> PrepareSalarySlipPrintDataAsync(int salaryId);
    Task<PrintDocumentData> PrepareCashierReportPrintDataAsync(CashierIncomeReportDto report);
}

