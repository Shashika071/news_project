using System.ComponentModel.DataAnnotations;

namespace CozyComfort.API.Models
{
    public class BlanketModel
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Material { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Size { get; set; }
        
        [Required]
        public decimal Weight { get; set; }
        
        [Required]
        [DataType(DataType.Currency)]
        public decimal ManufacturerPrice { get; set; }
        
        [Required]
        [DataType(DataType.Currency)]
        public decimal RetailPrice { get; set; }
        
        [StringLength(255)]
        public string ImageUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}