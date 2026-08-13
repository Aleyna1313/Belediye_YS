using BBYS.Application.DTOs;

namespace BBYS.Application.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId, int userId);
    Task MarkAllAsReadAsync(int userId);
    Task<bool> DeleteAsync(int notificationId, int userId);
}

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetLogsAsync(int? userId = null, string? module = null);
}
