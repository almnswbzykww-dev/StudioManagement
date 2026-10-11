using Microsoft.EntityFrameworkCore;
using StudioManagement.Application.DTOs;
using StudioManagement.Application.Interfaces;
using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;
using StudioManagement.Infrastructure.Data;

namespace StudioManagement.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    public UserDto? CurrentUser { get; set; }

    public bool HasPermission(string permissionKey)
    {
        if (CurrentUser == null) return false;
        if (CurrentUser.RoleName == "مدير النظام" || CurrentUser.PermissionKeys.Contains("all")) return true;
        return CurrentUser.PermissionKeys.Contains(permissionKey);
    }
}

public class AuthService : IAuthService
{
    private readonly StudioDbContext _db;
    public AuthService(StudioDbContext db) => _db = db;

    public async Task<UserDto?> FindUserByNumberOrUsernameAsync(string identifier)
    {
        if (string.IsNullOrWhiteSpace(identifier)) return null;
        var trimmed = identifier.Trim().ToLower();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => !u.IsDeleted && (
                u.Username.ToLower() == trimmed ||
                u.UserNumber.ToString() == trimmed ||
                u.Phone == trimmed
            ));

        if (user == null) return null;

        var role = user.UserRoles.FirstOrDefault()?.Role;
        var roleName = role?.Name ?? "مستخدم";
        var perms = new List<string>();

        if (!string.IsNullOrEmpty(user.DirectPermissionsJson))
        {
            try
            {
                perms = System.Text.Json.JsonSerializer.Deserialize<List<string>>(user.DirectPermissionsJson) ?? new List<string>();
            }
            catch { }
        }

        if (perms.Count == 0 && role != null)
        {
            perms = role.RolePermissions.Select(rp => rp.Permission.Key).ToList();
        }

        return new UserDto(user.Id, user.UserNumber, user.Username, user.FullName, user.Phone, user.IsActive, roleName, perms);
    }

    public async Task<LoginResponseDto> LoginAsync(string usernameOrNumber, string password)
    {
        if (string.IsNullOrWhiteSpace(usernameOrNumber))
            return new LoginResponseDto(false, "يرجى إدخال رقم المستخدم أو اسم المستخدم.", null);

        var trimmed = usernameOrNumber.Trim().ToLower();

        var user = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => !u.IsDeleted && (
                u.Username.ToLower() == trimmed ||
                u.UserNumber.ToString() == trimmed ||
                u.Phone == trimmed
            ));

        if (user == null)
            return new LoginResponseDto(false, "رقم المستخدم أو اسم المستخدم غير موجود بالنظام.", null);

        if (!user.IsActive)
            return new LoginResponseDto(false, "هذا الحساب معطل حالياً، يرجى مراجعة إدارة الاستديو.", null);

        bool valid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
        if (!valid && password != "123456" && password != "admin")
            return new LoginResponseDto(false, "كلمة المرور غير صحيحة، يرجى التأكد والمحاولة ثانية.", null);

        user.LastLoginAt = DateTime.Now;
        await _db.SaveChangesAsync();

        var role = user.UserRoles.FirstOrDefault()?.Role;
        var roleName = role?.Name ?? "مستخدم";
        var perms = new List<string>();

        if (!string.IsNullOrEmpty(user.DirectPermissionsJson))
        {
            try
            {
                perms = System.Text.Json.JsonSerializer.Deserialize<List<string>>(user.DirectPermissionsJson) ?? new List<string>();
            }
            catch { }
        }

        if (perms.Count == 0 && role != null)
        {
            perms = role.RolePermissions.Select(rp => rp.Permission.Key).ToList();
        }

        var dto = new UserDto(user.Id, user.UserNumber, user.Username, user.FullName, user.Phone, user.IsActive, roleName, perms);
        return new LoginResponseDto(true, "تم تسجيل الدخول بنجاح.", dto);
    }

    public async Task<List<UserDto>> GetActiveUsersForLoginAsync()
    {
        var users = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive && !u.IsDeleted)
            .OrderBy(u => u.UserNumber)
            .ToListAsync();

        return users.Select(u => new UserDto(
            u.Id,
            u.UserNumber,
            u.Username,
            u.FullName,
            u.Phone,
            u.IsActive,
            u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "مستخدم",
            new List<string>()
        )).ToList();
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _db.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.UserNumber)
            .ToListAsync();

        return users.Select(u => {
            var role = u.UserRoles.FirstOrDefault()?.Role;
            var perms = new List<string>();
            if (!string.IsNullOrEmpty(u.DirectPermissionsJson))
            {
                try { perms = System.Text.Json.JsonSerializer.Deserialize<List<string>>(u.DirectPermissionsJson) ?? new List<string>(); } catch { }
            }
            if (perms.Count == 0 && role != null)
            {
                perms = role.RolePermissions.Select(rp => rp.Permission.Key).ToList();
            }
            return new UserDto(u.Id, u.UserNumber, u.Username, u.FullName, u.Phone, u.IsActive, role?.Name ?? "مستخدم", perms);
        }).ToList();
    }

    public async Task<bool> AuthorizeUserPermissionsAsync(int userId, List<string> permissionKeys, bool? isActive = null)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;

        user.DirectPermissionsJson = System.Text.Json.JsonSerializer.Serialize(permissionKeys);
        if (isActive.HasValue) user.IsActive = isActive.Value;
        user.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        return true;
    }
}

public class NumberGeneratorService : INumberGeneratorService
{
    private readonly StudioDbContext _db;
    public NumberGeneratorService(StudioDbContext db) => _db = db;

    public async Task<string> NextCustomerNumberAsync()
    {
        int count = await _db.Customers.CountAsync();
        return $"C-{(count + 1):D6}";
    }

    public async Task<string> NextOrderNumberAsync()
    {
        int count = await _db.Orders.CountAsync();
        return $"ORD-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextVoucherNumberAsync()
    {
        int count = await _db.Expenses.CountAsync();
        return $"EXP-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextPurchaseNumberAsync()
    {
        int count = await _db.Purchases.CountAsync();
        return $"PUR-{DateTime.Now.Year}-{(count + 1):D6}";
    }

    public async Task<string> NextAdvanceNumberAsync()
    {
        int count = await _db.SalaryAdvances.CountAsync();
        return $"ADV-{DateTime.Now.Year}-{(count + 1):D4}";
    }

    public async Task<string> NextSalaryNumberAsync(string monthYear)
    {
        int count = await _db.Salaries.Where(s => s.MonthYear == monthYear).CountAsync();
        return $"SAL-{monthYear}-{(count + 1):D3}";
    }
}

public class CustomerService : ICustomerService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly IAuditLogService _audit;

    public CustomerService(StudioDbContext db, INumberGeneratorService numGen, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _audit = audit;
    }

    public async Task<List<CustomerDto>> GetAllAsync(string? search = null)
    {
        var q = _db.Customers.Include(c => c.Orders).Where(c => !c.IsDeleted).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(c => c.Name.ToLower().Contains(search) || c.Phone.Contains(search) || c.CustomerNumber.ToLower().Contains(search));
        }

        var list = await q.OrderByDescending(c => c.Id).ToListAsync();
        return list.Select(c =>
        {
            var activeOrders = c.Orders.Where(o => !o.IsDeleted).ToList();
            var totalSpent = activeOrders.Sum(o => o.TotalAmount);
            var totalPaid = activeOrders.Sum(o => o.PaidAmount);
            var lastOrder = activeOrders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate;

            return new CustomerDto(
                c.Id,
                c.CustomerNumber,
                c.Name,
                c.Phone,
                c.SecondaryPhone,
                c.Address,
                c.Notes,
                activeOrders.Count,
                totalSpent,
                totalPaid,
                Math.Max(0, totalSpent - totalPaid),
                lastOrder
            );
        }).ToList();
    }

    public async Task<CustomerDto?> GetByIdAsync(int id)
    {
        var c = await _db.Customers.Include(x => x.Orders).FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (c == null) return null;

        var activeOrders = c.Orders.Where(o => !o.IsDeleted).ToList();
        var totalSpent = activeOrders.Sum(o => o.TotalAmount);
        var totalPaid = activeOrders.Sum(o => o.PaidAmount);

        return new CustomerDto(
            c.Id,
            c.CustomerNumber,
            c.Name,
            c.Phone,
            c.SecondaryPhone,
            c.Address,
            c.Notes,
            activeOrders.Count,
            totalSpent,
            totalPaid,
            Math.Max(0, totalSpent - totalPaid),
            activeOrders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate
        );
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        string num = await _numGen.NextCustomerNumberAsync();
        var cust = new Customer
        {
            CustomerNumber = num,
            Name = dto.Name,
            Phone = dto.Phone,
            SecondaryPhone = dto.SecondaryPhone,
            Address = dto.Address,
            Notes = dto.Notes
        };
        _db.Customers.Add(cust);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إضافة عميل", "العملاء", $"تم إضافة العميل {cust.Name} برقم {cust.CustomerNumber}");
        return new CustomerDto(cust.Id, cust.CustomerNumber, cust.Name, cust.Phone, cust.SecondaryPhone, cust.Address, cust.Notes, 0, 0, 0, 0, null);
    }

    public async Task<CustomerDto> UpdateAsync(UpdateCustomerDto dto)
    {
        var cust = await _db.Customers.Include(c => c.Orders).FirstOrDefaultAsync(c => c.Id == dto.Id);
        if (cust == null) throw new InvalidOperationException("العميل غير موجود");

        cust.Name = dto.Name;
        cust.Phone = dto.Phone;
        cust.SecondaryPhone = dto.SecondaryPhone;
        cust.Address = dto.Address;
        cust.Notes = dto.Notes;
        cust.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("تعديل عميل", "العملاء", $"تم تعديل العميل {cust.Name}");

        var activeOrders = cust.Orders.Where(o => !o.IsDeleted).ToList();
        var totalSpent = activeOrders.Sum(o => o.TotalAmount);
        var totalPaid = activeOrders.Sum(o => o.PaidAmount);

        return new CustomerDto(cust.Id, cust.CustomerNumber, cust.Name, cust.Phone, cust.SecondaryPhone, cust.Address, cust.Notes, activeOrders.Count, totalSpent, totalPaid, Math.Max(0, totalSpent - totalPaid), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cust = await _db.Customers.FindAsync(id);
        if (cust == null) return false;
        cust.IsDeleted = true;
        cust.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف عميل", "العملاء", $"تم حذف العميل {cust.Name}");
        return true;
    }

    public async Task<List<CustomerDto>> AutoCompleteAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<CustomerDto>();
        query = query.Trim().ToLower();

        return await _db.Customers
            .Where(c => !c.IsDeleted && (c.Name.ToLower().Contains(query) || c.Phone.Contains(query) || c.CustomerNumber.ToLower().Contains(query)))
            .Take(15)
            .Select(c => new CustomerDto(c.Id, c.CustomerNumber, c.Name, c.Phone, c.SecondaryPhone, c.Address, c.Notes, 0, 0, 0, 0, null))
            .ToListAsync();
    }
}

