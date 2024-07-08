import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserService } from './shared/services/user.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'da-bubble';
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  constructor() { }
}
