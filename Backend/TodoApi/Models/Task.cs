using System;
using System.ComponentModel.DataAnnotations;

namespace TodoApi.Models
{
    public class Task
    {
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(256)]
        [MinLength(11, ErrorMessage = "Task title must be longer than 10 characters")]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public bool Done { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
