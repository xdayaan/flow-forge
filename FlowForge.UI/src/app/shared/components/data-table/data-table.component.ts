import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
    @Input() data: any[] = [];
    @Input() columns: { key: string; label: string; type?: 'text' | 'date' | 'badge' | 'actions' | 'boolean' }[] = [];
    @Input() totalCount = 0;
    @Input() pageIndex = 1; // Used to be pageNumber, aliasing or replacing
    @Input() pageSize = 10;
    @Input() isLoading = false;
    @Input() showPagination = true;

    @Output() pageChange = new EventEmitter<number>();
    @Output() actionClick = new EventEmitter<{ action: string; row: any }>();

    get totalPages(): number {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    get pages(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            // Simple logic for now, can be optimized for large page counts
            if (i === 1 || i === this.totalPages || (i >= this.pageIndex - 2 && i <= this.pageIndex + 2)) {
                pages.push(i);
            }
        }
        // Remove duplicates and sort
        return [...new Set(pages)].sort((a, b) => a - b);
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.pageChange.emit(page);
        }
    }

    onAction(action: string, row: any) {
        this.actionClick.emit({ action, row });
    }
}
