using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class DistributorOrder
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(20)]
        public string OrderNumber { get; set; }
        
        [ForeignKey("Seller")]
        public int SellerId { get; set; }
        public User Seller { get; set; }
        
        [ForeignKey("Distributor")]
        public int DistributorId { get; set; }
        public User Distributor { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal TotalAmount { get; set; }
        
        public List<DistributorOrderItem> OrderItems { get; set; } = new List<DistributorOrderItem>();
    }

    public class DistributorOrderItem
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("DistributorOrder")]
        public int DistributorOrderId { get; set; }
        public DistributorOrder DistributorOrder { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal UnitPrice { get; set; }
    }
}