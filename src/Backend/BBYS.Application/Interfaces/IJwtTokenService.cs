using BBYS.Domain.Entities;

namespace BBYS.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}
