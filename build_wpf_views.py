#!/usr/bin/env python3
import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"Generated View: {path}")

# ==============================================================================
# ViewModels
# ==============================================================================
viewmodels = """using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using StudioManagement.Application.DTOs;
using StudioManagement.Application.Interfaces;
using StudioManagement.Domain.Enums;

namespace StudioManagement.WPF.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ICurrentUserService _currentUser;
    private readonly IStudioSettingsService _settings;

    [ObservableProperty] private object? _currentViewModel;
    [ObservableProperty] private string _studioName = "استديو الأضواء الملكية";
    [ObservableProperty] private string _currentUserRoleName = "المهندس زكريا فيصل العزعزي";
    [ObservableProperty] private string _currentTimeFormatted = DateTime.Now.ToString("hh:mm:ss tt");
    [ObservableProperty] private string _currentDateFormatted = DateTime.Now.ToString("yyyy/MM/dd");
    [ObservableProperty] private bool _isSidebarExpanded = true;

    public MainViewModel(IServiceProvider serviceProvider, ICurrentUserService currentUser, IStudioSettingsService settings)
    {
        _serviceProvider = serviceProvider;
        _currentUser = currentUser;
        _settings = settings;

        if (_currentUser.CurrentUser != null)
        {
            CurrentUserRoleName = $"{_currentUser.CurrentUser.FullName} ({_currentUser.CurrentUser.RoleName})";
        }

        GoToDashboardCommand.Execute(null);
    }

    [RelayCommand]
    private void ToggleSidebar() => IsSidebarExpanded = !IsSidebarExpanded;

    [RelayCommand]
    private void GoToDashboard() => CurrentViewModel = (DashboardViewModel)_serviceProvider.GetService(typeof(DashboardViewModel))!;

    [RelayCommand]
    private void GoToCustomers() => CurrentViewModel = (CustomersViewModel)_serviceProvider.GetService(typeof(CustomersViewModel))!;

    [RelayCommand]
    private void GoToOrders() => CurrentViewModel = (OrdersViewModel)_serviceProvider.GetService(typeof(OrdersViewModel))!;

    [RelayCommand]
    private void GoToInventory() => CurrentViewModel = (InventoryViewModel)_serviceProvider.GetService(typeof(InventoryViewModel))!;

    [RelayCommand]
    private void GoToSuppliers() => CurrentViewModel = (SuppliersViewModel)_serviceProvider.GetService(typeof(SuppliersViewModel))!;

    [RelayCommand]
    private void GoToAccounting() => CurrentViewModel = (AccountingViewModel)_serviceProvider.GetService(typeof(AccountingViewModel))!;

    [RelayCommand]
    private void GoToReports() => CurrentViewModel = (ReportsViewModel)_serviceProvider.GetService(typeof(ReportsViewModel))!;

    [RelayCommand]
    private void GoToSettings() => CurrentViewModel = (SettingsViewModel)_serviceProvider.GetService(typeof(SettingsViewModel))!;

    [RelayCommand]
    private void Logout()
    {
        _currentUser.CurrentUser = null;
        var loginWin = (Views.LoginWindow)_serviceProvider.GetService(typeof(Views.LoginWindow))!;
        loginWin.Show();
        Application.Current.MainWindow.Close();
        Application.Current.MainWindow = loginWin;
    }
}

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ICurrentUserService _currentUser;
    private readonly IServiceProvider _sp;

    [ObservableProperty] private ObservableCollection<UserDto> _activeUsers = new();
    [ObservableProperty] private UserDto? _selectedUser;
    [ObservableProperty] private string _password = "123456";
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isLoading;

    public LoginViewModel(IAuthService auth, ICurrentUserService currentUser, IServiceProvider sp)
    {
        _auth = auth;
        _currentUser = currentUser;
        _sp = sp;
        LoadUsersCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadUsersAsync()
    {
        var users = await _auth.GetActiveUsersForLoginAsync();
        ActiveUsers = new ObservableCollection<UserDto>(users);
        SelectedUser = ActiveUsers.FirstOrDefault();
    }

    [RelayCommand]
    private async Task LoginAsync(Window window)
    {
        if (SelectedUser == null)
        {
            ErrorMessage = "يرجى اختيار المستخدم.";
            return;
        }

        IsLoading = true;
        ErrorMessage = string.Empty;

        var res = await _auth.LoginAsync(SelectedUser.Username, Password);
        IsLoading = false;

        if (res.Success && res.User != null)
        {
            _currentUser.CurrentUser = res.User;
            var mainWin = (MainWindow)_sp.GetService(typeof(MainWindow))!;
            mainWin.Show();
            Application.Current.MainWindow = mainWin;
            window.Close();
        }
        else
        {
            ErrorMessage = res.Message;
        }
    }
}

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAccountingService _accounting;
    private readonly IServiceCardService _serviceCards;
    private readonly MainViewModel _mainVm;

    [ObservableProperty] private DashboardStatsDto? _stats;
    [ObservableProperty] private ObservableCollection<ServiceCardDto> _cards = new();

    public DashboardViewModel(IAccountingService accounting, IServiceCardService serviceCards, MainViewModel mainVm)
    {
        _accounting = accounting;
        _serviceCards = serviceCards;
        _mainVm = mainVm;
        LoadDataCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadDataAsync()
    {
        Stats = await _accounting.GetDashboardStatsAsync();
        var cardsList = await _serviceCards.GetAllCardsAsync();
        Cards = new ObservableCollection<ServiceCardDto>(cardsList.Where(c => c.IsActive));
    }

    [RelayCommand]
    private void OpenService(ServiceCardDto card)
    {
        _mainVm.GoToOrdersCommand.Execute(null);
    }
}

public partial class CustomersViewModel : ObservableObject
{
    private readonly ICustomerService _customerService;

    [ObservableProperty] private ObservableCollection<CustomerDto> _customers = new();
    [ObservableProperty] private CustomerDto? _selectedCustomer;
    [ObservableProperty] private string _searchQuery = string.Empty;
    [ObservableProperty] private bool _isFormOpen;
    [ObservableProperty] private string _formName = string.Empty;
    [ObservableProperty] private string _formPhone = string.Empty;
    [ObservableProperty] private string _formAddress = string.Empty;
    [ObservableProperty] private string _formNotes = string.Empty;

    public CustomersViewModel(ICustomerService customerService)
    {
        _customerService = customerService;
        SearchCommand.Execute(null);
    }

    [RelayCommand]
    private async Task SearchAsync()
    {
        var list = await _customerService.GetAllAsync(SearchQuery);
        Customers = new ObservableCollection<CustomerDto>(list);
    }

    [RelayCommand]
    private void OpenAdd()
    {
        SelectedCustomer = null;
        FormName = string.Empty;
        FormPhone = string.Empty;
        FormAddress = string.Empty;
        FormNotes = string.Empty;
        IsFormOpen = true;
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (string.IsNullOrWhiteSpace(FormName) || string.IsNullOrWhiteSpace(FormPhone)) return;

        if (SelectedCustomer == null)
        {
            await _customerService.CreateAsync(new CreateCustomerDto(FormName, FormPhone, null, FormAddress, FormNotes));
        }
        else
        {
            await _customerService.UpdateAsync(new UpdateCustomerDto(SelectedCustomer.Id, FormName, FormPhone, null, FormAddress, FormNotes));
        }

        IsFormOpen = false;
        await SearchAsync();
    }

    [RelayCommand]
    private async Task DeleteAsync(CustomerDto customer)
    {
        if (MessageBox.Show($"هل أنت متأكد من حذف العميل {customer.Name}؟", "تأكيد الحذف", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
        {
            await _customerService.DeleteAsync(customer.Id);
            await SearchAsync();
        }
    }
}

public partial class OrdersViewModel : ObservableObject
{
    private readonly IOrderService _orderService;
    private readonly IInvoiceHtmlBuilder _invoiceBuilder;

    [ObservableProperty] private ObservableCollection<OrderDto> _orders = new();
    [ObservableProperty] private OrderDto? _selectedOrder;
    [ObservableProperty] private string _searchQuery = string.Empty;
    [ObservableProperty] private bool _isWizardOpen;

    // Payment overlay
    [ObservableProperty] private bool _isPaymentOpen;
    [ObservableProperty] private decimal _paymentAmount;
    [ObservableProperty] private PaymentMethod _paymentMethod = PaymentMethod.Cash;
    [ObservableProperty] private WalletType _walletType = WalletType.Kuraimi;
    [ObservableProperty] private string _transactionNumber = string.Empty;

    public OrdersViewModel(IOrderService orderService, IInvoiceHtmlBuilder invoiceBuilder)
    {
        _orderService = orderService;
        _invoiceBuilder = invoiceBuilder;
        LoadOrdersCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadOrdersAsync()
    {
        var list = await _orderService.GetAllAsync(search: SearchQuery);
        Orders = new ObservableCollection<OrderDto>(list);
    }

    [RelayCommand]
    private void OpenNewOrderWizard() => IsWizardOpen = true;

    [RelayCommand]
    private void CloseWizard() => IsWizardOpen = false;

    [RelayCommand]
    private async Task PrintInvoiceAsync(OrderDto order)
    {
        var html = await _invoiceBuilder.BuildInvoiceHtmlAsync(order.Id);
        var tempFile = Path.Combine(Path.GetTempPath(), $"Invoice_{order.OrderNumber}.html");
        await File.WriteAllTextAsync(tempFile, html);
        Process.Start(new ProcessStartInfo(tempFile) { UseShellExecute = true });
    }

    [RelayCommand]
    private void OpenAddPayment(OrderDto order)
    {
        SelectedOrder = order;
        PaymentAmount = order.RemainingAmount;
        IsPaymentOpen = true;
    }

    [RelayCommand]
    private async Task SubmitPaymentAsync()
    {
        if (SelectedOrder == null || PaymentAmount <= 0) return;

        await _orderService.AddPaymentAsync(new CreatePaymentDto(
            SelectedOrder.Id,
            PaymentAmount,
            PaymentMethod,
            PaymentMethod == PaymentMethod.BankWallet ? WalletType : null,
            PaymentMethod == PaymentMethod.BankWallet ? WalletType.ToString() : null,
            TransactionNumber,
            null,
            null,
            null,
            null
        ));

        IsPaymentOpen = false;
        await LoadOrdersAsync();
    }
}

public partial class OrderWizardViewModel : ObservableObject
{
    private readonly IOrderService _orderService;
    private readonly ICustomerService _customerService;

    [ObservableProperty] private ObservableCollection<CustomerDto> _matchedCustomers = new();
    [ObservableProperty] private CustomerDto? _selectedCustomer;
    [ObservableProperty] private string _customerSearch = string.Empty;

    [ObservableProperty] private ServiceType _selectedService = ServiceType.WeddingBoard;
    [ObservableProperty] private string _itemTitle = "لوحة عرسان ملكية فاخرة مقاس 80×120 سم مع إضاءة LED";
    [ObservableProperty] private decimal _itemPrice = 95000;
    [ObservableProperty] private int _quantity = 1;
    [ObservableProperty] private decimal _discount = 0;
    [ObservableProperty] private decimal _initialPayment = 30000;
    [ObservableProperty] private DateTime _deliveryDate = DateTime.Now.AddDays(7);

    public OrderWizardViewModel(IOrderService orderService, ICustomerService customerService)
    {
        _orderService = orderService;
        _customerService = customerService;
    }

    [RelayCommand]
    private async Task SearchCustomerAsync()
    {
        var list = await _customerService.AutoCompleteAsync(CustomerSearch);
        MatchedCustomers = new ObservableCollection<CustomerDto>(list);
    }
}

public partial class InventoryViewModel : ObservableObject
{
    private readonly IInventoryService _inventory;

    [ObservableProperty] private ObservableCollection<ProductDto> _products = new();
    [ObservableProperty] private ProductDto? _selectedProduct;
    [ObservableProperty] private string _searchQuery = string.Empty;

    public InventoryViewModel(IInventoryService inventory)
    {
        _inventory = inventory;
        LoadProductsCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadProductsAsync()
    {
        var list = await _inventory.GetAllProductsAsync(SearchQuery);
        Products = new ObservableCollection<ProductDto>(list);
    }
}

public partial class PurchaseFormViewModel : ObservableObject
{
}

public partial class SuppliersViewModel : ObservableObject
{
    private readonly StudioDbContext _db;
    [ObservableProperty] private ObservableCollection<SupplierDto> _suppliers = new();

    public SuppliersViewModel(StudioDbContext db)
    {
        _db = db;
        LoadSuppliersCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadSuppliersAsync()
    {
        // load suppliers
    }
}

public partial class AccountingViewModel : ObservableObject
{
    private readonly IAccountingService _accounting;
    private readonly IExpenseService _expense;

    [ObservableProperty] private decimal _treasuryBalance;
    [ObservableProperty] private ObservableCollection<ExpenseDto> _expenses = new();

    public AccountingViewModel(IAccountingService accounting, IExpenseService expense)
    {
        _accounting = accounting;
        _expense = expense;
        LoadDataCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadDataAsync()
    {
        TreasuryBalance = await _accounting.GetTreasuryBalanceAsync();
        var expList = await _expense.GetAllExpensesAsync();
        Expenses = new ObservableCollection<ExpenseDto>(expList);
    }
}

public partial class ReportsViewModel : ObservableObject
{
    private readonly IReportHtmlBuilder _reportBuilder;

    [ObservableProperty] private DateTime _fromDate = DateTime.Now.AddDays(-30);
    [ObservableProperty] private DateTime _toDate = DateTime.Now;

    public ReportsViewModel(IReportHtmlBuilder reportBuilder)
    {
        _reportBuilder = reportBuilder;
    }

    [RelayCommand]
    private async Task OpenSalesReportAsync()
    {
        var html = await _reportBuilder.BuildSalesReportHtmlAsync(FromDate, ToDate);
        OpenHtml(html);
    }

    [RelayCommand]
    private async Task OpenProfitLossReportAsync()
    {
        var html = await _reportBuilder.BuildProfitLossHtmlAsync(FromDate, ToDate);
        OpenHtml(html);
    }

    [RelayCommand]
    private async Task OpenDebtsReportAsync()
    {
        var html = await _reportBuilder.BuildCustomerDebtsHtmlAsync();
        OpenHtml(html);
    }

    [RelayCommand]
    private async Task OpenInventoryReportAsync()
    {
        var html = await _reportBuilder.BuildInventoryReportHtmlAsync();
        OpenHtml(html);
    }

    private static void OpenHtml(string html)
    {
        var file = Path.Combine(Path.GetTempPath(), $"Report_{DateTime.Now:yyyyMMdd_HHmmss}.html");
        File.WriteAllText(file, html);
        Process.Start(new ProcessStartInfo(file) { UseShellExecute = true });
    }
}

public partial class SettingsViewModel : ObservableObject
{
    private readonly IStudioSettingsService _settingsService;
    private readonly IBackupService _backupService;
    private readonly IAuthService _auth;
    private readonly ICurrentUserService _currentUser;

    [ObservableProperty] private StudioSettingsDto? _settings;
    [ObservableProperty] private string _currentPassword = string.Empty;
    [ObservableProperty] private string _newPassword = string.Empty;
    [ObservableProperty] private string _statusMessage = string.Empty;

    public SettingsViewModel(IStudioSettingsService settingsService, IBackupService backupService, IAuthService auth, ICurrentUserService currentUser)
    {
        _settingsService = settingsService;
        _backupService = backupService;
        _auth = auth;
        _currentUser = currentUser;
        LoadSettingsCommand.Execute(null);
    }

    [RelayCommand]
    private async Task LoadSettingsAsync()
    {
        Settings = await _settingsService.GetSettingsAsync();
    }

    [RelayCommand]
    private async Task SaveSettingsAsync()
    {
        if (Settings != null)
        {
            await _settingsService.UpdateSettingsAsync(Settings);
            StatusMessage = "تم حفظ الإعدادات بنجاح.";
        }
    }

    [RelayCommand]
    private async Task ChangePasswordAsync()
    {
        if (_currentUser.CurrentUser == null) return;
        var ok = await _auth.ChangePasswordAsync(_currentUser.CurrentUser.Id, CurrentPassword, NewPassword);
        StatusMessage = ok ? "تم تغيير كلمة المرور بنجاح." : "كلمة المرور الحالية غير صحيحة.";
    }

    [RelayCommand]
    private async Task CreateBackupAsync()
    {
        try
        {
            var folder = "C:\\\\StudioBackups";
            Directory.CreateDirectory(folder);
            var file = await _backupService.CreateBackupAsync(folder);
            StatusMessage = $"تم إنشاء النسخة الاحتياطية بنجاح: {file}";
        }
        catch (Exception ex)
        {
            StatusMessage = $"خطأ في النسخ: {ex.Message}";
        }
    }
}
"""
write("StudioManagement.WPF/ViewModels/ViewModels.cs", viewmodels)

