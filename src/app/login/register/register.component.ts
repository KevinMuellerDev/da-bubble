import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  showPassword: boolean = false;
  isFormSubmitted: boolean = false;
  registerForm: FormGroup;

  /**
   * Constructs a new instance of the RegisterComponent class.
   * @param {Router} router - The Angular Router service used for navigation.
   * @param {UserService} userService - The UserService dependency injected into the component.
   * Defaults to a new instance of UserService if not provided.
   */
  constructor(private router: Router, private userService: UserService = inject(UserService)) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      privacyCheck: new FormControl(false, [Validators.requiredTrue])
    });
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Continues the registration process if the form is valid.
   * This function sets the `isFormSubmitted` flag to `true` and checks if the `registerForm` is valid.
   * If the form is valid, it prepares the data for a new user by calling the `prepareDataNewUser` method
   * of the `userService` with the form value. It also sets the `key` property of the `userService` to the
   * value of the `password` control of the `registerForm`. Finally, it navigates to the `/register/chooseavatar`
   * route using the `router`.
   */
  async continue() {
    this.isFormSubmitted = true;
    if (this.registerForm.valid) {
      this.userService.prepareDataNewUser(this.registerForm.value);
      this.userService.key = this.registerForm.controls['password'].value
      this.router.navigate(['/register/chooseavatar']);
    }
  }
}