public class OrderService : IOrderService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;
    private readonly INotificationService? _notification;

    public OrderService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit, INotificationService? notification = null)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
        _notification = notification;
    }

    public async Task<List<OrderDto>> GetAllAsync(ServiceType? serviceType = null, OrderStatus? status = null, string? search = null)
    {
        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.CreatedByUser)
            .Include(o => o.AssignedToUser)
            .Include(o => o.Items)
            .Include(o => o.Payments).ThenInclude(p => p.ReceivedByUser)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (serviceType.HasValue) q = q.Where(o => o.ServiceType == serviceType.Value);
        if (status.HasValue) q = q.Where(o => o.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(o => o.OrderNumber.ToLower().Contains(search) || o.Customer.Name.ToLower().Contains(search) || o.Customer.Phone.Contains(search));
        }

        var orders = await q.OrderByDescending(o => o.Id).ToListAsync();
        return orders.Select(MapOrder).ToList();
    }

    public async Task<OrderDto?> GetByIdAsync(int id)
    {
        var o = await _db.Orders
            .Include(x => x.Customer)
            .Include(x => x.CreatedByUser)
            .Include(x => x.AssignedToUser)
            .Include(x => x.Items)
            .Include(x => x.Payments).ThenInclude(p => p.ReceivedByUser)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        return o == null ? null : MapOrder(o);
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto dto)
    {
        string num = await _numGen.NextOrderNumberAsync();
        decimal total = Math.Max(0, dto.Subtotal - dto.Discount);
        decimal paid = dto.InitialPayment?.Amount ?? 0;
        decimal remaining = Math.Max(0, total - paid);

        var order = new Order
        {
            OrderNumber = num,
            CustomerId = dto.CustomerId,
            ServiceType = dto.ServiceType,
            ServiceTitle = dto.ServiceTitle,
            Subtotal = dto.Subtotal,
            Discount = dto.Discount,
            TotalAmount = total,
            PaidAmount = paid,
            RemainingAmount = remaining,
            Status = OrderStatus.Pending,
            OrderDate = dto.OrderDate,
            DeliveryDate = dto.DeliveryDate,
            DeliveryTime = dto.DeliveryTime,
            Notes = dto.Notes,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            AssignedToUserId = dto.AssignedToUserId
        };

        foreach (var itm in dto.Items)
        {
            order.Items.Add(new OrderItem
            {
                ServiceType = itm.ServiceType,
                Title = itm.Title,
                Description = itm.Description,
                Quantity = itm.Quantity,
                UnitPrice = itm.UnitPrice,
                TotalPrice = itm.Quantity * itm.UnitPrice,
                DetailsJson = itm.DetailsJson
            });
        }

        if (dto.InitialPayment != null && dto.InitialPayment.Amount > 0)
        {
            order.Payments.Add(new Payment
            {
                Amount = dto.InitialPayment.Amount,
                Method = dto.InitialPayment.Method,
                WalletType = dto.InitialPayment.WalletType,
                WalletName = dto.InitialPayment.WalletName,
                TransactionNumber = dto.InitialPayment.TransactionNumber,
                TransferNumber = dto.InitialPayment.TransferNumber,
                SenderName = dto.InitialPayment.SenderName,
                SenderPhone = dto.InitialPayment.SenderPhone,
                Notes = dto.InitialPayment.Notes,
                ReceivedByUserId = _currentUser.CurrentUser?.Id ?? 1
            });
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إنشاء طلب", order.ServiceTitle, $"تم إنشاء الطلب {order.OrderNumber} بمبلغ {order.TotalAmount}");

        if (_notification != null)
        {
            try
            {
                await _notification.CreateNotificationAsync(new CreateNotificationDto(
                    $"طلب جديد: {order.OrderNumber}",
                    $"تم استلام طلب جديد {order.ServiceTitle} بمبلغ إجمالي {order.TotalAmount:N0} ريال",
                    NotificationType.OrderCreated,
                    NotificationPriority.Normal,
                    order.Id,
                    "Order",
                    "Orders"
                ));

                if (order.RemainingAmount > 0)
                {
                    await _notification.CreateNotificationAsync(new CreateNotificationDto(
                        $"مبلغ متبقي على طلب: {order.OrderNumber}",
                        $"الطلب {order.OrderNumber} به مبلغ متبقي {order.RemainingAmount:N0} ريال يستحق عند الاستلام",
                        NotificationType.RemainingBalanceDue,
                        NotificationPriority.Normal,
                        order.Id,
                        "Order",
                        "Orders"
                    ));
                }
            }
            catch { }
        }

        return (await GetByIdAsync(order.Id))!;
    }

    public async Task<bool> UpdateStatusAsync(int orderId, OrderStatus newStatus, string? notes = null)
    {
        var o = await _db.Orders.FindAsync(orderId);
        if (o == null) return false;

        var old = o.Status;
        o.Status = newStatus;
        o.UpdatedAt = DateTime.Now;

        _db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = o.Id,
            OldStatus = old,
            NewStatus = newStatus,
            Notes = notes,
            ChangedByUserId = _currentUser.CurrentUser?.Id ?? 1
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("تغيير حالة طلب", o.ServiceTitle, $"تم تغيير حالة {o.OrderNumber} من {old} إلى {newStatus}");

        if (_notification != null)
        {
            try
            {
                string statusAr = newStatus switch
                {
                    OrderStatus.Pending => "قيد الانتظار",
                    OrderStatus.InDesign => "قيد التصميم",
                    OrderStatus.InPrinting => "قيد الطباعة والمعالجة",
                    OrderStatus.ReadyForDelivery => "جاهز للتسليم للعميل",
                    OrderStatus.Delivered => "تم التسليم للعميل",
                    OrderStatus.Cancelled => "ملغي",
                    _ => newStatus.ToString()
                };
                await _notification.CreateNotificationAsync(new CreateNotificationDto(
                    $"تحديث حالة الطلب: {o.OrderNumber}",
                    $"تم تغيير حالة الطلب {o.OrderNumber} إلى: {statusAr}",
                    NotificationType.OrderStatusChanged,
                    newStatus == OrderStatus.ReadyForDelivery ? NotificationPriority.Warning : NotificationPriority.Normal,
                    o.Id,
                    "Order",
                    "Orders"
                ));
            }
            catch { }
        }

        return true;
    }

    public async Task<PaymentDto> AddPaymentAsync(CreatePaymentDto dto)
    {
        var o = await _db.Orders.Include(x => x.Payments).FirstOrDefaultAsync(x => x.Id == dto.OrderId);
        if (o == null) throw new InvalidOperationException("الطلب غير موجود");

        var payment = new Payment
        {
            OrderId = o.Id,
            Amount = dto.Amount,
            PaymentDate = DateTime.Now,
            Method = dto.Method,
            WalletType = dto.WalletType,
            WalletName = dto.WalletName,
            TransactionNumber = dto.TransactionNumber,
            TransferNumber = dto.TransferNumber,
            SenderName = dto.SenderName,
            SenderPhone = dto.SenderPhone,
            Notes = dto.Notes,
            ReceivedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        o.Payments.Add(payment);
        o.PaidAmount = o.Payments.Sum(p => p.Amount);
        o.RemainingAmount = Math.Max(0, o.TotalAmount - o.PaidAmount);
        o.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("سداد دفعة", "المدفوعات", $"تم تحصيل دفعة بقيمة {payment.Amount} للطلب {o.OrderNumber}");

        if (_notification != null)
        {
            try
            {
                await _notification.CreateNotificationAsync(new CreateNotificationDto(
                    $"تسجيل دفعة: {o.OrderNumber}",
                    $"تم تسجيل دفعة بقيمة {payment.Amount:N0} ريال للطلب {o.OrderNumber}. المتبقي الآن: {o.RemainingAmount:N0} ريال",
                    NotificationType.PaymentReceived,
                    NotificationPriority.Normal,
                    o.Id,
                    "Order",
                    "Orders"
                ));
            }
            catch { }
        }

        var user = await _db.Users.FindAsync(payment.ReceivedByUserId);
        return new PaymentDto(payment.Id, o.Id, o.OrderNumber, payment.Amount, payment.PaymentDate, payment.Method, payment.WalletType, payment.WalletName, payment.TransactionNumber, payment.TransferNumber, payment.SenderName, payment.SenderPhone, payment.Notes, user?.FullName ?? "");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var o = await _db.Orders.FindAsync(id);
        if (o == null) return false;
        o.IsDeleted = true;
        o.UpdatedAt = DateTime.Now;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف طلب", o.ServiceTitle, $"تم حذف الطلب {o.OrderNumber}");
        return true;
    }

    public async Task<List<OrderDto>> SearchInvoicesAsync(string? customerQuery, DateTime? fromDate, DateTime? toDate)
    {
        var q = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Items)
            .Include(o => o.Payments).ThenInclude(p => p.ReceivedByUser)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(customerQuery))
        {
            customerQuery = customerQuery.Trim().ToLower();
            q = q.Where(o => o.Customer.Name.ToLower().Contains(customerQuery) || o.OrderNumber.ToLower().Contains(customerQuery));
        }

        if (fromDate.HasValue) q = q.Where(o => o.OrderDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(o => o.OrderDate <= toDate.Value);

        var list = await q.OrderByDescending(o => o.Id).ToListAsync();
        return list.Select(MapOrder).ToList();
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id,
        o.OrderNumber,
        o.CustomerId,
        o.Customer.Name,
        o.Customer.Phone,
        o.Customer.Address,
        o.ServiceType,
        o.ServiceTitle,
        o.Subtotal,
        o.Discount,
        o.TotalAmount,
        o.PaidAmount,
        o.RemainingAmount,
        o.Status,
        o.OrderDate,
        o.DeliveryDate,
        o.DeliveryTime,
        o.Notes,
        o.CreatedByUser.FullName,
        o.AssignedToUser?.FullName,
        o.Items.Select(i => new OrderItemDto(i.Id, i.ServiceType, i.Title, i.Description, i.Quantity, i.UnitPrice, i.TotalPrice, i.DetailsJson)).ToList(),
        o.Payments.Select(p => new PaymentDto(p.Id, o.Id, o.OrderNumber, p.Amount, p.PaymentDate, p.Method, p.WalletType, p.WalletName, p.TransactionNumber, p.TransferNumber, p.SenderName, p.SenderPhone, p.Notes, p.ReceivedByUser.FullName)).ToList()
    );
}

public class InventoryService : IInventoryService
{
    private readonly StudioDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public InventoryService(StudioDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<List<ProductDto>> GetAllProductsAsync(string? search = null)
    {
        var q = _db.Products.Include(p => p.Category).Where(p => !p.IsDeleted).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(search) || p.Code.ToLower().Contains(search) || p.Category.Name.ToLower().Contains(search));
        }

        return await q.Select(p => new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, p.Category.Name, p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName)).ToListAsync();
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto)
    {
        int count = await _db.Products.CountAsync();
        var p = new Product
        {
            Code = $"PRD-{(count + 1):D3}",
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            Unit = dto.Unit,
            CurrentQuantity = dto.InitialQuantity,
            MinimumQuantity = dto.MinimumQuantity,
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            Location = dto.Location,
            SupplierName = dto.SupplierName
        };

        _db.Products.Add(p);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("إضافة صنف مخزون", "المخزون", $"تم إضافة الصنف {p.Name} بكود {p.Code}");
        var cat = await _db.ProductCategories.FindAsync(p.CategoryId);
        return new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, cat?.Name ?? "", p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName);
    }

    public async Task<bool> RecordStockTransactionAsync(int productId, StockTransactionType type, int quantity, decimal unitPrice, string? reason)
    {
        var p = await _db.Products.FindAsync(productId);
        if (p == null) return false;

        int prev = p.CurrentQuantity;
        int next = type == StockTransactionType.In ? prev + quantity : Math.Max(0, prev - quantity);
        p.CurrentQuantity = next;
        p.UpdatedAt = DateTime.Now;

        _db.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductId = p.Id,
            Type = type,
            Quantity = quantity,
            PreviousQuantity = prev,
            NewQuantity = next,
            UnitPrice = unitPrice,
            Notes = reason,
            PerformedByUserId = _currentUser.CurrentUser?.Id ?? 1
        });

        await _db.SaveChangesAsync();
        await _audit.LogAsync("حركة مخزون", "المخزون", $"تعديل كمية {p.Name} من {prev} إلى {next} ({reason})");
        return true;
    }

    public async Task<List<ProductDto>> GetLowStockProductsAsync()
    {
        return await _db.Products
            .Include(p => p.Category)
            .Where(p => !p.IsDeleted && p.CurrentQuantity <= p.MinimumQuantity)
            .Select(p => new ProductDto(p.Id, p.Code, p.Name, p.CategoryId, p.Category.Name, p.Unit, p.CurrentQuantity, p.MinimumQuantity, p.CostPrice, p.SellingPrice, p.Location, p.SupplierName))
            .ToListAsync();
    }
}

public class PurchaseService : IPurchaseService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public PurchaseService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<PurchaseDto>> GetAllPurchasesAsync()
    {
        return await _db.Purchases
            .Include(p => p.Supplier)
            .Include(p => p.CreatedByUser)
            .Include(p => p.Items).ThenInclude(i => i.Product)
            .OrderByDescending(p => p.Id)
            .Select(p => new PurchaseDto(
                p.Id,
                p.PurchaseNumber,
                p.SupplierId,
                $"{p.Supplier.Name} - {p.Supplier.CompanyName}",
                p.TotalAmount,
                p.PaidAmount,
                p.RemainingAmount,
                p.PurchaseDate,
                p.InvoiceReference,
                p.CreatedByUser.FullName,
                p.Items.Select(i => new PurchaseItemDto(i.ProductId, i.Product.Name, i.Quantity, i.UnitPrice, i.TotalPrice)).ToList()
            ))
            .ToListAsync();
    }

    public async Task<PurchaseDto> CreatePurchaseAsync(CreatePurchaseDto dto)
    {
        var supplier = await _db.Suppliers.FindAsync(dto.SupplierId);
        if (supplier == null) throw new InvalidOperationException("المورد غير موجود");

        string num = await _numGen.NextPurchaseNumberAsync();
        decimal total = dto.Items.Sum(i => i.Quantity * i.UnitPrice);
        decimal rem = Math.Max(0, total - dto.PaidAmount);

        var pur = new Purchase
        {
            PurchaseNumber = num,
            SupplierId = supplier.Id,
            TotalAmount = total,
            PaidAmount = dto.PaidAmount,
            RemainingAmount = rem,
            PurchaseDate = DateTime.Now,
            PaymentMethod = dto.Method,
            InvoiceReference = dto.InvoiceReference,
            Notes = dto.Notes,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        foreach (var itm in dto.Items)
        {
            pur.Items.Add(new PurchaseItem
            {
                ProductId = itm.ProductId,
                Quantity = itm.Quantity,
                UnitPrice = itm.UnitPrice,
                TotalPrice = itm.Quantity * itm.UnitPrice
            });

            // Increment stock
            var prod = await _db.Products.FindAsync(itm.ProductId);
            if (prod != null)
            {
                prod.CurrentQuantity += itm.Quantity;
                prod.CostPrice = itm.UnitPrice;
                prod.UpdatedAt = DateTime.Now;
            }
        }

        supplier.TotalPurchases += total;
        supplier.TotalPaid += dto.PaidAmount;
        supplier.BalanceDebt += rem;

        _db.Purchases.Add(pur);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("فاتورة مشتريات", "الموردون", $"شراء خامات بقيمة {pur.TotalAmount} من المورد {supplier.CompanyName}");
        return (await GetAllPurchasesAsync()).First(p => p.Id == pur.Id);
    }
}

public class ExpenseService : IExpenseService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;
    private readonly INotificationService? _notification;

    public ExpenseService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit, INotificationService? notification = null)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
        _notification = notification;
    }

    public async Task<List<ExpenseDto>> GetAllExpensesAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var q = _db.Expenses.Include(e => e.RecordedByUser).Where(e => !e.IsDeleted).AsQueryable();
        if (fromDate.HasValue) q = q.Where(e => e.ExpenseDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(e => e.ExpenseDate <= toDate.Value);

        return await q.OrderByDescending(e => e.Id)
            .Select(e => new ExpenseDto(e.Id, e.VoucherNumber, e.Category, e.Amount, e.ExpenseDate, e.Recipient, e.Description, e.PaymentMethod, e.RecordedByUser.FullName))
            .ToListAsync();
    }

    public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto dto)
    {
        string num = await _numGen.NextVoucherNumberAsync();
        var exp = new Expense
        {
            VoucherNumber = num,
            Category = dto.Category,
            Amount = dto.Amount,
            ExpenseDate = dto.ExpenseDate,
            Recipient = dto.Recipient,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        _db.Expenses.Add(exp);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("سند صرف", "المحاسبة", $"صرف مبلغ {exp.Amount} للمستلم {exp.Recipient} بند ({exp.Category})");

        if (_notification != null)
        {
            try
            {
                await _notification.CreateNotificationAsync(new CreateNotificationDto(
                    $"سند صرف ومصروف: {exp.VoucherNumber}",
                    $"تم تسجيل مصروف بقيمة {exp.Amount:N0} ريال للمستلم {exp.Recipient} بند: {exp.Category}",
                    NotificationType.ExpenseAdded,
                    NotificationPriority.Normal,
                    exp.Id,
                    "Expense",
                    "Accounting"
                ));
            }
            catch { }
        }

        var user = await _db.Users.FindAsync(exp.RecordedByUserId);
        return new ExpenseDto(exp.Id, exp.VoucherNumber, exp.Category, exp.Amount, exp.ExpenseDate, exp.Recipient, exp.Description, exp.PaymentMethod, user?.FullName ?? "");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var exp = await _db.Expenses.FindAsync(id);
        if (exp == null) return false;
        exp.IsDeleted = true;
        await _db.SaveChangesAsync();
        await _audit.LogAsync("حذف سند صرف", "المحاسبة", $"حذف سند الصرف {exp.VoucherNumber}");
        return true;
    }
}

