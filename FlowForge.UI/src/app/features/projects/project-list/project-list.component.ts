import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
    projects: Project[] = [];
    totalCount = 0;
    pageNumber = 1;
    pageSize = 10;
    isLoading = false;

    columns = [
        { key: 'name', label: 'Project Name', type: 'text' as const },
        { key: 'description', label: 'Description', type: 'text' as const },
        { key: 'createdAt', label: 'Created At', type: 'date' as const },
        { key: 'status', label: 'Status', type: 'badge' as const }, // Assuming we map isArchived to status
        { key: 'actions', label: 'Actions', type: 'actions' as const }
    ];

    constructor(private projectService: ProjectService, private router: Router) { }

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects() {
        this.isLoading = true;
        this.projectService.getProjects(this.pageNumber, this.pageSize).subscribe({
            next: (result) => {
                this.projects = result.items.map(p => ({
                    ...p,
                    status: p.isArchived ? 'Archived' : 'Active'
                }));
                this.totalCount = result.totalCount;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                // Error handled by interceptor
            }
        });
    }

    onPageChange(page: number) {
        this.pageNumber = page;
        this.loadProjects();
    }

    onAction(event: { action: string, row: any }) {
        if (event.action === 'edit') {
            this.router.navigate(['/projects/edit', event.row.id]);
        } else if (event.action === 'delete') {
            if (confirm('Are you sure you want to delete this project?')) {
                this.projectService.deleteProject(event.row.id).subscribe(() => {
                    this.loadProjects();
                });
            }
        }
    }

    openCreateModal() {
        this.router.navigate(['/projects/new']);
    }
}
