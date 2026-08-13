# Belediye Bilgi Yönetim Sistemi (BBYS)

## 🇹🇷 Türkçe

Belediye Bilgi Yönetim Sistemi (BBYS), belediye birimlerinin satın alma, talep, stok ve ihale süreçlerini dijital ortamda yönetmesini sağlayan web tabanlı bir bilgi yönetim sistemi projesidir.

Proje, katmanlı mimari yaklaşımı kullanılarak geliştirilmiş ve backend ile frontend yapıları birbirinden ayrılmıştır.

### 🏗️ Proje Mimarisi

Proje aşağıdaki katmanlardan oluşmaktadır:

- **Domain:** Sistemin temel varlıkları (Entity), enum yapıları ve ortak modeller.
- **Application:** İş kuralları, servisler, DTO'lar ve uygulama arayüzleri.
- **Infrastructure:** JWT tabanlı kimlik doğrulama ve diğer altyapı servisleri.
- **Persistence:** Entity Framework Core, veritabanı context'i, Repository ve Unit of Work yapıları.
- **WebAPI:** REST API endpoint'leri ve Controller katmanı.
- **Frontend:** Kullanıcıların sistemi web üzerinden kullanmasını sağlayan React tabanlı arayüz.

### 🛠️ Kullanılan Teknolojiler

**Backend**
- C#
- ASP.NET Core Web API
- Entity Framework Core
- Microsoft SQL Server
- JWT Authentication

**Frontend**
- React
- TypeScript
- Vite
- CSS

### 📌 Temel Modüller

- Kullanıcı ve yetkilendirme yönetimi
- Müdürlük yönetimi
- Malzeme ve stok yönetimi
- Talep yönetimi
- İhale yönetimi
- Firma ve teklif yönetimi
- Belge yönetimi
- Bildirim sistemi
- Audit Log ve işlem takibi

### 🗄️ Veritabanı

Sistem, Entity Framework Core kullanılarak oluşturulan ilişkisel bir veritabanı yapısına sahiptir.

Temel tablolar arasında:

`Users`, `Departments`, `Materials`, `MaterialTypes`, `Warehouses`, `Requests`, `RequestItems`, `Tenders`, `Firms`, `FirmOffers`, `ManagementDocuments`, `Notifications` ve `AuditLogs` bulunmaktadır.

---

## 🇬🇧 English

# Municipality Information Management System (BBYS)

The Municipality Information Management System (BBYS) is a web-based information management system designed to digitize and manage procurement, request, inventory, and tender processes within municipal departments.

The project follows a layered architecture approach, with separate backend and frontend structures.

### 🏗️ Project Architecture

The project consists of the following layers:

- **Domain:** Core entities, enums, and common domain models.
- **Application:** Business logic, services, DTOs, and application interfaces.
- **Infrastructure:** JWT-based authentication and other infrastructure services.
- **Persistence:** Entity Framework Core, database context, Repository, and Unit of Work implementations.
- **WebAPI:** REST API endpoints and controller layer.
- **Frontend:** React-based web interface for system users.

### 🛠️ Technologies

**Backend**
- C#
- ASP.NET Core Web API
- Entity Framework Core
- Microsoft SQL Server
- JWT Authentication

**Frontend**
- React
- TypeScript
- Vite
- CSS

### 📌 Main Modules

- User and authorization management
- Department management
- Material and inventory management
- Request management
- Tender management
- Supplier and offer management
- Document management
- Notification system
- Audit logging and operation tracking

### 🗄️ Database

The system uses a relational database structure implemented with Entity Framework Core.

The main entities include:

`Users`, `Departments`, `Materials`, `MaterialTypes`, `Warehouses`, `Requests`, `RequestItems`, `Tenders`, `Firms`, `FirmOffers`, `ManagementDocuments`, `Notifications`, and `AuditLogs`.

---

## 📚 Project Status

This project is currently under development and is intended for educational and software development purposes.