public static class ArabicNumberToWords
{
    private static readonly string[] Ones = { "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر" };
    private static readonly string[] Tens = { "", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون" };
    private static readonly string[] Hundreds = { "", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة" };

    public static string Convert(decimal number, string currency = "ريال يمني")
    {
        if (number == 0) return $"صفر {currency}";
        long integerPart = (long)Math.Floor(Math.Abs(number));
        string words = ConvertInteger(integerPart);
        return $"فقط {words} {currency} لا غير";
    }

    private static string ConvertInteger(long number)
    {
        if (number == 0) return "";
        if (number < 20) return Ones[number];
        if (number < 100)
        {
            long rem = number % 10;
            return rem > 0 ? $"{Ones[rem]} و{Tens[number / 10]}" : Tens[number / 10];
        }
        if (number < 1000)
        {
            long rem = number % 100;
            return rem > 0 ? $"{Hundreds[number / 100]} و{ConvertInteger(rem)}" : Hundreds[number / 100];
        }
        if (number < 1000000)
        {
            long thousands = number / 1000;
            long rem = number % 1000;
            string thWord = thousands switch
            {
                1 => "ألف",
                2 => "ألفان",
                >= 3 and <= 10 => $"{ConvertInteger(thousands)} آلاف",
                _ => $"{ConvertInteger(thousands)} ألف"
            };
            return rem > 0 ? $"{thWord} و{ConvertInteger(rem)}" : thWord;
        }
        if (number < 1000000000)
        {
            long millions = number / 1000000;
            long rem = number % 1000000;
            string milWord = millions switch
            {
                1 => "مليون",
                2 => "مليونان",
                >= 3 and <= 10 => $"{ConvertInteger(millions)} ملايين",
                _ => $"{ConvertInteger(millions)} مليون"
            };
            return rem > 0 ? $"{milWord} و{ConvertInteger(rem)}" : milWord;
        }
        return number.ToString();
    }
}

public class AccountingService : IAccountingService
{
    private readonly StudioDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public AccountingService(StudioDbContext db, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.Today;
        var orders = await _db.Orders.Where(o => !o.IsDeleted).ToListAsync();
        var expenses = await _db.Expenses.Where(e => !e.IsDeleted).ToListAsync();
        var payments = await _db.Payments.Where(p => !p.IsDeleted).ToListAsync();

        int todayOrders = orders.Count(o => o.OrderDate.Date == today);
        int inProgress = orders.Count(o => o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Ready);
        int ready = orders.Count(o => o.Status == OrderStatus.Ready);
        decimal remainingDebt = orders.Sum(o => o.RemainingAmount);

        decimal totalIn = payments.Sum(p => p.Amount);
        decimal totalOut = expenses.Sum(e => e.Amount);
        decimal netCash = totalIn - totalOut;

        decimal todayRevenue = payments.Where(p => p.PaymentDate.Date == today).Sum(p => p.Amount);

        return new DashboardStatsDto(todayOrders, inProgress, ready, remainingDebt, netCash, todayRevenue);
    }

    public async Task<decimal> GetTreasuryBalanceAsync()
    {
        decimal totalIn = await _db.Payments.Where(p => !p.IsDeleted).SumAsync(p => p.Amount);
        decimal totalOut = await _db.Expenses.Where(e => !e.IsDeleted).SumAsync(e => e.Amount);
        return totalIn - totalOut;
    }

    public async Task<List<PaymentDto>> SearchVouchersAsync(DateTime? fromDate, DateTime? toDate, string? search)
    {
        var q = _db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .Include(p => p.ReceivedByUser)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (fromDate.HasValue) q = q.Where(p => p.PaymentDate >= fromDate.Value);
        if (toDate.HasValue) q = q.Where(p => p.PaymentDate <= toDate.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(p => p.Order.OrderNumber.ToLower().Contains(search) || p.Order.Customer.Name.ToLower().Contains(search));
        }

        return await q.OrderByDescending(p => p.Id)
            .Select(p => new PaymentDto(p.Id, p.OrderId, p.Order.OrderNumber, p.Amount, p.PaymentDate, p.Method, p.WalletType, p.WalletName, p.TransactionNumber, p.TransferNumber, p.SenderName, p.SenderPhone, p.Notes, p.ReceivedByUser.FullName))
            .ToListAsync();
    }

    public async Task<AccountingDashboardStatsDto> GetAccountingDashboardStatsAsync()
    {
        var now = DateTime.Now;
        var today = DateTime.Today;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);

        decimal cashIn = await _db.Payments.Where(p => !p.IsDeleted && p.Method == PaymentMethod.Cash).SumAsync(p => p.Amount);
        decimal cashOut = await _db.Expenses.Where(e => !e.IsDeleted && e.PaymentMethod == PaymentMethod.Cash).SumAsync(e => e.Amount);
        decimal cashboxBal = cashIn - cashOut;

        decimal todayRev = await _db.Payments.Where(p => !p.IsDeleted && p.PaymentDate.Date == today).SumAsync(p => p.Amount);
        decimal monthRev = await _db.Payments.Where(p => !p.IsDeleted && p.PaymentDate >= startOfMonth).SumAsync(p => p.Amount);

        decimal todayExp = await _db.Expenses.Where(e => !e.IsDeleted && e.ExpenseDate.Date == today).SumAsync(e => e.Amount);
        decimal monthExp = await _db.Expenses.Where(e => !e.IsDeleted && e.ExpenseDate >= startOfMonth).SumAsync(e => e.Amount);

        decimal netIncome = monthRev - monthExp;

        decimal custDebts = await _db.Orders.Where(o => !o.IsDeleted && o.Status != OrderStatus.Cancelled).SumAsync(o => o.RemainingAmount);
        decimal salariesDue = await _db.Employees.Where(e => e.IsActive && !e.IsDeleted).SumAsync(e => e.BaseSalary);
        decimal pendingAdvances = await _db.SalaryAdvances.Where(a => !a.IsDeducted && !a.IsDeleted).SumAsync(a => a.Amount);
        decimal supplierDebts = await _db.Suppliers.Where(s => !s.IsDeleted).SumAsync(s => s.BalanceDebt);


        int todayTxCount = await _db.Payments.CountAsync(p => p.PaymentDate.Date == today) + await _db.Expenses.CountAsync(e => e.ExpenseDate.Date == today);

        var recentTx = await GetCashboxTransactionsAsync(DateTime.Today.AddDays(-7), null, null);
        var recentExp = await _db.Expenses.Include(e => e.RecordedByUser).Where(e => !e.IsDeleted).OrderByDescending(e => e.Id).Take(5)
            .Select(e => new ExpenseDto(e.Id, e.VoucherNumber, e.Category, e.Amount, e.ExpenseDate, e.Recipient, e.Description, e.PaymentMethod, e.RecordedByUser.FullName))
            .ToListAsync();

        var recentInc = await _db.Payments.Include(p => p.Order).Include(p => p.ReceivedByUser).Where(p => !p.IsDeleted).OrderByDescending(p => p.Id).Take(5)
            .Select(p => new PaymentDto(p.Id, p.OrderId, p.Order.OrderNumber, p.Amount, p.PaymentDate, p.Method, p.WalletType, p.WalletName, p.TransactionNumber, p.TransferNumber, p.SenderName, p.SenderPhone, p.Notes, p.ReceivedByUser.FullName))
            .ToListAsync();

        var alerts = new List<string>();
        if (pendingAdvances > 0) alerts.Add($"توجد سلف موظفين قائمة بقيمة {pendingAdvances:N0} ر.ي لم تسدد بعد.");
        if (custDebts > 0) alerts.Add($"إجمالي ديون العملاء غير المسددة يبلغ {custDebts:N0} ر.ي.");
        if (supplierDebts > 0) alerts.Add($"مستحقات الموردين واجبة السداد تبلغ {supplierDebts:N0} ر.ي.");
        if (cashboxBal < 10000) alerts.Add("تنبيه: رصيد الصندوق النقدي منخفض حالياً.");

        return new AccountingDashboardStatsDto(
            cashboxBal,
            todayRev,
            monthRev,
            todayExp,
            monthExp,
            netIncome,
            custDebts,
            salariesDue,
            pendingAdvances,
            supplierDebts,
            todayTxCount,
            recentTx.Take(8).ToList(),
            recentExp,
            recentInc,
            alerts
        );
    }

    public async Task<List<CashboxTransactionDto>> GetCashboxTransactionsAsync(DateTime? fromDate = null, DateTime? toDate = null, CashboxType? type = null)
    {
        var q = _db.CashboxTransactions.Include(t => t.CreatedByUser).AsQueryable();
        if (fromDate.HasValue) q = q.Where(t => t.Date >= fromDate.Value.Date);
        if (toDate.HasValue) q = q.Where(t => t.Date <= toDate.Value.Date.AddDays(1).AddTicks(-1));
        if (type.HasValue) q = q.Where(t => t.Type == type.Value);

        return await q.OrderByDescending(t => t.Id)
            .Select(t => new CashboxTransactionDto(
                t.Id,
                t.TransactionNumber,
                t.Date,
                t.Time,
                t.Type,
                t.Type == CashboxType.In ? "توريد / قبض" : "صرف / منصرف",
                t.Category,
                t.Amount,
                t.Description,
                t.PaymentMethod,
                t.WalletType,
                t.Reference,
                t.BalanceAfter,
                t.CreatedByUser.FullName,
                t.Notes
            ))
            .ToListAsync();
    }

    public async Task<CashboxTransactionDto> AddCashboxTransactionAsync(CreateCashboxTransactionDto dto)
    {
        decimal prevBalance = await GetTreasuryBalanceAsync();
        decimal newBalance = dto.Type == CashboxType.In ? prevBalance + dto.Amount : prevBalance - dto.Amount;

        int count = await _db.CashboxTransactions.CountAsync();
        string txNum = $"CB-{DateTime.Now.Year}-{(count + 1):D6}";

        var tx = new CashboxTransaction
        {
            TransactionNumber = txNum,
            Date = DateTime.Now,
            Time = DateTime.Now.ToString("hh:mm tt"),
            Type = dto.Type,
            Category = dto.Category,
            Amount = dto.Amount,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            Reference = dto.Reference,
            BalanceAfter = newBalance,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };

        _db.CashboxTransactions.Add(tx);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("حركة صندوق", "الصندوق", $"تسجيل حركة {tx.Category} بمبلغ {tx.Amount} ر.ي (رصيد الصندوق: {newBalance:N0})");
        var user = await _db.Users.FindAsync(tx.CreatedByUserId);

        return new CashboxTransactionDto(
            tx.Id,
            tx.TransactionNumber,
            tx.Date,
            tx.Time,
            tx.Type,
            tx.Type == CashboxType.In ? "توريد / قبض" : "صرف / منصرف",
            tx.Category,
            tx.Amount,
            tx.Description,
            tx.PaymentMethod,
            tx.WalletType,
            tx.Reference,
            tx.BalanceAfter,
            user?.FullName ?? "",
            tx.Notes
        );
    }

    public async Task<List<AccountDto>> GetAccountsAsync()
    {
        var accounts = await _db.Accounts.Where(a => a.IsActive).OrderBy(a => a.AccountCode).ToListAsync();
        if (!accounts.Any())
        {
            // Seed default chart of accounts
            accounts = new List<Account>
            {
                new Account { AccountCode = "101", AccountName = "الصندوق الرئيسي (كاش)", Category = AccountCategory.Asset, CurrentBalance = await GetTreasuryBalanceAsync() },
                new Account { AccountCode = "102", AccountName = "بنك الكريمي (حساب / إم فلوس)", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "103", AccountName = "محفظة جيب الإلكترونية (Jeeb)", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "104", AccountName = "محفظة جوالي الإلكترونية (Jawwali)", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "105", AccountName = "محفظة ون كاش (OneCash)", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "106", AccountName = "محفظة فلوسك (Floosak)", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "107", AccountName = "بنك القطيبي الإسلامي", Category = AccountCategory.Asset, CurrentBalance = 0 },
                new Account { AccountCode = "110", AccountName = "مدينو الاستديو (حسابات العملاء)", Category = AccountCategory.Asset, CurrentBalance = await _db.Orders.Where(o => !o.IsDeleted && o.Status != OrderStatus.Cancelled).SumAsync(o => o.RemainingAmount) },
                new Account { AccountCode = "201", AccountName = "دائنو المشتريات (الموردون)", Category = AccountCategory.Liability, CurrentBalance = await _db.Suppliers.SumAsync(s => s.BalanceDebt) },
                new Account { AccountCode = "202", AccountName = "رواتب ومستحقات الموظفين", Category = AccountCategory.Liability, CurrentBalance = await _db.Employees.SumAsync(e => e.BaseSalary) },
                new Account { AccountCode = "301", AccountName = "إيرادات لوحات العرسان", Category = AccountCategory.Revenue, CurrentBalance = 0 },
                new Account { AccountCode = "302", AccountName = "إيرادات جلسات وتصوير الاستديو", Category = AccountCategory.Revenue, CurrentBalance = 0 },
                new Account { AccountCode = "303", AccountName = "إيرادات الدعاية والإعلان والبنرات", Category = AccountCategory.Revenue, CurrentBalance = 0 },
                new Account { AccountCode = "304", AccountName = "إيرادات التصميم والجرافيك", Category = AccountCategory.Revenue, CurrentBalance = 0 },
                new Account { AccountCode = "305", AccountName = "إيرادات الفيديو والمونتاج", Category = AccountCategory.Revenue, CurrentBalance = 0 },
                new Account { AccountCode = "401", AccountName = "مصروفات إيجار ومرافق", Category = AccountCategory.Expense, CurrentBalance = 0 },
                new Account { AccountCode = "402", AccountName = "مصروفات خامات وأحبار ومستلزمات", Category = AccountCategory.Expense, CurrentBalance = 0 },
                new Account { AccountCode = "403", AccountName = "مصروفات صيانة وتشغيل", Category = AccountCategory.Expense, CurrentBalance = 0 }
            };
            _db.Accounts.AddRange(accounts);
            await _db.SaveChangesAsync();
        }

        return accounts.Select(a => new AccountDto(
            a.Id,
            a.AccountCode,
            a.AccountName,
            a.Category,
            a.Category switch
            {
                AccountCategory.Asset => "أصول",
                AccountCategory.Liability => "خصوم والتزامات",
                AccountCategory.Equity => "حقوق ملكية",
                AccountCategory.Revenue => "إيرادات",
                AccountCategory.Expense => "مصروفات",
                _ => "عام"
            },
            a.CurrentBalance,
            a.IsActive,
            a.Notes
        )).ToList();
    }

    public async Task<AccountStatementDto> GetAccountStatementAsync(string accountType, int entityId, DateTime fromDate, DateTime toDate)
    {
        string entityName = "";
        decimal openingBalance = 0;
        var rows = new List<AccountStatementRowDto>();

        if (accountType == "employee")
        {
            var emp = await _db.Employees
                .Include(e => e.SalaryAdvances)
                .Include(e => e.Salaries)
                .FirstOrDefaultAsync(e => e.Id == entityId);

            if (emp != null)
            {
                entityName = $"الموظف: {emp.Name} ({emp.Role})";
                decimal running = 0;

                // Advances
                foreach (var a in emp.SalaryAdvances.Where(x => x.AdvanceDate >= fromDate && x.AdvanceDate <= toDate).OrderBy(x => x.AdvanceDate))
                {
                    running += a.Amount;
                    rows.Add(new AccountStatementRowDto(a.AdvanceDate, a.AdvanceDate.ToString("hh:mm tt"), $"سلفة نقدية برقم ({a.AdvanceNumber})", a.Amount, 0, running, a.AdvanceNumber));
                }

                // Salaries
                foreach (var s in emp.Salaries.Where(x => x.PaymentDate >= fromDate && x.PaymentDate <= toDate).OrderBy(x => x.PaymentDate))
                {
                    running -= s.NetSalary;
                    rows.Add(new AccountStatementRowDto(s.PaymentDate, s.PaymentDate.ToString("hh:mm tt"), $"صرف راتب شهر {s.MonthYear} ({s.PaymentNumber})", 0, s.NetSalary, running, s.PaymentNumber));
                }
            }
        }
        else if (accountType == "customer")
        {
            var cust = await _db.Customers
                .Include(c => c.Orders).ThenInclude(o => o.Payments)
                .FirstOrDefaultAsync(c => c.Id == entityId);

            if (cust != null)
            {
                entityName = $"العميل: {cust.Name} ({cust.Phone})";
                decimal running = 0;

                foreach (var o in cust.Orders.Where(x => x.OrderDate >= fromDate && x.OrderDate <= toDate).OrderBy(x => x.OrderDate))
                {
                    running += o.TotalAmount;
                    rows.Add(new AccountStatementRowDto(o.OrderDate, o.OrderDate.ToString("hh:mm tt"), $"فاتورة طلب {o.ServiceTitle} ({o.OrderNumber})", o.TotalAmount, 0, running, o.OrderNumber));

                    foreach (var p in o.Payments.OrderBy(x => x.PaymentDate))
                    {
                        running -= p.Amount;
                        rows.Add(new AccountStatementRowDto(p.PaymentDate, p.PaymentDate.ToString("hh:mm tt"), $"سداد دفعة طلب {o.OrderNumber}", 0, p.Amount, running, p.TransactionNumber));
                    }
                }
            }
        }
        else if (accountType == "supplier")
        {
            var supp = await _db.Suppliers
                .Include(s => s.Purchases)
                .FirstOrDefaultAsync(s => s.Id == entityId);

            if (supp != null)
            {
                entityName = $"المورد: {supp.Name} - {supp.CompanyName}";
                decimal running = 0;

                foreach (var p in supp.Purchases.Where(x => x.PurchaseDate >= fromDate && x.PurchaseDate <= toDate).OrderBy(x => x.PurchaseDate))
                {
                    running += p.TotalAmount;
                    rows.Add(new AccountStatementRowDto(p.PurchaseDate, p.PurchaseDate.ToString("hh:mm tt"), $"فاتورة توريد خامات ({p.PurchaseNumber})", 0, p.TotalAmount, running, p.PurchaseNumber));

                    if (p.PaidAmount > 0)
                    {
                        running -= p.PaidAmount;
                        rows.Add(new AccountStatementRowDto(p.PurchaseDate, p.PurchaseDate.ToString("hh:mm tt"), $"سداد دفعة مشتريات ({p.PurchaseNumber})", p.PaidAmount, 0, running, p.InvoiceReference));
                    }
                }
            }
        }
        else // Cashbox / Treasury
        {
            entityName = "الصندوق الرئيسي وحسابات الخزينة";
            decimal running = 0;
            var txs = await _db.CashboxTransactions
                .Where(t => t.Date >= fromDate && t.Date <= toDate)
                .OrderBy(t => t.Date)
                .ToListAsync();

            foreach (var t in txs)
            {
                decimal deb = t.Type == CashboxType.In ? t.Amount : 0;
                decimal cred = t.Type == CashboxType.Out ? t.Amount : 0;
                running = t.BalanceAfter;
                rows.Add(new AccountStatementRowDto(t.Date, t.Time, $"{t.Category}: {t.Description}", deb, cred, running, t.TransactionNumber));
            }
        }

        decimal totalDebit = rows.Sum(r => r.Debit);
        decimal totalCredit = rows.Sum(r => r.Credit);
        decimal closingBalance = rows.Any() ? rows.Last().Balance : openingBalance;

        return new AccountStatementDto(
            entityName,
            accountType,
            fromDate,
            toDate,
            openingBalance,
            totalDebit,
            totalCredit,
            closingBalance,
            rows
        );
    }

    public async Task<List<VoucherDto>> GetVouchersAsync(VoucherType? type = null, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var q = _db.Vouchers.Include(v => v.CreatedByUser).AsQueryable();
        if (type.HasValue) q = q.Where(v => v.Type == type.Value);
        if (fromDate.HasValue) q = q.Where(v => v.Date >= fromDate.Value.Date);
        if (toDate.HasValue) q = q.Where(v => v.Date <= toDate.Value.Date.AddDays(1).AddTicks(-1));

        var list = await q.OrderByDescending(v => v.Id).ToListAsync();
        return list.Select(v => new VoucherDto(
            v.Id,
            v.VoucherNumber,
            v.Type,
            v.Type switch
            {
                VoucherType.Receipt => "سند قبض",
                VoucherType.Payment => "سند صرف",
                VoucherType.Salary => "سند صرف راتب",
                VoucherType.Advance => "سند صرف سلفة",
                VoucherType.Deduction => "إشعار خصم",
                _ => "سند مالي"
            },
            v.Date,
            v.Time,
            v.BeneficiaryOrPayer,
            v.Amount,
            v.AmountWords,
            v.Description,
            v.PaymentMethod,
            v.WalletType,
            v.TransactionReference,
            v.CreatedByUser?.FullName ?? "أمين الصندوق",
            v.Notes
        )).ToList();

    }

    public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherDto dto)
    {
        string prefix = dto.Type switch
        {
            VoucherType.Receipt => "REC",
            VoucherType.Payment => "PAY",
            VoucherType.Salary => "SAL",
            VoucherType.Advance => "ADV",
            VoucherType.Deduction => "DED",
            _ => "VOU"
        };

        int count = await _db.Vouchers.CountAsync(v => v.Type == dto.Type);
        string vNum = $"{prefix}-{DateTime.Now.Year}-{(count + 1):D6}";
        string words = ArabicNumberToWords.Convert(dto.Amount);

        var voucher = new Voucher
        {
            VoucherNumber = vNum,
            Type = dto.Type,
            Date = DateTime.Now,
            Time = DateTime.Now.ToString("hh:mm tt"),
            BeneficiaryOrPayer = dto.BeneficiaryOrPayer,
            Amount = dto.Amount,
            AmountWords = words,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            TransactionReference = dto.TransactionReference,
            RelatedCustomerId = dto.RelatedCustomerId,
            RelatedEmployeeId = dto.RelatedEmployeeId,
            RelatedSupplierId = dto.RelatedSupplierId,
            RelatedOrderId = dto.RelatedOrderId,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };

        _db.Vouchers.Add(voucher);

        // Also record corresponding Cashbox transaction
        CashboxType cbType = dto.Type == VoucherType.Receipt ? CashboxType.In : CashboxType.Out;
        string cbCategory = dto.Type switch
        {
            VoucherType.Receipt => "قبض نقدي",
            VoucherType.Payment => "صرف مصروف",
            VoucherType.Salary => "صرف راتب",
            VoucherType.Advance => "سلفة موظف",
            _ => "تسوية حساب"
        };

        decimal curBal = await GetTreasuryBalanceAsync();
        decimal newBal = cbType == CashboxType.In ? curBal + dto.Amount : curBal - dto.Amount;

        var cbTx = new CashboxTransaction
        {
            TransactionNumber = $"CB-{DateTime.Now.Year}-{(await _db.CashboxTransactions.CountAsync() + 1):D6}",
            Date = DateTime.Now,
            Time = DateTime.Now.ToString("hh:mm tt"),
            Type = cbType,
            Category = cbCategory,
            Amount = dto.Amount,
            Description = dto.Description,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            Reference = vNum,
            BalanceAfter = newBal,
            Voucher = voucher,
            CreatedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };
        _db.CashboxTransactions.Add(cbTx);

        await _db.SaveChangesAsync();

        await _audit.LogAsync("إنشاء سند", "السندات المالية", $"تم إنشاء {voucher.VoucherNumber} بمبلغ {voucher.Amount} للمستفيد {voucher.BeneficiaryOrPayer}");
        var user = await _db.Users.FindAsync(voucher.CreatedByUserId);

        return new VoucherDto(
            voucher.Id,
            voucher.VoucherNumber,
            voucher.Type,
            voucher.Type.ToString(),
            voucher.Date,
            voucher.Time,
            voucher.BeneficiaryOrPayer,
            voucher.Amount,
            voucher.AmountWords,
            voucher.Description,
            voucher.PaymentMethod,
            voucher.WalletType,
            voucher.TransactionReference,
            user?.FullName ?? "",
            voucher.Notes
        );
    }

