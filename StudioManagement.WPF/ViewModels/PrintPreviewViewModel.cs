using System.Collections.ObjectModel;
using System.IO;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Win32;
using StudioManagement.Application.DTOs;
using StudioManagement.Application.Interfaces;

namespace StudioManagement.WPF.ViewModels;

public partial class PrintPreviewViewModel : ObservableObject
{
    private readonly IPrintService? _printService;

    [ObservableProperty] private PrintDocumentData _documentData;
    [ObservableProperty] private string _documentDateFormatted = "";
    [ObservableProperty] private double _paperPixelWidth = 794; // A4 at 96 DPI
    [ObservableProperty] private double _paperPixelHeight = 1123;
    [ObservableProperty] private string _footerTimestamp = "";
    [ObservableProperty] private ObservableCollection<string> _installedPrinters = new();
    [ObservableProperty] private string _selectedPrinter = "";
    [ObservableProperty] private int _customCopies = 1;
    [ObservableProperty] private string _copy1Bg = "#2563EB";
    [ObservableProperty] private string _copy2Bg = "#334155";
    [ObservableProperty] private string _copy3Bg = "#334155";
    [ObservableProperty] private int _selectedPaperSizeIndex = 0;
    [ObservableProperty] private bool _isPortrait = true;
    [ObservableProperty] private bool _isLandscape = false;
    [ObservableProperty] private bool _isInvoice = true;
    [ObservableProperty] private string _deliveryDateFormatted = "";
    [ObservableProperty] private string _dateFormattedPill = "";
    [ObservableProperty] private string _dept1Title = "قسم الاطفال";
    [ObservableProperty] private string _dept2Title = "قسم العائلة";
    [ObservableProperty] private string _dept3Title = "قسم الذواكر";
    [ObservableProperty] private string _dept1Value = "";
    [ObservableProperty] private string _dept2Value = "";
    [ObservableProperty] private string _dept3Value = "";
    [ObservableProperty] private string _leftHeaderImage = "Images/wedding_session_palace_1791329710801.jpg";
    [ObservableProperty] private string _rightHeaderImage = "Images/banner_printing_shop_1791329744641.jpg";
    [ObservableProperty] private double _zoomScale = 1.0;

    public event EventHandler? RequestClose;
    public event EventHandler? RequestPrintCanvas;

    public PrintPreviewViewModel()
    {
        // Design-time or fallback constructor
        DocumentData = new PrintDocumentData(
            DocumentTypeTitle: "فاتورة استلام طلب ومبيعات",
            DocumentNumber: "INV-2026-0001",
            Date: DateTime.Now,
            Time: DateTime.Now.ToString("hh:mm tt"),
            DayName: "الخميس",
            StudioName: "استديو الفن 3",
            StudioAddress: "صنعاء - شارع تعز",
            StudioPhone: "777000111",
            LogoPath: null,
            RecipientName: "عميل عام",
            RecipientPhone: "771234567",
            RecipientAddress: "صنعاء",
            Items: new List<PrintItemRow>
            {
                new(1, "لوحة عرسان ملكية فاخرة 80×120 سم إضاءة LED", 1, 95000, 95000)
            },
            TotalAmount: 95000,
            PaidAmount: 60000,
            RemainingAmount: 35000,
            PaymentMethodDisplay: "نقداً",
            ReferenceNumber: null,
            Currency: "ريال يمني",
            Notes: "استلام في الموعد المحدد",
            Terms: "يرجى إبراز أصل الفاتورة عند الاستلام",
            CreatedByName: "الكاشير",
            CopiesCount: 1,
            PaperSize: "A4"
        );
        InitDefaults();
    }

    public PrintPreviewViewModel(PrintDocumentData data, IPrintService? printService = null)
    {
        _printService = printService;
        _documentData = data;
        InitDefaults();
    }

