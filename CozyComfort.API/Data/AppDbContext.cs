using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Models;

namespace CozyComfort.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<BlanketModel> BlanketModels { get; set; }
        public DbSet<ManufacturerInventory> ManufacturerInventories { get; set; }
        public DbSet<DistributorInventory> DistributorInventories { get; set; }
        public DbSet<SellerInventory> SellerInventories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<ProductionCapacity> ProductionCapacities { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ManufacturerInventory>()
                .HasIndex(mi => mi.BlanketModelId)
                .IsUnique();

            modelBuilder.Entity<DistributorInventory>()
                .HasIndex(di => new { di.DistributorId, di.BlanketModelId })
                .IsUnique();

            modelBuilder.Entity<SellerInventory>()
                .HasIndex(si => new { si.SellerId, si.BlanketModelId })
                .IsUnique();

            modelBuilder.Entity<ProductionCapacity>()
                .HasIndex(pc => pc.BlanketModelId)
                .IsUnique();
        }
    }
}