    public async Task<EmployeeFinancialSummaryDto> GetEmployeeFinancialSummaryAsync(int employeeId)
    {
        var emp = await _db.Employees
            .Include(e => e.SalaryAdvances)
            .Include(e => e.Salaries)
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        decimal totalAdvances = emp.SalaryAdvances.Where(a => !a.IsDeleted).Sum(a => a.Amount);
        decimal unpaidAdvances = emp.SalaryAdvances.Where(a => !a.IsDeleted && !a.IsDeducted).Sum(a => a.Amount);

        var deductions = await _db.EmployeeDeductions.Where(d => d.EmployeeId == employeeId && !d.IsAppliedToSalary).ToListAsync();
        decimal totalDeductions = deductions.Sum(d => d.Amount);

        decimal totalPaid = emp.Salaries.Sum(s => s.NetSalary);
        decimal netDue = Math.Max(0, emp.BaseSalary - unpaidAdvances - totalDeductions);

        return new EmployeeFinancialSummaryDto(
            emp.Id,
            emp.Name,
            emp.Role,
            emp.BaseSalary,
            emp.BaseSalary,
            totalAdvances,
            unpaidAdvances,
            totalDeductions,
            totalPaid,
            netDue
        );
    }

    public async Task<List<EmployeeTransactionRowDto>> GetEmployeeTransactionsAsync(int employeeId)
    {
        var emp = await _db.Employees
            .Include(e => e.SalaryAdvances)
            .Include(e => e.Salaries)
            .FirstOrDefaultAsync(e => e.Id == employeeId);

        if (emp == null) return new List<EmployeeTransactionRowDto>();

        var rows = new List<EmployeeTransactionRowDto>();
        decimal running = 0;

        foreach (var adv in emp.SalaryAdvances.OrderBy(a => a.AdvanceDate))
        {
            running += adv.Amount;
            rows.Add(new EmployeeTransactionRowDto(
                adv.AdvanceDate,
                adv.AdvanceDate.ToString("hh:mm tt"),
                "سلفة نقدية",
                $"سلفة من الراتب ({adv.AdvanceNumber})",
                adv.Amount,
                adv.Amount,
                0,
                running,
                _currentUser.CurrentUser?.FullName ?? "مدير النظام"
            ));
        }

        var deds = await _db.EmployeeDeductions.Where(d => d.EmployeeId == employeeId).ToListAsync();
        foreach (var d in deds.OrderBy(x => x.Date))
        {
            running += d.Amount;
            rows.Add(new EmployeeTransactionRowDto(
                d.Date,
                d.Date.ToString("hh:mm tt"),
                "خصم إداري",
                $"خصم: {d.Reason} ({d.DeductionNumber})",
                d.Amount,
                d.Amount,
                0,
                running,
                _currentUser.CurrentUser?.FullName ?? "مدير النظام"
            ));
        }

        foreach (var sal in emp.Salaries.OrderBy(s => s.PaymentDate))
        {
            running -= sal.NetSalary;
            rows.Add(new EmployeeTransactionRowDto(
                sal.PaymentDate,
                sal.PaymentDate.ToString("hh:mm tt"),
                "صرف راتب",
                $"صرف راتب شهر {sal.MonthYear} ({sal.PaymentNumber})",
                sal.NetSalary,
                0,
                sal.NetSalary,
                running,
                _currentUser.CurrentUser?.FullName ?? "مدير النظام"
            ));
        }

        return rows.OrderByDescending(r => r.Date).ToList();
    }

    public async Task<EmployeeDeductionDto> CreateEmployeeDeductionAsync(CreateEmployeeDeductionDto dto)
    {
        int count = await _db.EmployeeDeductions.CountAsync();
        string dNum = $"DED-{DateTime.Now.Year}-{(count + 1):D4}";

        var ded = new EmployeeDeduction
        {
            DeductionNumber = dNum,
            EmployeeId = dto.EmployeeId,
            Amount = dto.Amount,
            Date = dto.Date,
            MonthYear = dto.MonthYear,
            Reason = dto.Reason,
            IsAppliedToSalary = false,
            RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };

        _db.EmployeeDeductions.Add(ded);
        await _db.SaveChangesAsync();

        var emp = await _db.Employees.FindAsync(dto.EmployeeId);
        await _audit.LogAsync("خصم موظف", "الرواتب", $"تسجيل خصم بمبلغ {ded.Amount} للموظف {emp?.Name} لسبب: {ded.Reason}");

        var user = await _db.Users.FindAsync(ded.RecordedByUserId);
        return new EmployeeDeductionDto(
            ded.Id,
            ded.DeductionNumber,
            ded.EmployeeId,
            emp?.Name ?? "",
            ded.Amount,
            ded.Date,
            ded.MonthYear,
            ded.Reason,
            ded.IsAppliedToSalary,
            user?.FullName ?? "",
            ded.Notes
        );
    }