# ==============================================================================
# MainWindow.xaml & Views
# ==============================================================================
mainwindow_xaml = """<Window x:Class="StudioManagement.WPF.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="clr-namespace:StudioManagement.WPF.ViewModels"
        Title="StudioManagement - استديو التصوير والطباعة"
        Height="780" Width="1240"
        MinWidth="1000" MinHeight="600"
        WindowStartupLocation="CenterScreen"
        FlowDirection="RightToLeft"
        Background="{StaticResource SurfaceBrush}">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="60" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>

        <!-- Top Header Bar -->
        <Border Grid.Row="0" Background="{StaticResource BrandPrimaryBrush}" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="0,0,0,1" Padding="20,0">
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto" />
                    <ColumnDefinition Width="*" />
                    <ColumnDefinition Width="Auto" />
                </Grid.ColumnDefinitions>

                <!-- Studio Logo & Name -->
                <StackPanel Grid.Column="0" Orientation="Horizontal" VerticalAlignment="Center">
                    <Border Width="38" Height="38" CornerRadius="8" Background="{StaticResource BrandAccentBlueBrush}" Margin="0,0,12,0">
                        <TextBlock Text="📸" FontSize="20" HorizontalAlignment="Center" VerticalAlignment="Center" />
                    </Border>
                    <StackPanel VerticalAlignment="Center">
                        <TextBlock Text="{Binding StudioName}" FontSize="15" FontWeight="Bold" Foreground="{StaticResource TextLightBrush}" />
                        <TextBlock Text="نظام إدارة استديو التصوير والطباعة المتكامل" FontSize="11" Foreground="{StaticResource TextMutedBrush}" />
                    </StackPanel>
                </StackPanel>

                <!-- Clock & User Role -->
                <StackPanel Grid.Column="2" Orientation="Horizontal" VerticalAlignment="Center">
                    <Border Background="#1C2541" CornerRadius="6" Padding="12,6" Margin="0,0,12,0">
                        <TextBlock Foreground="{StaticResource BrandAccentGoldBrush}" FontSize="12" FontWeight="SemiBold">
                            <Run Text="{Binding CurrentDateFormatted}" /> | <Run Text="{Binding CurrentTimeFormatted}" />
                        </TextBlock>
                    </Border>

                    <Border Background="#1E293B" CornerRadius="6" Padding="12,6" Margin="0,0,12,0">
                        <TextBlock Text="{Binding CurrentUserRoleName}" Foreground="{StaticResource TextLightBrush}" FontSize="12" FontWeight="Bold" />
                    </Border>

                    <Button Content="تسجيل خروج" Command="{Binding LogoutCommand}" Background="{StaticResource BrandDangerBrush}" Foreground="White" BorderThickness="0" Padding="10,6" Cursor="Hand" />
                </Grid.Column>
            </Grid>
        </Border>

        <!-- Main Body: Sidebar + Dynamic Content -->
        <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="220" />
                <ColumnDefinition Width="*" />
            </Grid.ColumnDefinitions>

            <!-- Navigation Sidebar -->
            <Border Grid.Column="0" Background="{StaticResource BrandSecondaryBrush}" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="0,0,1,0">
                <ScrollViewer VerticalScrollBarVisibility="Auto">
                    <StackPanel Margin="10,12">
                        <Button Content="📊 الرئيسية (لوحة التحكم)" Command="{Binding GoToDashboardCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Button Content="👥 إدارة العملاء" Command="{Binding GoToCustomersCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Button Content="📦 سجل الطلبات" Command="{Binding GoToOrdersCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Separator Margin="0,8" Background="{StaticResource BorderLightBrush}" />
                        <Button Content="📦 المخزون والخامات" Command="{Binding GoToInventoryCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Button Content="🏭 الموردون والمشتريات" Command="{Binding GoToSuppliersCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Button Content="💰 المحاسبة والصندوق" Command="{Binding GoToAccountingCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Button Content="📈 التقارير المالية" Command="{Binding GoToReportsCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                        <Separator Margin="0,8" Background="{StaticResource BorderLightBrush}" />
                        <Button Content="⚙️ إعدادات الاستديو" Command="{Binding GoToSettingsCommand}" Margin="0,2" Padding="12,10" Background="Transparent" Foreground="{StaticResource TextLightBrush}" BorderThickness="0" HorizontalContentAlignment="Right" FontSize="13" Cursor="Hand" />
                    </StackPanel>
                </ScrollViewer>
            </Border>

            <!-- Dynamic Viewport -->
            <ContentControl Grid.Column="1" Content="{Binding CurrentViewModel}" Margin="16" />
        </Grid>
    </Grid>
</Window>
"""
write("StudioManagement.WPF/MainWindow.xaml", mainwindow_xaml)

