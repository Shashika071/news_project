namespace CozyComfort.API.DTOs
{
    public class BlanketModelDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Material { get; set; }
        public string Size { get; set; }
        public decimal Weight { get; set; }
        public decimal ManufacturerPrice { get; set; }
        public decimal RetailPrice { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
    }

    public class InventoryDTO
    {
        public int BlanketModelId { get; set; }
        public string BlanketModelName { get; set; }
        public int Quantity { get; set; }
    }

    public class ProductionCapacityDTO
    {
        public int BlanketModelId { get; set; }
        public string BlanketModelName { get; set; }
        public int DailyCapacity { get; set; }
        public int CurrentProductionQueue { get; set; }
    }
}