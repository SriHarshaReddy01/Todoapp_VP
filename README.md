# Todo List Application

A modern, full-stack todo list application built with React (TypeScript) and .NET Core. This application allows users to manage tasks with features like filtering, sorting, and status tracking.

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete with a single click
- ✅ Filter tasks by status (all, active, completed)
- ✅ Sort tasks by due date or creation date
- ✅ Set due dates for tasks with visual indicators for overdue items
- ✅ Add detailed notes to tasks
- ✅ Responsive design that works on desktop and mobile devices

## Tech Stack

### Frontend
- **React** with **TypeScript** for type safety
- **React Query** for server state management
- **TailwindCSS** for styling
- **Vite** for fast development and building

### Backend
- **.NET Core** API with C#
- **Entity Framework Core** for database operations
- **SQLite** database for data storage
- **RESTful API** design

## Project Structure

```
TodoApp/
├── Backend/
│   └── TodoApi/           # .NET Core API project
│       ├── Controllers/   # API endpoints
│       ├── Data/          # Database context
│       ├── Middleware/    # Custom middleware (CORS, etc.)
│       ├── Models/        # Data models
│       └── Program.cs     # Application entry point
│
└── Frontend/
    └── todo-app/          # React application
        ├── public/        # Static assets
        ├── src/
        │   ├── components/  # React components
        │   ├── services/    # API services
        │   ├── styles/      # CSS styles
        │   └── types/       # TypeScript type definitions
        └── package.json   # Dependencies
```

## Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (version 10.0 or later)
- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd TodoApp/Backend/TodoApi
   ```

2. Restore dependencies:
   ```
   dotnet restore
   ```

3. Run the API:
   ```
   dotnet run
   ```
   The API will be available at http://localhost:5136

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd TodoApp/Frontend/todo-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:5173

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/v1/tasks | Get all tasks with optional filtering and pagination |
| GET    | /api/v1/tasks/{id} | Get a specific task by ID |
| POST   | /api/v1/tasks | Create a new task |
| PATCH  | /api/v1/tasks/{id} | Update an existing task |
| POST   | /api/v1/tasks/{id}/toggle | Toggle task completion status |
| DELETE | /api/v1/tasks/{id} | Delete a task |

### Query Parameters for GET /api/v1/tasks

- `status`: Filter by status (`all`, `active`, `completed`)
- `sort`: Sort field (`dueDate`, `createdAt`)
- `order`: Sort order (`asc`, `desc`)
- `page`: Page number for pagination
- `pageSize`: Number of items per page

## Frontend Components

- **TaskForm**: Component for creating and editing tasks
- **TaskList**: Displays the list of tasks with filtering and sorting options
- **TaskItem**: Individual task item with toggle, edit, and delete functionality

## Data Models

### Task

```typescript
interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // ISO 8601 format
  done: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

## Development Notes

- The backend validates that task titles must be longer than 10 characters
- Task notes have a maximum length of 1000 characters
- Due dates are stored and transmitted in ISO 8601 format
- The API includes pagination headers (`X-Total-Count`) for list endpoints

## Future Enhancements

- User authentication and multi-user support
- Task categories/tags
- Task priorities
- Recurring tasks
