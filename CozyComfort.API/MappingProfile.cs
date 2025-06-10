using AutoMapper;
using CozyComfort.API.DTOs;
using CozyComfort.API.Models;

namespace CozyComfort.API
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {  
         
            CreateMap<User, UserDTO>()
    .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.Name));
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

            CreateMap<ManufacturerOrder, ManufacturerOrderResponseDTO>();
            CreateMap<ManufacturerOrderDTO, ManufacturerOrder>();
            CreateMap<ManufacturerOrderItem, ManufacturerOrderItemResponseDTO>();
            CreateMap<ManufacturerOrderItemDTO, ManufacturerOrderItem>();
        }
    }
}