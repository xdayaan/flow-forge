import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats, RecentActivity } from '../../core/services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    stats: DashboardStats = {
        activeProjects: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0
    };
    recentActivity: RecentActivity[] = [];
    isLoading = true;

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        // Parallel requests
        this.dashboardService.getStats().subscribe({
            next: (data) => this.stats = data,
            error: (err) => console.error('Failed to load stats', err)
        });

        this.dashboardService.getRecentActivity().subscribe({
            next: (data) => {
                this.recentActivity = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load activity', err);
                this.isLoading = false;
            }
        });
    }
}
