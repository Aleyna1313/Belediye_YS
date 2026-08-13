using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Persistence.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Department> Departments => Set<Department>();
    public DbSet<User> Users => Set<User>();
    public DbSet<MaterialType> MaterialTypes => Set<MaterialType>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<Request> Requests => Set<Request>();
    public DbSet<RequestItem> RequestItems => Set<RequestItem>();
    public DbSet<Firm> Firms => Set<Firm>();
    public DbSet<Tender> Tenders => Set<Tender>();
    public DbSet<FirmOffer> FirmOffers => Set<FirmOffer>();
    public DbSet<ManagementDocument> ManagementDocuments => Set<ManagementDocument>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Setting> Settings => Set<Setting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Decimal Precision
        foreach (var property in modelBuilder.Model.GetEntityTypes()
                     .SelectMany(t => t.GetProperties())
                     .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // Indexes & Constraints
        modelBuilder.Entity<Department>().HasIndex(d => d.Code).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<MaterialType>().HasIndex(mt => mt.Code).IsUnique();
        modelBuilder.Entity<Material>().HasIndex(m => m.Code).IsUnique();
        modelBuilder.Entity<Request>().HasIndex(r => r.RequestNo).IsUnique();
        modelBuilder.Entity<Tender>().HasIndex(t => t.TenderNo).IsUnique();
        modelBuilder.Entity<Firm>().HasIndex(f => f.TaxNumber).IsUnique();
        modelBuilder.Entity<ManagementDocument>().HasIndex(d => d.DocumentNo).IsUnique();
        modelBuilder.Entity<Setting>().HasIndex(s => s.Key).IsUnique();

        // Foreign Key Relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Warehouse>()
            .HasOne(w => w.Department)
            .WithMany(d => d.Warehouses)
            .HasForeignKey(w => w.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Material>()
            .HasOne(m => m.MaterialType)
            .WithMany(mt => mt.Materials)
            .HasForeignKey(m => m.MaterialTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Material>()
            .HasOne(m => m.Warehouse)
            .WithMany(w => w.Materials)
            .HasForeignKey(m => m.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Request>()
            .HasOne(r => r.Department)
            .WithMany(d => d.Requests)
            .HasForeignKey(r => r.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Request>()
            .HasOne(r => r.User)
            .WithMany(u => u.Requests)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RequestItem>()
            .HasOne(ri => ri.Request)
            .WithMany(r => r.RequestItems)
            .HasForeignKey(ri => ri.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RequestItem>()
            .HasOne(ri => ri.Material)
            .WithMany(m => m.RequestItems)
            .HasForeignKey(ri => ri.MaterialId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tender>()
            .HasOne(t => t.Request)
            .WithOne(r => r.Tender)
            .HasForeignKey<Tender>(t => t.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tender>()
            .HasOne(t => t.WinningFirm)
            .WithMany()
            .HasForeignKey(t => t.WinningFirmId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<FirmOffer>()
            .HasOne(fo => fo.Tender)
            .WithMany(t => t.Offers)
            .HasForeignKey(fo => fo.TenderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FirmOffer>()
            .HasOne(fo => fo.Firm)
            .WithMany(f => f.Offers)
            .HasForeignKey(fo => fo.FirmId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ManagementDocument>()
            .HasOne(d => d.Request)
            .WithMany(r => r.Documents)
            .HasForeignKey(d => d.RequestId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ManagementDocument>()
            .HasOne(d => d.Tender)
            .WithMany(t => t.Documents)
            .HasForeignKey(d => d.TenderId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ManagementDocument>()
            .HasOne(d => d.CreatedByUser)
            .WithMany()
            .HasForeignKey(d => d.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuditLog>()
            .HasOne(a => a.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Seed Data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // 10 Müdürlük
        modelBuilder.Entity<Department>().HasData(
            new Department { Id = 1, Name = "Bilgi İşlem Müdürlüğü", Code = "BILGI_ISLEM", Description = "Bilişim ve Teknoloji Hizmetleri", IsActive = true },
            new Department { Id = 2, Name = "Kültür Sanat ve Sosyal İşler Müdürlüğü", Code = "KULTUR_SANAT", Description = "Sosyal Etkinlikler ve Kültür Merkezi", IsActive = true },
            new Department { Id = 3, Name = "İnsan Kaynakları Müdürlüğü", Code = "INSAN_KAYNAKLARI", Description = "Personel ve İK Yönetimi", IsActive = true },
            new Department { Id = 4, Name = "İmar ve Şehircilik Müdürlüğü", Code = "IMAR_SEHIR", Description = "Ruhsat ve Şehircilik Hizmetleri", IsActive = true },
            new Department { Id = 5, Name = "Mali Hizmetler Müdürlüğü", Code = "MALI_HIZMETLER", Description = "Bütçe ve Muhasebe Yönetimi", IsActive = true },
            new Department { Id = 6, Name = "Park ve Bahçeler Müdürlüğü", Code = "PARK_BAHCE", Description = "Yeşil Alanlar ve Park Bakımı", IsActive = true },
            new Department { Id = 7, Name = "Hukuk İşleri Müdürlüğü", Code = "HUKUK_ISLERI", Description = "Hukuki Danışmanlık ve Davalar", IsActive = true },
            new Department { Id = 8, Name = "Zabıta Müdürlüğü", Code = "ZABITA", Description = "Denetim ve Asayiş Hizmetleri", IsActive = true },
            new Department { Id = 9, Name = "Afet İşleri Müdürlüğü", Code = "AFET_ISLERI", Description = "Afet Yönetimi ve Arama Kurtarma", IsActive = true },
            new Department { Id = 10, Name = "Basın Yayın Müdürlüğü", Code = "BASIN_YAYIN", Description = "Halkla İlişkiler ve Basın", IsActive = true }
        );

        // Malzeme Türleri (Prompt: Malzeme türleri yalnızca 150 Sarf Malzemesi ve 255 Demirbaş olacaktır)
        modelBuilder.Entity<MaterialType>().HasData(
            new MaterialType { Id = 1, Code = "150", Name = "150 Sarf Malzemesi", Description = "Tüketilebilir Sarf Malzemeleri" },
            new MaterialType { Id = 2, Code = "255", Name = "255 Demirbaş", Description = "Kalıcı Demirbaş Malzemeler" }
        );

        // Ambarlar
        modelBuilder.Entity<Warehouse>().HasData(
            new Warehouse { Id = 1, Name = "Bilgi İşlem Ana Depo", Location = "A Blok Zemin Kat", DepartmentId = 1 },
            new Warehouse { Id = 2, Name = "Mali Hizmetler Evrak Deposu", Location = "B Blok 1. Kat", DepartmentId = 5 },
            new Warehouse { Id = 3, Name = "Park Bahçeler Şantiye Deposu", Location = "Merkez Şantiye", DepartmentId = 6 },
            new Warehouse { Id = 4, Name = "Genel Belediye Ambarı", Location = "Garaj Depo Alanı", DepartmentId = null }
        );

        // Kullanıcılar (Prompt: Görevi yalnızca "Şef" veya "Teminci" olarak gösterilecektir)
        // Default şifre hash'i (Password: 123456)
        string defaultHash = "$2a$11$q9hE/2l2nQ6T6S5W9f/0ieA/5B2M0s9e4R5.y/u5A/4X1c0e0e0e0"; 

        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "admin", PasswordHash = defaultHash, FullName = "Sistem Yöneticisi", Email = "admin@belediye.bel.tr", Phone = "05550000000", DepartmentId = 1, Title = "Şef", Role = "Admin", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 2, Username = "bilgi_sef", PasswordHash = defaultHash, FullName = "Ahmet Yılmaz (Bilgi İşlem Şefi)", Email = "ahmet.yilmaz@belediye.bel.tr", Phone = "05551112233", DepartmentId = 1, Title = "Şef", Role = "User", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 3, Username = "bilgi_teminci", PasswordHash = defaultHash, FullName = "Mehmet Demir (Bilgi İşlem Teminci)", Email = "mehmet.demir@belediye.bel.tr", Phone = "05552223344", DepartmentId = 1, Title = "Teminci", Role = "User", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 4, Username = "mali_sef", PasswordHash = defaultHash, FullName = "Ayşe Kaya (Mali Hizmetler Şefi)", Email = "ayse.kaya@belediye.bel.tr", Phone = "05553334455", DepartmentId = 5, Title = "Şef", Role = "User", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 5, Username = "mali_teminci", PasswordHash = defaultHash, FullName = "Fatma Şahin (Mali Hizmetler Teminci)", Email = "fatma.sahin@belediye.bel.tr", Phone = "05554445566", DepartmentId = 5, Title = "Teminci", Role = "User", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new User { Id = 6, Username = "park_sef", PasswordHash = defaultHash, FullName = "Ali Öztürk (Park Bahçe Şefi)", Email = "ali.ozturk@belediye.bel.tr", Phone = "05555556677", DepartmentId = 6, Title = "Şef", Role = "User", CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Örnek Malzemeler (150 Sarf / 255 Demirbaş)
        modelBuilder.Entity<Material>().HasData(
            new Material { Id = 1, Code = "MAL-150-001", Name = "A4 Fotokopi Kağıdı (80 gr)", MaterialTypeId = 1, WarehouseId = 1, StockQuantity = 500, Unit = "Paket", UnitPrice = 145.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 2, Code = "MAL-150-002", Name = "Siyah Toner (HP LaserJet)", MaterialTypeId = 1, WarehouseId = 1, StockQuantity = 35, Unit = "Adet", UnitPrice = 850.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 3, Code = "MAL-150-003", Name = "Cat6 Ağ Kablosu (300m)", MaterialTypeId = 1, WarehouseId = 1, StockQuantity = 12, Unit = "Makara", UnitPrice = 2400.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 4, Code = "MAL-255-001", Name = "Masaüstü İş İstasyonu Bilgisayar", MaterialTypeId = 2, WarehouseId = 1, StockQuantity = 20, Unit = "Adet", UnitPrice = 32000.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 5, Code = "MAL-255-002", Name = "27 inç 4K IPS Monitör", MaterialTypeId = 2, WarehouseId = 1, StockQuantity = 15, Unit = "Adet", UnitPrice = 9500.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 6, Code = "MAL-255-003", Name = "Kesintisiz Güç Kaynağı 3000VA UPS", MaterialTypeId = 2, WarehouseId = 1, StockQuantity = 8, Unit = "Adet", UnitPrice = 18500.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 7, Code = "MAL-150-004", Name = "Çim Biçme Misinası (50m)", MaterialTypeId = 1, WarehouseId = 3, StockQuantity = 40, Unit = "Rulo", UnitPrice = 350.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Material { Id = 8, Code = "MAL-255-004", Name = "Benzinli Çim Biçme Traktörü", MaterialTypeId = 2, WarehouseId = 3, StockQuantity = 3, Unit = "Adet", UnitPrice = 145000.00m, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        // Tedarikçi Firmalar
        modelBuilder.Entity<Firm>().HasData(
            new Firm { Id = 1, TaxNumber = "1234567890", Name = "Akdeniz Teknoloji A.Ş.", ContactPerson = "Kemal Sever", Phone = "02123334455", Email = "info@akdenizteknoloji.com", Address = "Atatürk Cad. No:12 İstanbul" },
            new Firm { Id = 2, TaxNumber = "9876543210", Name = "Kuzey Bilişim ve Donanım Ltd. Şti.", ContactPerson = "Serkan Avcı", Phone = "02164445566", Email = "satis@kuzeybilisim.com.tr", Address = "Sanayi Sanayi Bölgesi No:45 Kocaeli" },
            new Firm { Id = 3, TaxNumber = "4567891230", Name = "Anadolu Kırtasiye ve Büro Malzemeleri", ContactPerson = "Zeynep Uçar", Phone = "03125556677", Email = "siparis@anadolukirtasiye.com", Address = "Kızılay Mah. Ankara" },
            new Firm { Id = 4, TaxNumber = "7891234560", Name = "Toros Peyzaj ve Şantiye Ekipmanları", ContactPerson = "Mustafa Yalçın", Phone = "02426667788", Email = "iletisim@torospeyzaj.com", Address = "Akdeniz Bulvarı Antalya" }
        );

        // Ayarlar
        modelBuilder.Entity<Setting>().HasData(
            new Setting { Id = 1, Key = "SYSTEM_NAME", Value = "Belediye Bilgi Yönetim Sistemi", Description = "Sistem Başlığı" },
            new Setting { Id = 2, Key = "BELEDIYE_NAME", Value = "Örnek Büyükşehir Belediyesi", Description = "Belediye Resmi Adı" },
            new Setting { Id = 3, Key = "CURRENCY_SYMBOL", Value = "₺", Description = "Para Birimi Simgesi" }
        );
    }
}