    private void InitDefaults()
    {
        DocumentDateFormatted = DocumentData.Date.ToString("yyyy/MM/dd", System.Globalization.CultureInfo.InvariantCulture);
        DateFormattedPill = DocumentData.Date.ToString("yyyy / MM / dd م", System.Globalization.CultureInfo.InvariantCulture);

        if (DocumentData.DeliveryDate.HasValue)
        {
            DeliveryDateFormatted = DocumentData.DeliveryDate.Value.ToString("yyyy / MM / dd م", System.Globalization.CultureInfo.InvariantCulture);
        }
        else
        {
            DeliveryDateFormatted = DocumentData.Date.AddDays(3).ToString("yyyy / MM / dd م", System.Globalization.CultureInfo.InvariantCulture);
        }

        IsInvoice = DocumentData.DocumentTypeTitle.Contains("فاتورة") || 
                    DocumentData.DocumentTypeTitle.Contains("طلب") || 
                    DocumentData.DocumentTypeTitle.Contains("مبيعات") ||
                    DocumentData.DocumentTypeTitle.Contains("Invoice");

        // Map order items to Department columns or display items
        if (DocumentData.Items != null && DocumentData.Items.Any())
        {
            var items = DocumentData.Items;
            if (items.Count >= 3)
            {
                Dept1Title = items[0].Description.Length > 20 ? items[0].Description.Substring(0, 18) + ".." : items[0].Description;
                Dept1Value = $"{items[0].Quantity} × {items[0].UnitPrice:N0} = {items[0].TotalPrice:N0} ر.ي";

                Dept2Title = items[1].Description.Length > 20 ? items[1].Description.Substring(0, 18) + ".." : items[1].Description;
                Dept2Value = $"{items[1].Quantity} × {items[1].UnitPrice:N0} = {items[1].TotalPrice:N0} ر.ي";

                Dept3Title = items[2].Description.Length > 20 ? items[2].Description.Substring(0, 18) + ".." : items[2].Description;
                Dept3Value = $"{items[2].Quantity} × {items[2].UnitPrice:N0} = {items[2].TotalPrice:N0} ر.ي";
            }
            else if (items.Count == 2)
            {
                Dept1Title = items[0].Description;
                Dept1Value = $"{items[0].Quantity} × {items[0].UnitPrice:N0} = {items[0].TotalPrice:N0} ر.ي";

                Dept2Title = items[1].Description;
                Dept2Value = $"{items[1].Quantity} × {items[1].UnitPrice:N0} = {items[1].TotalPrice:N0} ر.ي";

                Dept3Title = "قسم الذواكر";
                Dept3Value = "فلاشات وذواكر ديجيتال";
            }
            else if (items.Count == 1)
            {
                Dept1Title = "قسم الاطفال";
                Dept1Value = "تصوير شخصي وبورتريه";

                Dept2Title = items[0].Description.Length > 24 ? items[0].Description.Substring(0, 22) + ".." : items[0].Description;
                Dept2Value = $"{items[0].Quantity} × {items[0].UnitPrice:N0} = {items[0].TotalPrice:N0} ر.ي";

                Dept3Title = "قسم الذواكر";
                Dept3Value = "معالجة وتسليم رقمي";
            }
        }
        else
        {
            Dept1Title = "قسم الاطفال";
            Dept1Value = "جلسات أطفال وبورتريه";

            Dept2Title = "قسم العائلة";
            Dept2Value = "تصوير عائلي وملكي VIP";

            Dept3Title = "قسم الذواكر";
            Dept3Value = "تفريغ وطباعة ذواكر";
        }

        FooterTimestamp = $"طُبع بواسطة نظام StudioManagement • التاريخ: {DateTime.Now:yyyy/MM/dd hh:mm tt} • مستند رسمي معتمد";
        CustomCopies = Math.Max(1, DocumentData.CopiesCount);
        UpdateCopyButtons(CustomCopies);

        // Load installed printers
        LoadPrinters();

        // Update paper dimensions
        UpdatePaperDimensions();
    }

    private void LoadPrinters()
    {
        InstalledPrinters.Clear();
        try
        {
            var printServer = new System.Printing.LocalPrintServer();
            var queues = printServer.GetPrintQueues();
            foreach (var q in queues)
            {
                InstalledPrinters.Add(q.Name);
            }
        }
        catch
        {
            // Fallback safe printers for Windows
        }

        if (!InstalledPrinters.Any())
        {
            InstalledPrinters.Add("طابعة الويندوز الافتراضية (Default Printer)");
            InstalledPrinters.Add("Microsoft Print to PDF");
            InstalledPrinters.Add("Microsoft XPS Document Writer");
            InstalledPrinters.Add("طابعة الفواتير الحرارية POS-80");
        }

        SelectedPrinter = InstalledPrinters.FirstOrDefault() ?? "Microsoft Print to PDF";
    }

