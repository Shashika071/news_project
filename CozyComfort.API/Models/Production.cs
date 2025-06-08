using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class ProductionCapacity
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("BlanketModel")]
        public int BlanketModelId { get; set; }
        public BlanketModel BlanketModel { get; set; }
        
        public int DailyCapacity { get; set; }
        
        public int CurrentProductionQueue { get; set; } = 0;
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}