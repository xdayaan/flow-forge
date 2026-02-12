import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';

import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            {
                path: 'projects',
                loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent)
            },
            {
                path: 'projects/new',
                loadComponent: () => import('./features/projects/project-form/project-form.component').then(m => m.ProjectFormComponent)
            },
            {
                path: 'projects/edit/:id',
                loadComponent: () => import('./features/projects/project-form/project-form.component').then(m => m.ProjectFormComponent)
            }
        ]
    }
];
