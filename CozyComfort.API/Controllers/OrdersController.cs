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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var role = User.FindFirst(ClaimTypes.Role).Value;

            IQueryable<Order> query = _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Seller)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.BlanketModel);

            switch (role)
            {
                case "Customer":
                    query = query.Where(o => o.CustomerId == userId);
                    break;
                case "Seller":
                    query = query.Where(o => o.SellerId == userId);
                    break;
                case "Distributor":
                    // Distributors don't directly see customer orders
                    return Forbid();
                case "Manufacturer":
                    // Manufacturers don't directly see customer orders
                    return Forbid();
                default:
                    return Forbid();
            }

            var orders = await query.ToListAsync();

            return orders.Select(o => new OrderResponseDTO
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.OrderDate,
                CustomerId = o.CustomerId,
                CustomerName = o.Customer?.BusinessName ?? o.Customer?.Username,
                SellerId = o.SellerId,
                SellerName = o.Seller.BusinessName ?? o.Seller.Username,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                ShippingAddress = o.ShippingAddress,
                ContactPhone = o.ContactPhone,
                Notes = o.Notes,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponseDTO
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
public async Task<ActionResult<OrderResponseDTO>> GetOrder(int id)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    var role = User.FindFirst(ClaimTypes.Role).Value;

    var order = await _context.Orders
        .Include(o => o.Seller)  // Still include seller
        .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.BlanketModel)
        .FirstOrDefaultAsync(o => o.Id == id);

    if (order == null)
    {
        return NotFound();
    }

    // Authorization check
    if ((role == "Customer" && order.CustomerId != userId) ||
        (role == "Seller" && order.SellerId != userId))
    {
        return Forbid();
    }

    // Fetch customer separately if CustomerId exists
    string customerName = "Customer";
    if (order.CustomerId.HasValue)
    {
        var customer = await _context.Users
            .Where(u => u.Id == order.CustomerId.Value)
            .Select(u => new { u.Username, u.BusinessName })
            .FirstOrDefaultAsync();

        customerName = customer?.BusinessName ?? customer?.Username ?? "Customer";
    }

    return new OrderResponseDTO
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        OrderDate = order.OrderDate,
        CustomerId = order.CustomerId,
        CustomerName = customerName,  // Use the fetched name
        SellerId = order.SellerId,
        SellerName = order.Seller.BusinessName ?? order.Seller.Username,
        Status = order.Status,
        TotalAmount = order.TotalAmount,
        ShippingAddress = order.ShippingAddress,
        ContactPhone = order.ContactPhone,
        Notes = order.Notes,
        OrderItems = order.OrderItems.Select(oi => new OrderItemResponseDTO
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
        [Authorize(Roles = "Customer,Seller")]
        public async Task<ActionResult<OrderResponseDTO>> PostOrder(OrderDTO orderDTO)
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

            // For customers, set customer ID from auth
            if (role == "Customer")
            {
                orderDTO.CustomerId = userId;
            }

            // For sellers, verify they're creating order for themselves
            if (role == "Seller" && orderDTO.SellerId != userId)
            {
                return Forbid();
            }

            // Generate order number
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var order = new Order
            {
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                CustomerId = orderDTO.CustomerId,
                SellerId = orderDTO.SellerId,
                Status = "Pending",
                TotalAmount = orderDTO.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice),
                ShippingAddress = orderDTO.ShippingAddress,
                ContactPhone = orderDTO.ContactPhone,
                Notes = orderDTO.Notes,
                OrderItems = orderDTO.OrderItems.Select(oi => new OrderItem
                {
                    BlanketModelId = oi.BlanketModelId,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Return the created order
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new OrderResponseDTO
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                CustomerId = order.CustomerId,
                SellerId = order.SellerId,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                ShippingAddress = order.ShippingAddress,
                ContactPhone = order.ContactPhone,
                Notes = order.Notes,
                OrderItems = order.OrderItems.Select(oi => new OrderItemResponseDTO
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
public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
    var role = User.FindFirst(ClaimTypes.Role).Value;

    // Include order items in the query
    var order = await _context.Orders
        .Include(o => o.OrderItems)
        .FirstOrDefaultAsync(o => o.Id == id);
    
    if (order == null)
    {
        return NotFound();
    }

    // Authorization check
    if ((role == "Customer" && order.CustomerId != userId) ||
        (role == "Seller" && order.SellerId != userId))
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

    // If status is being updated to "Delivered", reduce inventory
    if (status == "Delivered" && order.Status != "Delivered")
    {
        foreach (var orderItem in order.OrderItems)
        {
            var inventory = await _context.SellerInventories
                .FirstOrDefaultAsync(si => 
                    si.SellerId == order.SellerId && 
                    si.BlanketModelId == orderItem.BlanketModelId);
            
            if (inventory == null)
            {
                return BadRequest($"Inventory not found for product ID {orderItem.BlanketModelId}");
            }

            if (inventory.Quantity < orderItem.Quantity)
            {
                return BadRequest($"Insufficient inventory for product ID {orderItem.BlanketModelId}. Available: {inventory.Quantity}, Requested: {orderItem.Quantity}");
            }

            inventory.Quantity -= orderItem.Quantity;
            inventory.LastUpdated = DateTime.UtcNow;
        }
    }

    order.Status = status;
    await _context.SaveChangesAsync();

    return NoContent();
}
    }
}