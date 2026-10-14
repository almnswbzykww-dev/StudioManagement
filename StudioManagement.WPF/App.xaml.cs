using System.Globalization;
using System.IO;
using System.Threading;
using System.Windows;
using System.Windows.Markup;
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

    public App()
    {
        // 1. Force English Digits (0123456789) globally across all WPF views, DataGrids, TextBlocks, and StringFormat bindings
        // while preserving complete Arabic UI, texts, and RTL layout
        var customCulture = new CultureInfo("ar-SA")
        {
            NumberFormat = (NumberFormatInfo)CultureInfo.InvariantCulture.NumberFormat.Clone(),
            DateTimeFormat = (DateTimeFormatInfo)CultureInfo.InvariantCulture.DateTimeFormat.Clone()
        };
        customCulture.NumberFormat.DigitSubstitution = DigitShapes.None;
        customCulture.NumberFormat.NativeDigits = new[] { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };

        Thread.CurrentThread.CurrentCulture = customCulture;
        Thread.CurrentThread.CurrentUICulture = customCulture;
        CultureInfo.DefaultThreadCurrentCulture = customCulture;
        CultureInfo.DefaultThreadCurrentUICulture = customCulture;

        // Apply en-US Language to FrameworkElement so WPF controls render digits in standard Latin form
        FrameworkElement.LanguageProperty.OverrideMetadata(
            typeof(FrameworkElement),
            new FrameworkPropertyMetadata(XmlLanguage.GetLanguage("en-US"))
        );
        // 24/7 Continuous Operation: Register Global Unhandled Exception Handlers
        this.DispatcherUnhandledException += (s, e) =>
        {
            LogExceptionLocally(e.Exception, "DispatcherUnhandledException");
            MessageBox.Show(
                $"حدث تنبيه غير متوقع أثناء التشغيل:\n{e.Exception.Message}\n\nتم تسجيل الخطأ في ملف السجلات المحلي (Logs) واستمر تشغيل النظام بأمان.",
                "تنبيه أمان النظام",
                MessageBoxButton.OK,
                MessageBoxImage.Warning
            );
            e.Handled = true; // Prevent app crash
        };

        AppDomain.CurrentDomain.UnhandledException += (s, e) =>
        {
            if (e.ExceptionObject is Exception ex)
            {
                LogExceptionLocally(ex, "AppDomainUnhandledException");
            }
        };

        TaskScheduler.UnobservedTaskException += (s, e) =>
        {
            LogExceptionLocally(e.Exception, "TaskSchedulerUnobservedTaskException");
            e.SetObserved(); // Prevent background task crash
        };
    }

    private static void LogExceptionLocally(Exception ex, string source)
    {
        try
        {
            string logsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
            if (!Directory.Exists(logsDir)) Directory.CreateDirectory(logsDir);
            string logFile = Path.Combine(logsDir, $"StudioError_{DateTime.Now:yyyyMMdd}.log");
            string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{source}] {ex.GetType().Name}: {ex.Message}\r\nStack Trace:\r\n{ex.StackTrace}\r\n--------------------------------------------------\r\n";
            File.AppendAllText(logFile, logEntry);
        }
        catch { }
    }

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        _host = Host.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                var providerMode = context.Configuration["DatabaseProvider"] ?? "Auto";
                var sqlServerConn = context.Configuration.GetConnectionString("StudioDb") 
                    ?? "Server=.\\SQLEXPRESS;Database=StudioManagementDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connect Timeout=3;";
                var sqliteConn = context.Configuration.GetConnectionString("SqliteDb") 
                    ?? "Data Source=StudioManagement.db";

                bool useSqlServer = false;
                if (providerMode.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
                {
                    useSqlServer = true;
                }
                else if (providerMode.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
                {
                    useSqlServer = false;
                }
                else
                {
                    // Auto: Test if SQL Server is responsive in 2 seconds; if not, use offline SQLite
                    try
                    {
                        using var testConn = new Microsoft.Data.SqlClient.SqlConnection(sqlServerConn);
                        testConn.Open();
                        useSqlServer = true;
                    }
                    catch
                    {
                        useSqlServer = false;
                    }
                }

                services.AddDbContext<StudioDbContext>(options =>
                {
                    if (useSqlServer)
                    {
                        options.UseSqlServer(sqlServerConn);
                    }
                    else
                    {
                        // Ensure fixed absolute path in AppDomain BaseDirectory so working directory changes never lose the database file
                        string finalSqliteConn = sqliteConn;
                        if (sqliteConn.Contains("Data Source=", StringComparison.OrdinalIgnoreCase))
                        {
                            var parts = sqliteConn.Split("Data Source=", StringSplitOptions.RemoveEmptyEntries);
                            if (parts.Length > 0)
                            {
                                var rawPath = parts[0].Trim().TrimEnd(';');
                                if (!Path.IsPathRooted(rawPath))
                                {
                                    var fixedPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, rawPath);
                                    finalSqliteConn = $"Data Source={fixedPath}";
                                }
                            }
                        }
                        options.UseSqlite(finalSqliteConn);
                    }
                });

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
                services.AddScoped<INotificationService, NotificationService>();
                services.AddScoped<IPrintService, PrintService>();

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
                services.AddTransient<PrintPreviewViewModel>();

                // Views
                services.AddTransient<MainWindow>();
                services.AddTransient<LoginWindow>();
                services.AddTransient<PrintPreviewWindow>();
            })
            .Build();

        await _host.StartAsync();

        // Ensure database is seeded
        using (var scope = _host.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<StudioDbContext>();
            try
            {
                await DbInitializer.SeedAsync(db);

                // For 24/7 continuous operation: Enable SQLite WAL mode (Write-Ahead Logging) and busy timeout
                if (db.Database.IsSqlite())
                {
                    try
                    {
                        await db.Database.ExecuteSqlRawAsync("PRAGMA journal_mode = WAL;");
                        await db.Database.ExecuteSqlRawAsync("PRAGMA synchronous = NORMAL;");
                        await db.Database.ExecuteSqlRawAsync("PRAGMA busy_timeout = 5000;");
                    }
                    catch { }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Database seeding exception: {ex.Message}");
            }
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
