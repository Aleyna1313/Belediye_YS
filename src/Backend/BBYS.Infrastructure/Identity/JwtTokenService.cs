using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BBYS.Application.Interfaces;
using BBYS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BBYS.Infrastructure.Identity;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var secretKey = _configuration["JwtSettings:Secret"] ?? "BBYS_SUPER_SECRET_SECURITY_KEY_2026_BELEDIYE_OTOMASYONU_998877";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("FullName", user.FullName ?? ""),
            new Claim("Email", user.Email ?? ""),
            new Claim("DepartmentId", user.DepartmentId.ToString()),
            new Claim("DepartmentName", user.Department?.Name ?? ""),
            new Claim("DepartmentCode", user.Department?.Code ?? ""),
            new Claim("Title", user.Title ?? "Şef"), // "Şef" veya "Teminci"
            new Claim(ClaimTypes.Role, user.Role ?? "User")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"] ?? "BBYS.API",
            audience: _configuration["JwtSettings:Audience"] ?? "BBYS.Client",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
