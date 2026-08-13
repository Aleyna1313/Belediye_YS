using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

public class TendersController : BaseApiController
{
    private readonly ITenderService _tenderService;

    public TendersController(ITenderService tenderService)
    {
        _tenderService = tenderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTenders([FromQuery] string? status, [FromQuery] bool filterDepartment = true)
    {
        int? deptId = filterDepartment ? CurrentDepartmentId : null;
        var result = await _tenderService.GetTendersAsync(deptId, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _tenderService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTenderDto dto)
    {
        try
        {
            var result = await _tenderService.CreateTenderAsync(dto, CurrentUserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("firms")]
    public async Task<IActionResult> GetFirms()
    {
        var result = await _tenderService.GetFirmsAsync();
        return Ok(result);
    }

    [HttpPost("firms")]
    public async Task<IActionResult> CreateFirm([FromBody] FirmDto dto)
    {
        var result = await _tenderService.CreateFirmAsync(dto);
        return Ok(result);
    }

    [HttpPost("{id}/offers")]
    public async Task<IActionResult> AddOffer(int id, [FromBody] CreateFirmOfferDto dto)
    {
        try
        {
            dto.TenderId = id;
            var result = await _tenderService.AddOfferAsync(dto, CurrentUserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/compare")]
    public async Task<IActionResult> CompareOffers(int id)
    {
        var result = await _tenderService.GetOfferComparisonAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id}/complete")]
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteTender(int id, [FromBody] CompleteTenderDto dto)
    {
        try
        {
            var result = await _tenderService.CompleteTenderAsync(id, dto, CurrentUserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
