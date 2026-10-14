using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
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

    private void UserNumberBox_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            PassBox.Focus();
        }
    }

    private void UserNumberBox_TextChanged(object sender, TextChangedEventArgs e)
    {
        if (sender is TextBox tb && !string.IsNullOrEmpty(tb.Text))
        {
            var normalized = StudioManagement.Application.Common.NumberNormalizer.NormalizeDigits(tb.Text);
            if (normalized != tb.Text)
            {
                int caret = tb.CaretIndex;
                tb.Text = normalized;
                tb.CaretIndex = Math.Min(caret, tb.Text.Length);
            }
        }
    }

    private void PassBox_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
        {
            if (_vm.LoginCommand.CanExecute(this))
            {
                _vm.LoginCommand.Execute(this);
            }
        }
    }
}
