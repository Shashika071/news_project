using AutoMapper;
using CozyComfort.API.DTOs;
using CozyComfort.API.Models;

namespace CozyComfort.API
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<RegisterDTO, User>();
            CreateMap<User, UserDTO>();

            // Blanket model mappings
            CreateMap<BlanketModel, BlanketModelDTO>();
            CreateMap<BlanketModelDTO, BlanketModel>();

            // Order mappings
            CreateMap<Order, OrderResponseDTO>();
            CreateMap<OrderDTO, Order>();
            CreateMap<OrderItem, OrderItemResponseDTO>();
            CreateMap<OrderItemDTO, OrderItem>();

            // Distributor order mappings
            CreateMap<DistributorOrder, DistributorOrderResponseDTO>();
            CreateMap<DistributorOrderDTO, DistributorOrder>();
            CreateMap<DistributorOrderItem, DistributorOrderItemResponseDTO>();
            CreateMap<DistributorOrderItemDTO, DistributorOrderItem>();

            // Manufacturer order mappings
            CreateMap<ManufacturerOrder, ManufacturerOrderResponseDTO>();
            CreateMap<ManufacturerOrderDTO, ManufacturerOrder>();
            CreateMap<ManufacturerOrderItem, ManufacturerOrderItemResponseDTO>();
            CreateMap<ManufacturerOrderItemDTO, ManufacturerOrderItem>();
        }
    }
}