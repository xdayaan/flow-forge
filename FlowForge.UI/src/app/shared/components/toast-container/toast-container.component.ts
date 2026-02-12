import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1060">
            <div *ngFor="let toast of toasts" class="toast show align-items-center text-white border-0 mb-2" 
                 [class.bg-success]="toast.type === 'success'"
                 [class.bg-danger]="toast.type === 'error'"
                 [class.bg-warning]="toast.type === 'warning'"
                 [class.bg-info]="toast.type === 'info'"
                 role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        {{ toast.message }}
                    </div>
                    <button type="button" class="btn-close btn-close-white m-auto me-2" (click)="remove(toast)"></button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .toast { transition: all 0.3s ease-in-out; }
    `]
})
export class ToastContainerComponent implements OnInit {
    toasts: Toast[] = [];

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.notificationService.toasts$.subscribe((toasts: Toast[]) => {
            this.toasts = toasts;
        });
    }

    remove(toast: Toast) {
        this.notificationService.remove(toast);
    }
}
