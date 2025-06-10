using Microsoft.AspNetCore.Mvc;
using CozyComfort.API.Data;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("manufacturer")]
        [Authorize(Roles = "Manufacturer")]
        public async Task<ActionResult<IEnumerable<InventoryDTO>>> GetManufacturerInventory()
        {
            return await _context.ManufacturerInventories
                .Include(mi => mi.BlanketModel)
                .Where(mi => mi.BlanketModel.IsActive)
                .Select(mi => new InventoryDTO
                {
                    BlanketModelId = mi.BlanketModelId,
                    BlanketModelName = mi.BlanketModel.Name,
                    Quantity = mi.Quantity
                })
                .ToListAsync();
        }

        [HttpGet("distributor")]
        [Authorize(Roles = "Distributor")]
        public async Task<ActionResult<IEnumerable<InventoryDTO>>> GetDistributorInventory()
        {
            var distributorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            return await _context.DistributorInventories
                .Include(di => di.BlanketModel)
                .Where(di => di.DistributorId == distributorId && di.BlanketModel.IsActive)
                .Select(di => new InventoryDTO
                {
                    BlanketModelId = di.BlanketModelId,
                    BlanketModelName = di.BlanketModel.Name,
                    Quantity = di.Quantity
                })
                .ToListAsync();
        }

        [HttpGet("seller")]
        [Authorize(Roles = "Seller")]
        public async Task<ActionResult<IEnumerable<InventoryDTO>>> GetSellerInventory()
        {
            var sellerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            return await _context.SellerInventories
                .Include(si => si.BlanketModel)
                .Where(si => si.SellerId == sellerId && si.BlanketModel.IsActive)
                .Select(si => new InventoryDTO
                {
                    BlanketModelId = si.BlanketModelId,
                    BlanketModelName = si.BlanketModel.Name,
                    Quantity = si.Quantity
                })
                .ToListAsync();
        }

        public class QuantityUpdateDto
{
    public int Quantity { get; set; }
}

[HttpPut("manufacturer/{blanketModelId}")]
[Authorize(Roles = "Manufacturer")]
public async Task<IActionResult> UpdateManufacturerInventory(int blanketModelId, [FromBody] QuantityUpdateDto request)
{
    var inventory = await _context.ManufacturerInventories
        .FirstOrDefaultAsync(mi => mi.BlanketModelId == blanketModelId);

    if (inventory == null)
    {
        return NotFound();
    }

    inventory.Quantity = request.Quantity;
    inventory.LastUpdated = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return NoContent();
}


        [HttpPut("distributor/{blanketModelId}")]
        [Authorize(Roles = "Distributor")]
        public async Task<IActionResult> UpdateDistributorInventory(int blanketModelId, [FromBody] int quantity)
        {
            var distributorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var inventory = await _context.DistributorInventories
                .FirstOrDefaultAsync(di => di.DistributorId == distributorId && di.BlanketModelId == blanketModelId);

            if (inventory == null)
            {
                return NotFound();
            }

            inventory.Quantity = quantity;
            inventory.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("seller/{blanketModelId}")]
        [Authorize(Roles = "Seller")]
        public async Task<IActionResult> UpdateSellerInventory(int blanketModelId, [FromBody] int quantity)
        {
            var sellerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var inventory = await _context.SellerInventories
                .FirstOrDefaultAsync(si => si.SellerId == sellerId && si.BlanketModelId == blanketModelId);

            if (inventory == null)
            {
                return NotFound();
            }

            inventory.Quantity = quantity;
            inventory.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}