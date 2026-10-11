using Microsoft.EntityFrameworkCore;
using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(StudioDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync())
        {
            var adminRole = new Role { Name = "مدير النظام", Description = "صلاحيات إدارية وفنية ومالية كاملة" };
            var cashierRole = new Role { Name = "كاشير ومبيعات", Description = "إدخال العملاء، الطلبات، والتحصيل المالي" };
            context.Roles.AddRange(adminRole, cashierRole);
            await context.SaveChangesAsync();

            // Seed Permissions
            var permissionsList = new List<Permission>
            {
                new() { Key = "Dashboard:View", Module = "لوحة التحكم", Description = "مشاهدة Dashboard" },
                new() { Key = "Orders:View", Module = "الطلبات", Description = "مشاهدة الطلبات" },
                new() { Key = "Orders:Create", Module = "الطلبات", Description = "إضافة طلب جديد" },
                new() { Key = "Orders:Edit", Module = "الطلبات", Description = "تعديل الطلبات" },
                new() { Key = "Orders:Delete", Module = "الطلبات", Description = "حذف الطلبات" },
                new() { Key = "Customers:View", Module = "العملاء", Description = "مشاهدة العملاء" },
                new() { Key = "Customers:Create", Module = "العملاء", Description = "إضافة عميل" },
                new() { Key = "Customers:Delete", Module = "العملاء", Description = "حذف عميل" },
                new() { Key = "Invoices:Create", Module = "الفواتير", Description = "إنشاء فاتورة" },
                new() { Key = "Invoices:Print", Module = "الفواتير", Description = "طباعة الفواتير" },
                new() { Key = "Invoices:Reprint", Module = "الفواتير", Description = "إعادة طباعة الفواتير" },
                new() { Key = "Invoices:Delete", Module = "الفواتير", Description = "حذف الفواتير" },
                new() { Key = "Payments:Create", Module = "المدفوعات", Description = "تسجيل دفعة" },
                new() { Key = "Payments:View", Module = "المدفوعات", Description = "مشاهدة المدفوعات" },
                new() { Key = "Payments:Delete", Module = "المدفوعات", Description = "حذف المدفوعات" },
                new() { Key = "Accounting:View", Module = "الحسابات", Description = "مشاهدة الحسابات والصندوق" },
                new() { Key = "Accounting:Edit", Module = "الحسابات", Description = "تعديل الحسابات" },
                new() { Key = "Accounting:Delete", Module = "الحسابات", Description = "حذف الحسابات" },
                new() { Key = "Expenses:Create", Module = "المصروفات", Description = "إضافة مصروف" },
                new() { Key = "Expenses:Edit", Module = "المصروفات", Description = "تعديل المصروفات" },
                new() { Key = "Expenses:Delete", Module = "المصروفات", Description = "حذف المصروفات" },
                new() { Key = "Salaries:View", Module = "الرواتب", Description = "مشاهدة الرواتب والسلف" },
                new() { Key = "Salaries:Edit", Module = "الرواتب", Description = "تعديل الرواتب والسلف" },
                new() { Key = "Reports:Sales", Module = "التقارير", Description = "تقرير المبيعات" },
                new() { Key = "Reports:TodayIncome", Module = "التقارير", Description = "تقرير دخل اليوم" },
                new() { Key = "Reports:FullFinancial", Module = "التقارير", Description = "التقارير المالية الكاملة" },
                new() { Key = "Reports:CashierIncome", Module = "التقارير", Description = "تقرير دخل الكاشير" },
                new() { Key = "Settings:System", Module = "الإعدادات", Description = "إعدادات النظام" },
                new() { Key = "Settings:StudioInfo", Module = "الإعدادات", Description = "بيانات الاستديو" },
                new() { Key = "Settings:Users", Module = "الإعدادات", Description = "المستخدمون والصلاحيات" },
                new() { Key = "Backup:Manage", Module = "النسخ الاحتياطي", Description = "إدارة النسخ الاحتياطي والاستعادة" }
            };
            context.Permissions.AddRange(permissionsList);
            await context.SaveChangesAsync();

            // Grant Admin all permissions
            foreach (var perm in permissionsList)
            {
                context.RolePermissions.Add(new RolePermission { RoleId = adminRole.Id, PermissionId = perm.Id });
            }

            // Grant Cashier specific default permissions
            var cashierDefaultKeys = new[] { "Dashboard:View", "Orders:View", "Orders:Create", "Orders:Edit", "Customers:View", "Customers:Create", "Invoices:Create", "Invoices:Print", "Invoices:Reprint", "Payments:Create", "Payments:View", "Reports:Sales", "Reports:TodayIncome" };
            foreach (var perm in permissionsList.Where(p => cashierDefaultKeys.Contains(p.Key)))
            {
                context.RolePermissions.Add(new RolePermission { RoleId = cashierRole.Id, PermissionId = perm.Id });
            }
            await context.SaveChangesAsync();

            var adminUser = new User
            {
                UserNumber = 1001,
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                FullName = "المهندس زكريا فيصل العزعزي",
                Phone = "777000111",
                IsActive = true
            };

            var cashierUser = new User
            {
                UserNumber = 1002,
                Username = "cashier",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                FullName = "أحمد عبد الله المحمدي",
                Phone = "777111222",
                IsActive = true
            };

            context.Users.AddRange(adminUser, cashierUser);
            await context.SaveChangesAsync();

            context.UserRoles.AddRange(
                new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id },
                new UserRole { UserId = cashierUser.Id, RoleId = cashierRole.Id }
            );

            // Seed Studio Settings
            context.StudioSettings.Add(new StudioSettings());

            // Seed Default Product Category
            var cat = new ProductCategory { Name = "عام", Description = "خامات ومستلزمات استديو عامة" };
            context.ProductCategories.Add(cat);
            await context.SaveChangesAsync();

            // Seed Default Products
            context.Products.AddRange(
                new Product { Code = "PRD-001", Name = "ورق كوداك فوتوغرافي لماع A4", CategoryId = cat.Id, CurrentQuantity = 50, MinimumQuantity = 10, CostPrice = 6500, SellingPrice = 12000, Unit = "باكت" },
                new Product { Code = "PRD-002", Name = "طقم أحبار كانون وإبسون 6 ألوان", CategoryId = cat.Id, CurrentQuantity = 8, MinimumQuantity = 3, CostPrice = 42000, SellingPrice = 70000, Unit = "طقم" },
                new Product { Code = "PRD-003", Name = "ألواح أكريليك شفاف 80×120 سم", CategoryId = cat.Id, CurrentQuantity = 15, MinimumQuantity = 5, CostPrice = 18000, SellingPrice = 35000, Unit = "لوح" },
                new Product { Code = "PRD-004", Name = "أكواب سحرية سبلميشن", CategoryId = cat.Id, CurrentQuantity = 24, MinimumQuantity = 6, CostPrice = 1200, SellingPrice = 3000, Unit = "حبة" }
            );

            // Seed Default 12 Studio Services (3x4 Grid)
            var services = new List<StudioService>
            {
                new() { ServiceType = ServiceType.WeddingBoard, Name = "لوحات العرسان الفاخرة", Description = "تصميم وطباعة اللوحات الملكية الكبيرة بإطارات خشبية وإضاءة LED", Icon = "Palette", ImagePath = "Images/wedding_board_frame_1791329701263.jpg", DisplayOrder = 1, DefaultPrice = 95000 },
                new() { ServiceType = ServiceType.WeddingSession, Name = "جلسات تصوير عرسان VIP", Description = "تصوير احترافي مخصص للعرسان داخل الاستديو الملكي", Icon = "Sparkles", ImagePath = "Images/wedding_session_palace_1791329710801.jpg", DisplayOrder = 2, DefaultPrice = 110000 },
                new() { ServiceType = ServiceType.StudioPhotos, Name = "الصور وجلسات الاستديو", Description = "جلسات بورتريه شخصية، عائلية، تخرج، وصور رسمية", Icon = "Camera", ImagePath = "Images/studio_portrait_session_1791329721847.jpg", DisplayOrder = 3, DefaultPrice = 45000 },
                new() { ServiceType = ServiceType.PhotoAlbums, Name = "ألبومات الصور الفاخرة", Description = "ألبومات زفاف ديجيتال حرارية جلد إيطالي وأكريليك", Icon = "BookOpen", ImagePath = "Images/luxury_photo_album_1791329731952.jpg", DisplayOrder = 4, DefaultPrice = 120000 },
                new() { ServiceType = ServiceType.Advertising, Name = "الدعاية والإعلان والبنرات", Description = "طباعة بنرات فليكس، فينيل، ستيكرات، ورول اب", Icon = "Megaphone", ImagePath = "Images/banner_printing_shop_1791329744641.jpg", DisplayOrder = 5, DefaultPrice = 75000 },
                new() { ServiceType = ServiceType.GraphicDesign, Name = "التصميمات والشعارات", Description = "هويات تجارية، كروت، بروشورات، وبطاقات دعوات رقمية", Icon = "PenTool", ImagePath = "Images/branding_design_mockup_1791329754567.jpg", DisplayOrder = 6, DefaultPrice = 35000 },
                new() { ServiceType = ServiceType.PassportPhotos, Name = "صور الجوازات والمعاملات", Description = "تصوير فوري رسمي للجوازات والسفارات والمعاملات", Icon = "ShieldCheck", ImagePath = "Images/passport_id_photos_1791329763832.jpg", DisplayOrder = 7, DefaultPrice = 10000 },
                new() { ServiceType = ServiceType.PhotoRestoration, Name = "ترميم وتلوين الصور", Description = "معالجة وترميم الصور التالفة والقديمة بجودة فائقة", Icon = "Sparkles", ImagePath = "Images/vintage_photo_restoration_1791329773616.jpg", DisplayOrder = 8, DefaultPrice = 30000 },
                new() { ServiceType = ServiceType.CanvasPrints, Name = "لوحات الكانفس الفنية", Description = "طباعة كانفس فاخرة مشدودة على خشب سويدي أصلي", Icon = "Palette", ImagePath = "Images/stretched_canvas_gallery_1791329785266.jpg", DisplayOrder = 9, DefaultPrice = 65000 },
                new() { ServiceType = ServiceType.VideoMontage, Name = "الفيديو والمونتاج السينمائي", Description = "تصوير سينمائي 4K، تصوير درون جوي ومونتاج تيزرات", Icon = "Film", ImagePath = "Images/video_editing_suite_1791329794357.jpg", DisplayOrder = 10, DefaultPrice = 150000 },
                new() { ServiceType = ServiceType.OutdoorPhoto, Name = "التصوير الخارجي والمناسبات", Description = "جلسات تصوير في حدائق ومنتجعات وتغطية الأفراح", Icon = "Image", ImagePath = "Images/outdoor_wedding_couple_1791329805313.jpg", DisplayOrder = 11, DefaultPrice = 85000 },
                new() { ServiceType = ServiceType.ThermalPrint, Name = "الطباعة الحرارية والهدايا", Description = "طباعة سبلميشن للتيشيرتات والأكواب والدروع التذكارية", Icon = "Flame", ImagePath = "Images/thermal_press_printing_1791329815734.jpg", DisplayOrder = 12, DefaultPrice = 25000 }
            };
            context.StudioServices.AddRange(services);

            // Seed Initial Customer
            var cust = new Customer
            {
                CustomerNumber = "C-000001",
                Name = "عمار ياسين الشميري",
                Phone = "771234567",
                Address = "صنعاء - حي الأصبحي",
                Notes = "عميل مميز - حفل زفاف"
            };
            context.Customers.Add(cust);
            await context.SaveChangesAsync();

            // Seed Initial Order
            var order = new Order
            {
                OrderNumber = "ORD-2026-000001",
                CustomerId = cust.Id,
                ServiceType = ServiceType.WeddingBoard,
                ServiceTitle = "لوحات العرسان الفاخرة",
                Subtotal = 110000,
                Discount = 5000,
                TotalAmount = 105000,
                PaidAmount = 70000,
                RemainingAmount = 35000,
                Status = OrderStatus.InPrinting,
                OrderDate = DateTime.Now.AddDays(-5),
                DeliveryDate = DateTime.Now.AddDays(3),
                DeliveryTime = "06:00 م",
                CreatedByUserId = adminUser.Id,
                Notes = "لوحة ملكية 80×120 سم مع إضاءة دافئة LED"
            };
            order.Items.Add(new OrderItem
            {
                ServiceType = ServiceType.WeddingBoard,
                Title = "لوحة عرسان ملكية فاخرة مقاس 80×120 سم إضاءة LED",
                Quantity = 1,
                UnitPrice = 110000,
                TotalPrice = 110000
            });
            order.Payments.Add(new Payment
            {
                Amount = 70000,
                Method = PaymentMethod.BankWallet,
                WalletType = WalletType.Kuraimi,
                WalletName = "كريمي / إم فلوس",
                TransactionNumber = "TX-9988231",
                ReceivedByUserId = cashierUser.Id,
                Notes = "دفعة أولى عند توقيع الطلب"
            });
            context.Orders.Add(order);

            // Seed Initial Employees
            var emp1 = new Employee
            {
                EmpNumber = "EMP-001",
                Name = "المهندس زكريا فيصل العزعزي",
                Role = "مدير عام الاستديو والإنتاج",
                Phone = "777000111",
                HireDate = DateTime.Now.AddMonths(-18),
                BaseSalary = 250000,
                Notes = "إدارة فنية وهندسية شاملة"
            };
            var emp2 = new Employee
            {
                EmpNumber = "EMP-002",
                Name = "محمد نبيل الرازحي",
                Role = "مصور فوتوغرافي وسينمائي 4K",
                Phone = "771234888",
                HireDate = DateTime.Now.AddMonths(-10),
                BaseSalary = 140000,
                Notes = "جلسات العرسان والإنتاج الإعلاني"
            };
            var emp3 = new Employee
            {
                EmpNumber = "EMP-003",
                Name = "عبدالرحمن خالد الصنعاني",
                Role = "مصمم جرافيك ومونتير فيديو",
                Phone = "773344556",
                HireDate = DateTime.Now.AddMonths(-8),
                BaseSalary = 130000,
                Notes = "تصميم الألبومات ومونتاج التيزرات"
            };
            var emp4 = new Employee
            {
                EmpNumber = "EMP-004",
                Name = "سامي عبدالله القدسي",
                Role = "فني طباعة حرارية وكانفس",
                Phone = "775566778",
                HireDate = DateTime.Now.AddMonths(-5),
                BaseSalary = 100000,
                Notes = "طباعة اللوحات وتجميع الإطارات الخشبية"
            };
            var emp5 = new Employee
            {
                EmpNumber = "EMP-005",
                Name = "حسام صادق الشرجبي",
                Role = "كاشير ومسؤول مبيعات وخدمة عملاء",
                Phone = "772233445",
                HireDate = DateTime.Now.AddMonths(-3),
                BaseSalary = 90000,
                Notes = "استقبال العملاء وتسليم الطلبات والتحصيل"
            };
            context.Employees.AddRange(emp1, emp2, emp3, emp4, emp5);
            await context.SaveChangesAsync();

            // Seed Initial Advance
            var adv1 = new SalaryAdvance
            {
                AdvanceNumber = "ADV-2026-0001",
                EmployeeId = emp2.Id,
                Amount = 25000,
                AdvanceDate = DateTime.Now.AddDays(-6),
                MonthTarget = DateTime.Now.ToString("yyyy-MM"),
                IsDeducted = false,
                Notes = "سلفة نقدية طارئة",
                ApprovedByUserId = adminUser.Id
            };
            context.SalaryAdvances.Add(adv1);

            // Seed Initial Deduction
            var ded1 = new EmployeeDeduction
            {
                DeductionNumber = "DED-2026-0001",
                EmployeeId = emp4.Id,
                Amount = 5000,
                Date = DateTime.Now.AddDays(-4),
                MonthYear = DateTime.Now.ToString("yyyy-MM"),
                Reason = "غياب وتأخير غير مبرر",
                IsAppliedToSalary = false,
                RecordedByUserId = adminUser.Id,
                Notes = "خصم يومين عمل"
            };
            context.EmployeeDeductions.Add(ded1);

            // Seed Initial Vouchers
            var v1 = new Voucher
            {
                VoucherNumber = "REC-2026-0001",
                Type = VoucherType.Receipt,
                Date = DateTime.Now.AddDays(-2),
                Time = "11:30 ص",
                BeneficiaryOrPayer = "عمار ياسين الشميري",
                Amount = 70000,
                AmountWords = "سبعون ألف ريال يمني فقط لا غير",
                Description = "عربون حجز طلب لوحة عرسان ملكية (ORD-2026-000001)",
                PaymentMethod = PaymentMethod.BankWallet,
                WalletType = WalletType.Kuraimi,
                TransactionReference = "TX-9988231",
                CreatedByUserId = cashierUser.Id,
                RelatedCustomerId = cust.Id,
                RelatedOrderId = order.Id,
                Notes = "سند قبض مسدد عبر بنك الكريمي"
            };
            var v2 = new Voucher
            {
                VoucherNumber = "PAY-2026-0001",
                Type = VoucherType.Payment,
                Date = DateTime.Now.AddDays(-1),
                Time = "04:15 م",
                BeneficiaryOrPayer = "محمد نبيل الرازحي",
                Amount = 25000,
                AmountWords = "خمسة وعشرون ألف ريال يمني فقط لا غير",
                Description = "صرف سلفة نقدية على الراتب",
                PaymentMethod = PaymentMethod.Cash,
                CreatedByUserId = adminUser.Id,
                RelatedEmployeeId = emp2.Id,
                Notes = "سند صرف سلفة موظف"
            };
            context.Vouchers.AddRange(v1, v2);

            // Seed Initial Expenses
            var exp1 = new Expense
            {
                VoucherNumber = "EXP-2026-0001",
                Category = "خامات ومستلزمات",
                Amount = 45000,
                ExpenseDate = DateTime.Now.AddDays(-3),
                Recipient = "مؤسسة الرويشان لمواد الدعاية",
                Description = "شراء رول قماش كانفس إيطالي وأحبار أصلية",
                PaymentMethod = PaymentMethod.Cash,
                RecordedByUserId = adminUser.Id
            };
            var exp2 = new Expense
            {
                VoucherNumber = "EXP-2026-0002",
                Category = "فواتير ومرافق",
                Amount = 22000,
                ExpenseDate = DateTime.Now.AddDays(-2),
                Recipient = "المؤسسة العامة للكهرباء ومياه الشرب",
                Description = "سداد فاتورة استهلاك كهرباء وماء الاستديو",
                PaymentMethod = PaymentMethod.BankWallet,
                WalletType = WalletType.Kuraimi,
                RecordedByUserId = adminUser.Id
            };
            context.Expenses.AddRange(exp1, exp2);

            // Seed Initial Accounts
            var accMain = new Account
            {
                AccountCode = "101",
                AccountName = "الصندوق الرئيسي (الخزينة النقدية)",
                Category = AccountCategory.Cash,
                CurrentBalance = 185000,
                IsActive = true,
                Notes = "النقدية بالصندوق داخل الاستديو"
            };
            var accBank = new Account
            {
                AccountCode = "102",
                AccountName = "حساب بنك الكريمي للتمويل الأصغر",
                Category = AccountCategory.Bank,
                CurrentBalance = 420000,
                IsActive = true,
                Notes = "حساب الاستديو الرسمي لدى الكريمي"
            };
            context.Accounts.AddRange(accMain, accBank);

            await context.SaveChangesAsync();
        }

        // Ensure all 12 StudioServices have their offline local ImagePath populated
        var existingServices = await context.StudioServices.ToListAsync();
        if (existingServices.Any())
        {
            var defaultImages = new Dictionary<ServiceType, string>
            {
                [ServiceType.WeddingBoard] = "Images/wedding_board_frame_1791329701263.jpg",
                [ServiceType.WeddingSession] = "Images/wedding_session_palace_1791329710801.jpg",
                [ServiceType.StudioPhotos] = "Images/studio_portrait_session_1791329721847.jpg",
                [ServiceType.PhotoAlbums] = "Images/luxury_photo_album_1791329731952.jpg",
                [ServiceType.Advertising] = "Images/banner_printing_shop_1791329744641.jpg",
                [ServiceType.GraphicDesign] = "Images/branding_design_mockup_1791329754567.jpg",
                [ServiceType.PassportPhotos] = "Images/passport_id_photos_1791329763832.jpg",
                [ServiceType.PhotoRestoration] = "Images/vintage_photo_restoration_1791329773616.jpg",
                [ServiceType.CanvasPrints] = "Images/stretched_canvas_gallery_1791329785266.jpg",
                [ServiceType.VideoMontage] = "Images/video_editing_suite_1791329794357.jpg",
                [ServiceType.OutdoorPhoto] = "Images/outdoor_wedding_couple_1791329805313.jpg",
                [ServiceType.ThermalPrint] = "Images/thermal_press_printing_1791329815734.jpg"
            };

            bool changed = false;
            foreach (var s in existingServices)
            {
                if (string.IsNullOrWhiteSpace(s.ImagePath) && defaultImages.TryGetValue(s.ServiceType, out var img))
                {
                    s.ImagePath = img;
                    changed = true;
                }
            }
            if (changed)
            {
                await context.SaveChangesAsync();
            }
        }
    }
}
