using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        var deps = await _unitOfWork.Repository<Department>().Query()
            .Include(d => d.Users)
            .ToListAsync();

        return deps.Select(d => new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            Code = d.Code,
            Description = d.Description,
            IsActive = d.IsActive,
            UserCount = d.Users.Count
        }).ToList();
    }

    public async Task<DepartmentDto?> GetByIdAsync(int id)
    {
        var d = await _unitOfWork.Repository<Department>().Query()
            .Include(dep => dep.Users)
            .FirstOrDefaultAsync(dep => dep.Id == id);

        if (d == null) return null;

        return new DepartmentDto
        {
            Id = d.Id,
            Name = d.Name,
            Code = d.Code,
            Description = d.Description,
            IsActive = d.IsActive,
            UserCount = d.Users.Count
        };
    }
}
