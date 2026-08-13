using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var list = await _unitOfWork.Repository<Notification>().Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return list.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Title = n.Title,
            Message = n.Message,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
    {
        var n = await _unitOfWork.Repository<Notification>().GetByIdAsync(notificationId);
        if (n == null || n.UserId != userId) return false;

        n.IsRead = true;
        _unitOfWork.Repository<Notification>().Update(n);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var list = await _unitOfWork.Repository<Notification>().Query()
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var n in list)
        {
            n.IsRead = true;
            _unitOfWork.Repository<Notification>().Update(n);
        }
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int notificationId, int userId)
    {
        var n = await _unitOfWork.Repository<Notification>().GetByIdAsync(notificationId);
        if (n == null || n.UserId != userId) return false;

        _unitOfWork.Repository<Notification>().Remove(n);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}

public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;

    public AuditLogService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<AuditLogDto>> GetLogsAsync(int? userId = null, string? module = null)
    {
        var query = _unitOfWork.Repository<AuditLog>().Query().AsQueryable();

        if (userId.HasValue && userId.Value > 0)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(module))
        {
            query = query.Where(a => a.Module == module);
        }

        var logs = await query.OrderByDescending(a => a.Timestamp).Take(100).ToListAsync();

        return logs.Select(a => new AuditLogDto
        {
            Id = a.Id,
            UserId = a.UserId,
            Username = a.Username,
            Action = "LOGIN".Equals(a.Action) ? "Sisteme Giriş" : a.Action,
            Module = a.Module,
            Details = a.Details,
            IpAddress = a.IpAddress,
            Timestamp = a.Timestamp
        }).ToList();
    }
}
