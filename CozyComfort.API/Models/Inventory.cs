using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class ManufacturerInventory
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class DistributorInventory
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Distributor")]
        public int DistributorId { get; set; }
        public User Distributor { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    public class SellerInventory
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Seller")]
        public int SellerId { get; set; }
        public User Seller { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int Quantity { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}