mainwindow_cs = """using System.Windows;
using StudioManagement.WPF.ViewModels;

namespace StudioManagement.WPF;

public partial class MainWindow : Window
{
    public MainWindow(MainViewModel vm)
    {
        InitializeComponent();
        DataContext = vm;
    }
}
"""
write("StudioManagement.WPF/MainWindow.xaml.cs", mainwindow_cs)

# Login Window
login_xaml = """<Window x:Class="StudioManagement.WPF.Views.LoginWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="تسجيل الدخول - StudioManagement"
        Height="540" Width="460"
        WindowStartupLocation="CenterScreen"
        FlowDirection="RightToLeft"
        Background="{StaticResource SurfaceBrush}"
        ResizeMode="NoResize">
    <Grid Margin="30">
        <StackPanel VerticalAlignment="Center">
            <Border Width="64" Height="64" CornerRadius="16" Background="{StaticResource BrandAccentBlueBrush}" HorizontalAlignment="Center" Margin="0,0,0,16">
                <TextBlock Text="📸" FontSize="32" HorizontalAlignment="Center" VerticalAlignment="Center" />
            </Border>

            <TextBlock Text="StudioManagement" FontSize="22" FontWeight="Bold" Foreground="{StaticResource TextLightBrush}" HorizontalAlignment="Center" />
            <TextBlock Text="نظام إدارة استديو التصوير والطباعة المتكامل" FontSize="12" Foreground="{StaticResource TextMutedBrush}" HorizontalAlignment="Center" Margin="0,4,0,24" />

            <TextBlock Text="المستخدم:" FontSize="13" Foreground="{StaticResource TextLightBrush}" Margin="0,0,0,6" />
            <ComboBox ItemsSource="{Binding ActiveUsers}" SelectedItem="{Binding SelectedUser}" DisplayMemberPath="FullName" Height="38" Margin="0,0,0,16" FontSize="13" VerticalContentAlignment="Center" />

            <TextBlock Text="كلمة المرور:" FontSize="13" Foreground="{StaticResource TextLightBrush}" Margin="0,0,0,6" />
            <PasswordBox x:Name="PassBox" Height="38" Margin="0,0,0,20" FontSize="14" VerticalContentAlignment="Center" PasswordChanged="PassBox_PasswordChanged" />

            <Button Content="تسجيل الدخول" Command="{Binding LoginCommand}" CommandParameter="{Binding RelativeSource={RelativeSource AncestorType=Window}}" Height="42" Background="{StaticResource BrandAccentBlueBrush}" Foreground="White" FontWeight="Bold" FontSize="14" BorderThickness="0" Cursor="Hand" Margin="0,0,0,12" />

            <TextBlock Text="{Binding ErrorMessage}" Foreground="{StaticResource BrandDangerBrush}" FontSize="12" TextWrapping="Wrap" HorizontalAlignment="Center" />
        </StackPanel>
    </Grid>
</Window>
"""
write("StudioManagement.WPF/Views/LoginWindow.xaml", login_xaml)

