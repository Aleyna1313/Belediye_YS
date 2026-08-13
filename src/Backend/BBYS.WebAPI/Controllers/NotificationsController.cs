using BBYS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var result = await _notificationService.GetUserNotificationsAsync(CurrentUserId);
        return Ok(result);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var success = await _notificationService.MarkAsReadAsync(id, CurrentUserId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(CurrentUserId);
        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _notificationService.DeleteAsync(id, CurrentUserId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
