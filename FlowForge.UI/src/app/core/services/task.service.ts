import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: number; // Enum: 0=Todo, 1=InProgress, 2=Done
    priority: number; // Enum: 0=Low, 1=Medium, 2=High
    assignedTo?: string;
    assigneeName?: string;
    dueDate?: Date;
    projectId: string;
    projectName?: string;
    createdAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = `${environment.apiUrl}/tasks`;

    constructor(private http: HttpClient) { }

    getTasks(page: number = 1, pageSize: number = 10, searchTerm?: string, status?: number): Observable<{ items: Task[], totalCount: number }> {
        let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
        if (searchTerm) url += `&searchTerm=${searchTerm}`;
        if (status !== undefined && status !== null) url += `&status=${status}`;
        return this.http.get<{ items: Task[], totalCount: number }>(url);
    }

    getTask(id: string): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    createTask(task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task);
    }

    updateTask(id: string, task: Partial<Task>): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, task);
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateTaskStatus(id: string, status: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
    }
}
