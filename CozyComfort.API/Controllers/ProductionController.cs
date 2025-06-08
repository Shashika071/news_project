using Microsoft.AspNetCore.Mvc;
using CozyComfort.API.Data;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manufacturer")]
    public class ProductionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductionCapacityDTO>>> GetProductionCapacities()
        {
            return await _context.ProductionCapacities
                .Include(pc => pc.BlanketModel)
                .Where(pc => pc.BlanketModel.IsActive)
                .Select(pc => new ProductionCapacityDTO
                {
                    BlanketModelId = pc.BlanketModelId,
                    BlanketModelName = pc.BlanketModel.Name,
                    DailyCapacity = pc.DailyCapacity,
                    CurrentProductionQueue = pc.CurrentProductionQueue
                })
                .ToListAsync();
        }

        [HttpPut("{blanketModelId}")]
        public async Task<IActionResult> UpdateProductionCapacity(int blanketModelId, ProductionCapacityDTO capacityDTO)
        {
            if (blanketModelId != capacityDTO.BlanketModelId)
            {
                return BadRequest();
            }

            var capacity = await _context.ProductionCapacities
                .FirstOrDefaultAsync(pc => pc.BlanketModelId == blanketModelId);

            if (capacity == null)
            {
                return NotFound();
            }

            capacity.DailyCapacity = capacityDTO.DailyCapacity;
            capacity.CurrentProductionQueue = capacityDTO.CurrentProductionQueue;
            capacity.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}