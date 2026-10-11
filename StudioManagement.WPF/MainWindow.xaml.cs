using System.Windows;
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
