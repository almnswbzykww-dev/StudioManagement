using System;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Animation;
using System.Windows.Threading;

namespace StudioManagement
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private readonly DispatcherTimer _clockTimer;
        private bool _isPasswordVisible = false;

        public MainWindow()
        {
            InitializeComponent();

            // 1. Initialize Real-Time Clock Timer (Updating Date, Time & Year)
            _clockTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(1)
            };
            _clockTimer.Tick += ClockTimer_Tick;
            _clockTimer.Start();
            UpdateDateTimeDisplay();
        }

        private void ClockTimer_Tick(object sender, EventArgs e)
        {
            UpdateDateTimeDisplay();
        }

        private void UpdateDateTimeDisplay()
        {
            DateTime now = DateTime.Now;
            // Arabic Format matching image: 📅 2025-06-17 | ⏰ 10:24 م
            string dateStr = "📅 " + now.ToString("yyyy-MM-dd");
            string timeStr = "⏰ " + now.ToString("hh:mm") + (now.Hour >= 12 ? " م" : " ص");
            
            TxtCurrentDate.Text = dateStr;
            TxtCurrentTime.Text = timeStr;
            TxtCurrentYear.Text = now.ToString("yyyy");
        }

        #region Window Control Buttons & Window Dragging
        private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount == 2)
            {
                ToggleMaximizeRestore();
            }
            else
            {
                DragMove();
            }
        }

        private void BtnMinimize_Click(object sender, RoutedEventArgs e)
        {
            this.WindowState = WindowState.Minimized;
        }

        private void BtnMaximizeRestore_Click(object sender, RoutedEventArgs e)
        {
            ToggleMaximizeRestore();
        }

        private void ToggleMaximizeRestore()
        {
            if (this.WindowState == WindowState.Maximized)
            {
                this.WindowState = WindowState.Normal;
                BtnMaximizeRestore.ToolTip = "تكبير (□)";
            }
            else
            {
                this.WindowState = WindowState.Maximized;
                BtnMaximizeRestore.ToolTip = "استعادة الحجم (❐)";
            }
        }

        private void BtnClose_Click(object sender, RoutedEventArgs e)
        {
            MessageBoxResult result = MessageBox.Show(
                "هل أنت متأكد من رغبتك في إغلاق نظام إدارة الاستديو؟", 
                "إغلاق البرنامج", 
                MessageBoxButton.YesNo, 
                MessageBoxImage.Question, 
                MessageBoxResult.No, 
                MessageBoxOptions.RtlReading);

            if (result == MessageBoxResult.Yes)
            {
                Application.Current.Shutdown();
            }
        }
        #endregion

        #region Password Visibility Toggle
        private void BtnTogglePassword_Click(object sender, RoutedEventArgs e)
        {
            _isPasswordVisible = !_isPasswordVisible;

            if (_isPasswordVisible)
            {
                TxtPasswordVisible.Text = TxtPassword.Password;
                TxtPassword.Visibility = Visibility.Collapsed;
                TxtPasswordVisible.Visibility = Visibility.Visible;
                TxtPasswordVisible.Focus();
                TxtPasswordVisible.CaretIndex = TxtPasswordVisible.Text.Length;
            }
            else
            {
                TxtPassword.Password = TxtPasswordVisible.Text;
                TxtPasswordVisible.Visibility = Visibility.Collapsed;
                TxtPassword.Visibility = Visibility.Visible;
                TxtPassword.Focus();
            }
        }
        #endregion

        #region In-Viewfinder Camera HUD Notifications
        /// <summary>
        /// Displays an in-viewfinder camera HUD notification in the dead center of the viewfinder frame
        /// with smooth fade-in and fade-out animation as requested by the user.
        /// </summary>
        public void ShowViewfinderHudNotification(string title, string message, bool isSuccess = true)
        {
            HudNotificationTitle.Text = title;
            HudNotificationMessage.Text = message;

            if (isSuccess)
            {
                HudNotificationBorder.BorderBrush = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#10B981");
                HudNotificationTitle.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#34D399");
                HudNotificationIcon.Fill = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#10B981");
                // Checkmark icon
                HudNotificationIcon.Data = System.Windows.Media.Geometry.Parse("M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z");
            }
            else
            {
                HudNotificationBorder.BorderBrush = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#F43F5E");
                HudNotificationTitle.Foreground = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#FB7185");
                HudNotificationIcon.Fill = (System.Windows.Media.Brush)new System.Windows.Media.BrushConverter().ConvertFromString("#F43F5E");
                // Alert icon
                HudNotificationIcon.Data = System.Windows.Media.Geometry.Parse("M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z");
            }

            HudNotificationBorder.Visibility = Visibility.Visible;

            // Fade-In Storyboard
            DoubleAnimation fadeIn = new DoubleAnimation(0.0, 1.0, TimeSpan.FromMilliseconds(250));
            HudNotificationBorder.BeginAnimation(UIElement.OpacityProperty, fadeIn);

            // Auto-dismiss Timer after 2.8 seconds
            DispatcherTimer dismissTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(2.8) };
            dismissTimer.Tick += (s, ev) =>
            {
                dismissTimer.Stop();
                DoubleAnimation fadeOut = new DoubleAnimation(1.0, 0.0, TimeSpan.FromMilliseconds(250));
                fadeOut.Completed += (s2, ev2) =>
                {
                    HudNotificationBorder.Visibility = Visibility.Collapsed;
                };
                HudNotificationBorder.BeginAnimation(UIElement.OpacityProperty, fadeOut);
            };
            dismissTimer.Start();
        }
        #endregion

        #region Login Execution
        private void BtnLogin_Click(object sender, RoutedEventArgs e)
        {
            string userNumber = TxtUserNumber.Text?.Trim();
            string username = TxtUsername.Text?.Trim();
            string password = _isPasswordVisible ? TxtPasswordVisible.Text : TxtPassword.Password;

            if (string.IsNullOrEmpty(username))
            {
                ShowViewfinderHudNotification("تنبيه الكاميرا", "يرجى إدخال اسم المستخدم للمتابعة", false);
                TxtUsername.Focus();
                return;
            }

            if (string.IsNullOrEmpty(password))
            {
                ShowViewfinderHudNotification("تنبيه الكاميرا", "يرجى كتابة كلمة المرور الخاصة بحسابك", false);
                TxtPassword.Focus();
                return;
            }

            // Authentication verification (Demo / Database Integration)
            if ((username.ToLower() == "admin" || userNumber == "1" || username == "كاشير" || username == "مصور") && 
                (password == "admin" || password == "123" || password == "123456"))
            {
                ShowViewfinderHudNotification("تم الاعتماد بنجاح", "مرحباً بك! جاري فتح لوحة تحكم الاستديو...", true);

                // Delay slightly and open Dashboard Window
                DispatcherTimer navigateTimer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(1.2) };
                navigateTimer.Tick += (s, ev) =>
                {
                    navigateTimer.Stop();
                    // DashboardWindow dashboard = new DashboardWindow();
                    // dashboard.Show();
                    // this.Close();
                };
                navigateTimer.Start();
            }
            else
            {
                ShowViewfinderHudNotification("خطأ في البيانات", "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى إعادة المحاولة", false);
            }
        }
        #endregion
    }
}
