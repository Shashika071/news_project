using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CozyComfort.API.Data;
using CozyComfort.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UsersController(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Get all distributors
        /// </summary>
        [HttpGet("distributors")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetDistributors()
        {
            var distributors = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "Distributor")
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<UserDTO>>(distributors));
        }

        /// <summary>
        /// Get all sellers
        /// </summary>
        [HttpGet("sellers")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetSellers()
        {
            var sellers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "Seller")
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<UserDTO>>(sellers));
        }

        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return _mapper.Map<UserDTO>(user);
        }
    }
}