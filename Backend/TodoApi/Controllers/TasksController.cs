using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers
{
    // DTO for toggle status request
    public class ToggleStatusDTO
    {
        public bool Done { get; set; }
    }

    [ApiController]
    [Route("/api/v1/tasks")]
    public class TasksController : ControllerBase
    {
        private readonly TodoDbContext _context;

        public TasksController(TodoDbContext context)
        {
            _context = context;
        }

        // GET: /api/v1/tasks?status=all|active|completed&sort=dueDate|createdAt&order=asc|desc&page=1&pageSize=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDTO>>> GetTasks(
            [FromQuery] string status = "all",
            [FromQuery] string sort = "dueDate",
            [FromQuery] string order = "asc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            // Start with all tasks
            IQueryable<Models.Task> query = _context.Tasks;

            // Apply status filter
            query = status.ToLower() switch
            {
                "active" => query.Where(t => !t.Done),
                "completed" => query.Where(t => t.Done),
                _ => query // "all" or any other value
            };

            // Apply sorting
            query = (sort.ToLower(), order.ToLower()) switch
            {
                ("duedate", "asc") => query.OrderBy(t => !t.Done)
                                          .ThenBy(t => t.DueDate == null)
                                          .ThenBy(t => t.DueDate)
                                          .ThenByDescending(t => t.CreatedAt),
                ("duedate", _) => query.OrderBy(t => !t.Done)
                                      .ThenBy(t => t.DueDate == null)
                                      .ThenByDescending(t => t.DueDate)
                                      .ThenByDescending(t => t.CreatedAt),
                ("createdat", "asc") => query.OrderBy(t => !t.Done)
                                           .ThenBy(t => t.CreatedAt),
                ("createdat", _) => query.OrderBy(t => !t.Done)
                                       .ThenByDescending(t => t.CreatedAt),
                _ => query.OrderBy(t => !t.Done)
                         .ThenBy(t => t.DueDate == null)
                         .ThenBy(t => t.DueDate)
                         .ThenByDescending(t => t.CreatedAt)
            };

            // Get total count for pagination headers
            var totalCount = await query.CountAsync();
            Response.Headers.Append("X-Total-Count", totalCount.ToString());

            // Apply pagination
            var tasks = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Map to DTOs
            var taskDtos = tasks.Select(t => new TaskDTO
            {
                Id = t.Id,
                Title = t.Title,
                Notes = t.Notes,
                DueDate = t.DueDate?.ToString("o"), // ISO 8601
                Done = t.Done,
                CreatedAt = t.CreatedAt.ToString("o"), // ISO 8601
                UpdatedAt = t.UpdatedAt.ToString("o")  // ISO 8601
            });

            return Ok(taskDtos);
        }

        // GET: /api/v1/tasks/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDTO>> GetTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound();
            }

            var taskDto = new TaskDTO
            {
                Id = task.Id,
                Title = task.Title,
                Notes = task.Notes,
                DueDate = task.DueDate?.ToString("o"),
                Done = task.Done,
                CreatedAt = task.CreatedAt.ToString("o"),
                UpdatedAt = task.UpdatedAt.ToString("o")
            };

            return taskDto;
        }

        // POST: /api/v1/tasks
        [HttpPost]
        public async Task<ActionResult<TaskDTO>> CreateTask(TaskDTO taskDto)
        {
            // Validate title length
            if (string.IsNullOrWhiteSpace(taskDto.Title) || taskDto.Title.Trim().Length < 3)
            {
                return BadRequest(new { error = "Title must be at least 3 characters." });
            }

            // Validate notes length
            if (!string.IsNullOrEmpty(taskDto.Notes) && taskDto.Notes.Length > 1000)
            {
                return BadRequest(new { error = "Notes must be 1000 characters or less." });
            }

            // Parse due date if provided
            DateTime? dueDate = null;
            if (!string.IsNullOrEmpty(taskDto.DueDate))
            {
                if (!DateTime.TryParse(taskDto.DueDate, out var parsedDate))
                {
                    return BadRequest(new { error = "Invalid due date format. Use ISO 8601 format." });
                }
                dueDate = parsedDate;
            }

            var task = new Models.Task
            {
                Id = Guid.NewGuid(),
                Title = taskDto.Title.Trim(),
                Notes = taskDto.Notes,
                DueDate = dueDate,
                Done = taskDto.Done,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var createdTaskDto = new TaskDTO
            {
                Id = task.Id,
                Title = task.Title,
                Notes = task.Notes,
                DueDate = task.DueDate?.ToString("o"),
                Done = task.Done,
                CreatedAt = task.CreatedAt.ToString("o"),
                UpdatedAt = task.UpdatedAt.ToString("o")
            };

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, createdTaskDto);
        }

        // PATCH: /api/v1/tasks/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, TaskDTO taskDto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            // Update title if provided
            if (taskDto.Title != null)
            {
                if (taskDto.Title.Trim().Length < 3)
                {
                    return BadRequest(new { error = "Title must be at least 3 characters." });
                }
                task.Title = taskDto.Title.Trim();
            }

            // Update notes if provided
            if (taskDto.Notes != null)
            {
                if (taskDto.Notes.Length > 1000)
                {
                    return BadRequest(new { error = "Notes must be 1000 characters or less." });
                }
                task.Notes = taskDto.Notes;
            }

            // Update due date if provided
            if (taskDto.DueDate != null)
            {
                if (string.IsNullOrEmpty(taskDto.DueDate))
                {
                    task.DueDate = null;
                }
                else if (DateTime.TryParse(taskDto.DueDate, out var parsedDate))
                {
                    task.DueDate = parsedDate;
                }
                else
                {
                    return BadRequest(new { error = "Invalid due date format. Use ISO 8601 format." });
                }
            }

            // Update done status if provided
            if (taskDto.Done != task.Done)
            {
                task.Done = taskDto.Done;
            }

            task.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var updatedTaskDto = new TaskDTO
            {
                Id = task.Id,
                Title = task.Title,
                Notes = task.Notes,
                DueDate = task.DueDate?.ToString("o"),
                Done = task.Done,
                CreatedAt = task.CreatedAt.ToString("o"),
                UpdatedAt = task.UpdatedAt.ToString("o")
            };

            return Ok(updatedTaskDto);
        }

        // DELETE: /api/v1/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TaskExists(Guid id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }

        // POST: /api/v1/tasks/{id}/toggle
        [HttpPost("{id}/toggle")]
        public async Task<ActionResult<TaskDTO>> ToggleTaskStatus(Guid id, ToggleStatusDTO toggleDto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            // Update only the done status
            task.Done = toggleDto.Done;
            task.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var updatedTaskDto = new TaskDTO
            {
                Id = task.Id,
                Title = task.Title,
                Notes = task.Notes,
                DueDate = task.DueDate?.ToString("o"),
                Done = task.Done,
                CreatedAt = task.CreatedAt.ToString("o"),
                UpdatedAt = task.UpdatedAt.ToString("o")
            };

            return Ok(updatedTaskDto);
        }
    }
}