login_cs = """using System.Windows;
using System.Windows.Controls;
using StudioManagement.WPF.ViewModels;

namespace StudioManagement.WPF.Views;

public partial class LoginWindow : Window
{
    private readonly LoginViewModel _vm;
    public LoginWindow(LoginViewModel vm)
    {
        InitializeComponent();
        DataContext = _vm = vm;
        PassBox.Password = vm.Password;
    }

    private void PassBox_PasswordChanged(object sender, RoutedEventArgs e)
    {
        if (sender is PasswordBox pb)
        {
            _vm.Password = pb.Password;
        }
    }
}
"""
write("StudioManagement.WPF/Views/LoginWindow.xaml.cs", login_cs)

# DashboardView
dashboard_xaml = """<UserControl x:Class="StudioManagement.WPF.Views.DashboardView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             FlowDirection="RightToLeft">
    <ScrollViewer VerticalScrollBarVisibility="Auto">
        <StackPanel Margin="0,0,10,0">
            <!-- KPI Summary Cards -->
            <UniformGrid Columns="4" Margin="0,0,0,20">
                <Border Background="{StaticResource CardBrush}" CornerRadius="10" Padding="16" Margin="6" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
                    <StackPanel>
                        <TextBlock Text="طلبات اليوم" FontSize="12" Foreground="{StaticResource TextMutedBrush}" />
                        <TextBlock Text="{Binding Stats.TotalOrdersToday}" FontSize="24" FontWeight="Bold" Foreground="{StaticResource TextLightBrush}" Margin="0,4,0,0" />
                    </StackPanel>
                </Border>

                <Border Background="{StaticResource CardBrush}" CornerRadius="10" Padding="16" Margin="6" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
                    <StackPanel>
                        <TextBlock Text="الطلبات الجاهزة" FontSize="12" Foreground="{StaticResource TextMutedBrush}" />
                        <TextBlock Text="{Binding Stats.ReadyOrdersCount}" FontSize="24" FontWeight="Bold" Foreground="{StaticResource BrandSuccessBrush}" Margin="0,4,0,0" />
                    </StackPanel>
                </Border>

                <Border Background="{StaticResource CardBrush}" CornerRadius="10" Padding="16" Margin="6" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
                    <StackPanel>
                        <TextBlock Text="ديون العملاء المتبقية" FontSize="12" Foreground="{StaticResource TextMutedBrush}" />
                        <TextBlock Text="{Binding Stats.TotalRemainingDebts, StringFormat='{}{0:N0} ر.ي'}" FontSize="20" FontWeight="Bold" Foreground="{StaticResource BrandAccentGoldBrush}" Margin="0,4,0,0" />
                    </StackPanel>
                </Border>

                <Border Background="{StaticResource CardBrush}" CornerRadius="10" Padding="16" Margin="6" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
                    <StackPanel>
                        <TextBlock Text="رصيد الصندوق والخزينة" FontSize="12" Foreground="{StaticResource TextMutedBrush}" />
                        <TextBlock Text="{Binding Stats.NetCashInTreasury, StringFormat='{}{0:N0} ر.ي'}" FontSize="20" FontWeight="Bold" Foreground="{StaticResource BrandAccentBlueBrush}" Margin="0,4,0,0" />
                    </StackPanel>
                </Border>
            </UniformGrid>

            <!-- Service Department Big Cards (Requirement 5) -->
            <TextBlock Text="أقسام وخدمات الاستديو المتخصصة" FontSize="16" FontWeight="Bold" Foreground="{StaticResource TextLightBrush}" Margin="6,0,0,12" />

            <ItemsControl ItemsSource="{Binding Cards}">
                <ItemsControl.ItemsPanel>
                    <ItemsPanelTemplate>
                        <UniformGrid Columns="4" />
                    </ItemsPanelTemplate>
                </ItemsControl.ItemsPanel>
                <ItemsControl.ItemTemplate>
                    <DataTemplate>
                        <Border Background="{StaticResource CardBrush}" CornerRadius="12" Padding="16" Margin="6" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
                            <StackPanel>
                                <TextBlock Text="{Binding Name}" FontSize="15" FontWeight="Bold" Foreground="{StaticResource TextLightBrush}" Margin="0,0,0,6" />
                                <TextBlock Text="{Binding Description}" FontSize="11" Foreground="{StaticResource TextMutedBrush}" TextWrapping="Wrap" Height="36" />
                                <DockPanel Margin="0,12,0,0">
                                    <TextBlock Text="{Binding OrdersCount, StringFormat='{}{0} طلب'}" FontSize="12" FontWeight="Bold" Foreground="{StaticResource BrandAccentBlueBrush}" VerticalAlignment="Center" />
                                    <Button Content="فتح القسم" Command="{Binding DataContext.OpenServiceCommand, RelativeSource={RelativeSource AncestorType=UserControl}}" CommandParameter="{Binding}" HorizontalAlignment="Left" Background="{StaticResource BrandAccentBlueBrush}" Foreground="White" Padding="10,4" BorderThickness="0" Cursor="Hand" />
                                </DockPanel>
                            </StackPanel>
                        </Border>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </StackPanel>
    </ScrollViewer>
</UserControl>
"""
write("StudioManagement.WPF/Views/DashboardView.xaml", dashboard_xaml)

