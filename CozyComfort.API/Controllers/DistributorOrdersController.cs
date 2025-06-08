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
    [Authorize(Roles = "Distributor,Seller")]
    public class DistributorOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DistributorOrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DistributorOrderResponseDTO>>> GetDistributorOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            IQueryable<DistributorOrder> query = _context.DistributorOrders
                .Include(o => o.Seller)
                .Include(o => o.Distributor)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.BlanketModel);

            if (role == "Seller")
            {
                query = query.Where(o => o.SellerId == userId);
            }
            else if (role == "Distributor")
            {
                query = query.Where(o => o.DistributorId == userId);
            }

            var orders = await query.ToListAsync();

            return orders.Select(o => new DistributorOrderResponseDTO
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                SellerId = o.SellerId,
                SellerName = o.Seller.BusinessName ?? o.Seller.Username,
                DistributorId = o.DistributorId,
                DistributorName = o.Distributor.BusinessName ?? o.Distributor.Username,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                OrderItems = o.OrderItems.Select(oi => new DistributorOrderItemResponseDTO
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
        public async Task<ActionResult<DistributorOrderResponseDTO>> GetDistributorOrder(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            var order = await _context.DistributorOrders
                .Include(o => o.Seller)
                .Include(o => o.Distributor)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.BlanketModel)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            // Authorization check
            if ((role == "Seller" && order.SellerId != userId) ||
                (role == "Distributor" && order.DistributorId != userId))
            {
                return Forbid();
            }

            return new DistributorOrderResponseDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                SellerId = order.SellerId,
                SellerName = order.Seller.BusinessName ?? order.Seller.Username,
                DistributorId = order.DistributorId,
                DistributorName = order.Distributor.BusinessName ?? order.Distributor.Username,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                OrderItems = order.OrderItems.Select(oi => new DistributorOrderItemResponseDTO
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
        [Authorize(Roles = "Seller")]
        public async Task<ActionResult<DistributorOrderResponseDTO>> PostDistributorOrder(DistributorOrderDTO orderDTO)
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

            // Verify seller is creating order for themselves
            if (orderDTO.SellerId != userId)
            {
                return Forbid();
            }

            // Verify distributor exists
            var distributor = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == orderDTO.DistributorId && u.Role.Name == "Distributor");

            if (distributor == null)
            {
                return BadRequest("Invalid distributor");
            }

            // Generate order number
            var orderNumber = $"DORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var order = new DistributorOrder
            {
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                SellerId = orderDTO.SellerId,
                DistributorId = orderDTO.DistributorId,
                Status = "Pending",
                TotalAmount = orderDTO.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice),
                OrderItems = orderDTO.OrderItems.Select(oi => new DistributorOrderItem
                {
                    BlanketModelId = oi.BlanketModelId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };

            _context.DistributorOrders.Add(order);
            await _context.SaveChangesAsync();

            // Return the created order
            return CreatedAtAction(nameof(GetDistributorOrder), new { id = order.Id }, new DistributorOrderResponseDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                SellerId = order.SellerId,
                SellerName = _context.Users.Find(order.SellerId).BusinessName ?? _context.Users.Find(order.SellerId).Username,
                DistributorId = order.DistributorId,
                DistributorName = distributor.BusinessName ?? distributor.Username,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                OrderItems = order.OrderItems.Select(oi => new DistributorOrderItemResponseDTO
                {
                    BlanketModelId = oi.BlanketModelId,
                    BlanketModelName = _context.BlanketModels.Find(oi.BlanketModelId).Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.Quantity * oi.UnitPrice
                }).ToList()
            });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateDistributorOrderStatus(int id, [FromBody] string status)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            var order = await _context.DistributorOrders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            // Authorization check
            if ((role == "Seller" && order.SellerId != userId) ||
                (role == "Distributor" && order.DistributorId != userId))
            {
                return Forbid();
            }

            // Validate status transition
            var validTransitions = new Dictionary<string, List<string>>
            {
                ["Pending"] = new List<string> { "Processing", "Cancelled" },
                ["Processing"] = new List<string> { "Shipped", "Cancelled" },
                ["Shipped"] = new List<string> { "Delivered" }
            };

            if (!validTransitions.ContainsKey(order.Status) || 
                !validTransitions[order.Status].Contains(status))
            {
                return BadRequest("Invalid status transition");
            }

            order.Status = status;
            await _context.SaveChangesAsync();

            // If order is being processed, check inventory and potentially create manufacturer order
            if (role == "Distributor" && status == "Processing")
            {
                await ProcessDistributorOrder(order);
            }

            return NoContent();
        }

        private async Task ProcessDistributorOrder(DistributorOrder order)
        {
            var orderItems = await _context.DistributorOrderItems
                .Include(oi => oi.BlanketModel)
                .Where(oi => oi.DistributorOrderId == order.Id)
                .ToListAsync();

            var insufficientInventoryItems = new List<DistributorOrderItem>();
            var manufacturerOrderItems = new List<ManufacturerOrderItemDTO>();

            foreach (var item in orderItems)
            {
                var distributorInventory = await _context.DistributorInventories
                    .FirstOrDefaultAsync(di => di.DistributorId == order.DistributorId && 
                                              di.BlanketModelId == item.BlanketModelId);

                if (distributorInventory == null || distributorInventory.Quantity < item.Quantity)
                {
                    insufficientInventoryItems.Add(item);
                    var neededQuantity = item.Quantity - (distributorInventory?.Quantity ?? 0);
                    manufacturerOrderItems.Add(new ManufacturerOrderItemDTO
                    {
                        BlanketModelId = item.BlanketModelId,
                        Quantity = neededQuantity,
                        UnitPrice = item.BlanketModel.ManufacturerPrice
                    });
                }
            }

            if (manufacturerOrderItems.Count > 0)
            {
                // Create manufacturer order for insufficient items
                var manufacturerOrder = new ManufacturerOrderDTO
                {
                    DistributorId = order.DistributorId,
                    OrderItems = manufacturerOrderItems
                };

                // This would call the ManufacturerOrdersController's PostManufacturerOrder action
                // In a real application, you might use an internal service or mediator pattern
                // For simplicity, we'll directly create the order here
                var orderNumber = $"MORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

                var newManufacturerOrder = new ManufacturerOrder
                {
                    OrderNumber = orderNumber,
                    OrderDate = DateTime.UtcNow,
                    DistributorId = manufacturerOrder.DistributorId,
                    Status = "Pending",
                    TotalAmount = manufacturerOrder.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice),
                    OrderItems = manufacturerOrder.OrderItems.Select(oi => new ManufacturerOrderItem
                    {
                        BlanketModelId = oi.BlanketModelId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice
                    }).ToList()
                };

                _context.ManufacturerOrders.Add(newManufacturerOrder);
                await _context.SaveChangesAsync();
            }
        }
    }
}