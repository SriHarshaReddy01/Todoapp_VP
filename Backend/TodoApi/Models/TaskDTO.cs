using System;

namespace TodoApi.Models
{
    public class TaskDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? DueDate { get; set; }  // ISO 8601 format
        public bool Done { get; set; }
        public string CreatedAt { get; set; } = string.Empty;  // ISO 8601 format
        public string UpdatedAt { get; set; } = string.Empty;  // ISO 8601 format
    }
}