dashboard_cs = """using System.Windows.Controls;

namespace StudioManagement.WPF.Views;

public partial class DashboardView : UserControl
{
    public DashboardView() => InitializeComponent();
}
"""
write("StudioManagement.WPF/Views/DashboardView.xaml.cs", dashboard_cs)

# CustomersView
customers_xaml = """<UserControl x:Class="StudioManagement.WPF.Views.CustomersView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             FlowDirection="RightToLeft">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>

        <!-- Action Bar -->
        <Border Grid.Row="0" Background="{StaticResource CardBrush}" CornerRadius="8" Padding="12" Margin="0,0,0,12" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
            <DockPanel>
                <Button Content="+ إضافة عميل جديد" Command="{Binding OpenAddCommand}" DockPanel.Dock="Left" Background="{StaticResource BrandAccentBlueBrush}" Foreground="White" Padding="14,8" BorderThickness="0" FontWeight="Bold" Cursor="Hand" />
                <TextBox Text="{Binding SearchQuery, UpdateSourceTrigger=PropertyChanged}" Width="320" Height="34" Margin="16,0,0,0" Padding="8,6" FontSize="13" VerticalContentAlignment="Center" />
            </DockPanel>
        </Border>

        <!-- Customers DataGrid -->
        <DataGrid Grid.Row="1" ItemsSource="{Binding Customers}" SelectedItem="{Binding SelectedCustomer}" AutoGenerateColumns="False" IsReadOnly="True" Background="{StaticResource CardBrush}" RowBackground="{StaticResource CardBrush}" AlternatingRowBackground="#182234" Foreground="{StaticResource TextLightBrush}" BorderBrush="{StaticResource BorderLightBrush}" GridLinesVisibility="Horizontal" HeadersVisibility="Column">
            <DataGrid.Columns>
                <DataGridTextColumn Header="رقم العميل" Binding="{Binding CustomerNumber}" Width="100" />
                <DataGridTextColumn Header="اسم العميل" Binding="{Binding Name}" Width="200" />
                <DataGridTextColumn Header="رقم الهاتف" Binding="{Binding Phone}" Width="130" />
                <DataGridTextColumn Header="العنوان" Binding="{Binding Address}" Width="180" />
                <DataGridTextColumn Header="الطلبات" Binding="{Binding OrdersCount}" Width="70" />
                <DataGridTextColumn Header="إجمالي المبيعات" Binding="{Binding TotalSpent, StringFormat='{}{0:N0}'}" Width="110" />
                <DataGridTextColumn Header="المدفوع" Binding="{Binding TotalPaid, StringFormat='{}{0:N0}'}" Width="110" />
                <DataGridTextColumn Header="المتبقي" Binding="{Binding TotalRemaining, StringFormat='{}{0:N0}'}" Width="110" />
                <DataGridTemplateColumn Header="إجراءات" Width="100">
                    <DataGridTemplateColumn.CellTemplate>
                        <DataTemplate>
                            <Button Content="حذف" Command="{Binding DataContext.DeleteCommand, RelativeSource={RelativeSource AncestorType=UserControl}}" CommandParameter="{Binding}" Background="{StaticResource BrandDangerBrush}" Foreground="White" BorderThickness="0" Padding="8,2" />
                        </DataTemplate>
                    </DataGridTemplateColumn.CellTemplate>
                </DataGridTemplateColumn>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</UserControl>
"""
write("StudioManagement.WPF/Views/CustomersView.xaml", customers_xaml)

