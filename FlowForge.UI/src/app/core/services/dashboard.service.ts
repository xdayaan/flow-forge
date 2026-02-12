import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
    activeProjects: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
}

export interface RecentActivity {
    id: string;
    projectName: string;
    taskTitle: string;
    userName: string;
    action: string;
    date: Date;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
    }

    getRecentActivity(): Observable<RecentActivity[]> {
        return this.http.get<RecentActivity[]>(`${this.apiUrl}/recent-activity`);
    }
}