    partial void OnCustomCopiesChanged(int value)
    {
        if (value < 1) value = 1;
        UpdateCopyButtons(value);
    }

    partial void OnSelectedPaperSizeIndexChanged(int value)
    {
        UpdatePaperDimensions();
    }

    partial void OnIsPortraitChanged(bool value)
    {
        if (value)
        {
            IsLandscape = false;
            UpdatePaperDimensions();
        }
    }

    partial void OnIsLandscapeChanged(bool value)
    {
        if (value)
        {
            IsPortrait = false;
            UpdatePaperDimensions();
        }
    }

    private void UpdatePaperDimensions()
    {
        // Standard 96 DPI pixel measurements
        double w = 794;
        double h = 1123;

        switch (SelectedPaperSizeIndex)
        {
            case 0: // A4
                w = 794; h = 1123; break;
            case 1: // A5
                w = 559; h = 794; break;
            case 2: // POS 80mm
                w = 320; h = 950; break;
            case 3: // Letter
                w = 816; h = 1056; break;
        }

        if (IsLandscape && SelectedPaperSizeIndex != 2)
        {
            PaperPixelWidth = h;
            PaperPixelHeight = w;
        }
        else
        {
            PaperPixelWidth = w;
            PaperPixelHeight = h;
        }
    }

    private void UpdateCopyButtons(int copies)
    {
        Copy1Bg = copies == 1 ? "#2563EB" : "#334155";
        Copy2Bg = copies == 2 ? "#2563EB" : "#334155";
        Copy3Bg = copies == 3 ? "#2563EB" : "#334155";
    }

    [RelayCommand]
    private void SetCopies(object? param)
    {
        if (param != null && int.TryParse(param.ToString(), out int val))
        {
            CustomCopies = val;
        }
    }

    [RelayCommand]
    private void ZoomIn()
    {
        ZoomScale = Math.Min(2.5, ZoomScale + 0.15);
    }

    [RelayCommand]
    private void ZoomOut()
    {
        ZoomScale = Math.Max(0.5, ZoomScale - 0.15);
    }

    [RelayCommand]
    private void ZoomReset()
    {
        ZoomScale = 1.0;
    }

    [RelayCommand]
    private void PrintNow()
    {
        RequestPrintCanvas?.Invoke(this, EventArgs.Empty);
    }

