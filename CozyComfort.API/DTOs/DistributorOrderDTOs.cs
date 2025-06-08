using System;
using System.Collections.Generic;

namespace CozyComfort.API.DTOs
{
    public class DistributorOrderDTO
    {
        public int SellerId { get; set; }
        public int DistributorId { get; set; }
        public List<DistributorOrderItemDTO> OrderItems { get; set; } = new List<DistributorOrderItemDTO>();
    }

    public class DistributorOrderItemDTO
    {
        public int BlanketModelId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class DistributorOrderResponseDTO
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public int SellerId { get; set; }
        public string SellerName { get; set; }
        public int DistributorId { get; set; }
        public string DistributorName { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public List<DistributorOrderItemResponseDTO> OrderItems { get; set; } = new List<DistributorOrderItemResponseDTO>();
    }

    public class DistributorOrderItemResponseDTO
    {
        public int BlanketModelId { get; set; }
        public string BlanketModelName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}