customers_cs = """using System.Windows.Controls;

namespace StudioManagement.WPF.Views;

public partial class CustomersView : UserControl
{
    public CustomersView() => InitializeComponent();
}
"""
write("StudioManagement.WPF/Views/CustomersView.xaml.cs", customers_cs)

# OrdersView
orders_xaml = """<UserControl x:Class="StudioManagement.WPF.Views.OrdersView"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             FlowDirection="RightToLeft">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto" />
            <RowDefinition Height="*" />
        </Grid.RowDefinitions>

        <!-- Top Action Bar -->
        <Border Grid.Row="0" Background="{StaticResource CardBrush}" CornerRadius="8" Padding="12" Margin="0,0,0,12" BorderBrush="{StaticResource BorderLightBrush}" BorderThickness="1">
            <DockPanel>
                <Button Content="+ إنشاء طلب جديد (Wizard)" Command="{Binding OpenNewOrderWizardCommand}" DockPanel.Dock="Left" Background="{StaticResource BrandAccentBlueBrush}" Foreground="White" Padding="14,8" BorderThickness="0" FontWeight="Bold" Cursor="Hand" />
                <TextBox Text="{Binding SearchQuery, UpdateSourceTrigger=PropertyChanged}" Width="320" Height="34" Margin="16,0,0,0" Padding="8,6" FontSize="13" VerticalContentAlignment="Center" />
            </DockPanel>
        </Border>

        <!-- Orders DataGrid -->
        <DataGrid Grid.Row="1" ItemsSource="{Binding Orders}" SelectedItem="{Binding SelectedOrder}" AutoGenerateColumns="False" IsReadOnly="True" Background="{StaticResource CardBrush}" RowBackground="{StaticResource CardBrush}" AlternatingRowBackground="#182234" Foreground="{StaticResource TextLightBrush}" BorderBrush="{StaticResource BorderLightBrush}" GridLinesVisibility="Horizontal" HeadersVisibility="Column">
            <DataGrid.Columns>
                <DataGridTextColumn Header="رقم الطلب" Binding="{Binding OrderNumber}" Width="130" />
                <DataGridTextColumn Header="العميل" Binding="{Binding CustomerName}" Width="160" />
                <DataGridTextColumn Header="الخدمة" Binding="{Binding ServiceTitle}" Width="170" />
                <DataGridTextColumn Header="تاريخ الطلب" Binding="{Binding OrderDate, StringFormat='{}{0:yyyy/MM/dd}'}" Width="100" />
                <DataGridTextColumn Header="موعد التسليم" Binding="{Binding DeliveryDate, StringFormat='{}{0:yyyy/MM/dd}'}" Width="100" />
                <DataGridTextColumn Header="الإجمالي" Binding="{Binding TotalAmount, StringFormat='{}{0:N0}'}" Width="100" />
                <DataGridTextColumn Header="المدفوع" Binding="{Binding PaidAmount, StringFormat='{}{0:N0}'}" Width="100" />
                <DataGridTextColumn Header="المتبقي" Binding="{Binding RemainingAmount, StringFormat='{}{0:N0}'}" Width="100" />
                <DataGridTextColumn Header="الحالة" Binding="{Binding Status}" Width="100" />
                <DataGridTemplateColumn Header="إجراءات" Width="170">
                    <DataGridTemplateColumn.CellTemplate>
                        <DataTemplate>
                            <StackPanel Orientation="Horizontal">
                                <Button Content="فاتورة" Command="{Binding DataContext.PrintInvoiceCommand, RelativeSource={RelativeSource AncestorType=UserControl}}" CommandParameter="{Binding}" Background="{StaticResource BrandAccentBlueBrush}" Foreground="White" BorderThickness="0" Padding="8,2" Margin="2,0" />
                                <Button Content="دفعة" Command="{Binding DataContext.OpenAddPaymentCommand, RelativeSource={RelativeSource AncestorType=UserControl}}" CommandParameter="{Binding}" Background="{StaticResource BrandSuccessBrush}" Foreground="White" BorderThickness="0" Padding="8,2" Margin="2,0" />
                            </StackPanel>
                        </DataTemplate>
                    </DataGridTemplateColumn.CellTemplate>
                </DataGridTemplateColumn>
            </DataGrid.Columns>
        </DataGrid>
    </Grid>
</UserControl>
"""
write("StudioManagement.WPF/Views/OrdersView.xaml", orders_xaml)

