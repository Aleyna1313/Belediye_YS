using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

public class RequestsController : BaseApiController
{
    private readonly IRequestService _requestService;

    public RequestsController(IRequestService requestService)
    {
        _requestService = requestService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRequests([FromQuery] string? status, [FromQuery] bool filterDepartment = true)
    {
        int? deptId = filterDepartment ? CurrentDepartmentId : null;
        var result = await _requestService.GetRequestsAsync(deptId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _requestService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRequestDto dto)
    {
        try
        {
            var result = await _requestService.CreateRequestAsync(dto, CurrentUserId, CurrentDepartmentId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
    {
        var success = await _requestService.UpdateStatusAsync(id, dto.Status, CurrentUserId);
        if (!success) return NotFound();
        return Ok(new { success = true });
    }
}