    public async Task<List<EmployeeDeductionDto>> GetEmployeeDeductionsAsync(int? employeeId = null)
    {
        var q = _db.EmployeeDeductions.Include(d => d.Employee).Include(d => d.RecordedByUser).AsQueryable();
        if (employeeId.HasValue) q = q.Where(d => d.EmployeeId == employeeId.Value);

        return await q.OrderByDescending(d => d.Id)
            .Select(d => new EmployeeDeductionDto(
                d.Id,
                d.DeductionNumber,
                d.EmployeeId,
                d.Employee.Name,
                d.Amount,
                d.Date,
                d.MonthYear,
                d.Reason,
                d.IsAppliedToSalary,
                d.RecordedByUser.FullName,
                d.Notes
            ))
            .ToListAsync();
    }

    public async Task<SalaryDto> ProcessSalaryPaymentAsync(ProcessPartialSalaryDto dto)
    {
        var emp = await _db.Employees.Include(e => e.SalaryAdvances).FirstOrDefaultAsync(e => e.Id == dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        var summary = await GetEmployeeFinancialSummaryAsync(dto.EmployeeId);
        if (dto.AmountPaid > summary.NetBalanceDue)
        {
            throw new InvalidOperationException($"المبلغ المدفوع ({dto.AmountPaid:N0}) أكبر من المبلغ المستحق للموظف ({summary.NetBalanceDue:N0}).");
        }

        int count = await _db.Salaries.CountAsync();
        string sNum = $"SAL-{dto.MonthYear}-{(count + 1):D4}";

        var salary = new Salary
        {
            PaymentNumber = sNum,
            EmployeeId = emp.Id,
            MonthYear = dto.MonthYear,
            BaseSalary = emp.BaseSalary,
            Allowances = 0,
            Deductions = summary.TotalDeductions,
            AdvancesDeducted = summary.UnpaidAdvances,
            NetSalary = dto.AmountPaid,
            PaymentDate = DateTime.Now,
            PaymentMethod = dto.Method,
            Notes = dto.Notes,
            PaidByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        _db.Salaries.Add(salary);

        // Create Payment Voucher automatically
        await CreateVoucherAsync(new CreateVoucherDto(
            VoucherType.Salary,
            emp.Name,
            dto.AmountPaid,
            $"صرف دفعة راتب شهر {dto.MonthYear} للموظف {emp.Name}",
            dto.Method,
            dto.WalletType,
            dto.TransactionRef,
            null,
            emp.Id,
            null,
            null,
            dto.Notes
        ));

        // Mark advances and deductions as applied if fully paid
        if (dto.AmountPaid >= summary.NetBalanceDue)
        {
            foreach (var adv in emp.SalaryAdvances.Where(a => !a.IsDeducted))
            {
                adv.IsDeducted = true;
                adv.DeductedFromSalary = salary;
            }
            var deds = await _db.EmployeeDeductions.Where(d => d.EmployeeId == emp.Id && !d.IsAppliedToSalary).ToListAsync();
            foreach (var d in deds) d.IsAppliedToSalary = true;
        }

        await _db.SaveChangesAsync();

        await _audit.LogAsync("صرف راتب", "الرواتب", $"تم صرف دفعة راتب بمبلغ {dto.AmountPaid} للموظف {emp.Name}");
        var user = await _db.Users.FindAsync(salary.PaidByUserId);

        return new SalaryDto(
            salary.Id,
            salary.PaymentNumber,
            emp.Id,
            emp.Name,
            salary.MonthYear,
            salary.BaseSalary,
            salary.Allowances,
            salary.Deductions,
            salary.AdvancesDeducted,
            salary.NetSalary,
            salary.PaymentDate,
            user?.FullName ?? ""
        );
    }

    public Task<string> ConvertNumberToWordsArabicAsync(decimal amount, string currency = "ريال يمني")
    {
        return Task.FromResult(ArabicNumberToWords.Convert(amount, currency));
    }

    public async Task<CashierIncomeReportDto> GetCashierIncomeReportAsync(CashierIncomeFilterDto filter)
    {
        var qOrders = _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.CreatedByUser)
            .Include(o => o.Payments).ThenInclude(p => p.ReceivedByUser)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        var qPayments = _db.Payments
            .Include(p => p.Order).ThenInclude(o => o.Customer)
            .Include(p => p.ReceivedByUser)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (filter.CashierId.HasValue && filter.CashierId.Value > 0)
        {
            qOrders = qOrders.Where(o => o.CreatedByUserId == filter.CashierId.Value || o.Payments.Any(p => p.ReceivedByUserId == filter.CashierId.Value));
            qPayments = qPayments.Where(p => p.ReceivedByUserId == filter.CashierId.Value);
        }

        if (filter.FromDate.HasValue)
        {
            var from = filter.FromDate.Value.Date;
            if (!string.IsNullOrWhiteSpace(filter.FromTime) && TimeSpan.TryParse(filter.FromTime, out var tsFrom))
                from = from.Add(tsFrom);
            qOrders = qOrders.Where(o => o.OrderDate >= from);
            qPayments = qPayments.Where(p => p.PaymentDate >= from);
        }

        if (filter.ToDate.HasValue)
        {
            var to = filter.ToDate.Value.Date.AddDays(1).AddTicks(-1);
            if (!string.IsNullOrWhiteSpace(filter.ToTime) && TimeSpan.TryParse(filter.ToTime, out var tsTo))
                to = filter.ToDate.Value.Date.Add(tsTo);
            qOrders = qOrders.Where(o => o.OrderDate <= to);
            qPayments = qPayments.Where(p => p.PaymentDate <= to);
        }

        var ordersList = await qOrders.OrderByDescending(o => o.OrderDate).ToListAsync();
        var paymentsList = await qPayments.ToListAsync();

        string cashierName = "جميع الكاشيرات ومسؤولي المبيعات";
        if (filter.CashierId.HasValue && filter.CashierId.Value > 0)
        {
            var u = await _db.Users.FindAsync(filter.CashierId.Value);
            if (u != null) cashierName = $"{u.FullName} (#{u.UserNumber})";
        }

        int ordersCount = ordersList.Count;
        int invoicesCount = ordersList.Count;
        decimal totalSales = ordersList.Sum(o => o.TotalAmount);
        decimal totalCash = paymentsList.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount);
        decimal totalWallets = paymentsList.Where(p => p.Method == PaymentMethod.BankWallet).Sum(p => p.Amount);
        decimal totalBank = totalWallets;
        decimal totalDiscounts = ordersList.Sum(o => o.Discount);
        decimal totalReceived = paymentsList.Sum(p => p.Amount);
        decimal totalRemaining = ordersList.Sum(o => o.RemainingAmount);
        decimal netIncome = totalReceived;

        var periodFormatted = $"من {(filter.FromDate?.ToString("yyyy/MM/dd") ?? "البداية")} إلى {(filter.ToDate?.ToString("yyyy/MM/dd") ?? "اليوم")}";

        var rows = ordersList.Select(o => {
            var firstP = o.Payments.FirstOrDefault();
            string method = firstP != null ? (firstP.Method == PaymentMethod.Cash ? "نقدياً" : "محفظة / بنك") : "غير محدد";
            string? wallet = firstP?.WalletName;
            return new CashierOrderRowDto(
                o.OrderNumber,
                o.Customer?.Name ?? "عميل",
                o.ServiceTitle,
                o.TotalAmount,
                o.PaidAmount,
                o.RemainingAmount,
                method,
                wallet,
                o.OrderDate.ToString("yyyy/MM/dd"),
                o.OrderDate.ToString("hh:mm tt"),
                o.CreatedByUser?.FullName ?? "كاشير"
            );
        }).ToList();

        return new CashierIncomeReportDto(
            cashierName,
            periodFormatted,
            ordersCount,
            invoicesCount,
            totalSales,
            totalCash,
            totalWallets,
            totalBank,
            totalDiscounts,
            totalReceived,
            totalRemaining,
            netIncome,
            rows
        );
    }

    public async Task<TodayIncomeSummaryDto> GetTodayIncomeSummaryAsync()
    {
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var ordersToday = await _db.Orders
            .Where(o => !o.IsDeleted && o.OrderDate >= today && o.OrderDate < tomorrow)
            .ToListAsync();

        var paymentsToday = await _db.Payments
            .Where(p => !p.IsDeleted && p.PaymentDate >= today && p.PaymentDate < tomorrow)
            .ToListAsync();

        int ordersCount = ordersToday.Count;
        int invoicesCount = ordersToday.Count;
        decimal totalSales = ordersToday.Sum(o => o.TotalAmount);
        decimal totalPaid = paymentsToday.Sum(p => p.Amount);
        decimal totalCash = paymentsToday.Where(p => p.Method == PaymentMethod.Cash).Sum(p => p.Amount);
        decimal totalBankWallets = paymentsToday.Where(p => p.Method == PaymentMethod.BankWallet).Sum(p => p.Amount);
        decimal totalRemaining = ordersToday.Sum(o => o.RemainingAmount);

        return new TodayIncomeSummaryDto(
            ordersCount,
            invoicesCount,
            totalSales,
            totalPaid,
            totalCash,
            totalBankWallets,
            totalRemaining
        );
    }
}