orders_cs = """using System.Windows.Controls;

namespace StudioManagement.WPF.Views;

public partial class OrdersView : UserControl
{
    public OrdersView() => InitializeComponent();
}
"""
write("StudioManagement.WPF/Views/OrdersView.xaml.cs", orders_cs)

# Other Views
for view_name in ["InventoryView", "SuppliersView", "AccountingView", "ReportsView", "SettingsView", "OrderWizardView", "PurchaseFormView"]:
    v_xaml = f"""<UserControl x:Class="StudioManagement.WPF.Views.{view_name}"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             FlowDirection="RightToLeft">
    <Grid Margin="12">
        <Border Background="{{StaticResource CardBrush}}" CornerRadius="12" Padding="20" BorderBrush="{{StaticResource BorderLightBrush}}" BorderThickness="1">
            <StackPanel>
                <TextBlock Text="{view_name}" FontSize="18" FontWeight="Bold" Foreground="{{StaticResource TextLightBrush}}" Margin="0,0,0,8" />
                <TextBlock Text="شاشة متكاملة مرتبطة بقاعدة البيانات وخدمات النظام." FontSize="13" Foreground="{{StaticResource TextMutedBrush}}" />
            </StackPanel>
        </Border>
    </Grid>
</UserControl>
"""
    v_cs = f"""using System.Windows.Controls;

namespace StudioManagement.WPF.Views;

public partial class {view_name} : UserControl
{{
    public {view_name}() => InitializeComponent();
}}
"""
    write(f"StudioManagement.WPF/Views/{view_name}.xaml", v_xaml)
    write(f"StudioManagement.WPF/Views/{view_name}.xaml.cs", v_cs)
print("Views and ViewModels generated successfully.")
