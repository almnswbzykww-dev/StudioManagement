using System.Data;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using StudioManagement.Domain.Entities;
using StudioManagement.Domain.Enums;

namespace StudioManagement.Infrastructure.Data;

public static class DbInitializer
{
    private class ColumnDef
    {
        public string Name { get; set; } = string.Empty;
        public string SqlServerType { get; set; } = string.Empty;
        public string SqliteType { get; set; } = string.Empty;
        public string DefaultSqlServer { get; set; } = string.Empty;
        public string DefaultSqlite { get; set; } = string.Empty;
        public bool IsNullable { get; set; }
    }

    private class TableDef
    {
        public string Name { get; set; } = string.Empty;
        public List<ColumnDef> Columns { get; set; } = new();
    }

    private static readonly List<TableDef> TargetTables = new()
    {
        new TableDef { Name = "Users", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "UserNumber", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Username", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "PasswordHash", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "FullName", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Phone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "IsActive", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "LastLoginAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "DirectPermissionsJson", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Roles", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
        } },
        new TableDef { Name = "Permissions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Key", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Module", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
        } },
        new TableDef { Name = "UserRoles", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "UserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "RoleId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
        } },
        new TableDef { Name = "RolePermissions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "RoleId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PermissionId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
        } },
        new TableDef { Name = "Customers", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "CustomerNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Phone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "SecondaryPhone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Address", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Orders", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OrderNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "CustomerId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ServiceType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ServiceTitle", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Subtotal", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Discount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "TotalAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "PaidAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "RemainingAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Status", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OrderDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "DeliveryDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "DeliveryTime", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "CreatedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "AssignedToUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "OrderItems", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OrderId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ServiceType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Title", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Quantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "UnitPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "TotalPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "DetailsJson", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "OrderStatusHistories", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OrderId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OldStatus", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "NewStatus", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "ChangedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "Payments", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "OrderId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "PaymentDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Method", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "WalletType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "WalletName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "TransactionNumber", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "TransferNumber", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "SenderName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "SenderPhone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "ReceivedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "ProductCategories", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Products", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Code", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "CategoryId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Unit", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "CurrentQuantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "MinimumQuantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "CostPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "SellingPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Location", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "SupplierName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "InventoryTransactions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ProductId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Type", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Quantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PreviousQuantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "NewQuantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "UnitPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Reference", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "PerformedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "Suppliers", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "SupplierNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "CompanyName", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Phone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Address", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Category", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "TotalPurchases", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "TotalPaid", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "BalanceDebt", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Purchases", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PurchaseNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "SupplierId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "TotalAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "PaidAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "RemainingAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "PurchaseDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "InvoiceReference", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "CreatedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "PurchaseItems", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PurchaseId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ProductId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Quantity", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "UnitPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "TotalPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
        } },
        new TableDef { Name = "Expenses", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "VoucherNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Category", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "ExpenseDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Recipient", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "WalletType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RecordedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "Employees", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "EmpNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Role", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Phone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "HireDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "BaseSalary", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "InitialDebt", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "IsActive", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "EmployeeDebts", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "DebtNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "EmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Reason", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "IsSettled", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "SettledAmount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "RecordedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "EmployeePayments", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PaymentNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "EmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "WalletType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "RelatedDebtId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RecordedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "SalaryAdvances", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "AdvanceNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "EmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "AdvanceDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "MonthTarget", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "IsDeducted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "DeductedFromSalaryId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "ApprovedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "Salaries", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "PaymentNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "EmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "MonthYear", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "BaseSalary", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Allowances", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Deductions", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "AdvancesDeducted", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "NetSalary", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "PaymentDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "PaidByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
        } },
        new TableDef { Name = "StudioSettings", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "StudioName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "'استديو الفن 3'", DefaultSqlite = "'استديو الفن 3'", IsNullable = false },
            new ColumnDef { Name = "SystemManagerName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Tagline", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Address", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Phone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "SecondaryPhone", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Whatsapp", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Email", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "CrNumber", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Currency", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "'ريال يمني'", DefaultSqlite = "'ريال يمني'", IsNullable = false },
            new ColumnDef { Name = "LogoPath", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "LogoBase64", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "InvoiceTitle", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "InvoiceSubtitle", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "InvoiceFooterNote", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "ReceiptFooter", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "InvoiceTerms", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "PrintSize", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "'A4'", DefaultSqlite = "'A4'", IsNullable = false },
            new ColumnDef { Name = "EnableOrderNotifications", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "EnableDeliveryDeadlineAlerts", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "EnablePaymentAlerts", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "EnableFinancialAlerts", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "EnableBackupAlerts", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "DaysBeforeDeliveryAlert", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "2", DefaultSqlite = "2", IsNullable = false },
        } },
        new TableDef { Name = "StudioServices", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ServiceType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Name", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Icon", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "ImagePath", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "DisplayOrder", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "IsActive", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "DefaultPrice", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
        } },
        new TableDef { Name = "AuditLogs", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Action", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Module", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Details", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "UserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "UserName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Metadata", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Vouchers", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "VoucherNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Type", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Time", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "BeneficiaryOrPayer", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "AmountWords", SqlServerType = "NVARCHAR(300)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "WalletType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "TransactionReference", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RelatedCustomerId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RelatedEmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RelatedSupplierId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RelatedOrderId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "CreatedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "CashboxTransactions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "TransactionNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Time", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Type", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Category", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "PaymentMethod", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "WalletType", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "Reference", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "BalanceAfter", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "VoucherId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "CreatedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Accounts", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "AccountCode", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "AccountName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Category", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "CurrentBalance", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "IsActive", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "AccountTransactions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "AccountId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "Time", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Description", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Debit", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Credit", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "BalanceAfter", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "ReferenceNumber", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "EmployeeDeductions", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "DeductionNumber", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "EmployeeId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Amount", SqlServerType = "DECIMAL(18,2)", SqliteType = "TEXT", DefaultSqlServer = "0", DefaultSqlite = "'0'", IsNullable = false },
            new ColumnDef { Name = "Date", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "MonthYear", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Reason", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "IsAppliedToSalary", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "RecordedByUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "BackupHistories", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "FileName", SqlServerType = "NVARCHAR(250)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "FilePath", SqlServerType = "NVARCHAR(500)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "BackupDate", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "FileSizeBytes", SqlServerType = "BIGINT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Type", SqlServerType = "NVARCHAR(50)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "IsSuccessful", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "1", DefaultSqlite = "1", IsNullable = false },
            new ColumnDef { Name = "CreatedByUserName", SqlServerType = "NVARCHAR(150)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Notes", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
        new TableDef { Name = "Notifications", Columns = new List<ColumnDef> {
            new ColumnDef { Name = "Id", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "", DefaultSqlite = "", IsNullable = false },
            new ColumnDef { Name = "CreatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "(GETDATE())", DefaultSqlite = "'2026-01-01 00:00:00'", IsNullable = false },
            new ColumnDef { Name = "UpdatedAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsDeleted", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Title", SqlServerType = "NVARCHAR(200)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Message", SqlServerType = "NVARCHAR(MAX)", SqliteType = "TEXT", DefaultSqlServer = "''", DefaultSqlite = "''", IsNullable = false },
            new ColumnDef { Name = "Type", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "Priority", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "IsRead", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "ReadAt", SqlServerType = "DATETIME2", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "IsArchived", SqlServerType = "BIT", SqliteType = "INTEGER", DefaultSqlServer = "0", DefaultSqlite = "0", IsNullable = false },
            new ColumnDef { Name = "RelatedEntityId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "RelatedEntityType", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "ActionTarget", SqlServerType = "NVARCHAR(100)", SqliteType = "TEXT", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
            new ColumnDef { Name = "TargetUserId", SqlServerType = "INT", SqliteType = "INTEGER", DefaultSqlServer = "NULL", DefaultSqlite = "NULL", IsNullable = true },
        } },
    };

    public static async Task SeedAsync(StudioDbContext context)
    {
        // 1. Ensure schema is synchronized and all missing tables/columns are added non-destructively
        await SynchronizeSchemaSafelyAsync(context);

        // 2. Initial Seeding if database is empty
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

    public static async Task SynchronizeSchemaSafelyAsync(StudioDbContext context)
    {
        try
        {
            // Create tables that do not exist yet without modifying or dropping existing tables
            await context.Database.EnsureCreatedAsync();

            var conn = context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            bool isSqlite = context.Database.IsSqlite();

            foreach (var table in TargetTables)
            {
                var existingCols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                if (isSqlite)
                {
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = $"PRAGMA table_info('{table.Name}');";
                    try
                    {
                        using var reader = await cmd.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            var colName = reader["name"]?.ToString();
                            if (!string.IsNullOrEmpty(colName))
                            {
                                existingCols.Add(colName);
                            }
                        }
                    }
                    catch { }
                }
                else
                {
                    // SQL Server
                    using var cmd = conn.CreateCommand();
                    cmd.CommandText = $"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table.Name}';";
                    try
                    {
                        using var reader = await cmd.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            var colName = reader["COLUMN_NAME"]?.ToString();
                            if (!string.IsNullOrEmpty(colName))
                            {
                                existingCols.Add(colName);
                            }
                        }
                    }
                    catch { }
                }

                if (existingCols.Count == 0) continue;

                // Add any missing column safely with ALTER TABLE
                foreach (var col in table.Columns)
                {
                    if (col.Name.Equals("Id", StringComparison.OrdinalIgnoreCase)) continue;
                    if (existingCols.Contains(col.Name)) continue;

                    try
                    {
                        using var alterCmd = conn.CreateCommand();
                        if (isSqlite)
                        {
                            string nullability = col.IsNullable ? "" : (string.IsNullOrEmpty(col.DefaultSqlite) ? "" : $" DEFAULT {col.DefaultSqlite}");
                            alterCmd.CommandText = $"ALTER TABLE [{table.Name}] ADD COLUMN [{col.Name}] {col.SqliteType}{nullability};";
                        }
                        else
                        {
                            // SQL Server
                            string defaultClause = string.IsNullOrEmpty(col.DefaultSqlServer) || col.DefaultSqlServer == "NULL"
                                ? "" 
                                : $" CONSTRAINT [DF_{table.Name}_{col.Name}] DEFAULT {col.DefaultSqlServer}";
                            string nullClause = col.IsNullable ? "NULL" : "NOT NULL";
                            alterCmd.CommandText = $"ALTER TABLE [{table.Name}] ADD [{col.Name}] {col.SqlServerType} {defaultClause} {nullClause};";
                        }
                        await alterCmd.ExecuteNonQueryAsync();
                    }
                    catch
                    {
                        // Safe fallback - column might already exist or concurrent update
                    }
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Schema synchronization notice: {ex.Message}");
        }
    }

}
