import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    constructor(private authService: AuthService) { }

    logout() {
        this.authService.logout();
    }
}
