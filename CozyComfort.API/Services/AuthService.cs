using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CozyComfort.API.Data;
using CozyComfort.API.Models;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;

namespace CozyComfort.API.Services
{
    public interface IAuthService
    {
        Task<User> Register(User user, string password);
        Task<string> Login(string username, string password);
        Task<bool> UserExists(string username);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<User> Register(User user, string password)
        {
            if (await UserExists(user.Username))
                throw new Exception("Username already exists");

      using var hmac = new System.Security.Cryptography.HMACSHA512();
user.PasswordSalt = hmac.Key;
user.PasswordHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));


            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return user;
        }

        public async Task<string> Login(string username, string password)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null || !VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
                return null;

            return GenerateJwtToken(user);
        }

        public async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

       private bool VerifyPasswordHash(string password, string storedHash, byte[] storedSalt)
{
    var computedHash = new System.Security.Cryptography.HMACSHA512(storedSalt)
        .ComputeHash(Encoding.UTF8.GetBytes(password));

    var originalHash = Convert.FromBase64String(storedHash);

    return computedHash.SequenceEqual(originalHash);
}


        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(_configuration["Jwt:Key"]));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryInMinutes"])),
                SigningCredentials = creds,
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}