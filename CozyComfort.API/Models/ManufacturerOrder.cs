using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class ManufacturerOrder
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(20)]
        public string OrderNumber { get; set; }
        
        [ForeignKey("Distributor")]
        public int DistributorId { get; set; }
        public User Distributor { get; set; }
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [StringLength(20)]
        public string Status { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal TotalAmount { get; set; }
        
        public DateTime? ApprovedDate { get; set; }
        
        [ForeignKey("ApprovedByUser")]
        public int? ApprovedBy { get; set; }
        public User ApprovedByUser { get; set; }
        
        public List<ManufacturerOrderItem> OrderItems { get; set; } = new List<ManufacturerOrderItem>();
    }

    public class ManufacturerOrderItem
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("ManufacturerOrder")]
        public int ManufacturerOrderId { get; set; }
        public ManufacturerOrder ManufacturerOrder { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        [DataType(DataType.Currency)]
        public decimal UnitPrice { get; set; }
    }
}