import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  showIntroAnimation: boolean = false;
  showPassword: boolean = false;
  isFormSubmitted: boolean = false;
  loginForm: FormGroup;

  /**
   * Initializes the login form with email and password form controls.
   * The email form control requires a value and must be a valid email address.
   * The password form control requires a value and must have a minimum length of 8 characters.
   * @constructor
   */
  constructor(private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  /**
   * Initializes the component and checks if the animation has been seen before.
   * If not, sets the `showIntroAnimation` flag to true and stores it in the session storage.
   */
  ngOnInit() {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');
    if (!hasSeenAnimation) {
      this.showIntroAnimation = true;
      sessionStorage.setItem('hasSeenAnimation', 'true');
    }
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.showIntroAnimation = false;
    sessionStorage.removeItem('hasSeenAnimation');
    this.isFormSubmitted = true;
    if (this.loginForm.valid) {
      this.router.navigate(['/mainsection']);
      this.isFormSubmitted = false;
    }
  }
}
