using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(20)]
        public string OrderNumber { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        [ForeignKey("Customer")]
        public int? CustomerId { get; set; }
        public User Customer { get; set; }
        
        [ForeignKey("Seller")]
        public int SellerId { get; set; }
        public User Seller { get; set; }
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal TotalAmount { get; set; }
        
        public string ShippingAddress { get; set; }
        
        [StringLength(20)]
        public string ContactPhone { get; set; }
        
        public string Notes { get; set; }
        
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Order")]
        public int OrderId { get; set; }
        public Order Order { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal UnitPrice { get; set; }
    }
}