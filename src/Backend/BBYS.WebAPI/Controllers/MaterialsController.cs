using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

public class MaterialsController : BaseApiController
{
    private readonly IMaterialService _materialService;

    public MaterialsController(IMaterialService materialService)
    {
        _materialService = materialService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMaterials([FromQuery] int? warehouseId, [FromQuery] int? materialTypeId, [FromQuery] bool filterDepartment = true)
    {
        int? deptId = filterDepartment ? CurrentDepartmentId : null;
        var result = await _materialService.GetMaterialsAsync(warehouseId, materialTypeId, deptId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _materialService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetMaterialTypes()
    {
        var result = await _materialService.GetMaterialTypesAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMaterialDto dto)
    {
        try
        {
            var result = await _materialService.CreateMaterialAsync(dto, CurrentUserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly IMaterialService _materialService;

    public WarehousesController(IMaterialService materialService)
    {
        _materialService = materialService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWarehouses([FromQuery] int? departmentId)
    {
        var result = await _materialService.GetWarehousesAsync(departmentId);
        return Ok(result);
    }
}
