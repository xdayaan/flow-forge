import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    user: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.user$.subscribe(user => {
            this.user = user;
        });
    }

    getRoleLabel(role: string): string {
        return role === 'Admin' ? 'Administrator' : role;
    }
}
