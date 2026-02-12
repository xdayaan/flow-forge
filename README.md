# FlowForge - Professional Project & Task Management

FlowForge is a robust, full-stack project management application designed for teams to streamline their workflows. It features a modern Angular frontend, a powerful .NET 10 backend, and a PostgreSQL database, all containerized with Docker for seamless deployment.

## 🚀 Features

### 📊 Unified Dashboard
- **Live Statistics**: Real-time insights into active projects, completed tasks, and pending items.
- **Activity Feed**: Stay updated with the latest changes across your organization.

### 📋 Task Management (Full CRUD)
- **Interactive Kanban Board**: Visual drag-and-drop workflow for rapid status updates.
- **Advanced Filtering**: Search and filter tasks by status, priority, or assignee.
- **Detail View**: Comprehensive task forms for managing titles, descriptions, and metadata.

### 🏗️ Project Management
- **Project Tracking**: Manage project lifecycles from creation to archiving.
- **Seamless Integration**: Link tasks to specific projects for better organization.

### 👥 User & Team Management
- **Full User CRUD**: Administrators can create, edit, and manage team members and roles.
- **Role-Based Access**: Support for Admin, Manager, and Member roles.
- **Profile Management**: Individual user settings and tenant information.

### 🔐 Security & Multi-Tenancy
- **JWT Authentication**: Secure login and registration flows.
- **Tenant Isolation**: Multi-tenant architecture ensuring data privacy between organizations.
- **Optimistic Concurrency**: Robust data consistency using PostgreSQL's native tracking.

## 🛠️ Technology Stack

- **Frontend**: Angular, Bootstrap 5, Angular CDK (Drag & Drop), RxJS.
- **Backend**: .NET 10, Entity Framework Core, ASP.NET Core Web API.
- **Database**: PostgreSQL 16+.
- **Infrastructure**: Docker, Docker Compose, Nginx.

## 🚦 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation & Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/flow-forge.git
   cd flow-forge
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**:
   - **Frontend**: [http://localhost:4200](http://localhost:4200)
   - **API (Swagger)**: [http://localhost:5111/swagger](http://localhost:5111/swagger)

## 🏗️ Architecture

FlowForge follows a Clean Architecture approach:
- **FlowForge.Domain**: Core entities and business logic (POCOs).
- **FlowForge.Application**: DTOs, interfaces, and application services.
- **FlowForge.Infrastructure**: Data access (EF Core), migrations, and external services.
- **FlowForge.API**: RESTful endpoints and middleware.
- **FlowForge.UI**: Standalone Angular application with a modular feature structure.

## 🛡️ Maintenance

The application includes automatic database migration handling on startup. It also correctly handles PostgreSQL's strict UTC requirements for `DateTime` fields and uses native system columns for optimistic concurrency control.

---
*Built with ❤️ for efficient team collaboration.*
