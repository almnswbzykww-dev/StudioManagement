using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;
using StudioManagement.Application.DTOs;
using StudioManagement.Application.Interfaces;
using StudioManagement.Domain.Enums;
using StudioManagement.Infrastructure.Data;

namespace StudioManagement.WPF.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ICurrentUserService _currentUser;
    private readonly IStudioSettingsService _settings;
    private readonly INotificationService? _notificationService;

    [ObservableProperty] private object? _currentViewModel;
    [ObservableProperty] private string _studioName = "استديو الفن 3";
    [ObservableProperty] private string _currentUserRoleName = "المهندس زكريا فيصل العزعزي";
    [ObservableProperty] private string _currentTimeFormatted = DateTime.Now.ToString("hh:mm:ss tt", System.Globalization.CultureInfo.InvariantCulture);
    [ObservableProperty] private string _currentDateFormatted = DateTime.Now.ToString("dddd, dd MMMM yyyy", System.Globalization.CultureInfo.InvariantCulture);
    [ObservableProperty] private bool _isSidebarExpanded = true;

    [ObservableProperty] private int _unreadNotificationCount;
    [ObservableProperty] private bool _hasUnreadNotifications;
    [ObservableProperty] private ObservableCollection<NotificationDto> _notifications = new();
    [ObservableProperty] private bool _isNotificationsOpen;

    private readonly System.Windows.Threading.DispatcherTimer? _clockTimer;
    private readonly System.Windows.Threading.DispatcherTimer? _notifTimer;

    public MainViewModel(IServiceProvider serviceProvider, ICurrentUserService currentUser, IStudioSettingsService settings)
    {
        _serviceProvider = serviceProvider;
        _currentUser = currentUser;
        _settings = settings;
        _notificationService = (INotificationService?)serviceProvider.GetService(typeof(INotificationService));

        // Update English Date, Time, and Day every second
        _clockTimer = new System.Windows.Threading.DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1)
        };
        _clockTimer.Tick += (s, e) =>
        {
            CurrentTimeFormatted = DateTime.Now.ToString("hh:mm:ss tt", System.Globalization.CultureInfo.InvariantCulture);
            CurrentDateFormatted = DateTime.Now.ToString("dddd, dd MMMM yyyy", System.Globalization.CultureInfo.InvariantCulture);
        };
        _clockTimer.Start();

        // Notification polling & deadline check timer (every 15s)
        _notifTimer = new System.Windows.Threading.DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(15)
        };
        _notifTimer.Tick += async (s, e) =>
        {
            await RefreshNotificationsAsync();
        };
        _notifTimer.Start();

        _settings.SettingsChanged += (s, e) =>
        {
            Application.Current?.Dispatcher?.Invoke(() =>
            {
                StudioName = e.StudioName;
                if (_currentUser.CurrentUser != null)
                {
                    if (_currentUser.CurrentUser.RoleName == "مدير النظام")
                        CurrentUserRoleName = $"{e.SystemManagerName} (مدير النظام)";
                    else
                        CurrentUserRoleName = $"{_currentUser.CurrentUser.FullName} ({_currentUser.CurrentUser.RoleName})";
                }
            });
        };

        Task.Run(async () =>
        {
            try
            {
                var st = await _settings.GetSettingsAsync();
                Application.Current?.Dispatcher?.Invoke(() =>
                {
                    StudioName = st.StudioName;
                    if (_currentUser.CurrentUser != null)
                    {
                        if (_currentUser.CurrentUser.RoleName == "مدير النظام")
                            CurrentUserRoleName = $"{st.SystemManagerName} (مدير النظام)";
                        else
                            CurrentUserRoleName = $"{_currentUser.CurrentUser.FullName} ({_currentUser.CurrentUser.RoleName})";
                    }
                });
            }
            catch { }

            await Task.Delay(1500);
            await RefreshNotificationsAsync();
        });

        GoToDashboardCommand.Execute(null);
    }

    [RelayCommand]
    private void MinimizeWindow(Window? win)
    {
        if (win != null)
        {
            win.WindowState = WindowState.Minimized;
        }
        else if (Application.Current?.MainWindow != null)
        {
            Application.Current.MainWindow.WindowState = WindowState.Minimized;
        }
    }

    [RelayCommand]
    private void MaximizeWindow(Window? win)
    {
        var target = win ?? Application.Current?.MainWindow;
        if (target != null)
        {
            target.WindowState = target.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }
    }

    [RelayCommand]
    private void CloseWindow(Window? win)
    {
        Logout();
    }

    [RelayCommand]
    private void ToggleSidebar() => IsSidebarExpanded = !IsSidebarExpanded;

    [RelayCommand]
    private void GoToDashboard() => CurrentViewModel = (DashboardViewModel)_serviceProvider.GetService(typeof(DashboardViewModel))!;

    [RelayCommand]
    private void GoToCustomers()
    {
        if (!_currentUser.HasPermission("Customers:View"))
        {
            ShowPermissionWarning("مشاهدة العملاء");
            return;
        }
        CurrentViewModel = (CustomersViewModel)_serviceProvider.GetService(typeof(CustomersViewModel))!;
    }

    [RelayCommand]
    private void GoToOrders()
    {
        if (!_currentUser.HasPermission("Orders:View"))
        {
            ShowPermissionWarning("مشاهدة الطلبات والفواتير");
            return;
        }
        CurrentViewModel = (OrdersViewModel)_serviceProvider.GetService(typeof(OrdersViewModel))!;
    }

    [RelayCommand]
    private void GoToInventory()
    {
        if (!_currentUser.HasPermission("Orders:View"))
        {
            ShowPermissionWarning("المخزون والخامات");
            return;
        }
        CurrentViewModel = (InventoryViewModel)_serviceProvider.GetService(typeof(InventoryViewModel))!;
    }

    [RelayCommand]
    private void GoToSuppliers()
    {
        if (!_currentUser.HasPermission("Accounting:View"))
        {
            ShowPermissionWarning("الموردون والمشتريات");
            return;
        }
        CurrentViewModel = (SuppliersViewModel)_serviceProvider.GetService(typeof(SuppliersViewModel))!;
    }

    [RelayCommand]
    private void GoToAccounting()
    {
        if (!_currentUser.HasPermission("Accounting:View"))
        {
            ShowPermissionWarning("المحاسبة والصندوق");
            return;
        }
        CurrentViewModel = (AccountingViewModel)_serviceProvider.GetService(typeof(AccountingViewModel))!;
    }

    [RelayCommand]
    private void GoToReports()
    {
        if (!_currentUser.HasPermission("Reports:Sales") && !_currentUser.HasPermission("Reports:TodayIncome") && !_currentUser.HasPermission("Reports:FullFinancial"))
        {
            ShowPermissionWarning("التقارير المالية");
            return;
        }
        CurrentViewModel = (ReportsViewModel)_serviceProvider.GetService(typeof(ReportsViewModel))!;
    }

    [RelayCommand]
    private void GoToSettings()
    {
        if (!_currentUser.HasPermission("Settings:System") && !_currentUser.HasPermission("Settings:StudioInfo") && !_currentUser.HasPermission("Settings:Users"))
        {
            ShowPermissionWarning("إعدادات الاستديو والمستخدمين");
            return;
        }
        CurrentViewModel = (SettingsViewModel)_serviceProvider.GetService(typeof(SettingsViewModel))!;
    }

    [RelayCommand]
    private void ToggleNotifications()
    {
        IsNotificationsOpen = !IsNotificationsOpen;
        if (IsNotificationsOpen)
        {
            _ = RefreshNotificationsAsync();
        }
    }

    [RelayCommand]
    public async Task RefreshNotificationsAsync()
    {
        if (_notificationService == null) return;
        try
        {
            await _notificationService.CheckApproachingDeadlinesAsync();
            var list = await _notificationService.GetActiveNotificationsAsync(40);
            var count = await _notificationService.GetUnreadCountAsync();

            Application.Current?.Dispatcher?.Invoke(() =>
            {
                Notifications.Clear();
                foreach (var item in list) Notifications.Add(item);
                UnreadNotificationCount = count;
                HasUnreadNotifications = count > 0;
            });
        }
        catch { }
    }

    [RelayCommand]
    private async Task MarkNotificationAsReadAsync(object? param)
    {
        if (_notificationService == null || param == null) return;
        if (int.TryParse(param.ToString(), out int id))
        {
            try
            {
                await _notificationService.MarkAsReadAsync(id);
                await RefreshNotificationsAsync();
            }
            catch { }
        }
    }

    [RelayCommand]
    private async Task MarkAllNotificationsAsReadAsync()
    {
        if (_notificationService == null) return;
        try
        {
            await _notificationService.MarkAllAsReadAsync();
            await RefreshNotificationsAsync();
        }
        catch { }
    }

    [RelayCommand]
    private async Task DeleteNotificationAsync(object? param)
    {
        if (_notificationService == null || param == null) return;
        if (int.TryParse(param.ToString(), out int id))
        {
            try
            {
                await _notificationService.DeleteNotificationAsync(id);
                await RefreshNotificationsAsync();
            }
            catch { }
        }
    }

    [RelayCommand]
    private async Task ClearAllNotificationsAsync()
    {
        if (_notificationService == null) return;
        try
        {
            await _notificationService.ClearAllAsync();
            await RefreshNotificationsAsync();
        }
        catch { }
    }

    [RelayCommand]
    private async Task OpenNotificationItemAsync(NotificationDto? item)
    {
        if (item == null) return;
        if (!item.IsRead && _notificationService != null)
        {
            try
            {
                await _notificationService.MarkAsReadAsync(item.Id);
                await RefreshNotificationsAsync();
            }
            catch { }
        }
        IsNotificationsOpen = false;

        if (item.ActionTarget == "Orders")
        {
            GoToOrders();
        }
        else if (item.ActionTarget == "Accounting")
        {
            GoToAccounting();
        }
        else if (item.ActionTarget == "Customers")
        {
            GoToCustomers();
        }
        else if (item.ActionTarget == "Settings")
        {
            GoToSettings();
        }
        else
        {
            GoToDashboard();
        }
    }

    private static void ShowPermissionWarning(string moduleName)
    {
        MessageBox.Show(
            $"عذراً، ليس لديك صلاحية للوصول إلى [{moduleName}]. يرجى مراجعة مدير النظام.",
            "صلاحية غير كافية",
            MessageBoxButton.OK,
            MessageBoxImage.Warning,
            MessageBoxResult.OK,
            MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
        );
    }

    [RelayCommand]
    private void Logout()
    {
        var result = MessageBox.Show(
            "هل تريد تسجيل الخروج؟",
            "تسجيل الخروج من النظام",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question,
            MessageBoxResult.No,
            MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
        );

        if (result != MessageBoxResult.Yes) return;

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
    private readonly IStudioSettingsService _settingsService;
    private readonly IServiceProvider _sp;

    [ObservableProperty] private string _userNumber = "1001";
    [ObservableProperty] private string _username = "admin";
    [ObservableProperty] private string _detectedUserName = string.Empty;
    [ObservableProperty] private string _detectedRoleTitle = string.Empty;
    [ObservableProperty] private bool _isUserDetected;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string _errorMessage = string.Empty;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _studioName = "استديو الفن 3";
    [ObservableProperty] private string _studioTagline = "لتصوير الفيديو والإعلانات والطباعة الرقمية والحرارية";
    [ObservableProperty] private string? _studioLogoBase64;
    [ObservableProperty] private ObservableCollection<UserDto> _availableUsers = new();

    [ObservableProperty] private string _currentDateFormatted = DateTime.Now.ToString("yyyy-MM-dd");
    [ObservableProperty] private string _currentTimeFormatted = DateTime.Now.ToString("hh:mm:ss tt");
    [ObservableProperty] private string _currentDayArabic = DateTime.Now.ToString("dddd", new System.Globalization.CultureInfo("ar-SA"));

    public LoginViewModel(IAuthService auth, ICurrentUserService currentUser, IStudioSettingsService settingsService, IServiceProvider sp)
    {
        _auth = auth;
        _currentUser = currentUser;
        _settingsService = settingsService;
        _sp = sp;

        try
        {
            var clockTimer = new System.Windows.Threading.DispatcherTimer { Interval = TimeSpan.FromSeconds(1) };
            clockTimer.Tick += (s, e) =>
            {
                CurrentDateFormatted = DateTime.Now.ToString("yyyy-MM-dd");
                CurrentTimeFormatted = DateTime.Now.ToString("hh:mm:ss tt");
                CurrentDayArabic = DateTime.Now.ToString("dddd", new System.Globalization.CultureInfo("ar-SA"));
            };
            clockTimer.Start();
        }
        catch { }

        Task.Run(async () =>
        {
            try
            {
                var s = await _settingsService.GetSettingsAsync();
                var users = await _auth.GetActiveUsersForLoginAsync();
                Application.Current?.Dispatcher?.Invoke(() =>
                {
                    StudioName = s.StudioName;
                    StudioTagline = s.Tagline;
                    StudioLogoBase64 = s.LogoBase64;
                    AvailableUsers = new ObservableCollection<UserDto>(users);
                    SearchUserCommand.Execute(null);
                });
            }
            catch { }
        });
    }

    [RelayCommand]
    private async Task SearchUserAsync()
    {
        if (string.IsNullOrWhiteSpace(UserNumber))
        {
            DetectedUserName = string.Empty;
            DetectedRoleTitle = string.Empty;
            IsUserDetected = false;
            return;
        }

        var user = await _auth.FindUserByNumberOrUsernameAsync(UserNumber);
        if (user != null)
        {
            Username = user.Username;
            DetectedUserName = user.FullName;
            DetectedRoleTitle = user.RoleName;
            IsUserDetected = true;
            ErrorMessage = string.Empty;
        }
        else
        {
            DetectedUserName = string.Empty;
            DetectedRoleTitle = string.Empty;
            IsUserDetected = false;
        }
    }

    partial void OnUserNumberChanged(string value)
    {
        var normalized = StudioManagement.Application.Common.NumberNormalizer.NormalizeDigits(value);
        if (normalized != value)
        {
            UserNumber = normalized;
            return;
        }
        SearchUserCommand.Execute(null);
    }

    [RelayCommand]
    private void SelectUserChip(UserDto user)
    {
        UserNumber = user.UserNumber.ToString();
        Username = user.Username;
        DetectedUserName = user.FullName;
        DetectedRoleTitle = user.RoleName;
        IsUserDetected = true;
    }

    [RelayCommand]
    private async Task LoginAsync(Window window)
    {
        var targetIdentifier = !string.IsNullOrWhiteSpace(Username) ? Username : UserNumber;
        targetIdentifier = StudioManagement.Application.Common.NumberNormalizer.NormalizeDigits(targetIdentifier);

        if (string.IsNullOrWhiteSpace(targetIdentifier))
        {
            ErrorMessage = "يرجى إدخال رقم المستخدم أو اسم المستخدم.";
            return;
        }

        if (string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "يرجى كتابة كلمة المرور للمتابعة.";
            return;
        }

        IsLoading = true;
        ErrorMessage = string.Empty;

        var res = await _auth.LoginAsync(targetIdentifier, Password);
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

    [RelayCommand]
    private void MinimizeWindow(Window? win)
    {
        if (win != null)
        {
            win.WindowState = WindowState.Minimized;
        }
    }

    [RelayCommand]
    private void MaximizeWindow(Window? win)
    {
        if (win != null)
        {
            win.WindowState = win.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }
    }

    [RelayCommand]
    private void CloseWindow(Window? win)
    {
        if (win != null)
        {
            win.Close();
        }
        else
        {
            Application.Current?.Shutdown();
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
    private readonly IPrintService? _printService;

    [ObservableProperty] private ObservableCollection<CustomerDto> _customers = new();
    [ObservableProperty] private CustomerDto? _selectedCustomer;
    [ObservableProperty] private string _searchQuery = string.Empty;
    [ObservableProperty] private bool _isFormOpen;
    [ObservableProperty] private string _formName = string.Empty;
    [ObservableProperty] private string _formPhone = string.Empty;
    [ObservableProperty] private string _formAddress = string.Empty;
    [ObservableProperty] private string _formNotes = string.Empty;

    public CustomersViewModel(ICustomerService customerService, IPrintService? printService = null)
    {
        _customerService = customerService;
        _printService = printService;
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

    [RelayCommand]
    private async Task PrintCustomerStatementAsync(CustomerDto? customer)
    {
        var target = customer ?? SelectedCustomer;
        if (target == null || _printService == null) return;

        try
        {
            var data = await _printService.PrepareCustomerStatementPrintDataAsync(target.Id);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز كشف حساب العميل: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}

public partial class OrdersViewModel : ObservableObject
{
    private readonly IOrderService _orderService;
    private readonly IInvoiceHtmlBuilder _invoiceBuilder;
    private readonly IPrintService _printService;

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
    [ObservableProperty] private string _senderName = string.Empty;
    [ObservableProperty] private string _senderPhone = string.Empty;
    [ObservableProperty] private string _paymentNotes = string.Empty;

    public OrdersViewModel(IOrderService orderService, IInvoiceHtmlBuilder invoiceBuilder, IPrintService printService)
    {
        _orderService = orderService;
        _invoiceBuilder = invoiceBuilder;
        _printService = printService;
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
        try
        {
            var data = await _printService.PrepareOrderInvoicePrintDataAsync(order.Id);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm)
            {
                Owner = Application.Current?.MainWindow
            };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز الفاتورة للطباعة: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private void OpenAddPayment(OrderDto order)
    {
        SelectedOrder = order;
        PaymentAmount = order.RemainingAmount;
        PaymentMethod = PaymentMethod.Cash;
        WalletType = WalletType.Kuraimi;
        TransactionNumber = string.Empty;
        SenderName = string.Empty;
        SenderPhone = string.Empty;
        PaymentNotes = string.Empty;
        IsPaymentOpen = true;
    }

    [RelayCommand]
    private void SelectWallet(string walletName)
    {
        PaymentMethod = PaymentMethod.BankWallet;
        switch (walletName)
        {
            case "Jeeb": WalletType = WalletType.Jeeb; break;
            case "Jawwali": WalletType = WalletType.Jawwali; break;
            case "OneCash": WalletType = WalletType.OneCash; break;
            case "Floosak": WalletType = WalletType.Floosak; break;
            case "Kuraimi": WalletType = WalletType.Kuraimi; break;
            default: WalletType = WalletType.BankTransfer; break;
        }
    }

    [RelayCommand]
    private void SelectCash()
    {
        PaymentMethod = PaymentMethod.Cash;
    }

    [RelayCommand]
    private async Task SubmitPaymentAsync()
    {
        if (SelectedOrder == null || PaymentAmount <= 0) return;

        string walletNameStr = PaymentMethod == PaymentMethod.BankWallet ? GetWalletArabicName(WalletType) : null;

        await _orderService.AddPaymentAsync(new CreatePaymentDto(
            SelectedOrder.Id,
            PaymentAmount,
            PaymentMethod,
            PaymentMethod == PaymentMethod.BankWallet ? WalletType : null,
            walletNameStr,
            TransactionNumber,
            TransactionNumber,
            SenderName,
            SenderPhone,
            PaymentNotes
        ));

        IsPaymentOpen = false;
        await LoadOrdersAsync();
    }

    [RelayCommand]
    private void ClosePayment()
    {
        IsPaymentOpen = false;
    }

    private static string GetWalletArabicName(WalletType w) => w switch
    {
        WalletType.Jeeb => "محفظة جيب",
        WalletType.Jawwali => "محفظة جوالي",
        WalletType.OneCash => "محفظة ون كاش",
        WalletType.Floosak => "محفظة فلوسك",
        WalletType.Kuraimi => "محفظة كريمي / إم فلوس",
        _ => "تحويل بنكي"
    };
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
    private readonly IAuthService _auth;
    private readonly IPrintService? _printService;
    private readonly IEmployeeService? _employeeService;
    private readonly IPayrollService? _payrollService;

    [ObservableProperty] private int _selectedTabIndex = 0; // 0: Employees, 1: Cashbox & Vouchers, 2: Cashier Income, 3: Expenses, 4: Statements

    [ObservableProperty] private decimal _treasuryBalance;
    [ObservableProperty] private ObservableCollection<ExpenseDto> _expenses = new();
    [ObservableProperty] private ObservableCollection<EmployeeDto> _employees = new();
    [ObservableProperty] private ObservableCollection<EmployeeDto> _filteredEmployees = new();
    [ObservableProperty] private ObservableCollection<VoucherDto> _vouchers = new();
    [ObservableProperty] private ObservableCollection<VoucherDto> _filteredVouchers = new();
    [ObservableProperty] private ObservableCollection<CashboxTransactionDto> _cashboxTransactions = new();

    // Today's Income & Cashier Income
    [ObservableProperty] private TodayIncomeSummaryDto? _todayIncome;
    [ObservableProperty] private CashierIncomeReportDto? _cashierReport;
    [ObservableProperty] private DateTime _filterFromDate = DateTime.Today.AddDays(-7);
    [ObservableProperty] private DateTime _filterToDate = DateTime.Today;
    [ObservableProperty] private string _filterFromTime = "00:00";
    [ObservableProperty] private string _filterToTime = "23:59";
    [ObservableProperty] private ObservableCollection<UserDto> _cashiersList = new();
    [ObservableProperty] private UserDto? _selectedCashier;

    // Search queries
    [ObservableProperty] private string _employeeSearch = "";
    [ObservableProperty] private string _voucherSearch = "";
    [ObservableProperty] private string _voucherFilterType = "الكل";
    [ObservableProperty] private DateTime _voucherFromDate = DateTime.Today.AddDays(-30);
    [ObservableProperty] private DateTime _voucherToDate = DateTime.Today;

    // 1. Employee Management Modals & State
    [ObservableProperty] private bool _isNewEmployeeModalOpen;
    [ObservableProperty] private string _newEmpNumber = "";
    [ObservableProperty] private string _newEmpName = "";
    [ObservableProperty] private string _newEmpPhone = "";
    [ObservableProperty] private string _newEmpRole = "مصور استديو";
    [ObservableProperty] private decimal _newEmpSalary = 80000;
    [ObservableProperty] private DateTime _newEmpHireDate = DateTime.Today;
    [ObservableProperty] private decimal _newEmpOpeningDebt = 0;
    [ObservableProperty] private string _newEmpNotes = "";

    // Advance Modal
    [ObservableProperty] private bool _isAdvanceModalOpen;
    [ObservableProperty] private EmployeeDto? _selectedAdvanceEmp;
    [ObservableProperty] private decimal _advanceAmount = 10000;
    [ObservableProperty] private DateTime _advanceDate = DateTime.Today;
    [ObservableProperty] private PaymentMethod _advanceMethod = PaymentMethod.Cash;
    [ObservableProperty] private WalletType _advanceWallet = WalletType.Kuraimi;
    [ObservableProperty] private string _advanceNotes = "سلفة نقدية على الحساب";

    // Deduction Modal
    [ObservableProperty] private bool _isDeductionModalOpen;
    [ObservableProperty] private EmployeeDto? _selectedDeductionEmp;
    [ObservableProperty] private decimal _deductionAmount = 5000;
    [ObservableProperty] private string _deductionReason = "غياب / تأخير";
    [ObservableProperty] private DateTime _deductionDate = DateTime.Today;

    // Debt Modal (مديونية)
    [ObservableProperty] private bool _isDebtModalOpen;
    [ObservableProperty] private EmployeeDto? _selectedDebtEmp;
    [ObservableProperty] private decimal _debtAmount = 15000;
    [ObservableProperty] private string _debtReason = "سحب نقدي / مشتريات شخصية آجل";
    [ObservableProperty] private DateTime _debtDate = DateTime.Today;
    [ObservableProperty] private string _debtNotes = "";

    // Employee Payment Modal (سداد دفعة / مديونية)
    [ObservableProperty] private bool _isPaymentModalOpen;
    [ObservableProperty] private EmployeeDto? _selectedPaymentEmp;
    [ObservableProperty] private decimal _paymentAmount = 10000;
    [ObservableProperty] private DateTime _paymentDate = DateTime.Today;
    [ObservableProperty] private PaymentMethod _paymentMethod = PaymentMethod.Cash;
    [ObservableProperty] private WalletType _paymentWallet = WalletType.Kuraimi;
    [ObservableProperty] private string _paymentDesc = "سداد دفعة نقدية من المديونية";
    [ObservableProperty] private string _paymentNotes = "";

    // Salary Payment Modal
    [ObservableProperty] private bool _isSalaryModalOpen;
    [ObservableProperty] private EmployeeDto? _selectedSalaryEmp;
    [ObservableProperty] private string _salaryMonthYear = DateTime.Today.ToString("yyyy-MM");
    [ObservableProperty] private decimal _salaryBaseAmount = 0;
    [ObservableProperty] private decimal _salaryAdvancesDeducted = 0;
    [ObservableProperty] private decimal _salaryDeductions = 0;
    [ObservableProperty] private decimal _salaryAllowances = 0;
    [ObservableProperty] private decimal _salaryNetDue = 0;
    [ObservableProperty] private PaymentMethod _salaryMethod = PaymentMethod.Cash;
    [ObservableProperty] private string _salaryNotes = "";

    // 2. Voucher Modal (سند قبض / سند صرف)
    [ObservableProperty] private bool _isNewVoucherModalOpen;
    [ObservableProperty] private VoucherType _newVoucherType = VoucherType.Receipt;
    [ObservableProperty] private string _newVoucherTypeTitle = "سند قبض مالي (إيراد)";
    [ObservableProperty] private string _newVoucherBeneficiary = "";
    [ObservableProperty] private decimal _newVoucherAmount = 0;
    [ObservableProperty] private string _newVoucherDescription = "";
    [ObservableProperty] private PaymentMethod _newVoucherMethod = PaymentMethod.Cash;
    [ObservableProperty] private WalletType _newVoucherWallet = WalletType.Kuraimi;
    [ObservableProperty] private string _newVoucherRef = "";
    [ObservableProperty] private string _newVoucherNotes = "";

    // 3. New Expense Modal
    [ObservableProperty] private bool _isNewExpenseModalOpen;
    [ObservableProperty] private string _newExpenseCategory = "خامات ومستلزمات";
    [ObservableProperty] private decimal _newExpenseAmount = 0;
    [ObservableProperty] private string _newExpenseRecipient = "";
    [ObservableProperty] private string _newExpenseDesc = "";
    [ObservableProperty] private PaymentMethod _newExpenseMethod = PaymentMethod.Cash;
    [ObservableProperty] private WalletType _newExpenseWallet = WalletType.Kuraimi;

    // 4. Statements State
    [ObservableProperty] private string _stmtAccountType = "employee"; // employee, customer, supplier, cashbox
    [ObservableProperty] private int _stmtEntityId = 1;
    [ObservableProperty] private DateTime _stmtFromDate = DateTime.Today.AddDays(-30);
    [ObservableProperty] private DateTime _stmtToDate = DateTime.Today;
    [ObservableProperty] private AccountStatementDto? _currentStatement;

    public AccountingViewModel(
        IAccountingService accounting, 
        IExpenseService expense, 
        IAuthService auth, 
        IPrintService? printService = null,
        IEmployeeService? employeeService = null,
        IPayrollService? payrollService = null)
    {
        _accounting = accounting;
        _expense = expense;
        _auth = auth;
        _printService = printService;
        _employeeService = employeeService;
        _payrollService = payrollService;

        LoadDataCommand.Execute(null);
    }

    [RelayCommand]
    public async Task LoadDataAsync()
    {
        try
        {
            TreasuryBalance = await _accounting.GetTreasuryBalanceAsync();
            TodayIncome = await _accounting.GetTodayIncomeSummaryAsync();
            
            var expList = await _expense.GetAllExpensesAsync();
            Expenses = new ObservableCollection<ExpenseDto>(expList);

            if (_employeeService != null)
            {
                var empList = await _employeeService.GetAllEmployeesAsync();
                Employees = new ObservableCollection<EmployeeDto>(empList);
            }

            var vouchersList = await _accounting.GetVouchersAsync();
            Vouchers = new ObservableCollection<VoucherDto>(vouchersList);

            var cbList = await _accounting.GetCashboxTransactionsAsync();
            CashboxTransactions = new ObservableCollection<CashboxTransactionDto>(cbList);

            var users = await _auth.GetAllUsersAsync();
            CashiersList = new ObservableCollection<UserDto>(users);

            await SearchCashierIncomeAsync();

            ApplyEmployeeFilter();
            ApplyVoucherFilter();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading accounting data: {ex.Message}");
        }
    }

    partial void OnEmployeeSearchChanged(string value) => ApplyEmployeeFilter();
    partial void OnVoucherSearchChanged(string value) => ApplyVoucherFilter();
    partial void OnVoucherFilterTypeChanged(string value) => ApplyVoucherFilter();
    partial void OnVoucherFromDateChanged(DateTime value) => ApplyVoucherFilter();
    partial void OnVoucherToDateChanged(DateTime value) => ApplyVoucherFilter();

    [RelayCommand]
    public void ApplyEmployeeFilter()
    {
        if (string.IsNullOrWhiteSpace(EmployeeSearch))
        {
            FilteredEmployees = new ObservableCollection<EmployeeDto>(Employees);
            return;
        }
        var q = EmployeeSearch.Trim().ToLower();
        var filtered = Employees.Where(e =>
            (e.Name != null && e.Name.ToLower().Contains(q)) ||
            (e.EmpNumber != null && e.EmpNumber.ToLower().Contains(q)) ||
            (e.Role != null && e.Role.ToLower().Contains(q)) ||
            (e.Phone != null && e.Phone.Contains(q))
        ).ToList();
        FilteredEmployees = new ObservableCollection<EmployeeDto>(filtered);
    }

    [RelayCommand]
    public void ApplyVoucherFilter()
    {
        var qry = Vouchers.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(VoucherSearch))
        {
            var s = VoucherSearch.Trim().ToLower();
            qry = qry.Where(v =>
                (v.VoucherNumber != null && v.VoucherNumber.ToLower().Contains(s)) ||
                (v.BeneficiaryOrPayer != null && v.BeneficiaryOrPayer.ToLower().Contains(s)) ||
                (v.Description != null && v.Description.ToLower().Contains(s)) ||
                (v.TransactionReference != null && v.TransactionReference.ToLower().Contains(s))
            );
        }

        if (VoucherFilterType == "قبض" || VoucherFilterType == "سند قبض")
            qry = qry.Where(v => v.Type == VoucherType.Receipt);
        else if (VoucherFilterType == "صرف" || VoucherFilterType == "سند صرف")
            qry = qry.Where(v => v.Type == VoucherType.Payment || v.Type == VoucherType.Advance);

        qry = qry.Where(v => v.Date.Date >= VoucherFromDate.Date && v.Date.Date <= VoucherToDate.Date);

        FilteredVouchers = new ObservableCollection<VoucherDto>(qry.OrderByDescending(v => v.Date).ThenByDescending(v => v.Id));
    }

    [RelayCommand]
    private void SelectTab(object? tabIndex)
    {
        if (tabIndex != null && int.TryParse(tabIndex.ToString(), out int idx))
        {
            SelectedTabIndex = idx;
        }
    }

    // --- EMPLOYEES & PAYROLL COMMANDS ---

    [RelayCommand]
    private void OpenNewEmployeeModal()
    {
        NewEmpNumber = "";
        NewEmpName = "";
        NewEmpPhone = "";
        NewEmpRole = "مصور استديو";
        NewEmpSalary = 80000;
        NewEmpHireDate = DateTime.Today;
        NewEmpOpeningDebt = 0;
        NewEmpNotes = "";
        IsNewEmployeeModalOpen = true;
    }

    [RelayCommand]
    private void CloseNewEmployeeModal() => IsNewEmployeeModalOpen = false;

    [RelayCommand]
    private async Task SaveNewEmployeeAsync()
    {
        if (string.IsNullOrWhiteSpace(NewEmpName))
        {
            MessageBox.Show("يرجى إدخال اسم الموظف.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        if (_employeeService != null)
        {
            try
            {
                var dto = new CreateEmployeeDto(
                    NewEmpName.Trim(), 
                    NewEmpRole.Trim(), 
                    NewEmpPhone.Trim(), 
                    NewEmpHireDate, 
                    NewEmpSalary, 
                    NewEmpOpeningDebt, 
                    NewEmpNotes, 
                    string.IsNullOrWhiteSpace(NewEmpNumber) ? null : NewEmpNumber.Trim()
                );
                var created = await _employeeService.CreateEmployeeAsync(dto);

                IsNewEmployeeModalOpen = false;
                await LoadDataAsync();

                var res = MessageBox.Show($"تم حفظ بيانات الموظف [{created.Name}] بنجاح برقم وظيفي: {created.EmpNumber}.\nالراتب الشهري المتفق عليه: {created.BaseSalary:N0} ر.ي.\nالمديونية المسجلة: {created.InitialDebt:N0} ر.ي.\nهل ترغب في طباعة كشف حساب الموظف المعتمد الآن؟", "تم الحفظ بنجاح", MessageBoxButton.YesNo, MessageBoxImage.Information);
                if (res == MessageBoxResult.Yes)
                {
                    await PrintEmployeeStatementAsync(created);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"تعذر حفظ الموظف: {ex.Message}", "خطأ في الحفظ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    [RelayCommand]
    private void OpenAdvanceModal(EmployeeDto? emp)
    {
        SelectedAdvanceEmp = emp ?? Employees.FirstOrDefault();
        AdvanceAmount = 10000;
        AdvanceDate = DateTime.Today;
        AdvanceNotes = "سلفة نقدية على الحساب";
        IsAdvanceModalOpen = true;
    }

    [RelayCommand]
    private void CloseAdvanceModal() => IsAdvanceModalOpen = false;

    [RelayCommand]
    private async Task SaveAdvanceAsync()
    {
        if (SelectedAdvanceEmp == null || AdvanceAmount <= 0)
        {
            MessageBox.Show("يرجى اختيار الموظف وتحديد مبلغ السلفة.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            if (_employeeService != null)
            {
                var adv = await _employeeService.CreateAdvanceAsync(new CreateSalaryAdvanceDto(
                    SelectedAdvanceEmp.Id,
                    AdvanceAmount,
                    AdvanceDate.ToString("yyyy-MM"),
                    AdvanceNotes
                ));

                // Also register voucher
                var voucher = await _accounting.CreateVoucherAsync(new CreateVoucherDto(
                    VoucherType.Advance,
                    SelectedAdvanceEmp.Name,
                    AdvanceAmount,
                    $"سلفة موظف: {SelectedAdvanceEmp.Name} ({adv.AdvanceNumber})",
                    AdvanceMethod,
                    AdvanceWallet,
                    adv.AdvanceNumber,
                    null,
                    SelectedAdvanceEmp.Id,
                    null,
                    null,
                    AdvanceNotes
                ));

                IsAdvanceModalOpen = false;
                await LoadDataAsync();

                var res = MessageBox.Show($"تم تسجيل السلفة بمبلغ {AdvanceAmount:N0} ر.ي بنجاح برقم {adv.AdvanceNumber}.\nهل ترغب في طباعة سند الصرف الآن؟", "نجاح العملية", MessageBoxButton.YesNo, MessageBoxImage.Question);
                if (res == MessageBoxResult.Yes && _printService != null)
                {
                    await PrintPaymentVoucherAsync(voucher.Id);
                }
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر تسجيل السلفة: {ex.Message}", "خطأ في التسجيل", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private void OpenDeductionModal(EmployeeDto? emp)
    {
        SelectedDeductionEmp = emp ?? Employees.FirstOrDefault();
        DeductionAmount = 5000;
        DeductionReason = "خصم إداري / جزاء";
        DeductionDate = DateTime.Today;
        IsDeductionModalOpen = true;
    }

    [RelayCommand]
    private void CloseDeductionModal() => IsDeductionModalOpen = false;

    [RelayCommand]
    private async Task SaveDeductionAsync()
    {
        if (SelectedDeductionEmp == null || DeductionAmount <= 0)
        {
            MessageBox.Show("يرجى اختيار الموظف وتحديد مبلغ الخصم.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            await _accounting.CreateEmployeeDeductionAsync(new CreateEmployeeDeductionDto(
                SelectedDeductionEmp.Id,
                DeductionAmount,
                DeductionReason,
                DeductionDate.ToString("yyyy-MM"),
                $"تم تسجيل الخصم بتاريخ {DeductionDate:yyyy/MM/dd}"
            ));

            IsDeductionModalOpen = false;
            await LoadDataAsync();
            MessageBox.Show($"تم تسجيل الخصم الإداري بمبلغ {DeductionAmount:N0} ر.ي للموظف {SelectedDeductionEmp.Name} بنجاح.", "تم الحفظ", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر تسجيل الخصم: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // --- DEBT COMMANDS (تسجيل مديونية) ---

    [RelayCommand]
    private void OpenDebtModal(EmployeeDto? emp)
    {
        SelectedDebtEmp = emp ?? Employees.FirstOrDefault();
        DebtAmount = 15000;
        DebtReason = "سحب نقدي / مشتريات شخصية آجل";
        DebtDate = DateTime.Today;
        DebtNotes = "";
        IsDebtModalOpen = true;
    }

    [RelayCommand]
    private void CloseDebtModal() => IsDebtModalOpen = false;

    [RelayCommand]
    private async Task SaveDebtAsync()
    {
        if (SelectedDebtEmp == null || DebtAmount <= 0)
        {
            MessageBox.Show("يرجى اختيار الموظف وتحديد مبلغ المديونية.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            if (_employeeService != null)
            {
                var debt = await _employeeService.CreateDebtAsync(new CreateEmployeeDebtDto(
                    SelectedDebtEmp.Id,
                    DebtAmount,
                    DebtDate,
                    DebtReason.Trim(),
                    DebtNotes
                ));

                IsDebtModalOpen = false;
                await LoadDataAsync();

                var res = MessageBox.Show($"تم تسجيل المديونية بمبلغ {debt.Amount:N0} ر.ي برقم {debt.DebtNumber} للموظف [{SelectedDebtEmp.Name}] بنجاح.\nهل ترغب في طباعة سند المديونية / إشعار الخصم الآن؟", "تم الحفظ بنجاح", MessageBoxButton.YesNo, MessageBoxImage.Information);
                if (res == MessageBoxResult.Yes && _printService != null)
                {
                    await PrintEmployeeStatementAsync(SelectedDebtEmp);
                }
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر تسجيل المديونية: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // --- EMPLOYEE PAYMENT COMMANDS (سداد دفعة / مديونية) ---

    [RelayCommand]
    private void OpenPaymentModal(EmployeeDto? emp)
    {
        SelectedPaymentEmp = emp ?? Employees.FirstOrDefault();
        PaymentAmount = 10000;
        PaymentDate = DateTime.Today;
        PaymentMethod = PaymentMethod.Cash;
        PaymentWallet = WalletType.Kuraimi;
        PaymentDesc = "سداد دفعة نقدية لتسوية المديونية";
        PaymentNotes = "";
        IsPaymentModalOpen = true;
    }

    [RelayCommand]
    private void ClosePaymentModal() => IsPaymentModalOpen = false;

    [RelayCommand]
    private async Task SaveEmployeePaymentAsync()
    {
        if (SelectedPaymentEmp == null || PaymentAmount <= 0)
        {
            MessageBox.Show("يرجى اختيار الموظف وتحديد مبلغ الدفعة المسددة.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            if (_employeeService != null)
            {
                var payment = await _employeeService.CreatePaymentAsync(new CreateEmployeePaymentDto(
                    SelectedPaymentEmp.Id,
                    PaymentAmount,
                    PaymentDate,
                    PaymentMethod,
                    PaymentWallet,
                    PaymentDesc.Trim(),
                    null,
                    PaymentNotes
                ));

                // Also create Receipt Voucher for the treasury
                var voucher = await _accounting.CreateVoucherAsync(new CreateVoucherDto(
                    VoucherType.Receipt,
                    SelectedPaymentEmp.Name,
                    PaymentAmount,
                    $"سداد دفعة من الموظف: {SelectedPaymentEmp.Name} ({payment.PaymentNumber})",
                    PaymentMethod,
                    PaymentWallet,
                    payment.PaymentNumber,
                    null,
                    SelectedPaymentEmp.Id,
                    null,
                    null,
                    PaymentNotes
                ));

                IsPaymentModalOpen = false;
                await LoadDataAsync();

                var res = MessageBox.Show($"تم حفظ وتوريد الدفعة بمبلغ {PaymentAmount:N0} ر.ي بنجاح إلى الصندوق.\nرقم سند القبض: {voucher.VoucherNumber}.\nهل ترغب في طباعة سند القبض المعتمد الآن؟", "تم الحفظ بنجاح", MessageBoxButton.YesNo, MessageBoxImage.Information);
                if (res == MessageBoxResult.Yes && _printService != null)
                {
                    await PrintReceiptVoucherAsync(voucher.Id);
                }
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر تسجيل الدفعة: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task OpenSalaryModalAsync(EmployeeDto? emp)
    {
        var targetEmp = emp ?? Employees.FirstOrDefault();
        if (targetEmp == null) return;

        SelectedSalaryEmp = targetEmp;
        SalaryMonthYear = DateTime.Today.ToString("yyyy-MM");
        SalaryBaseAmount = targetEmp.BaseSalary;
        SalaryAllowances = 0;

        try
        {
            var summary = await _accounting.GetEmployeeFinancialSummaryAsync(targetEmp.Id);
            SalaryAdvancesDeducted = summary.UnpaidAdvances;
            SalaryDeductions = summary.TotalDeductions;
            RecalculateSalaryNetDue();
            IsSalaryModalOpen = true;
        }
        catch
        {
            SalaryAdvancesDeducted = targetEmp.PendingAdvances;
            SalaryDeductions = 0;
            RecalculateSalaryNetDue();
            IsSalaryModalOpen = true;
        }
    }

    [RelayCommand]
    private void CloseSalaryModal() => IsSalaryModalOpen = false;

    partial void OnSalaryAllowancesChanged(decimal value) => RecalculateSalaryNetDue();
    partial void OnSalaryDeductionsChanged(decimal value) => RecalculateSalaryNetDue();
    partial void OnSalaryAdvancesDeductedChanged(decimal value) => RecalculateSalaryNetDue();

    private void RecalculateSalaryNetDue()
    {
        SalaryNetDue = Math.Max(0, SalaryBaseAmount + SalaryAllowances - SalaryDeductions - SalaryAdvancesDeducted);
    }

    [RelayCommand]
    private async Task SaveSalaryPaymentAsync()
    {
        if (SelectedSalaryEmp == null) return;

        try
        {
            var salary = await _accounting.ProcessSalaryPaymentAsync(new ProcessPartialSalaryDto(
                SelectedSalaryEmp.Id,
                SalaryMonthYear,
                SalaryAllowances,
                SalaryDeductions,
                SalaryAdvancesDeducted,
                SalaryNetDue,
                SalaryPaymentMethod,
                SalaryNotes
            ));

            IsSalaryModalOpen = false;
            await LoadDataAsync();

            var res = MessageBox.Show($"تم صرف راتب الموظف [{SelectedSalaryEmp.Name}] لشهر {SalaryMonthYear} بنجاح برقم {salary.PaymentNumber}.\nصافي المستلم: {salary.NetSalary:N0} ر.ي.\nهل ترغب في طباعة قسيمة صرف الراتب الآن؟", "نجاح العملية", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (res == MessageBoxResult.Yes && _printService != null)
            {
                await PrintSalarySlipAsync(salary.Id);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر صرف الراتب: {ex.Message}", "خطأ في الصرف", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintEmployeeStatementAsync(EmployeeDto? emp)
    {
        var target = emp ?? Employees.FirstOrDefault();
        if (target == null || _printService == null) return;

        try
        {
            var data = await _printService.PrepareEmployeeStatementPrintDataAsync(target.Id);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز كشف حساب الموظف: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintSalarySlipAsync(int salaryId)
    {
        if (_printService == null) return;
        try
        {
            var data = await _printService.PrepareSalarySlipPrintDataAsync(salaryId);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في طباعة قسيمة الراتب: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintPayrollAsync()
    {
        if (_printService == null) return;
        try
        {
            string month = DateTime.Today.ToString("yyyy-MM");
            var data = await _printService.PreparePayrollPrintDataAsync(month);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز مسير الرواتب: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // --- VOUCHERS COMMANDS ---

    [RelayCommand]
    private void OpenNewVoucherModal(string? typeStr)
    {
        if (typeStr == "Receipt" || typeStr == "قبض")
        {
            NewVoucherType = VoucherType.Receipt;
            NewVoucherTypeTitle = "سند قبض مالي جديد (تحصيل إيراد)";
        }
        else
        {
            NewVoucherType = VoucherType.Payment;
            NewVoucherTypeTitle = "سند صرف مالي جديد (مصروف / دفعة)";
        }

        NewVoucherBeneficiary = "";
        NewVoucherAmount = 0;
        NewVoucherDescription = "";
        NewVoucherMethod = PaymentMethod.Cash;
        NewVoucherWallet = WalletType.Kuraimi;
        NewVoucherRef = "";
        NewVoucherNotes = "";
        IsNewVoucherModalOpen = true;
    }

    [RelayCommand]
    private void CloseNewVoucherModal() => IsNewVoucherModalOpen = false;

    [RelayCommand]
    private async Task SaveVoucherAsync()
    {
        if (string.IsNullOrWhiteSpace(NewVoucherBeneficiary) || NewVoucherAmount <= 0)
        {
            MessageBox.Show("يرجى إدخال اسم المستفيد/الدافع والمبلغ بشكل صحيح.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            var voucher = await _accounting.CreateVoucherAsync(new CreateVoucherDto(
                NewVoucherType,
                NewVoucherBeneficiary.Trim(),
                NewVoucherAmount,
                NewVoucherDescription.Trim(),
                NewVoucherMethod,
                NewVoucherWallet,
                NewVoucherRef.Trim(),
                null,
                null,
                null,
                null,
                NewVoucherNotes
            ));

            IsNewVoucherModalOpen = false;
            await LoadDataAsync();

            var res = MessageBox.Show($"تم حفظ {NewVoucherTypeTitle} برقم {voucher.VoucherNumber} بمبلغ {voucher.Amount:N0} ر.ي بنجاح.\nهل ترغب في فتح معاينة الطباعة الآن؟", "تم الحفظ بنجاح", MessageBoxButton.YesNo, MessageBoxImage.Information);
            if (res == MessageBoxResult.Yes && _printService != null)
            {
                if (voucher.Type == VoucherType.Receipt)
                    await PrintReceiptVoucherAsync(voucher.Id);
                else
                    await PrintPaymentVoucherAsync(voucher.Id);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر حفظ السند: {ex.Message}", "خطأ في الحفظ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintVoucherAsync(VoucherDto? voucher)
    {
        if (voucher == null) return;
        if (voucher.Type == VoucherType.Receipt)
            await PrintReceiptVoucherAsync(voucher.Id);
        else
            await PrintPaymentVoucherAsync(voucher.Id);
    }

    [RelayCommand]
    private async Task ReprintVoucherAsync(VoucherDto? voucher)
    {
        if (voucher == null)
        {
            MessageBox.Show("يرجى اختيار السند من الجدول أولاً لمعاينته وإعادة طباعته.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }
        await PrintVoucherAsync(voucher);
    }

    // --- EXPENSES COMMANDS ---

    [RelayCommand]
    private void OpenNewExpenseModal()
    {
        NewExpenseCategory = "خامات ومستلزمات";
        NewExpenseAmount = 0;
        NewExpenseRecipient = "";
        NewExpenseDesc = "";
        NewExpenseMethod = PaymentMethod.Cash;
        IsNewExpenseModalOpen = true;
    }

    [RelayCommand]
    private void CloseNewExpenseModal() => IsNewExpenseModalOpen = false;

    [RelayCommand]
    private async Task SaveExpenseAsync()
    {
        if (string.IsNullOrWhiteSpace(NewExpenseCategory) || NewExpenseAmount <= 0)
        {
            MessageBox.Show("يرجى إدخال بند المصروف والمبلغ.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        try
        {
            var exp = await _expense.CreateExpenseAsync(new CreateExpenseDto(
                NewExpenseCategory,
                NewExpenseAmount,
                DateTime.Now,
                NewExpenseRecipient.Trim(),
                NewExpenseDesc.Trim(),
                NewExpenseMethod,
                NewExpenseWallet
            ));

            IsNewExpenseModalOpen = false;
            await LoadDataAsync();
            MessageBox.Show($"تم تسجيل المصروف بمبلغ {exp.Amount:N0} ر.ي برقم {exp.VoucherNumber} بنجاح.", "تم الحفظ", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر تسجيل المصروف: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task DeleteExpenseAsync(object? param)
    {
        if (param != null && int.TryParse(param.ToString(), out int id))
        {
            var res = MessageBox.Show("هل أنت متأكد من حذف هذا المصروف؟", "تأكيد الحذف", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (res == MessageBoxResult.Yes)
            {
                await _expense.DeleteAsync(id);
                await LoadDataAsync();
            }
        }
    }

    [RelayCommand]
    private async Task PrintExpenseVoucherAsync(ExpenseDto? expense)
    {
        if (expense == null || _printService == null) return;
        try
        {
            var printData = new PrintDocumentData(
                DocumentTypeTitle: $"سند صرف مصروف رسمي - {expense.Category}",
                DocumentNumber: expense.VoucherNumber,
                Date: expense.ExpenseDate,
                Time: DateTime.Now.ToString("hh:mm tt"),
                DayName: DateTime.Now.ToString("dddd"),
                StudioName: "استديو الفن 3",
                StudioAddress: "صنعاء",
                StudioPhone: "777000111",
                LogoPath: null,
                RecipientName: expense.Recipient,
                RecipientPhone: "-",
                RecipientAddress: "سند صرف مصروفات تشغيلية",
                Items: new List<PrintItemRow>
                {
                    new(1, $"{expense.Category} - {expense.Description}", 1, expense.Amount, expense.Amount)
                },
                TotalAmount: expense.Amount,
                PaidAmount: expense.Amount,
                RemainingAmount: 0,
                PaymentMethodDisplay: expense.PaymentMethod.ToString(),
                ReferenceNumber: expense.VoucherNumber,
                Currency: "ريال يمني",
                Notes: expense.Description ?? "سند صرف معتمد قانونياً",
                Terms: "تم الصرف بموجب هذا السند وإبراء ذمة الصندوق.",
                CreatedByName: expense.RecordedByName ?? "المحاسب المالي",
                CopiesCount: 1,
                PaperSize: "A4"
            );

            var vm = new PrintPreviewViewModel(printData, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر طباعة سند الصرف: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintExpensesReportAsync()
    {
        if (_printService == null || Expenses.Count == 0) return;
        try
        {
            int idx = 1;
            var items = Expenses.Select(e => new PrintItemRow(
                idx++,
                $"{e.VoucherNumber} | {e.Category} | {e.Recipient} | {e.ExpenseDate:yyyy/MM/dd}",
                1,
                e.Amount,
                e.Amount
            )).ToList();

            var total = Expenses.Sum(e => e.Amount);

            var printData = new PrintDocumentData(
                DocumentTypeTitle: "تقرير كشف المصروفات وسندات الصرف الشامل",
                DocumentNumber: $"EXP-RPT-{DateTime.Now:yyyyMMdd}",
                Date: DateTime.Now,
                Time: DateTime.Now.ToString("hh:mm tt"),
                DayName: DateTime.Now.ToString("dddd"),
                StudioName: "استديو الفن 3",
                StudioAddress: "صنعاء",
                StudioPhone: "777000111",
                LogoPath: null,
                RecipientName: "الإدارة المالية العامة",
                RecipientPhone: "-",
                RecipientAddress: $"إجمالي عدد السندات: {Expenses.Count}",
                Items: items,
                TotalAmount: total,
                PaidAmount: total,
                RemainingAmount: 0,
                PaymentMethodDisplay: "كشف تحليلي للمصروفات",
                ReferenceNumber: null,
                Currency: "ريال يمني",
                Notes: $"إجمالي المصروفات المنصرفة: {total:N0} ريال يمني",
                Terms: "كشف مصروفات معتمد ومطابق لقيود الصندوق وسندات الصرف.",
                CreatedByName: "المحاسب المالي",
                CopiesCount: 1,
                PaperSize: "A4"
            );

            var vm = new PrintPreviewViewModel(printData, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر طباعة تقرير المصروفات: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // --- STATEMENTS COMMANDS ---

    [RelayCommand]
    private async Task SearchStatementAsync()
    {
        try
        {
            CurrentStatement = await _accounting.GetAccountStatementAsync(StmtAccountType, StmtEntityId, StmtFromDate, StmtToDate);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر جلب كشف الحساب: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintCurrentStatementAsync()
    {
        if (CurrentStatement == null || _printService == null)
        {
            await SearchStatementAsync();
            if (CurrentStatement == null) return;
        }

        try
        {
            int idx = 1;
            var items = CurrentStatement.Rows.Select(r => new PrintItemRow(
                idx++,
                r.Description,
                1,
                r.Debit > 0 ? r.Debit : r.Credit,
                r.Debit > 0 ? r.Debit : r.Credit
            )).ToList();

            var printData = new PrintDocumentData(
                DocumentTypeTitle: $"كشف حساب تفصيلي - {CurrentStatement.EntityName}",
                DocumentNumber: $"STMT-{DateTime.Now:yyyyMMdd-HHmmss}",
                Date: DateTime.Now,
                Time: DateTime.Now.ToString("hh:mm tt"),
                DayName: DateTime.Now.ToString("dddd"),
                StudioName: "استديو الفن 3",
                StudioAddress: "صنعاء",
                StudioPhone: "777000111",
                LogoPath: null,
                RecipientName: CurrentStatement.EntityName,
                RecipientPhone: "-",
                RecipientAddress: $"الفترة من: {CurrentStatement.FromDate:yyyy/MM/dd} إلى: {CurrentStatement.ToDate:yyyy/MM/dd}",
                Items: items,
                TotalAmount: CurrentStatement.TotalDebit,
                PaidAmount: CurrentStatement.TotalCredit,
                RemainingAmount: CurrentStatement.ClosingBalance,
                PaymentMethodDisplay: "كشف حساب دوري",
                ReferenceNumber: null,
                Currency: "ريال يمني",
                Notes: $"رصيد بداية المدة: {CurrentStatement.OpeningBalance:N0} • الرصيد الختامي: {CurrentStatement.ClosingBalance:N0}",
                Terms: "كشف حساب رسمي معتمد صادر من النظام الآلي للاستديو.",
                CreatedByName: "الإدارة المالية",
                CopiesCount: 1,
                PaperSize: "A4"
            );

            var vm = new PrintPreviewViewModel(printData, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في طباعة كشف الحساب: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    // --- CASHIER INCOME REPORT COMMANDS ---

    [RelayCommand]
    private async Task SearchCashierIncomeAsync()
    {
        var filter = new CashierIncomeFilterDto(
            FilterFromDate,
            FilterToDate,
            FilterFromTime,
            FilterToTime,
            SelectedCashier?.Id
        );
        CashierReport = await _accounting.GetCashierIncomeReportAsync(filter);
    }

    [RelayCommand]
    private async Task PrintCashierReportAsync()
    {
        if (CashierReport == null || _printService == null) return;
        try
        {
            var data = await _printService.PrepareCashierReportPrintDataAsync(CashierReport);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في طباعة تقرير الكاشير: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintCashierOrderRowAsync(CashierOrderRowDto? row)
    {
        if (row == null || _printService == null) return;
        try
        {
            var printData = new PrintDocumentData(
                DocumentTypeTitle: "إشعار فاتورة طلب كاشير",
                DocumentNumber: row.OrderNumber,
                Date: DateTime.Now,
                Time: row.TimeFormatted,
                DayName: DateTime.Now.ToString("dddd"),
                StudioName: "استديو الفن 3",
                StudioAddress: "صنعاء",
                StudioPhone: "777000111",
                LogoPath: null,
                RecipientName: row.CustomerName,
                RecipientPhone: "-",
                RecipientAddress: "طلب استديو وتصوير",
                Items: new List<PrintItemRow>
                {
                    new(1, row.ServiceTitle, 1, row.TotalAmount, row.TotalAmount)
                },
                TotalAmount: row.TotalAmount,
                PaidAmount: row.PaidAmount,
                RemainingAmount: row.RemainingAmount,
                PaymentMethodDisplay: row.PaymentMethodName,
                ReferenceNumber: row.WalletName,
                Currency: "ريال يمني",
                Notes: $"الكاشير المنفذ: {row.CashierName}",
                Terms: "إشعار رسمي معتمد من سجل الكاشير.",
                CreatedByName: row.CashierName,
                CopiesCount: 1,
                PaperSize: "A4"
            );

            var vm = new PrintPreviewViewModel(printData, _printService);
            var win = new Views.PrintPreviewWindow(vm) { Owner = Application.Current?.MainWindow };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"تعذر طباعة إشعار الطلب: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintReceiptVoucherAsync(int voucherId)
    {
        if (_printService == null) return;
        try
        {
            var data = await _printService.PrepareReceiptVoucherPrintDataAsync(voucherId);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm)
            {
                Owner = Application.Current?.MainWindow
            };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز سند القبض للطباعة: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task PrintPaymentVoucherAsync(int voucherId)
    {
        if (_printService == null) return;
        try
        {
            var data = await _printService.PreparePaymentVoucherPrintDataAsync(voucherId);
            var vm = new PrintPreviewViewModel(data, _printService);
            var win = new Views.PrintPreviewWindow(vm)
            {
                Owner = Application.Current?.MainWindow
            };
            win.ShowDialog();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"خطأ في تجهيز سند الصرف للطباعة: {ex.Message}", "خطأ في الطباعة", MessageBoxButton.OK, MessageBoxImage.Error);
        }
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

public partial class PermissionCheckItem : ObservableObject
{
    public string Key { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [ObservableProperty] private bool _isSelected;
}

public partial class SettingsViewModel : ObservableObject
{
    private readonly IStudioSettingsService _settingsService;
    private readonly IBackupService _backupService;
    private readonly IAuthService _auth;
    private readonly ICurrentUserService _currentUser;

    // Sub-Tabs
    [ObservableProperty] private int _selectedTab = 0; // 0=StudioInfo, 1=SystemData, 2=Users&Permissions, 3=Password, 4=Backup

    // Studio Info Properties (Dynamic & Centralized)
    [ObservableProperty] private string _studioName = "استديو الفن 3";
    [ObservableProperty] private string _systemManagerName = "المهندس زكريا فيصل العزعزي";
    [ObservableProperty] private string _tagline = "لتصوير الفيديو والإعلانات والطباعة الرقمية والحرارية";
    [ObservableProperty] private string _address = "صنعاء - حدة - جولة الرويشان";
    [ObservableProperty] private string _phone = "01-445566";
    [ObservableProperty] private string _secondaryPhone = "777111222";
    [ObservableProperty] private string _whatsapp = "777000111";
    [ObservableProperty] private string _email = "info@artstudio3.ye";
    [ObservableProperty] private string _description = "استديو تصوير سينمائي ومونتاج إعلانات وطباعة حرارية فاخرة";
    [ObservableProperty] private string _currency = "ر.ي";
    [ObservableProperty] private string? _logoPath;
    [ObservableProperty] private string? _logoBase64;
    [ObservableProperty] private string _invoiceTitle = "فاتورة ضريبية / سند تسليم خدمات";
    [ObservableProperty] private string _invoiceSubtitle = "استديو الفن 3 للإنتاج الإعلامي والطباعة";
    [ObservableProperty] private string _invoiceFooterNote = "نشكركم لاختيار استديو الفن 3. نسعد دائماً بتخليد أجمل لحظاتكم.";
    [ObservableProperty] private string _receiptFooter = "سند رسمي صادر ومعتمد من إدارة استديو الفن 3.";
    [ObservableProperty] private string _invoiceTerms = "1. تسليم الأعمال خلال الموعد.\n2. التعديلات المتاحة مرتين كحد أقصى.\n3. يحفظ الأرشيف 60 يوماً.";

    // Users & Permissions Properties
    [ObservableProperty] private ObservableCollection<UserDto> _usersList = new();
    [ObservableProperty] private UserDto? _selectedUser;
    [ObservableProperty] private ObservableCollection<PermissionCheckItem> _permissionsList = new();

    // Password & Status
    [ObservableProperty] private string _currentPassword = string.Empty;
    [ObservableProperty] private string _newPassword = string.Empty;
    [ObservableProperty] private string _statusMessage = string.Empty;

    public SettingsViewModel(IStudioSettingsService settingsService, IBackupService backupService, IAuthService auth, ICurrentUserService currentUser)
    {
        _settingsService = settingsService;
        _backupService = backupService;
        _auth = auth;
        _currentUser = currentUser;

        InitializePermissionsMasterList();
        LoadSettingsCommand.Execute(null);
        LoadUsersCommand.Execute(null);
    }

    private void InitializePermissionsMasterList()
    {
        var master = new List<PermissionCheckItem>
        {
            new() { Key = "Dashboard:View", Module = "لوحة التحكم", Description = "مشاهدة لوحة التحكم والإحصائيات" },
            new() { Key = "Orders:View", Module = "الطلبات", Description = "مشاهدة سجل الطلبات والفواتير" },
            new() { Key = "Orders:Create", Module = "الطلبات", Description = "إضافة طلب جديد" },
            new() { Key = "Orders:Edit", Module = "الطلبات", Description = "تعديل بيانات وحالة الطلبات" },
            new() { Key = "Orders:Delete", Module = "الطلبات", Description = "حذف وإلغاء الطلبات" },
            new() { Key = "Customers:View", Module = "العملاء", Description = "مشاهدة قائمة العملاء" },
            new() { Key = "Customers:Create", Module = "العملاء", Description = "إضافة وتعديل بيانات العملاء" },
            new() { Key = "Customers:Delete", Module = "العملاء", Description = "حذف العملاء" },
            new() { Key = "Invoices:Create", Module = "الفواتير", Description = "إنشاء وإصدار الفواتير" },
            new() { Key = "Invoices:Print", Module = "الفواتير", Description = "طباعة الفواتير" },
            new() { Key = "Invoices:Reprint", Module = "الفواتير", Description = "إعادة طباعة الفواتير السابقة" },
            new() { Key = "Invoices:Delete", Module = "الفواتير", Description = "حذف وإلغاء الفواتير" },
            new() { Key = "Payments:Create", Module = "المدفوعات", Description = "تسجيل دفعات نقدية وبنكية ومحافظ" },
            new() { Key = "Payments:View", Module = "المدفوعات", Description = "مشاهدة سجل المقبوضات والدفعات" },
            new() { Key = "Payments:Delete", Module = "المدفوعات", Description = "حذف السندات والدفعات" },
            new() { Key = "Accounting:View", Module = "الحسابات", Description = "مشاهدة الحسابات والصندوق وحركة المال" },
            new() { Key = "Accounting:Edit", Module = "الحسابات", Description = "تعديل العمليات المالية" },
            new() { Key = "Accounting:Delete", Module = "الحسابات", Description = "حذف قيود وسندات الصندوق" },
            new() { Key = "Expenses:Create", Module = "المصروفات", Description = "إضافة سندات الصرف والمصروفات" },
            new() { Key = "Expenses:Edit", Module = "المصروفات", Description = "تعديل المصروفات" },
            new() { Key = "Expenses:Delete", Module = "المصروفات", Description = "حذف المصروفات" },
            new() { Key = "Salaries:View", Module = "الرواتب", Description = "مشاهدة الرواتب وسندات السلف" },
            new() { Key = "Salaries:Edit", Module = "الرواتب", Description = "صرف الرواتب واعتماد السلف" },
            new() { Key = "Reports:Sales", Module = "التقارير", Description = "مشاهدة تقرير المبيعات اليومية" },
            new() { Key = "Reports:TodayIncome", Module = "التقارير", Description = "مشاهدة تقرير دخل اليوم" },
            new() { Key = "Reports:CashierIncome", Module = "التقارير", Description = "مشاهدة تقرير دخل كل كاشير بالتفصيل" },
            new() { Key = "Reports:FullFinancial", Module = "التقارير", Description = "مشاهدة التقارير المالية الكاملة والأرباح" },
            new() { Key = "Settings:System", Module = "الإعدادات", Description = "تعديل إعدادات وبيانات النظام" },
            new() { Key = "Settings:StudioInfo", Module = "الإعدادات", Description = "تعديل بيانات الاستديو والشعار" },
            new() { Key = "Settings:Users", Module = "الإعدادات", Description = "إدارة المستخدمين ومنح الصلاحيات" },
            new() { Key = "Backup:Manage", Module = "النسخ الاحتياطي", Description = "إجراء واسترجاع النسخ الاحتياطية" }
        };
        PermissionsList = new ObservableCollection<PermissionCheckItem>(master);
    }

    [RelayCommand]
    private async Task LoadSettingsAsync()
    {
        var s = await _settingsService.GetSettingsAsync();
        StudioName = s.StudioName;
        SystemManagerName = s.SystemManagerName;
        Tagline = s.Tagline;
        Address = s.Address;
        Phone = s.Phone;
        SecondaryPhone = s.SecondaryPhone ?? "";
        Whatsapp = s.Whatsapp;
        Email = s.Email;
        Description = s.Description ?? "";
        Currency = s.Currency;
        LogoPath = s.LogoPath;
        LogoBase64 = s.LogoBase64;
        InvoiceTitle = s.InvoiceTitle;
        InvoiceSubtitle = s.InvoiceSubtitle;
        InvoiceFooterNote = s.InvoiceFooterNote;
        ReceiptFooter = s.ReceiptFooter;
        InvoiceTerms = s.InvoiceTerms;
        StatusMessage = "تم تحميل بيانات الاستديو بنجاح.";
    }

    [RelayCommand]
    private async Task SaveSettingsAsync()
    {
        var dto = new StudioSettingsDto(
            StudioName,
            SystemManagerName,
            Tagline,
            Address,
            Phone,
            SecondaryPhone,
            Whatsapp,
            Email,
            Description,
            null,
            Currency,
            LogoPath,
            LogoBase64,
            InvoiceTitle,
            InvoiceSubtitle,
            InvoiceFooterNote,
            ReceiptFooter,
            InvoiceTerms,
            "A4"
        );

        await _settingsService.UpdateSettingsAsync(dto);
        StatusMessage = "✓ تم حفظ وتحديث بيانات الاستديو واسم مدير النظام بنجاح!";
        MessageBox.Show("تم حفظ بيانات الاستديو واسم المدير بنجاح. تنعكس التغييرات تلقائياً في جميع الشاشات والمستندات.", "تم الحفظ", MessageBoxButton.OK, MessageBoxImage.Information, MessageBoxResult.OK, MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading);
    }

    [RelayCommand]
    private async Task CancelSettingsAsync()
    {
        await LoadSettingsAsync();
        StatusMessage = "تم إلغاء التعديلات واستعادة البيانات الأصلية.";
    }

    [RelayCommand]
    private void UploadLogo()
    {
        var dlg = new OpenFileDialog
        {
            Filter = "ملفات الصور|*.png;*.jpg;*.jpeg;*.bmp;*.webp",
            Title = "اختر شعار/صورة الاستديو"
        };
        if (dlg.ShowDialog() == true)
        {
            try
            {
                var bytes = File.ReadAllBytes(dlg.FileName);
                LogoBase64 = $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
                LogoPath = dlg.FileName;
                StatusMessage = "✓ تم تحميل صورة الشعار بنجاح! اضغط [حفظ] لتثبيت التغيير.";
            }
            catch (Exception ex)
            {
                StatusMessage = $"خطأ في قراءة الصورة: {ex.Message}";
            }
        }
    }

    [RelayCommand]
    private void DeleteLogo()
    {
        LogoPath = null;
        LogoBase64 = null;
        StatusMessage = "تم إزالة الشعار. اضغط [حفظ] لتطبيق التغيير.";
    }

    [RelayCommand]
    private void PreviewLogo()
    {
        if (!string.IsNullOrWhiteSpace(LogoPath) && File.Exists(LogoPath))
        {
            Process.Start(new ProcessStartInfo(LogoPath) { UseShellExecute = true });
        }
        else
        {
            MessageBox.Show("لا يوجد مسار صورة متاح للمعاينة الخارجية.", "معاينة", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    [RelayCommand]
    private async Task LoadUsersAsync()
    {
        var users = await _auth.GetAllUsersAsync();
        UsersList = new ObservableCollection<UserDto>(users);
        if (UsersList.Count > 0)
        {
            SelectedUser = UsersList.FirstOrDefault(u => u.RoleName == "كاشير ومبيعات") ?? UsersList[0];
            OnSelectedUserChanged(SelectedUser);
        }
    }

    partial void OnSelectedUserChanged(UserDto? value)
    {
        if (value == null) return;

        foreach (var p in PermissionsList)
        {
            if (value.RoleName == "مدير النظام" || value.PermissionKeys.Contains("all"))
            {
                p.IsSelected = true;
            }
            else
            {
                p.IsSelected = value.PermissionKeys.Contains(p.Key);
            }
        }
    }

    [RelayCommand]
    private async Task AuthorizeUserAsync()
    {
        if (SelectedUser == null)
        {
            MessageBox.Show("يرجى اختيار المستخدم أولاً لتخويل صلاحياته.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var selectedKeys = PermissionsList.Where(p => p.IsSelected).Select(p => p.Key).ToList();
        var ok = await _auth.AuthorizeUserPermissionsAsync(SelectedUser.Id, selectedKeys, SelectedUser.IsActive);

        if (ok)
        {
            StatusMessage = $"🔐 تم تخويل وحفظ صلاحيات المستخدم [{SelectedUser.FullName}] بنجاح ({selectedKeys.Count} صلاحية مفعلة)!";
            MessageBox.Show(
                $"تم بنجاح تخويل الصلاحيات للمستخدم: {SelectedUser.FullName}\nتم تفعيل {selectedKeys.Count} صلاحية وربطها بالحساب فعلياً.",
                "🔐 تم التخويل بنجاح",
                MessageBoxButton.OK,
                MessageBoxImage.Information,
                MessageBoxResult.OK,
                MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
            );
            await LoadUsersAsync();
        }
        else
        {
            StatusMessage = "فشل في حفظ الصلاحيات.";
        }
    }

    [RelayCommand]
    private void SelectAllPermissions()
    {
        foreach (var p in PermissionsList) p.IsSelected = true;
    }

    [RelayCommand]
    private void ClearAllPermissions()
    {
        foreach (var p in PermissionsList) p.IsSelected = false;
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
            var folder = "C:\\StudioBackups";
            Directory.CreateDirectory(folder);
            var file = await _backupService.CreateBackupAsync(folder);
            StatusMessage = $"تم إنشاء النسخة الاحتياطية بنجاح: {file}";
        }
        catch (Exception ex)
        {
            StatusMessage = $"خطأ في النسخ: {ex.Message}";
        }
    }

    [RelayCommand]
    private async Task ResetAllDataAsync()
    {
        var result = MessageBox.Show(
            "تحذير هام: هل أنت متأكد من رغبتك في حذف وتصفير جميع البيانات والطلبات والسجلات السابقة بالكامل للبدء بإدخال بيانات جديدة؟\n\nسيتم حفظ نسخة احتياطية آمنة تلقائياً في مجلد النسخ الاحتياطي، ثم تصفير الطلبات والعملاء والسندات والمصروفات والديون.\n\n(سيتم الحفاظ على حساب المدير، إعدادات الاستديو، وصور الأقسام المعتمدة).",
            "⚠️ تأكيد تصفير البيانات والسجلات السابقة",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning,
            MessageBoxResult.No,
            MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
        );

        if (result == MessageBoxResult.Yes)
        {
            try
            {
                var ok = await _backupService.ResetAllDataAsync();
                if (ok)
                {
                    StatusMessage = "✅ تم تصفير وحذف جميع البيانات والطلبات والسجلات السابقة بنجاح! تم أخذ نسخة احتياطية تلقائياً.";
                    MessageBox.Show(
                        "تم تصفير وحذف جميع البيانات والطلبات والسجلات السابقة بنجاح.\nتم حفظ نسخة احتياطية في مجلد Backups تلقائياً، وأصبحت قاعدة البيانات نظيفة وجاهزة لبدء إدخال بياناتك الجديدة.",
                        "✅ تم التصفير بنجاح",
                        MessageBoxButton.OK,
                        MessageBoxImage.Information,
                        MessageBoxResult.OK,
                        MessageBoxOptions.RightAlign | MessageBoxOptions.RtlReading
                    );
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"خطأ أثناء التصفير: {ex.Message}";
                MessageBox.Show($"حدث خطأ أثناء تصفير البيانات: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
