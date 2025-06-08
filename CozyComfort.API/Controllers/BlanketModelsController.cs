using Microsoft.AspNetCore.Mvc;
using CozyComfort.API.Data;
using CozyComfort.API.Models;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BlanketModelsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BlanketModelsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<BlanketModelDTO>>> GetBlanketModels()
        {
            return await _context.BlanketModels
                .Where(b => b.IsActive)
                .Select(b => new BlanketModelDTO
                {
                    Id = b.Id,
                    Name = b.Name,
                    Description = b.Description,
                    Material = b.Material,
                    Size = b.Size,
                    Weight = b.Weight,
                    ManufacturerPrice = b.ManufacturerPrice,
                    RetailPrice = b.RetailPrice,
                    ImageUrl = b.ImageUrl,
                    IsActive = b.IsActive
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<BlanketModelDTO>> GetBlanketModel(int id)
        {
            var blanketModel = await _context.BlanketModels.FindAsync(id);

            if (blanketModel == null || !blanketModel.IsActive)
            {
                return NotFound();
            }

            return new BlanketModelDTO
            {
                Id = blanketModel.Id,
                Name = blanketModel.Name,
                Description = blanketModel.Description,
                Material = blanketModel.Material,
                Size = blanketModel.Size,
                Weight = blanketModel.Weight,
                ManufacturerPrice = blanketModel.ManufacturerPrice,
                RetailPrice = blanketModel.RetailPrice,
                ImageUrl = blanketModel.ImageUrl,
                IsActive = blanketModel.IsActive
            };
        }

        [HttpPost]
        [Authorize(Roles = "Manufacturer")]
        public async Task<ActionResult<BlanketModelDTO>> PostBlanketModel(BlanketModelDTO blanketModelDTO)
        {
            var blanketModel = new BlanketModel
            {
                Name = blanketModelDTO.Name,
                Description = blanketModelDTO.Description,
                Material = blanketModelDTO.Material,
                Size = blanketModelDTO.Size,
                Weight = blanketModelDTO.Weight,
                ManufacturerPrice = blanketModelDTO.ManufacturerPrice,
                RetailPrice = blanketModelDTO.RetailPrice,
                ImageUrl = blanketModelDTO.ImageUrl,
                IsActive = blanketModelDTO.IsActive
            };

            _context.BlanketModels.Add(blanketModel);
            await _context.SaveChangesAsync();

            // Create inventory entry
            var inventory = new ManufacturerInventory
            {
                BlanketModelId = blanketModel.Id,
                Quantity = 0
            };
            _context.ManufacturerInventories.Add(inventory);

            // Create production capacity entry
            var capacity = new ProductionCapacity
            {
                BlanketModelId = blanketModel.Id,
                DailyCapacity = 100 // Default capacity
            };
            _context.ProductionCapacities.Add(capacity);

            await _context.SaveChangesAsync();

            blanketModelDTO.Id = blanketModel.Id;
            return CreatedAtAction(nameof(GetBlanketModel), new { id = blanketModel.Id }, blanketModelDTO);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Manufacturer")]
        public async Task<IActionResult> PutBlanketModel(int id, BlanketModelDTO blanketModelDTO)
        {
            if (id != blanketModelDTO.Id)
            {
                return BadRequest();
            }

            var blanketModel = await _context.BlanketModels.FindAsync(id);
            if (blanketModel == null)
            {
                return NotFound();
            }

            blanketModel.Name = blanketModelDTO.Name;
            blanketModel.Description = blanketModelDTO.Description;
            blanketModel.Material = blanketModelDTO.Material;
            blanketModel.Size = blanketModelDTO.Size;
            blanketModel.Weight = blanketModelDTO.Weight;
            blanketModel.ManufacturerPrice = blanketModelDTO.ManufacturerPrice;
            blanketModel.RetailPrice = blanketModelDTO.RetailPrice;
            blanketModel.ImageUrl = blanketModelDTO.ImageUrl;
            blanketModel.IsActive = blanketModelDTO.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BlanketModelExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manufacturer")]
        public async Task<IActionResult> DeleteBlanketModel(int id)
        {
            var blanketModel = await _context.BlanketModels.FindAsync(id);
            if (blanketModel == null)
            {
                return NotFound();
            }

            // Soft delete
            blanketModel.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BlanketModelExists(int id)
        {
            return _context.BlanketModels.Any(e => e.Id == id);
        }
    }
}