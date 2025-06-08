using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CozyComfort.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [ForeignKey("Role")]
        public int RoleId { get; set; }
        public Role Role { get; set; }
        
        [StringLength(100)]
        public string BusinessName { get; set; }
        
        [StringLength(100)]
        public string ContactPerson { get; set; }
        
        [StringLength(20)]
        public string Phone { get; set; }
        
        public string Address { get; set; }
    }

    public class Role
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; }
        
        [StringLength(255)]
        public string Description { get; set; }
    }
}