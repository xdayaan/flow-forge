import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task } from '../../../core/services/task.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="row kanban-board g-3 mt-2">
      <div class="col-md-4" *ngFor="let column of columns">
        <div class="kanban-column p-2 bg-light rounded shadow-sm h-100">
          <h5 class="p-2 border-bottom d-flex justify-content-between">
            {{ column.name }}
            <span class="badge bg-secondary rounded-pill">{{ column.tasks.length }}</span>
          </h5>
          
          <div
            cdkDropList
            [id]="column.status.toString()"
            [cdkDropListData]="column.tasks"
            [cdkDropListConnectedTo]="connectedTo"
            class="kanban-list p-2"
            style="min-height: 500px;"
            (cdkDropListDropped)="drop($event, column.status)">
            
            <div *ngFor="let task of column.tasks" class="task-card bg-white p-3 mb-2 rounded shadow-sm border" 
                 cdkDrag [cdkDragData]="task">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ task.title }}</h6>
                <div class="dropdown">
                  <button class="btn btn-link btn-sm p-0" (click)="editTask(task.id)">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                </div>
              </div>
              <p class="text-muted small mb-2 text-truncate">{{ task.description }}</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="badge" [ngClass]="getPriorityClass(task.priority)">
                   {{ getPriorityLabel(task.priority) }}
                </span>
                <small class="text-muted" *ngIf="task.assigneeName">
                   <i class="bi bi-person"></i> {{ task.assigneeName }}
                </small>
              </div>
            </div>

            <div *ngIf="column.tasks.length === 0" class="text-center py-5 text-muted small">
              No tasks
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      min-height: calc(100vh - 200px);
    }
    .kanban-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .task-card {
      cursor: grab;
    }
    .task-card:active {
      cursor: grabbing;
    }
  `]
})
export class TaskKanbanComponent implements OnInit {
  columns: any[] = [
    { name: 'Todo', status: 0, tasks: [] },
    { name: 'In Progress', status: 1, tasks: [] },
    { name: 'Done', status: 2, tasks: [] }
  ];

  connectedTo: string[] = ['0', '1', '2'];

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks(1, 100).subscribe({
      next: (result: any) => {
        this.columns[0].tasks = result.items.filter((t: any) => t.status === 0);
        this.columns[1].tasks = result.items.filter((t: any) => t.status === 1);
        this.columns[2].tasks = result.items.filter((t: any) => t.status === 2);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: number) {
    const task = event.item.data as Task;
    console.log(`Dropped task ${task.id} (${task.title}). Target status: ${newStatus}`);

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      console.log(`Sending API request to update task ${task.id} to status ${newStatus}`);
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        next: () => {
          console.log('Status updated successfully in backend');
          task.status = newStatus;
        },
        error: (err) => {
          console.error('Error updating status in backend:', err);
          this.loadTasks(); // Reload to restore correct state
        }
      });
    }
  }

  getPriorityLabel(priority: number): string {
    return ['Low', 'Medium', 'High'][priority] || 'Unknown';
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 0: return 'bg-info text-dark';
      case 1: return 'bg-warning text-dark';
      case 2: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  editTask(id: string) {
    this.router.navigate(['/tasks/edit', id]);
  }
}
