using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out var id) ? id : 1; // Default to admin for unauthenticated testing
        }
    }

    protected int CurrentDepartmentId
    {
        get
        {
            var claim = User.FindFirst("DepartmentId")?.Value;
            return int.TryParse(claim, out var id) ? id : 1;
        }
    }

    protected string CurrentUserTitle
    {
        get
        {
            return User.FindFirst("Title")?.Value ?? "Şef"; // "Şef" veya "Teminci"
        }
    }
}
