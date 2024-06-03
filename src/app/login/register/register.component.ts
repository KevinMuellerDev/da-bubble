import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  showPassword: boolean = false;

  constructor() {
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  register() {
      // TODO: save user data to firestore, and go to choose avatar
    }
}