    [RelayCommand]
    private async Task SavePdfAsync()
    {
        var saveDlg = new SaveFileDialog
        {
            Filter = "ملف مستند PDF (*.pdf)|*.pdf|ملف XPS (*.xps)|*.xps|صفحة ويب HTML (*.html)|*.html",
            FileName = $"{DocumentData.DocumentTypeTitle}_{DocumentData.DocumentNumber}_{DateTime.Now:yyyyMMdd}.html"
        };

        if (saveDlg.ShowDialog() == true)
        {
            try
            {
                // Generate standalone clean HTML for offline archival / printing
                string ext = Path.GetExtension(saveDlg.FileName).ToLowerInvariant();
                if (ext == ".html" || ext == ".pdf")
                {
                    string htmlContent = GenerateHtmlForDocument();
                    await File.WriteAllTextAsync(saveDlg.FileName, htmlContent);
                    MessageBox.Show($"تم حفظ وتصدير المستند بنجاح:\n{saveDlg.FileName}", "تم الحفظ بنجاح", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"تعذر تصدير المستند: {ex.Message}", "خطأ في التصدير", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    private string GenerateHtmlForDocument()
    {
        var rows = string.Join("", DocumentData.Items.Select(i => 
            $"<tr><td style='padding:8px;border:1px solid #ddd;text-align:center;'>{i.Index}</td>" +
            $"<td style='padding:8px;border:1px solid #ddd;'>{i.Description}</td>" +
            $"<td style='padding:8px;border:1px solid #ddd;text-align:center;'>{i.Quantity}</td>" +
            $"<td style='padding:8px;border:1px solid #ddd;text-align:left;'>{i.UnitPrice:N0}</td>" +
            $"<td style='padding:8px;border:1px solid #ddd;text-align:left;font-weight:bold;'>{i.TotalPrice:N0}</td></tr>"
        ));

        return $@"<!DOCTYPE html>
<html lang=""ar"" dir=""rtl"">
<head>
<meta charset=""utf-8"">
<title>{DocumentData.DocumentTypeTitle} - {DocumentData.DocumentNumber}</title>
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; margin: 20px; background: #fff; color: #111; direction: rtl; }}
  .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 16px; }}
  .studio-name {{ font-size: 24px; font-weight: bold; color: #1E3A8A; }}
  .badge {{ border: 1px solid #ccc; padding: 10px 16px; border-radius: 8px; background: #f8fafc; text-align: right; }}
  .details-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 16px; }}
  th {{ background: #1E3A8A; color: #fff; padding: 10px; border: 1px solid #1E3A8A; text-align: right; }}
  .totals {{ display: flex; justify-content: space-between; margin-top: 16px; }}
  .totals-card {{ border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; width: 280px; background: #f8fafc; }}
  .signatures {{ display: flex; justify-content: space-between; margin-top: 40px; text-align: center; color: #64748b; font-size: 13px; }}
  .footer {{ margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px; }}
</style>
</head>
<body>
<div class=""header"">
  <div>
    <div class=""studio-name"">{DocumentData.StudioName}</div>
    <div>{DocumentData.StudioAddress} | {DocumentData.StudioPhone}</div>
  </div>
  <div class=""badge"">
    <div style=""font-weight:bold;color:#1E3A8A;"">{DocumentData.DocumentTypeTitle}</div>
    <div style=""font-weight:bold;"">الرقم: {DocumentData.DocumentNumber}</div>
    <div>التاريخ: {DocumentData.Date:yyyy/MM/dd} ({DocumentData.DayName})</div>
    <div>الوقت: {DocumentData.Time}</div>
  </div>
</div>

<div class=""details-box"">
  <strong>العميل / المستلم:</strong> {DocumentData.RecipientName} | <strong>الهاتف:</strong> {DocumentData.RecipientPhone} | <strong>العنوان:</strong> {DocumentData.RecipientAddress ?? "-"}<br/>
  <strong>طريقة السداد:</strong> {DocumentData.PaymentMethodDisplay} | <strong>المنشئ:</strong> {DocumentData.CreatedByName}
</div>

<table>
  <thead>
    <tr><th style=""width:40px;text-align:center;"">#</th><th>البيان والتفاصيل</th><th style=""width:70px;text-align:center;"">الكمية</th><th style=""width:110px;text-align:left;"">السعر</th><th style=""width:120px;text-align:left;"">الإجمالي</th></tr>
  </thead>
  <tbody>
    {rows}
  </tbody>
</table>

<div class=""totals"">
  <div style=""max-width:55%;"">
    <strong>شروط وملاحظات:</strong>
    <p style=""font-size:12px;color:#64748b;"">{DocumentData.Terms}</p>
    <p style=""font-size:12px;color:#64748b;"">{DocumentData.Notes}</p>
  </div>
  <div class=""totals-card"">
    <div>الإجمالي: <strong style=""float:left;"">{DocumentData.TotalAmount:N0} {DocumentData.Currency}</strong></div>
    <div style=""color:#15803d;margin:6px 0;"">المدفوع: <strong style=""float:left;"">{DocumentData.PaidAmount:N0} {DocumentData.Currency}</strong></div>
    <hr style=""border-color:#cbd5e1;margin:6px 0;"" />
    <div style=""color:#b91c1c;font-size:16px;font-weight:bold;"">المتبقي: <strong style=""float:left;"">{DocumentData.RemainingAmount:N0} {DocumentData.Currency}</strong></div>
  </div>
</div>

<div class=""signatures"">
  <div>توقيع العميل / المستلم<br/><br/>.............................</div>
  <div>توقيع الكاشير / المحاسب<br/><br/>.............................</div>
  <div>ختم إدارة الاستديو<br/><br/>.............................</div>
</div>

<div class=""footer"">
  {FooterTimestamp}
</div>
</body>
</html>";
    }
}
