using System.Windows;
using StudioManagement.WPF.ViewModels;

namespace StudioManagement.WPF.Views;

public partial class PrintPreviewWindow : Window
{
    public PrintPreviewWindow(PrintPreviewViewModel vm)
    {
        InitializeComponent();
        DataContext = vm;
        vm.RequestClose += (s, e) => Close();
        vm.RequestPrintCanvas += (s, e) =>
        {
            try
            {
                var printDialog = new System.Windows.Controls.PrintDialog();
                if (printDialog.ShowDialog() == true)
                {
                    printDialog.PrintVisual(PrintCanvas, vm.DocumentData.DocumentTypeTitle);
                    MessageBox.Show("تم إرسال المستند بنجاح إلى الطابعة المحددة.", "نجاح الطباعة", MessageBoxButton.OK, MessageBoxImage.Information);
                    Close();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ أثناء الطباعة: {ex.Message}", "خطأ في الطابعة", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        };
    }

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }
}
