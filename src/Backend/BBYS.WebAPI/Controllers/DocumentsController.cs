using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBYS.WebAPI.Controllers;

public class DocumentsController : BaseApiController
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments([FromQuery] int? requestId, [FromQuery] int? tenderId, [FromQuery] bool filterDepartment = true)
    {
        int? deptId = filterDepartment ? CurrentDepartmentId : null;
        var result = await _documentService.GetDocumentsAsync(requestId, tenderId, deptId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _documentService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateDocument([FromBody] CreateDocumentDto dto)
    {
        try
        {
            var result = await _documentService.CreateDocumentAsync(dto, CurrentUserId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class AuditLogsController : BaseApiController
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] int? userId, [FromQuery] string? module)
    {
        var result = await _auditLogService.GetLogsAsync(userId, module);
        return Ok(result);
    }
}
