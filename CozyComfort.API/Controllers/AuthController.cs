using Microsoft.AspNetCore.Mvc;
using CozyComfort.API.Services;
using CozyComfort.API.DTOs;
using CozyComfort.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO registerDTO)
        {
            if (await _authService.UserExists(registerDTO.Username))
                return BadRequest("Username already exists");

            var user = new User
            {
                Username = registerDTO.Username,
                Email = registerDTO.Email,
                RoleId = registerDTO.RoleId,
                BusinessName = registerDTO.BusinessName,
                ContactPerson = registerDTO.ContactPerson,
                Phone = registerDTO.Phone,
                Address = registerDTO.Address
            };

            var registeredUser = await _authService.Register(user, registerDTO.Password);

            return Ok(new
            {
                Id = registeredUser.Id,
                Username = registeredUser.Username,
                RoleId = registeredUser.RoleId
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var token = await _authService.Login(loginDTO.Username, loginDTO.Password);

            if (token == null)
                return Unauthorized();

            return Ok(new { token });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var username = User.FindFirst(ClaimTypes.Name).Value;
            var role = User.FindFirst(ClaimTypes.Role).Value;

            return Ok(new
            {
                Id = userId,
                Username = username,
                Role = role
            });
        }
    }
}