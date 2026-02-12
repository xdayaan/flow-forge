import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TaskService } from '../../../core/services/task.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskKanbanComponent } from '../task-kanban/task-kanban.component';

@Component({
    selector: 'app-task-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent, FormsModule, TaskKanbanComponent],
    template: `
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Tasks</h1>
            <div class="d-flex gap-2">
                <div class="btn-group btn-group-sm me-2">
                    <button type="button" class="btn btn-outline-secondary" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
                        <i class="bi bi-list"></i> List
                    </button>
                    <button type="button" class="btn btn-outline-secondary" [class.active]="viewMode === 'kanban'" (click)="viewMode = 'kanban'">
                        <i class="bi bi-kanban"></i> Board
                    </button>
                </div>
                
                <ng-container *ngIf="viewMode === 'list'">
                    <div class="input-group input-group-sm" style="width: 200px;">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control border-start-0" placeholder="Search tasks..." 
                               [(ngModel)]="searchTerm" (ngModelChange)="onFilter()">
                    </div>
                    <select class="form-select form-select-sm" style="width: 150px;" [(ngModel)]="statusFilter" (change)="onFilter()">
                        <option [ngValue]="null">All Statuses</option>
                        <option [value]="0">Todo</option>
                        <option [value]="1">In Progress</option>
                        <option [value]="2">Done</option>
                    </select>
                </ng-container>

                <button class="btn btn-sm btn-primary" (click)="createTask()">
                    <i class="bi bi-plus-lg"></i> New Task
                </button>
            </div>
        </div>

        <app-data-table *ngIf="viewMode === 'list'"
            [data]="tasks"
            [columns]="columns"
            [totalCount]="totalCount"
            [pageSize]="pageSize"
            [pageIndex]="pageNumber"
            [isLoading]="isLoading"
            (pageChange)="onPageChange($event)"
            (actionClick)="onAction($event)">
        </app-data-table>

        <app-task-kanban *ngIf="viewMode === 'kanban'"></app-task-kanban>
    `
})
export class TaskListComponent implements OnInit {
    tasks: any[] = [];
    totalCount = 0;
    pageNumber = 1;
    pageSize = 10;
    isLoading = false;
    searchTerm = '';
    statusFilter: number | null = null;
    viewMode: 'list' | 'kanban' = 'kanban';

    columns = [
        { key: 'title', label: 'Title', type: 'text' as const },
        { key: 'projectName', label: 'Project', type: 'text' as const },
        { key: 'assigneeName', label: 'Assigned To', type: 'text' as const },
        { key: 'status', label: 'Status', type: 'badge' as const },
        { key: 'priority', label: 'Priority', type: 'text' as const },
        { key: 'dueDate', label: 'Due Date', type: 'date' as const },
        { key: 'actions', label: 'Actions', type: 'actions' as const }
    ];

    constructor(private taskService: TaskService, private router: Router) { }

    ngOnInit(): void {
        this.loadTasks();
    }

    onFilter() {
        this.pageNumber = 1;
        this.loadTasks();
    }

    loadTasks() {
        this.isLoading = true;
        this.taskService.getTasks(this.pageNumber, this.pageSize, this.searchTerm, this.statusFilter ?? undefined).subscribe({
            next: (result: any) => {
                this.tasks = result.items.map((t: any) => ({
                    ...t,
                    status: this.getStatusLabel(t.status),
                    priority: this.getPriorityLabel(t.priority)
                }));
                this.totalCount = result.totalCount;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    getStatusLabel(status: number): string {
        return ['Todo', 'In Progress', 'Done'][status] || 'Unknown';
    }

    getPriorityLabel(priority: number): string {
        return ['Low', 'Medium', 'High'][priority] || 'Unknown';
    }

    onPageChange(page: number) {
        this.pageNumber = page;
        this.loadTasks();
    }

    onAction(event: { action: string, row: any }) {
        if (event.action === 'edit') {
            this.router.navigate(['/tasks/edit', event.row.id]);
        } else if (event.action === 'delete') {
            if (confirm('Are you sure you want to delete this task?')) {
                this.taskService.deleteTask(event.row.id).subscribe(() => {
                    this.loadTasks();
                });
            }
        }
    }

    createTask() {
        this.router.navigate(['/tasks/new']);
    }
}
