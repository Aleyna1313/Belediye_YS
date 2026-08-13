using BBYS.Application.DTOs;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BBYS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IUnitOfWork unitOfWork, IJwtTokenService jwtTokenService)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var userRepo = _unitOfWork.Repository<User>();
        var user = await userRepo.Query()
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == dto.Username.ToLower());

        if (user == null)
        {
            throw new Exception("Kullanıcı adı veya şifre hatalı.");
        }

        // Basit şifre doğrulaması (Demo için "123456" veya girilen şifre)
        bool isValid = dto.Password == "123456" || user.PasswordHash == dto.Password;
        if (!isValid)
        {
            throw new Exception("Kullanıcı adı veya şifre hatalı.");
        }

        var token = _jwtTokenService.GenerateToken(user);

        var profile = new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name ?? "",
            DepartmentCode = user.Department?.Code ?? "",
            Title = user.Title, // "Şef" veya "Teminci"
            Role = user.Role
        };

        // Audit Log ekleme
        await _unitOfWork.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = user.Id,
            Username = user.Username,
            Action = "LOGIN",
            Module = "Auth",
            Details = $"Kullanıcı sisteme giriş yaptı: {user.FullName} ({user.Title})",
            Timestamp = DateTime.UtcNow
        });
        await _unitOfWork.SaveChangesAsync();

        return new LoginResponseDto
        {
            Token = token,
            User = profile
        };
    }

    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await _unitOfWork.Repository<User>().Query()
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new Exception("Kullanıcı bulunamadı.");

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            Phone = user.Phone,
            DepartmentId = user.DepartmentId,
            DepartmentName = user.Department?.Name ?? "",
            DepartmentCode = user.Department?.Code ?? "",
            Title = user.Title, // "Şef" veya "Teminci"
            Role = user.Role
        };
    }
}
