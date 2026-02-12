import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="container-fluid pt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>{{ isEditMode ? 'Edit User' : 'New User' }}</h2>
        <a routerLink="/users" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Back to List
        </a>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()" #userForm="ngForm">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="fullName" class="form-label">Full Name</label>
                <input type="text" class="form-control" id="fullName" name="fullName" 
                       [(ngModel)]="user.fullName" required #fullName="ngModel"
                       [class.is-invalid]="fullName.invalid && fullName.touched">
                <div class="invalid-feedback">Full name is required.</div>
              </div>

              <div class="col-md-6">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" 
                       [(ngModel)]="user.email" required email #email="ngModel"
                       [class.is-invalid]="email.invalid && email.touched">
                <div class="invalid-feedback">Valid email is required.</div>
              </div>

              <div class="col-md-6" *ngIf="!isEditMode">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" 
                       [(ngModel)]="user.password" required minlength="6" #password="ngModel"
                       [class.is-invalid]="password.invalid && password.touched">
                <div class="invalid-feedback">Password is required (min 6 chars).</div>
              </div>

              <div class="col-md-6">
                <label for="role" class="form-label">Role</label>
                <select class="form-select" id="role" name="role" [(ngModel)]="user.role" required>
                  <option [ngValue]="0">Admin</option>
                  <option [ngValue]="1">Manager</option>
                  <option [ngValue]="2">Member</option>
                </select>
              </div>

              <div class="col-md-6 d-flex align-items-end" *ngIf="isEditMode">
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="isActive" name="isActive" [(ngModel)]="user.isActive">
                  <label class="form-check-label" for="isActive">User Account Active</label>
                </div>
              </div>

              <div class="col-12 mt-4">
                <button type="submit" class="btn btn-primary me-2" [disabled]="userForm.invalid || loading">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" *ngIf="loading"></span>
                  {{ isEditMode ? 'Update User' : 'Create User' }}
                </button>
                <a routerLink="/users" class="btn btn-light">Cancel</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserFormComponent implements OnInit {
    user: any = {
        fullName: '',
        email: '',
        role: 2,
        isActive: true,
        password: ''
    };
    isEditMode = false;
    loading = false;
    userId: string | null = null;

    constructor(
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.userId = this.route.snapshot.paramMap.get('id');
        if (this.userId) {
            this.isEditMode = true;
            this.loadUser();
        }
    }

    loadUser() {
        if (!this.userId) return;
        this.userService.getUser(this.userId).subscribe({
            next: (data) => {
                this.user = { ...data };
            },
            error: (err) => {
                this.notificationService.error('Failed to load user');
                this.router.navigate(['/users']);
            }
        });
    }

    onSubmit() {
        this.loading = true;
        const obs = this.isEditMode
            ? this.userService.updateUser(this.userId!, this.user)
            : this.userService.createUser(this.user);

        (obs as Observable<any>).subscribe({
            next: () => {
                this.notificationService.success(`User ${this.isEditMode ? 'updated' : 'created'} successfully`);
                this.router.navigate(['/users']);
            },
            error: (err) => {
                this.notificationService.error(err.error || `Failed to ${this.isEditMode ? 'update' : 'create'} user`);
                this.loading = false;
            }
        });
    }
}
