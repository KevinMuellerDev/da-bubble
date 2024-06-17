import { Component, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class RegisterComponent implements AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef;
  firstFocus: boolean = true;
  showPassword: boolean = false;
  isFormSubmitted: boolean = false;
  registerForm: FormGroup;

  /**
   * Constructs a RegisterComponent.
   * @param {Router} router - The Angular Router service.
   * @param {UserService} userService - The UserService dependency.
   */
  constructor(private router: Router, private userService: UserService = inject(UserService)) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      privacyCheck: new FormControl(false, [Validators.requiredTrue])
    });
  }

  ngAfterViewInit(): void {
    this.nameInput.nativeElement.focus();
  }

  onInput() {
    this.firstFocus = false;
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Continues the registration if the form is valid.
   * Sets `isFormSubmitted` to `true`. If the form is valid, prepares user data,
   * sets the `userService.key`, and navigates to `/register/chooseavatar`.
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
