import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">Users</h1>
      <button class="btn btn-sm btn-primary" (click)="createUser()">
        <i class="bi bi-plus-lg"></i> New User
      </button>
    </div>

    <app-data-table
      [data]="users"
      [columns]="columns"
      [totalCount]="users.length"
      [pageSize]="10"
      [pageIndex]="1"
      [isLoading]="isLoading"
      [showPagination]="false"
      (actionClick)="handleAction($event)">
    </app-data-table>
  `
})
export class UserListComponent implements OnInit {
    users: any[] = [];
    isLoading = false;

    columns = [
        { key: 'fullName', label: 'Name', type: 'text' as const },
        { key: 'email', label: 'Email', type: 'text' as const },
        { key: 'roleDisplay', label: 'Role', type: 'text' as const },
        { key: 'isActive', label: 'Active', type: 'boolean' as const },
        { key: 'actions', label: 'Actions', type: 'actions' as const }
    ];

    constructor(
        private userService: UserService,
        private router: Router,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.isLoading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data.map(u => ({
                    ...u,
                    roleDisplay: ['Admin', 'Manager', 'Member'][u.role] || 'Unknown'
                }));
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.notificationService.error('Failed to load users');
            }
        });
    }

    createUser() {
        this.router.navigate(['/users/new']);
    }

    handleAction(event: { action: string; row: any }) {
        if (event.action === 'edit') {
            this.router.navigate(['/users/edit', event.row.id]);
        } else if (event.action === 'delete') {
            this.deleteUser(event.row.id);
        }
    }

    deleteUser(id: string) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.userService.deleteUser(id).subscribe({
                next: () => {
                    this.notificationService.success('User deleted successfully');
                    this.loadUsers();
                },
                error: (err) => {
                    this.notificationService.error(err.error || 'Failed to delete user');
                }
            });
        }
    }
}
