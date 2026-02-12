import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/services/user.service'; // Adjust import if model is separate

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
    taskForm: FormGroup;
    isEditMode = false;
    taskId: string | null = null;
    isLoading = false;
    projects: Project[] = [];
    users: User[] = [];

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private projectService: ProjectService,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.taskForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            status: [0, Validators.required], // Default to Todo
            priority: [1, Validators.required], // Default to Medium
            projectId: ['', Validators.required],
            assignedTo: [null],
            dueDate: [null]
        });
    }

    ngOnInit(): void {
        this.loadProjects();
        this.loadUsers();

        this.taskId = this.route.snapshot.paramMap.get('id');
        if (this.taskId) {
            this.isEditMode = true;
            this.loadTask(this.taskId);
        }
    }

    loadProjects() {
        this.projectService.getProjects(1, 100).subscribe({
            next: (res) => this.projects = res.items,
            error: (err) => console.error('Error loading projects', err)
        });
    }

    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (res) => this.users = res,
            error: (err) => console.error('Error loading users', err)
        });
    }

    loadTask(id: string) {
        this.isLoading = true;
        this.taskService.getTask(id).subscribe({
            next: (task) => {
                this.taskForm.patchValue({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    projectId: task.projectId,
                    assignedTo: task.assignedTo,
                    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null
                });
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.router.navigate(['/tasks']);
            }
        });
    }

    onSubmit() {
        if (this.taskForm.invalid) return;

        this.isLoading = true;
        const formValue = this.taskForm.value;

        // Ensure status and priority are numbers
        formValue.status = Number(formValue.status);
        formValue.priority = Number(formValue.priority);

        if (this.isEditMode && this.taskId) {
            this.taskService.updateTask(this.taskId, formValue).subscribe({
                next: () => this.router.navigate(['/tasks']),
                error: () => this.isLoading = false
            });
        } else {
            this.taskService.createTask(formValue).subscribe({
                next: () => this.router.navigate(['/tasks']),
                error: () => this.isLoading = false
            });
        }
    }

    cancel() {
        this.router.navigate(['/tasks']);
    }
}
