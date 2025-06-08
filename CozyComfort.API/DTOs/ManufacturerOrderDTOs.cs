using System;
using System.Collections.Generic;

namespace CozyComfort.API.DTOs
{
    public class ManufacturerOrderDTO
    {
        public int DistributorId { get; set; }
        public List<ManufacturerOrderItemDTO> OrderItems { get; set; } = new List<ManufacturerOrderItemDTO>();
    }

    public class ManufacturerOrderItemDTO
    {
        public int BlanketModelId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class ManufacturerOrderResponseDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public int DistributorId { get; set; }
        public string DistributorName { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? ApprovedBy { get; set; }
        public string ApprovedByName { get; set; }
        public List<ManufacturerOrderItemResponseDTO> OrderItems { get; set; } = new List<ManufacturerOrderItemResponseDTO>();
    }

    public class ManufacturerOrderItemResponseDTO
    {
        public int BlanketModelId { get; set; }
        public string BlanketModelName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}