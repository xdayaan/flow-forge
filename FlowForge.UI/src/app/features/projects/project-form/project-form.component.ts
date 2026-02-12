import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';

@Component({
    selector: 'app-project-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnInit {
    projectForm: FormGroup;
    isEditMode = false;
    projectId: string | null = null;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.projectForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            isArchived: [false]
        });
    }

    ngOnInit(): void {
        this.projectId = this.route.snapshot.paramMap.get('id');
        if (this.projectId) {
            this.isEditMode = true;
            this.loadProject(this.projectId);
        }
    }

    loadProject(id: string) {
        this.isLoading = true;
        this.projectService.getProject(id).subscribe({
            next: (project) => {
                this.projectForm.patchValue({
                    name: project.name,
                    description: project.description,
                    isArchived: project.isArchived
                });
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                // Error handled globally
                this.router.navigate(['/projects']);
            }
        });
    }

    onSubmit() {
        if (this.projectForm.invalid) return;

        this.isLoading = true;
        const formValue = this.projectForm.value;

        if (this.isEditMode && this.projectId) {
            this.projectService.updateProject(this.projectId, formValue).subscribe({
                next: () => {
                    this.router.navigate(['/projects']);
                },
                error: () => this.isLoading = false
            });
        } else {
            this.projectService.createProject(formValue).subscribe({
                next: () => {
                    this.router.navigate(['/projects']);
                },
                error: () => this.isLoading = false
            });
        }
    }

    cancel() {
        this.router.navigate(['/projects']);
    }
}
