using Microsoft.AspNetCore.Mvc;
using CozyComfort.API.Data;
using CozyComfort.API.Models;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace CozyComfort.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manufacturer,Distributor")]
    public class ManufacturerOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ManufacturerOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ManufacturerOrderResponseDTO>>> GetManufacturerOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            IQueryable<ManufacturerOrder> query = _context.ManufacturerOrders
                .Include(o => o.Distributor)
                .Include(o => o.ApprovedByUser)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.BlanketModel);

            if (role == "Distributor")
            {
                query = query.Where(o => o.DistributorId == userId);
            }

            var orders = await query.ToListAsync();

            return orders.Select(o => new ManufacturerOrderResponseDTO
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                DistributorId = o.DistributorId,
                DistributorName = o.Distributor.BusinessName ?? o.Distributor.Username,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                ApprovedDate = o.ApprovedDate,
                ApprovedBy = o.ApprovedBy,
                ApprovedByName = o.ApprovedByUser?.Username,
                OrderItems = o.OrderItems.Select(oi => new ManufacturerOrderItemResponseDTO
                {
                    BlanketModelId = oi.BlanketModelId,
                    BlanketModelName = oi.BlanketModel.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.Quantity * oi.UnitPrice
                }).ToList()
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ManufacturerOrderResponseDTO>> GetManufacturerOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            var order = await _context.ManufacturerOrders
                .Include(o => o.Distributor)
                .Include(o => o.ApprovedByUser)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.BlanketModel)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            // Authorization check
            if (role == "Distributor" && order.DistributorId != userId)
            {
                return Forbid();
            }

            return new ManufacturerOrderResponseDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                DistributorId = order.DistributorId,
                DistributorName = order.Distributor.BusinessName ?? order.Distributor.Username,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                ApprovedDate = order.ApprovedDate,
                ApprovedBy = order.ApprovedBy,
                ApprovedByName = order.ApprovedByUser?.Username,
                OrderItems = order.OrderItems.Select(oi => new ManufacturerOrderItemResponseDTO
                {
                    BlanketModelId = oi.BlanketModelId,
                    BlanketModelName = oi.BlanketModel.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.Quantity * oi.UnitPrice
                }).ToList()
            };
        }

        [HttpPost]
        [Authorize(Roles = "Distributor")]
        public async Task<ActionResult<ManufacturerOrderResponseDTO>> PostManufacturerOrder(ManufacturerOrderDTO orderDTO)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            // Validate order items
            if (orderDTO.OrderItems == null || orderDTO.OrderItems.Count == 0)
            {
                return BadRequest("Order must contain at least one item");
            }

            // Check blanket models exist and are active
            var blanketModelIds = orderDTO.OrderItems.Select(oi => oi.BlanketModelId).ToList();
            var validBlanketModels = await _context.BlanketModels
                .Where(bm => blanketModelIds.Contains(bm.Id) && bm.IsActive)
                .Select(bm => bm.Id)
                .ToListAsync();

            if (validBlanketModels.Count != blanketModelIds.Distinct().Count())
            {
                return BadRequest("One or more blanket models are invalid or inactive");
            }

            // Verify distributor is creating order for themselves
            if (orderDTO.DistributorId != userId)
            {
                return Forbid();
            }

            // Generate order number
            var orderNumber = $"MORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var order = new ManufacturerOrder
            {
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                DistributorId = orderDTO.DistributorId,
                Status = "Pending",
                TotalAmount = orderDTO.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice),
                OrderItems = orderDTO.OrderItems.Select(oi => new ManufacturerOrderItem
                {
                    BlanketModelId = oi.BlanketModelId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };

            _context.ManufacturerOrders.Add(order);
            await _context.SaveChangesAsync();

            // Return the created order
            return CreatedAtAction(nameof(GetManufacturerOrder), new { id = order.Id }, new ManufacturerOrderResponseDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                DistributorId = order.DistributorId,
                DistributorName = _context.Users.Find(order.DistributorId).BusinessName ?? _context.Users.Find(order.DistributorId).Username,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                OrderItems = order.OrderItems.Select(oi => new ManufacturerOrderItemResponseDTO
                {
                    BlanketModelId = oi.BlanketModelId,
                    BlanketModelName = _context.BlanketModels.Find(oi.BlanketModelId).Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.Quantity * oi.UnitPrice
                }).ToList()
            });
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Manufacturer")]
        public async Task<IActionResult> ApproveManufacturerOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var order = await _context.ManufacturerOrders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (order.Status != "Pending")
            {
                return BadRequest("Only pending orders can be approved");
            }

            // Check production capacity
            var canFulfill = true;
            foreach (var item in order.OrderItems)
            {
                var capacity = await _context.ProductionCapacities
                    .FirstOrDefaultAsync(pc => pc.BlanketModelId == item.BlanketModelId);

                if (capacity == null || capacity.DailyCapacity - capacity.CurrentProductionQueue < item.Quantity)
                {
                    canFulfill = false;
                    break;
                }
            }

            if (!canFulfill)
            {
                return BadRequest("Insufficient production capacity to fulfill this order");
            }

            // Update production queue
            foreach (var item in order.OrderItems)
            {
                var capacity = await _context.ProductionCapacities
                    .FirstOrDefaultAsync(pc => pc.BlanketModelId == item.BlanketModelId);

                capacity.CurrentProductionQueue += item.Quantity;
            }

            // Update order status
            order.Status = "Approved";
            order.ApprovedDate = DateTime.UtcNow;
            order.ApprovedBy = userId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Manufacturer")]
        public async Task<IActionResult> CompleteManufacturerOrder(int id)
        {
            var order = await _context.ManufacturerOrders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (order.Status != "Approved")
            {
                return BadRequest("Only approved orders can be completed");
            }

            // Update inventory and production queue
            foreach (var item in order.OrderItems)
            {
                // Update manufacturer inventory
                var inventory = await _context.ManufacturerInventories
                    .FirstOrDefaultAsync(mi => mi.BlanketModelId == item.BlanketModelId);

                if (inventory == null)
                {
                    return BadRequest($"Inventory record not found for blanket model {item.BlanketModelId}");
                }

                inventory.Quantity += item.Quantity;
                inventory.LastUpdated = DateTime.UtcNow;

                // Update production queue
                var capacity = await _context.ProductionCapacities
                    .FirstOrDefaultAsync(pc => pc.BlanketModelId == item.BlanketModelId);

                if (capacity == null)
                {
                    return BadRequest($"Production capacity record not found for blanket model {item.BlanketModelId}");
                }

                capacity.CurrentProductionQueue -= item.Quantity;
                capacity.LastUpdated = DateTime.UtcNow;
            }

            // Update order status
            order.Status = "Completed";

            await _context.SaveChangesAsync();

            // Update distributor inventory
            foreach (var item in order.OrderItems)
            {
                var distributorInventory = await _context.DistributorInventories
                    .FirstOrDefaultAsync(di => di.DistributorId == order.DistributorId && 
                                             di.BlanketModelId == item.BlanketModelId);

                if (distributorInventory == null)
                {
                    distributorInventory = new DistributorInventory
                    {
                        DistributorId = order.DistributorId,
                        BlanketModelId = item.BlanketModelId,
                        Quantity = item.Quantity
                    };
                    _context.DistributorInventories.Add(distributorInventory);
                }
                else
                {
                    distributorInventory.Quantity += item.Quantity;
                }

                distributorInventory.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}