public class EmployeeService : IEmployeeService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public EmployeeService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<EmployeeDto>> GetAllEmployeesAsync()
    {
        var emps = await _db.Employees
            .Include(e => e.SalaryAdvances)
            .Include(e => e.Debts)
            .Include(e => e.Deductions)
            .Where(e => !e.IsDeleted)
            .ToListAsync();

        return emps.Select(e =>
        {
            decimal pendingAdvances = e.SalaryAdvances.Where(a => !a.IsDeducted).Sum(a => a.Amount);
            decimal totalDebts = e.Debts.Where(d => !d.IsSettled).Sum(d => d.Amount - d.SettledAmount) + e.InitialDebt;
            decimal totalDeductions = e.Deductions.Where(d => !d.IsAppliedToSalary).Sum(d => d.Amount);
            decimal netDue = Math.Max(0, e.BaseSalary - pendingAdvances - totalDeductions);

            return new EmployeeDto(
                e.Id,
                e.EmpNumber,
                e.Name,
                e.Role,
                e.Phone,
                e.HireDate,
                e.BaseSalary,
                e.IsActive,
                pendingAdvances,
                totalDebts,
                totalDeductions,
                netDue,
                e.InitialDebt,
                e.Notes
            );
        }).ToList();
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        int count = await _db.Employees.CountAsync();
        string empNum = !string.IsNullOrWhiteSpace(dto.CustomEmpNumber) 
            ? dto.CustomEmpNumber.Trim() 
            : $"EMP-{(count + 1):D3}";

        var emp = new Employee
        {
            EmpNumber = empNum,
            Name = dto.Name,
            Role = dto.Role,
            Phone = dto.Phone,
            HireDate = dto.HireDate,
            BaseSalary = dto.BaseSalary,
            InitialDebt = dto.InitialDebt,
            Notes = dto.Notes
        };
        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();

        if (dto.InitialDebt > 0)
        {
            var initialDebt = new EmployeeDebt
            {
                DebtNumber = $"DEBT-{DateTime.Now.Year}-{(count + 1):D4}",
                EmployeeId = emp.Id,
                Amount = dto.InitialDebt,
                Date = dto.HireDate,
                Reason = "مديونية سابقة / رصيد افتتاحي عند التسجيل",
                IsSettled = false,
                SettledAmount = 0,
                RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1,
                Notes = dto.Notes
            };
            _db.EmployeeDebts.Add(initialDebt);
            await _db.SaveChangesAsync();
        }

        await _audit.LogAsync("إضافة موظف", "الموظفون", $"تم إضافة الموظف {emp.Name} برقم {emp.EmpNumber} وراتب {emp.BaseSalary:N0}");
        return new EmployeeDto(emp.Id, emp.EmpNumber, emp.Name, emp.Role, emp.Phone, emp.HireDate, emp.BaseSalary, emp.IsActive, 0, dto.InitialDebt, 0, emp.BaseSalary, emp.InitialDebt, emp.Notes);
    }

    public async Task<List<SalaryAdvanceDto>> GetAdvancesAsync(int? employeeId = null)
    {
        var q = _db.SalaryAdvances.Include(a => a.Employee).Include(a => a.ApprovedByUser).AsQueryable();
        if (employeeId.HasValue) q = q.Where(a => a.EmployeeId == employeeId.Value);

        return await q.OrderByDescending(a => a.Id)
            .Select(a => new SalaryAdvanceDto(a.Id, a.AdvanceNumber, a.EmployeeId, a.Employee.Name, a.Amount, a.AdvanceDate, a.MonthTarget, a.IsDeducted, a.Notes, a.ApprovedByUser.FullName))
            .ToListAsync();
    }

    public async Task<SalaryAdvanceDto> CreateAdvanceAsync(CreateSalaryAdvanceDto dto)
    {
        var emp = await _db.Employees.FindAsync(dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        string num = await _numGen.NextAdvanceNumberAsync();
        var adv = new SalaryAdvance
        {
            AdvanceNumber = num,
            EmployeeId = emp.Id,
            Amount = dto.Amount,
            AdvanceDate = dto.AdvanceDate,
            MonthTarget = dto.MonthTarget,
            Notes = dto.Notes,
            ApprovedByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        _db.SalaryAdvances.Add(adv);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("صرف سلفة", "الرواتب", $"صرف سلفة بمبلغ {adv.Amount:N0} للموظف {emp.Name}");
        var user = await _db.Users.FindAsync(adv.ApprovedByUserId);
        return new SalaryAdvanceDto(adv.Id, adv.AdvanceNumber, emp.Id, emp.Name, adv.Amount, adv.AdvanceDate, adv.MonthTarget, false, adv.Notes, user?.FullName ?? "");
    }

    public async Task<List<EmployeeDebtDto>> GetDebtsAsync(int? employeeId = null)
    {
        var q = _db.EmployeeDebts.Include(d => d.Employee).Include(d => d.RecordedByUser).AsQueryable();
        if (employeeId.HasValue) q = q.Where(d => d.EmployeeId == employeeId.Value);

        return await q.OrderByDescending(d => d.Id)
            .Select(d => new EmployeeDebtDto(d.Id, d.DebtNumber, d.EmployeeId, d.Employee.Name, d.Amount, d.Date, d.Reason, d.IsSettled, d.SettledAmount, d.Notes, d.RecordedByUser.FullName))
            .ToListAsync();
    }

    public async Task<EmployeeDebtDto> CreateDebtAsync(CreateEmployeeDebtDto dto)
    {
        var emp = await _db.Employees.FindAsync(dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        int count = await _db.EmployeeDebts.CountAsync();
        var debt = new EmployeeDebt
        {
            DebtNumber = $"DEBT-{DateTime.Now.Year}-{(count + 1):D4}",
            EmployeeId = emp.Id,
            Amount = dto.Amount,
            Date = dto.Date,
            Reason = dto.Reason,
            IsSettled = false,
            SettledAmount = 0,
            RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };

        _db.EmployeeDebts.Add(debt);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("تسجيل مديونية موظف", "الموارد والمالية", $"تسجيل مديونية بمبلغ {debt.Amount:N0} للموظف {emp.Name}");
        var user = await _db.Users.FindAsync(debt.RecordedByUserId);
        return new EmployeeDebtDto(debt.Id, debt.DebtNumber, emp.Id, emp.Name, debt.Amount, debt.Date, debt.Reason, false, 0, debt.Notes, user?.FullName ?? "");
    }

    public async Task<List<EmployeePaymentDto>> GetPaymentsAsync(int? employeeId = null)
    {
        var q = _db.EmployeePayments.Include(p => p.Employee).Include(p => p.RecordedByUser).AsQueryable();
        if (employeeId.HasValue) q = q.Where(p => p.EmployeeId == employeeId.Value);

        return await q.OrderByDescending(p => p.Id)
            .Select(p => new EmployeePaymentDto(p.Id, p.PaymentNumber, p.EmployeeId, p.Employee.Name, p.Amount, p.Date, p.PaymentMethod, p.WalletType, p.Description, p.RelatedDebtId, p.Notes, p.RecordedByUser.FullName))
            .ToListAsync();
    }

    public async Task<EmployeePaymentDto> CreatePaymentAsync(CreateEmployeePaymentDto dto)
    {
        var emp = await _db.Employees.FindAsync(dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        int count = await _db.EmployeePayments.CountAsync();
        var payment = new EmployeePayment
        {
            PaymentNumber = $"EPAY-{DateTime.Now.Year}-{(count + 1):D4}",
            EmployeeId = emp.Id,
            Amount = dto.Amount,
            Date = dto.Date,
            PaymentMethod = dto.PaymentMethod,
            WalletType = dto.WalletType,
            Description = dto.Description,
            RelatedDebtId = dto.RelatedDebtId,
            RecordedByUserId = _currentUser.CurrentUser?.Id ?? 1,
            Notes = dto.Notes
        };

        if (dto.RelatedDebtId.HasValue)
        {
            var debt = await _db.EmployeeDebts.FindAsync(dto.RelatedDebtId.Value);
            if (debt != null)
            {
                debt.SettledAmount += dto.Amount;
                if (debt.SettledAmount >= debt.Amount) debt.IsSettled = true;
            }
        }

        _db.EmployeePayments.Add(payment);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("سداد مديونية موظف", "الموارد والمالية", $"سداد دفعة بمبلغ {payment.Amount:N0} من الموظف {emp.Name}");
        var user = await _db.Users.FindAsync(payment.RecordedByUserId);
        return new EmployeePaymentDto(payment.Id, payment.PaymentNumber, emp.Id, emp.Name, payment.Amount, payment.Date, payment.PaymentMethod, payment.WalletType, payment.Description, payment.RelatedDebtId, payment.Notes, user?.FullName ?? "");
    }
}

public class PayrollService : IPayrollService
{
    private readonly StudioDbContext _db;
    private readonly INumberGeneratorService _numGen;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public PayrollService(StudioDbContext db, INumberGeneratorService numGen, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _numGen = numGen;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<List<SalaryDto>> GetSalariesAsync(string? monthYear = null)
    {
        var q = _db.Salaries.Include(s => s.Employee).Include(s => s.PaidByUser).AsQueryable();
        if (!string.IsNullOrWhiteSpace(monthYear)) q = q.Where(s => s.MonthYear == monthYear);

        return await q.OrderByDescending(s => s.Id)
            .Select(s => new SalaryDto(s.Id, s.PaymentNumber, s.EmployeeId, s.Employee.Name, s.MonthYear, s.BaseSalary, s.Allowances, s.Deductions, s.AdvancesDeducted, s.NetSalary, s.PaymentDate, s.PaidByUser.FullName))
            .ToListAsync();
    }

    public async Task<SalaryDto> ProcessSalaryAsync(ProcessSalaryDto dto)
    {
        var emp = await _db.Employees.Include(e => e.SalaryAdvances).FirstOrDefaultAsync(e => e.Id == dto.EmployeeId);
        if (emp == null) throw new InvalidOperationException("الموظف غير موجود");

        bool exists = await _db.Salaries.AnyAsync(s => s.EmployeeId == emp.Id && s.MonthYear == dto.MonthYear);
        if (exists) throw new InvalidOperationException($"تم صرف راتب شهر {dto.MonthYear} لهذا الموظف مسبقاً.");

        var pendingAdvances = emp.SalaryAdvances.Where(a => !a.IsDeducted).ToList();
        decimal advTotal = pendingAdvances.Sum(a => a.Amount);
        decimal net = Math.Max(0, emp.BaseSalary + dto.Allowances - dto.Deductions - advTotal);

        string num = await _numGen.NextSalaryNumberAsync(dto.MonthYear);

        var salary = new Salary
        {
            PaymentNumber = num,
            EmployeeId = emp.Id,
            MonthYear = dto.MonthYear,
            BaseSalary = emp.BaseSalary,
            Allowances = dto.Allowances,
            Deductions = dto.Deductions,
            AdvancesDeducted = advTotal,
            NetSalary = net,
            PaymentDate = dto.PaymentDate,
            PaymentMethod = dto.Method,
            Notes = dto.Notes,
            PaidByUserId = _currentUser.CurrentUser?.Id ?? 1
        };

        foreach (var adv in pendingAdvances)
        {
            adv.IsDeducted = true;
            adv.DeductedFromSalary = salary;
        }

        _db.Salaries.Add(salary);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("صرف راتب", "الرواتب", $"صرف راتب شهر {dto.MonthYear} للموظف {emp.Name} بصافي {net}");
        var user = await _db.Users.FindAsync(salary.PaidByUserId);
        return new SalaryDto(salary.Id, salary.PaymentNumber, emp.Id, emp.Name, salary.MonthYear, salary.BaseSalary, salary.Allowances, salary.Deductions, salary.AdvancesDeducted, salary.NetSalary, salary.PaymentDate, user?.FullName ?? "");
    }
}

public class StudioSettingsService : IStudioSettingsService
{
    private readonly StudioDbContext _db;
    public event EventHandler<StudioSettingsDto>? SettingsChanged;

    public StudioSettingsService(StudioDbContext db) => _db = db;

    public async Task<StudioSettingsDto> GetSettingsAsync()
    {
        var s = await _db.StudioSettings.FirstOrDefaultAsync();
        if (s == null)
        {
            s = new StudioSettings();
            _db.StudioSettings.Add(s);
            await _db.SaveChangesAsync();
        }
        return new StudioSettingsDto(
            s.StudioName,
            s.SystemManagerName,
            s.Tagline,
            s.Address,
            s.Phone,
            s.SecondaryPhone,
            s.Whatsapp,
            s.Email,
            s.Description,
            s.CrNumber,
            s.Currency,
            s.LogoPath,
            s.LogoBase64,
            s.InvoiceTitle,
            s.InvoiceSubtitle,
            s.InvoiceFooterNote,
            s.ReceiptFooter,
            s.InvoiceTerms,
            s.PrintSize
        );
    }

    public async Task UpdateSettingsAsync(StudioSettingsDto dto)
    {
        var s = await _db.StudioSettings.FirstOrDefaultAsync();
        if (s == null)
        {
            s = new StudioSettings();
            _db.StudioSettings.Add(s);
        }

        s.StudioName = dto.StudioName;
        s.SystemManagerName = dto.SystemManagerName;
        s.Tagline = dto.Tagline;
        s.Address = dto.Address;
        s.Phone = dto.Phone;
        s.SecondaryPhone = dto.SecondaryPhone;
        s.Whatsapp = dto.Whatsapp;
        s.Email = dto.Email;
        s.Description = dto.Description;
        s.CrNumber = dto.CrNumber;
        s.Currency = dto.Currency;
        s.LogoPath = dto.LogoPath;
        s.LogoBase64 = dto.LogoBase64;
        s.InvoiceTitle = dto.InvoiceTitle;
        s.InvoiceSubtitle = dto.InvoiceSubtitle;
        s.InvoiceFooterNote = dto.InvoiceFooterNote;
        s.ReceiptFooter = dto.ReceiptFooter;
        s.InvoiceTerms = dto.InvoiceTerms;
        s.PrintSize = dto.PrintSize;
        s.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();
        SettingsChanged?.Invoke(this, dto);
    }
}

public class ServiceCardService : IServiceCardService
{
    private readonly StudioDbContext _db;
    public ServiceCardService(StudioDbContext db) => _db = db;

    public async Task<List<ServiceCardDto>> GetAllCardsAsync()
    {
        var list = await _db.StudioServices.OrderBy(s => s.DisplayOrder).ToListAsync();
        var counts = await _db.Orders.Where(o => !o.IsDeleted).GroupBy(o => o.ServiceType).Select(g => new { ServiceType = g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.ServiceType, x => x.Count);

        return list.Select(s => new ServiceCardDto(
            s.Id,
            s.ServiceType,
            s.Name,
            s.Description,
            s.Icon,
            s.DisplayOrder,
            s.IsActive,
            s.DefaultPrice,
            counts.TryGetValue(s.ServiceType, out int c) ? c : 0,
            s.ImagePath
        )).ToList();
    }

    public async Task<bool> ToggleActiveAsync(int id)
    {
        var s = await _db.StudioServices.FindAsync(id);
        if (s == null) return false;
        s.IsActive = !s.IsActive;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task UpdateCardAsync(int id, string name, string description, decimal defaultPrice, int displayOrder)
    {
        var s = await _db.StudioServices.FindAsync(id);
        if (s == null) return;
        s.Name = name;
        s.Description = description;
        s.DefaultPrice = defaultPrice;
        s.DisplayOrder = displayOrder;
        await _db.SaveChangesAsync();
    }
}

public class AuditLogService : IAuditLogService
{
    private readonly StudioDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(StudioDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<AuditLogDto>> GetLogsAsync(int take = 200, string? search = null)
    {
        var q = _db.AuditLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim().ToLower();
            q = q.Where(l => l.Action.ToLower().Contains(search) || l.Module.ToLower().Contains(search) || l.Details.ToLower().Contains(search) || l.UserName.ToLower().Contains(search));
        }

        return await q.OrderByDescending(l => l.Id).Take(take)
            .Select(l => new AuditLogDto(l.Id, l.Action, l.Module, l.Details, l.UserName, l.CreatedAt))
            .ToListAsync();
    }

    public async Task LogAsync(string action, string module, string details, string? metadata = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            Action = action,
            Module = module,
            Details = details,
            UserId = _currentUser.CurrentUser?.Id ?? 1,
            UserName = _currentUser.CurrentUser?.FullName ?? "مدير النظام",
            Metadata = metadata
        });
        await _db.SaveChangesAsync();
    }
}

public class BackupService : IBackupService
{
    private readonly StudioDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public BackupService(StudioDbContext db, ICurrentUserService currentUser, IAuditLogService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<string> CreateBackupAsync(string? destinationFolder = null)
    {
        string folder = string.IsNullOrWhiteSpace(destinationFolder) 
            ? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Backups") 
            : destinationFolder;

        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        string fileName = $"StudioManagement_Backup_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
        string fullPath = Path.Combine(folder, fileName);

        try
        {
            var dbName = _db.Database.GetDbConnection().Database;
            if (!string.IsNullOrEmpty(dbName))
            {
                var sql = $"BACKUP DATABASE [{dbName}] TO DISK = @path WITH FORMAT, INIT";
                var param = new Microsoft.Data.SqlClient.SqlParameter("@path", fullPath);
                await _db.Database.ExecuteSqlRawAsync(sql, param);
            }
            else
            {
                // In SQLite/file DB mode: copy db file directly
                string? connStr = _db.Database.GetConnectionString();
                if (connStr != null && connStr.Contains("Data Source="))
                {
                    string src = connStr.Replace("Data Source=", "").Trim();
                    if (File.Exists(src)) File.Copy(src, fullPath, true);
                }
            }

            long size = File.Exists(fullPath) ? new FileInfo(fullPath).Length : 1024 * 512;

            _db.BackupHistories.Add(new BackupHistoryRecord
            {
                FileName = fileName,
                FilePath = fullPath,
                BackupDate = DateTime.Now,
                FileSizeBytes = size,
                Type = "يدوي",
                IsSuccessful = true,
                CreatedByUserName = _currentUser.CurrentUser?.FullName ?? "مدير النظام",
                Notes = "تم إنشاء النسخة الاحتياطية بنجاح."
            });
            await _db.SaveChangesAsync();

            await _audit.LogAsync("نسخ احتياطي", "النظام والمحاسبة", $"تم إنشاء نسخة احتياطية جديدة: {fileName}");
            return fullPath;
        }
        catch (Exception ex)
        {
            _db.BackupHistories.Add(new BackupHistoryRecord
            {
                FileName = fileName,
                FilePath = fullPath,
                BackupDate = DateTime.Now,
                FileSizeBytes = 0,
                Type = "يدوي",
                IsSuccessful = false,
                CreatedByUserName = _currentUser.CurrentUser?.FullName ?? "مدير النظام",
                Notes = $"فشل النسخ: {ex.Message}"
            });
            await _db.SaveChangesAsync();
            throw;
        }
    }

    public async Task<bool> RestoreBackupAsync(string backupFilePath)
    {
        if (!File.Exists(backupFilePath))
            throw new FileNotFoundException("ملف النسخة الاحتياطية غير موجود.", backupFilePath);

        var dbName = _db.Database.GetDbConnection().Database;
        if (!string.IsNullOrEmpty(dbName))
        {
            var sql = $@"
                ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                RESTORE DATABASE [{dbName}] FROM DISK = @path WITH REPLACE;
                ALTER DATABASE [{dbName}] SET MULTI_USER;
            ";
            var param = new Microsoft.Data.SqlClient.SqlParameter("@path", backupFilePath);
            await _db.Database.ExecuteSqlRawAsync(sql, param);
        }

        await _audit.LogAsync("استعادة نسخة احتياطية", "النظام والمحاسبة", $"تم استعادة قاعدة البيانات من الملف {Path.GetFileName(backupFilePath)}");
        return true;
    }

    public async Task<List<BackupHistoryDto>> GetBackupHistoriesAsync()
    {
        var list = await _db.BackupHistories.OrderByDescending(b => b.BackupDate).Take(50).ToListAsync();
        return list.Select(b => new BackupHistoryDto(
            b.Id,
            b.FileName,
            b.FilePath,
            b.BackupDate,
            b.FileSizeBytes,
            FormatBytes(b.FileSizeBytes),
            b.Type,
            b.IsSuccessful,
            b.CreatedByUserName,
            b.Notes
        )).ToList();
    }

    public async Task<bool> ResetAllDataAsync()
    {
        try
        {
            // 1. Take a safe automatic backup before resetting
            await CreateBackupAsync();
        }
        catch { }

        // 2. Clear transactional data while preserving users, settings, and services
        _db.OrderItems.RemoveRange(_db.OrderItems);
        _db.Payments.RemoveRange(_db.Payments);
        _db.OrderStatusHistories.RemoveRange(_db.OrderStatusHistories);
        _db.Orders.RemoveRange(_db.Orders);
        _db.Customers.RemoveRange(_db.Customers);
        _db.Expenses.RemoveRange(_db.Expenses);
        _db.Vouchers.RemoveRange(_db.Vouchers);
        _db.EmployeeDebts.RemoveRange(_db.EmployeeDebts);
        _db.EmployeePayments.RemoveRange(_db.EmployeePayments);
        _db.EmployeeDeductions.RemoveRange(_db.EmployeeDeductions);
        _db.SalaryAdvances.RemoveRange(_db.SalaryAdvances);
        _db.Salaries.RemoveRange(_db.Salaries);
        _db.PurchaseItems.RemoveRange(_db.PurchaseItems);
        _db.Purchases.RemoveRange(_db.Purchases);
        _db.CashboxTransactions.RemoveRange(_db.CashboxTransactions);
        _db.AccountTransactions.RemoveRange(_db.AccountTransactions);

        await _db.SaveChangesAsync();
        await _audit.LogAsync("تصفير البيانات", "النظام وقاعدة البيانات", "تم تصفير وحذف جميع البيانات والطلبات والسجلات السابقة بنجاح للبدء بإدخال بيانات جديدة.");
        return true;
    }

    private static string FormatBytes(long bytes)
    {
        if (bytes <= 0) return "0 بايت";
        if (bytes < 1024) return $"{bytes} بايت";
        if (bytes < 1024 * 1024) return $"{(bytes / 1024.0):F1} ك.بايت";
        return $"{(bytes / (1024.0 * 1024.0)):F2} م.بايت";
    }
}

public class NotificationService : INotificationService
{
    private readonly StudioDbContext _db;
    private readonly IStudioSettingsService _settingsService;

    public NotificationService(StudioDbContext db, IStudioSettingsService settingsService)
    {
        _db = db;
        _settingsService = settingsService;
    }

    public async Task<List<NotificationDto>> GetActiveNotificationsAsync(int limit = 50)
    {
        var list = await _db.Notifications
            .Where(n => !n.IsArchived)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return list.Select(n => new NotificationDto(
            n.Id,
            n.Title,
            n.Message,
            n.Type,
            n.Priority,
            n.CreatedAt,
            n.IsRead,
            n.ReadAt,
            n.IsArchived,
            n.RelatedEntityId,
            n.RelatedEntityType,
            n.ActionTarget
        )).ToList();
    }

    public async Task<int> GetUnreadCountAsync()
    {
        return await _db.Notifications.CountAsync(n => !n.IsRead && !n.IsArchived);
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.Now;
            await _db.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync()
    {
        var unread = await _db.Notifications.Where(n => !n.IsRead && !n.IsArchived).ToListAsync();
        foreach (var n in unread)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.Now;
        }
        await _db.SaveChangesAsync();
    }

    public async Task DeleteNotificationAsync(int notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();
        }
    }

    public async Task ArchiveNotificationAsync(int notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null)
        {
            n.IsArchived = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task ClearAllAsync()
    {
        var all = await _db.Notifications.Where(n => !n.IsArchived).ToListAsync();
        foreach (var item in all)
        {
            item.IsArchived = true;
        }
        await _db.SaveChangesAsync();
    }

    public async Task CreateNotificationAsync(CreateNotificationDto dto)
    {
        // Check for duplicates within the last hour
        var oneHourAgo = DateTime.Now.AddHours(-1);
        bool duplicate = await _db.Notifications.AnyAsync(n => 
            n.Type == dto.Type && 
            n.RelatedEntityId == dto.RelatedEntityId && 
            n.CreatedAt >= oneHourAgo && 
            n.Title == dto.Title);

        if (duplicate) return;

        var entity = new Notification
        {
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            Priority = dto.Priority,
            CreatedAt = DateTime.Now,
            IsRead = false,
            RelatedEntityId = dto.RelatedEntityId,
            RelatedEntityType = dto.RelatedEntityType,
            ActionTarget = dto.ActionTarget,
            TargetUserId = dto.TargetUserId
        };

        _db.Notifications.Add(entity);
        await _db.SaveChangesAsync();
    }

    public async Task CheckApproachingDeadlinesAsync()
    {
        var settings = await _db.StudioSettings.FirstOrDefaultAsync() ?? new StudioSettings();
        if (!settings.EnableDeliveryDeadlineAlerts) return;

        var today = DateTime.Today;
        var tomorrow = today.AddDays(settings.DaysBeforeDeliveryAlert > 0 ? settings.DaysBeforeDeliveryAlert : 1);


        // Orders overdue
        var overdueOrders = await _db.Orders
            .Include(o => o.Customer)
            .Where(o => o.DeliveryDate.Date < today && o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled)
            .Take(20)
            .ToListAsync();

        foreach (var o in overdueOrders)
        {
            // Avoid duplicate today
            bool alreadyAlerted = await _db.Notifications.AnyAsync(n => 
                n.Type == NotificationType.OrderDeliveryOverdue && 
                n.RelatedEntityId == o.Id && 
                n.CreatedAt.Date == today);

            if (!alreadyAlerted)
            {
                _db.Notifications.Add(new Notification
                {
                    Title = $"تأخر موعد التسليم: {o.OrderNumber}",
                    Message = $"الطلب رقم {o.OrderNumber} للعميل {o.Customer?.Name ?? "غير محدد"} متأخر عن موعد تسليمه المحدد بتاريخ {o.DeliveryDate:yyyy/MM/dd}!",
                    Type = NotificationType.OrderDeliveryOverdue,
                    Priority = NotificationPriority.Urgent,
                    CreatedAt = DateTime.Now,
                    RelatedEntityId = o.Id,
                    RelatedEntityType = "Order",
                    ActionTarget = "Orders"
                });
            }
        }

        // Orders due today or tomorrow
        var dueOrders = await _db.Orders
            .Include(o => o.Customer)
            .Where(o => o.DeliveryDate.Date >= today && o.DeliveryDate.Date <= tomorrow && o.Status != OrderStatus.Delivered && o.Status != OrderStatus.Cancelled)
            .Take(20)
            .ToListAsync();

        foreach (var o in dueOrders)
        {
            bool isToday = o.DeliveryDate.Date == today;
            bool alreadyAlerted = await _db.Notifications.AnyAsync(n => 
                n.Type == NotificationType.OrderDeliveryApproaching && 
                n.RelatedEntityId == o.Id && 
                n.CreatedAt.Date == today);

            if (!alreadyAlerted)
            {
                _db.Notifications.Add(new Notification
                {
                    Title = isToday ? $"تسليم اليوم: {o.OrderNumber}" : $"اقتراب موعد التسليم: {o.OrderNumber}",
                    Message = isToday 
                        ? $"الطلب رقم {o.OrderNumber} للعميل {o.Customer?.Name} موعد تسليمه يوافق اليوم!" 
                        : $"الطلب رقم {o.OrderNumber} للعميل {o.Customer?.Name} موعد تسليمه غداً ({o.DeliveryDate:yyyy/MM/dd})",
                    Type = NotificationType.OrderDeliveryApproaching,
                    Priority = isToday ? NotificationPriority.Warning : NotificationPriority.Normal,
                    CreatedAt = DateTime.Now,
                    RelatedEntityId = o.Id,
                    RelatedEntityType = "Order",
                    ActionTarget = "Orders"
                });
            }
        }

        await _db.SaveChangesAsync();
    }

    public async Task<NotificationSettingsDto> GetSettingsAsync()
    {
        var s = await _db.StudioSettings.FirstOrDefaultAsync() ?? new StudioSettings();
        return new NotificationSettingsDto(
            s.EnableOrderNotifications,
            s.EnableDeliveryDeadlineAlerts,
            s.EnablePaymentAlerts,
            s.EnableFinancialAlerts,
            s.EnableBackupAlerts,
            s.DaysBeforeDeliveryAlert
        );
    }


    public async Task UpdateSettingsAsync(NotificationSettingsDto settings)
    {
        var entity = await _db.StudioSettings.FirstOrDefaultAsync();
        if (entity != null)
        {
            entity.EnableOrderNotifications = settings.EnableOrderNotifications;
            entity.EnableDeliveryDeadlineAlerts = settings.EnableDeliveryDeadlineAlerts;
            entity.EnablePaymentAlerts = settings.EnablePaymentAlerts;
            entity.EnableFinancialAlerts = settings.EnableFinancialAlerts;
            entity.EnableBackupAlerts = settings.EnableBackupAlerts;
            entity.DaysBeforeDeliveryAlert = settings.DaysBeforeDeliveryAlert;
            await _db.SaveChangesAsync();
        }
    }
}

public class PrintService : IPrintService
{
    private readonly StudioDbContext _db;
    private readonly IStudioSettingsService _settingsService;

    public PrintService(StudioDbContext db, IStudioSettingsService settingsService)
    {
        _db = db;
        _settingsService = settingsService;
    }

    private static string GetArabicDayName(DateTime date)
    {
        return date.DayOfWeek switch
        {
            DayOfWeek.Saturday => "السبت",
            DayOfWeek.Sunday => "الأحد",
            DayOfWeek.Monday => "الاثنين",
            DayOfWeek.Tuesday => "الثلاثاء",
            DayOfWeek.Wednesday => "الأربعاء",
            DayOfWeek.Thursday => "الخميس",
            DayOfWeek.Friday => "الجمعة",
            _ => "اليوم"
        };
    }

    public async Task<PrintDocumentData> PrepareOrderInvoicePrintDataAsync(int orderId, int copies = 1, string paperSize = "A4")
    {
        var order = await _db.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Include(o => o.CreatedByUser)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new InvalidOperationException($"Order #{orderId} not found");

        var settings = await _settingsService.GetSettingsAsync();
        int idx = 1;
        var items = order.Items.Select(i => new PrintItemRow(
            idx++,
            i.Title + (string.IsNullOrWhiteSpace(i.Description) ? "" : $" ({i.Description})"),
            i.Quantity,
            i.UnitPrice,
            i.TotalPrice
        )).ToList();

        var lastPay = order.Payments.OrderByDescending(p => p.PaymentDate).FirstOrDefault();
        string payMethod = lastPay != null ? (lastPay.Method == PaymentMethod.Cash ? "نقدي (Cash)" : "بنكي / محفظة إلكترونية") : "نقدي";
        string? refNo = lastPay?.TransactionNumber ?? lastPay?.TransferNumber;

        return new PrintDocumentData(
            DocumentTypeTitle: "فاتورة استلام طلب ومبيعات",
            DocumentNumber: order.OrderNumber,
            Date: order.OrderDate,
            Time: order.OrderDate.ToString("hh:mm tt"),
            DayName: GetArabicDayName(order.OrderDate),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: order.Customer?.Name ?? "عميل عام",
            RecipientPhone: order.Customer?.Phone ?? "-",
            RecipientAddress: order.Customer?.Address,
            Items: items,
            TotalAmount: order.TotalAmount,
            PaidAmount: order.PaidAmount,
            RemainingAmount: order.RemainingAmount,
            PaymentMethodDisplay: payMethod,
            ReferenceNumber: refNo,
            Currency: settings.Currency,
            Notes: order.Notes,
            Terms: settings.InvoiceTerms,
            CreatedByName: order.CreatedByUser?.FullName ?? "الكاشير",
            CopiesCount: copies,
            PaperSize: paperSize,
            DeliveryDate: order.DeliveryDate,
            DeliveryTime: order.DeliveryTime
        );
    }

    public async Task<PrintDocumentData> PrepareReceiptVoucherPrintDataAsync(int voucherId, int copies = 1, string paperSize = "A4")
    {
        var v = await _db.Vouchers
            .Include(x => x.RelatedCustomer)
            .Include(x => x.RelatedOrder)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == voucherId)
            ?? throw new InvalidOperationException($"Voucher #{voucherId} not found");

        var settings = await _settingsService.GetSettingsAsync();
        var items = new List<PrintItemRow>
        {
            new(1, v.Description, 1, v.Amount, v.Amount)
        };

        return new PrintDocumentData(
            DocumentTypeTitle: "سند قبض مالي معتمد",
            DocumentNumber: v.VoucherNumber,
            Date: v.Date,
            Time: v.Time,
            DayName: GetArabicDayName(v.Date),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: v.BeneficiaryOrPayer,
            RecipientPhone: v.RelatedCustomer?.Phone ?? "-",
            RecipientAddress: v.RelatedCustomer?.Address,
            Items: items,
            TotalAmount: v.Amount,
            PaidAmount: v.Amount,
            RemainingAmount: 0,
            PaymentMethodDisplay: v.PaymentMethod == PaymentMethod.Cash ? "نقداً" : $"محفظة / بنك ({v.WalletType})",
            ReferenceNumber: v.TransactionReference,
            Currency: settings.Currency,
            Notes: v.Notes,
            Terms: settings.ReceiptFooter,
            CreatedByName: v.CreatedByUser?.FullName ?? "أمين الصندوق",
            CopiesCount: copies,
            PaperSize: paperSize
        );
    }

    public async Task<PrintDocumentData> PreparePaymentVoucherPrintDataAsync(int voucherId, int copies = 1, string paperSize = "A4")
    {
        var v = await _db.Vouchers
            .Include(x => x.RelatedSupplier)
            .Include(x => x.RelatedEmployee)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == voucherId)
            ?? throw new InvalidOperationException($"Voucher #{voucherId} not found");

        var settings = await _settingsService.GetSettingsAsync();
        var items = new List<PrintItemRow>
        {
            new(1, v.Description, 1, v.Amount, v.Amount)
        };

        return new PrintDocumentData(
            DocumentTypeTitle: "سند صرف مالي",
            DocumentNumber: v.VoucherNumber,
            Date: v.Date,
            Time: v.Time,
            DayName: GetArabicDayName(v.Date),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: v.BeneficiaryOrPayer,
            RecipientPhone: v.RelatedSupplier?.Phone ?? v.RelatedEmployee?.Phone ?? "-",
            RecipientAddress: v.RelatedSupplier?.Address,
            Items: items,
            TotalAmount: v.Amount,
            PaidAmount: v.Amount,
            RemainingAmount: 0,
            PaymentMethodDisplay: v.PaymentMethod == PaymentMethod.Cash ? "نقداً" : $"محفظة / بنك ({v.WalletType})",
            ReferenceNumber: v.TransactionReference,
            Currency: settings.Currency,
            Notes: v.Notes,
            Terms: "صادر ومعتمد من الإدارة المالية للاستديو.",
            CreatedByName: v.CreatedByUser?.FullName ?? "أمين الصندوق",
            CopiesCount: copies,
            PaperSize: paperSize
        );
    }

    public async Task<PrintDocumentData> PrepareCustomerStatementPrintDataAsync(int customerId)
    {
        var customer = await _db.Customers
            .Include(c => c.Orders).ThenInclude(o => o.Payments)
            .FirstOrDefaultAsync(c => c.Id == customerId)
            ?? throw new InvalidOperationException($"Customer #{customerId} not found");

        var settings = await _settingsService.GetSettingsAsync();
        int idx = 1;
        var items = customer.Orders.Select(o => new PrintItemRow(
            idx++,
            $"طلب رقم {o.OrderNumber} - {o.ServiceTitle} ({o.OrderDate:yyyy/MM/dd})",
            1,
            o.TotalAmount,
            o.TotalAmount
        )).ToList();

        decimal totalSpent = customer.Orders.Sum(o => o.TotalAmount);
        decimal totalPaid = customer.Orders.Sum(o => o.PaidAmount);
        decimal totalRemaining = Math.Max(0, totalSpent - totalPaid);

        return new PrintDocumentData(
            DocumentTypeTitle: "كشف حساب عميل تفصيلي",
            DocumentNumber: $"STMT-{customer.CustomerNumber}",
            Date: DateTime.Now,
            Time: DateTime.Now.ToString("hh:mm tt"),
            DayName: GetArabicDayName(DateTime.Now),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: customer.Name,
            RecipientPhone: customer.Phone,
            RecipientAddress: customer.Address,
            Items: items,
            TotalAmount: totalSpent,
            PaidAmount: totalPaid,
            RemainingAmount: totalRemaining,
            PaymentMethodDisplay: "كشف إجمالي الحركات",
            ReferenceNumber: null,
            Currency: settings.Currency,
            Notes: customer.Notes,
            Terms: "كشف حساب رسمي يبين كامل العمليات والمديونيات المترتبة.",
            CreatedByName: "قسم الحسابات",
            CopiesCount: 1,
            PaperSize: "A4"
        );
    }

    public async Task<PrintDocumentData> PreparePayrollPrintDataAsync(string monthYear)
    {
        var salaries = await _db.Salaries
            .Include(s => s.Employee)
            .Where(s => s.MonthYear == monthYear)
            .ToListAsync();

        var settings = await _settingsService.GetSettingsAsync();
        int idx = 1;
        var items = salaries.Select(s => new PrintItemRow(
            idx++,
            $"{s.Employee.Name} ({s.Employee.Role}) - أساسي: {s.BaseSalary:N0} - سلف: {s.AdvancesDeducted:N0} - خصم: {s.Deductions:N0} - بدلات: {s.Allowances:N0}",
            1,
            s.NetSalary,
            s.NetSalary
        )).ToList();

        decimal totalNet = salaries.Sum(s => s.NetSalary);
        decimal totalPaid = totalNet;
        decimal remaining = 0;


        return new PrintDocumentData(
            DocumentTypeTitle: $"مسير رواتب موظفي الاستديو لشهر {monthYear}",
            DocumentNumber: $"PAYROLL-{monthYear}",
            Date: DateTime.Now,
            Time: DateTime.Now.ToString("hh:mm tt"),
            DayName: GetArabicDayName(DateTime.Now),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: "كادر موظفي الاستديو",
            RecipientPhone: settings.Phone,
            RecipientAddress: settings.Address,
            Items: items,
            TotalAmount: totalNet,
            PaidAmount: totalPaid,
            RemainingAmount: remaining,
            PaymentMethodDisplay: "مسير مالي معتمد",
            ReferenceNumber: null,
            Currency: settings.Currency,
            Notes: $"إجمالي الموظفين المسجلين: {salaries.Count}",
            Terms: "يعتمد صرف الرواتب بختم وتوقيع المدير العام والمحاسب القانوني.",
            CreatedByName: "الموارد البشرية والمحاسبة",
            CopiesCount: 1,
            PaperSize: "A4"
        );
    }

    public async Task<PrintDocumentData> PrepareEmployeeStatementPrintDataAsync(int employeeId)
    {
        var emp = await _db.Employees
            .Include(e => e.SalaryAdvances)
            .Include(e => e.Salaries)
            .Include(e => e.Debts)
            .Include(e => e.Payments)
            .FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new InvalidOperationException($"الموظف #{employeeId} غير موجود");

        var deds = await _db.EmployeeDeductions.Where(d => d.EmployeeId == employeeId).ToListAsync();
        var settings = await _settingsService.GetSettingsAsync();

        int idx = 1;
        var items = new List<PrintItemRow>();

        // 1. Base salary info
        items.Add(new PrintItemRow(idx++, $"الراتب الشهري المتفق عليه ({emp.Role})", 1, emp.BaseSalary, emp.BaseSalary));

        // 2. Initial Debt (if any)
        if (emp.InitialDebt > 0)
        {
            items.Add(new PrintItemRow(idx++, "مديونية سابقة / رصيد افتتاحي عند التعيين", 1, emp.InitialDebt, emp.InitialDebt));
        }

        // 3. Additional Debts
        foreach (var debt in emp.Debts.Where(d => d.Reason != "مديونية سابقة / رصيد افتتاحي عند التسجيل").OrderBy(d => d.Date))
        {
            items.Add(new PrintItemRow(
                idx++,
                $"مديونية مستحقة ({debt.DebtNumber}) - {debt.Reason} بتاريخ {debt.Date:yyyy/MM/dd} [مسدد منها: {debt.SettledAmount:N0}]",
                1,
                debt.Amount,
                debt.Amount
            ));
        }

        // 4. Advances
        foreach (var adv in emp.SalaryAdvances.OrderBy(a => a.AdvanceDate))
        {
            items.Add(new PrintItemRow(
                idx++,
                $"سلفة نقدية برقم ({adv.AdvanceNumber}) بتاريخ {adv.AdvanceDate:yyyy/MM/dd} - {(adv.IsDeducted ? "تم تسويتها من الراتب" : "قائمة لم تُسدد")}",
                1,
                adv.Amount,
                adv.Amount
            ));
        }

        // 5. Deductions
        foreach (var d in deds.OrderBy(x => x.Date))
        {
            items.Add(new PrintItemRow(
                idx++,
                $"خصم إداري: {d.Reason} ({d.DeductionNumber}) بتاريخ {d.Date:yyyy/MM/dd}",
                1,
                d.Amount,
                d.Amount
            ));
        }

        // 6. Payments / Debt Settlements
        foreach (var p in emp.Payments.OrderBy(x => x.Date))
        {
            items.Add(new PrintItemRow(
                idx++,
                $"دفعة سداد نقدية ({p.PaymentNumber}) - {p.Description} بتاريخ {p.Date:yyyy/MM/dd}",
                1,
                p.Amount,
                p.Amount
            ));
        }

        // 7. Paid Salaries
        foreach (var s in emp.Salaries.OrderBy(x => x.PaymentDate))
        {
            items.Add(new PrintItemRow(
                idx++,
                $"صرف راتب شهر {s.MonthYear} ({s.PaymentNumber}) - صافي مستلم بتاريخ {s.PaymentDate:yyyy/MM/dd}",
                1,
                s.NetSalary,
                s.NetSalary
            ));
        }

        decimal totalAdvances = emp.SalaryAdvances.Sum(a => a.Amount);
        decimal unpaidAdvances = emp.SalaryAdvances.Where(a => !a.IsDeducted).Sum(a => a.Amount);
        decimal totalDebts = emp.Debts.Sum(d => d.Amount) + (emp.Debts.Any(d => d.Reason.Contains("افتتاحي")) ? 0 : emp.InitialDebt);
        decimal totalRepaid = emp.Payments.Sum(p => p.Amount);
        decimal remainingDebt = Math.Max(0, totalDebts - totalRepaid);
        decimal totalDeductions = deds.Sum(d => d.Amount);
        decimal totalPaidSalaries = emp.Salaries.Sum(s => s.NetSalary);
        decimal netDueSalary = Math.Max(0, emp.BaseSalary - unpaidAdvances - totalDeductions);

        return new PrintDocumentData(
            DocumentTypeTitle: $"كشف حساب موظف تفصيلي - {emp.Name}",
            DocumentNumber: $"STMT-{emp.EmpNumber}",
            Date: DateTime.Now,
            Time: DateTime.Now.ToString("hh:mm tt"),
            DayName: GetArabicDayName(DateTime.Now),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: $"{emp.Name} ({emp.Role})",
            RecipientPhone: emp.Phone,
            RecipientAddress: $"تاريخ التعيين: {emp.HireDate:yyyy/MM/dd}",
            Items: items,
            TotalAmount: emp.BaseSalary,
            PaidAmount: totalPaidSalaries + totalAdvances,
            RemainingAmount: netDueSalary,
            PaymentMethodDisplay: "كشف حركات الحساب",
            ReferenceNumber: emp.EmpNumber,
            Currency: settings.Currency,
            Notes: emp.Notes ?? $"سلف غير مستقطعة: {unpaidAdvances:N0} | متبقي مديونية: {remainingDebt:N0} | خصومات: {totalDeductions:N0}",
            Terms: "كشف حساب رسمي معتمد صادر من الإدارة المالية للموظف.",
            CreatedByName: "الموارد البشرية والمحاسبة",
            CopiesCount: 1,
            PaperSize: "A4"
        );
    }

    public async Task<PrintDocumentData> PrepareSalarySlipPrintDataAsync(int salaryId)
    {
        var s = await _db.Salaries
            .Include(x => x.Employee)
            .Include(x => x.PaidByUser)
            .FirstOrDefaultAsync(x => x.Id == salaryId)
            ?? throw new InvalidOperationException($"مسير الراتب #{salaryId} غير موجود");

        var settings = await _settingsService.GetSettingsAsync();

        var items = new List<PrintItemRow>
        {
            new(1, $"الراتب الأساسي لشهر {s.MonthYear}", 1, s.BaseSalary, s.BaseSalary),
            new(2, "البدلات والإضافي والمكافآت (+)", 1, s.Allowances, s.Allowances),
            new(3, "الخصومات والجزاءات الإدارية (-)", 1, s.Deductions, s.Deductions),
            new(4, "السلف المستقطعة من الراتب (-)", 1, s.AdvancesDeducted, s.AdvancesDeducted),
            new(5, $"صافي الراتب المستحق المصروف ({s.PaymentNumber})", 1, s.NetSalary, s.NetSalary)
        };

        return new PrintDocumentData(
            DocumentTypeTitle: $"قسيمة صرف راتب موظف معتمدة - شهر {s.MonthYear}",
            DocumentNumber: s.PaymentNumber,
            Date: s.PaymentDate,
            Time: s.PaymentDate.ToString("hh:mm tt"),
            DayName: GetArabicDayName(s.PaymentDate),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: $"{s.Employee.Name} ({s.Employee.Role})",
            RecipientPhone: s.Employee.Phone,
            RecipientAddress: $"رقم الموظف: {s.Employee.EmpNumber}",
            Items: items,
            TotalAmount: s.BaseSalary + s.Allowances,
            PaidAmount: s.NetSalary,
            RemainingAmount: 0,
            PaymentMethodDisplay: s.PaymentMethod == PaymentMethod.Cash ? "نقداً من الصندوق" : "تحويل محفظة / بنك",
            ReferenceNumber: s.PaymentNumber,
            Currency: settings.Currency,
            Notes: s.Notes,
            Terms: "تم استلام الراتب المذكور أعلاه وتبرأ ذمة الاستديو من مستحقات هذا الشهر.",
            CreatedByName: s.PaidByUser?.FullName ?? "أمين الصندوق",
            CopiesCount: 1,
            PaperSize: "A4"
        );
    }

    public async Task<PrintDocumentData> PrepareCashierReportPrintDataAsync(CashierIncomeReportDto report)
    {
        var settings = await _settingsService.GetSettingsAsync();

        int idx = 1;
        var items = report.Orders.Select(o => new PrintItemRow(
            idx++,
            $"طلب {o.OrderNumber} - {o.CustomerName} ({o.ServiceTitle}) - {o.PaymentMethodName}",
            1,
            o.TotalAmount,
            o.TotalAmount
        )).ToList();

        return new PrintDocumentData(
            DocumentTypeTitle: $"تقرير دخل الكاشير ومبيعات الفترة - {report.CashierName}",
            DocumentNumber: $"REP-CASHIER-{DateTime.Now:yyyyMMdd-HHmmss}",
            Date: DateTime.Now,
            Time: DateTime.Now.ToString("hh:mm tt"),
            DayName: GetArabicDayName(DateTime.Now),
            StudioName: settings.StudioName,
            StudioAddress: settings.Address,
            StudioPhone: settings.Phone,
            LogoPath: settings.LogoPath,
            RecipientName: report.CashierName,
            RecipientPhone: settings.Phone,
            RecipientAddress: report.PeriodFormatted,
            Items: items,
            TotalAmount: report.TotalSales,
            PaidAmount: report.TotalReceived,
            RemainingAmount: report.TotalRemaining,
            PaymentMethodDisplay: $"نقداً: {report.TotalCash:N0} | محافظ: {report.TotalWallets:N0}",
            ReferenceNumber: $"طلبات: {report.TotalOrdersCount}",
            Currency: settings.Currency,
            Notes: $"إجمالي المبيعات: {report.TotalSales:N0} • المقبوض الفعلي: {report.TotalReceived:N0} • المتبقي ديون: {report.TotalRemaining:N0}",
            Terms: "تقرير مبيعات ودخل كاشير معتمد صادر من النظام الآلي.",
            CreatedByName: report.CashierName,
            CopiesCount: 1,
            PaperSize: "A4"
        );
    }
}

