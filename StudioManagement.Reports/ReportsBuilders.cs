using System.Text;
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
body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; margin: 20px; color: #1e293b; background: #fff; }}
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
        <p style=""margin: 4px 0 0 0;""><strong>العنوان:</strong> {(string.IsNullOrEmpty(order.CustomerAddress) ? "-" : order.CustomerAddress)}</p>
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
    <tbody>");

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
        <style>body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#1e3a8a; color:#fff; }}</style></head><body>");
        sb.Append($@"<h2>تقرير مبيعات استديو {s.StudioName}</h2><p>الفترة من {fromDate:yyyy/MM/dd} إلى {toDate:yyyy/MM/dd}</p>");
        sb.Append(@"<table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الخدمة</th><th>التاريخ</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody>");
        foreach (var o in filtered)
        {
            sb.Append($@"<tr><td>{o.OrderNumber}</td><td>{o.CustomerName}</td><td>{o.ServiceTitle}</td><td>{o.OrderDate:yyyy/MM/dd}</td><td>{o.TotalAmount:N0}</td><td>{o.PaidAmount:N0}</td><td>{o.RemainingAmount:N0}</td></tr>");
        }
        sb.Append($@"</tbody></table><p><strong>الإجمالي: {filtered.Sum(x => x.TotalAmount):N0} {s.Currency}</strong> | <strong>المحصل: {filtered.Sum(x => x.PaidAmount):N0} {s.Currency}</strong></p></body></html>");
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
        <style>body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; margin: 20px; }} .box {{ border:1px solid #ccc; padding:15px; border-radius:8px; margin-bottom:10px; }}</style></head><body>
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
        <style>body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#b91c1c; color:#fff; }}</style></head><body>");
        sb.Append($@"<h2>كشف مديونية العملاء - {s.StudioName}</h2>");
        sb.Append(@"<table><thead><tr><th>رقم العميل</th><th>اسم العميل</th><th>الهاتف</th><th>إجمالي المبيعات</th><th>المسدد</th><th>المتبقي بذمته</th></tr></thead><tbody>");
        foreach (var c in debts)
        {
            sb.Append($@"<tr><td>{c.CustomerNumber}</td><td>{c.Name}</td><td>{c.Phone}</td><td>{c.TotalSpent:N0}</td><td>{c.TotalPaid:N0}</td><td style=""color:red; font-weight:bold;"">{c.TotalRemaining:N0}</td></tr>");
        }
        sb.Append($@"</tbody></table><h3>إجمالي الديون المعلقة: {debts.Sum(x => x.TotalRemaining):N0} {s.Currency}</h3></body></html>");
        return sb.ToString();
    }

    public async Task<string> BuildInventoryReportHtmlAsync()
    {
        var products = await _inventoryService.GetAllProductsAsync();
        var s = await _settings.GetSettingsAsync();

        var sb = new StringBuilder();
        sb.Append($@"<!DOCTYPE html><html dir=""rtl"" lang=""ar""><head><meta charset=""utf-8""/><title>تقرير المخزون</title>
        <style>body {{ font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; margin: 20px; }} table {{ width:100%; border-collapse:collapse; }} th, td {{ border:1px solid #ccc; padding:8px; text-align:right; font-size:12px; }} th {{ background:#d97706; color:#fff; }}</style></head><body>");
        sb.Append($@"<h2>تقرير أرصدة المخزون - {s.StudioName}</h2>");
        sb.Append(@"<table><thead><tr><th>الكود</th><th>الصنف</th><th>التصنيف</th><th>الرصيد الحالي</th><th>الحد الأدنى</th><th>سعر التكلفة</th><th>سعر البيع</th></tr></thead><tbody>");
        foreach (var p in products)
        {
            var isLow = p.CurrentQuantity <= p.MinimumQuantity;
            var rowStyle = isLow ? @" style=""background:#fee2e2;""" : "";
            sb.Append($@"<tr{rowStyle}><td>{p.Code}</td><td>{p.Name}</td><td>{p.CategoryName}</td><td><strong>{p.CurrentQuantity}</strong></td><td>{p.MinimumQuantity}</td><td>{p.CostPrice:N0}</td><td>{p.SellingPrice:N0}</td></tr>");
        }
        sb.Append(@"</tbody></table></body></html>");
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
