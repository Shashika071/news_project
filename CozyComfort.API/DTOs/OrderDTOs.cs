using System.ComponentModel.DataAnnotations;

namespace CozyComfort.API.DTOs
{
    public class OrderItemDTO
    {
        [Required]
        public int BlanketModelId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }

    public class OrderDTO
    {
        public string OrderNumber { get; set; }
        public int? CustomerId { get; set; }
        public int SellerId { get; set; }
        public string Status { get; set; }
        public string ShippingAddress { get; set; }
        public string ContactPhone { get; set; }
        public string Notes { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
    }

    public class OrderResponseDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public int? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int SellerId { get; set; }
        public string SellerName { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; }
        public string ContactPhone { get; set; }
        public string Notes { get; set; }
        public List<OrderItemResponseDTO> OrderItems { get; set; } = new List<OrderItemResponseDTO>();
    }

    public class OrderItemResponseDTO
    {
        public int BlanketModelId { get; set; }
        public string BlanketModelName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}