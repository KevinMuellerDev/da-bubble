import { Component, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseError } from '@angular/fire/app';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit {
  firestore: Firestore = inject(Firestore);
  @ViewChild('nameInput') nameInput!: ElementRef;
  errorMessage: string = '';
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

  /**
   * Executes after the view has been initialized.
   * Sets a timeout to focus on the 'nameInput' element after 1 second.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.nameInput.nativeElement.focus();
    }, 1000);
  }

  /**
   * The `onInput` function sets the `firstFocus` property to false.
   */
  onInput() {
    this.firstFocus = false;
    this.errorMessage = '';
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Asynchronously continues the registration process.
   * @return {Promise<void>} Resolves after the registration process is completed.
   */
  async continue() {
    this.isFormSubmitted = true;
    if (this.registerForm.valid) {
      const email = this.registerForm.controls['email'].value;
      const name = this.registerForm.controls['name'].value;
      try {
        await this.handleUserRegistration(email, name);
      } catch (error) {
        this.handleRegistrationError(error);
      }
    }
  }

  /**
   * Asynchronously handles the registration process for a new user.
   * @param {string} email - The email address of the user.
   * @param {string} name - The name of the user.
   * @return {Promise<void>} - A promise that resolves when the registration process is complete.
   * @throws {Error} - Throws an error if a user with the same email or name already exists.
   */
  async handleUserRegistration(email: string, name: string) {
    const { emailExists, nameExists } = await this.userService.checkRegisteredUser(email, name);
    if (emailExists) {
      throw new Error("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");
    } else if (nameExists) {
      throw new Error("Ein Benutzer mit diesem Namen existiert bereits.");
    } else {
      await this.userService.prepareDataNewUser(this.registerForm.value);
      this.userService.key = this.registerForm.controls['password'].value;
      this.router.navigate(['/register/chooseavatar']);
    }
  }

  /**
   * Handles the registration error based on the type of error received.
   * @param {any} error - The error object to be handled.
   */
  handleRegistrationError(error: any) {
    if (error instanceof FirebaseError) {
      this.errorMessage = this.getFirebaseErrorMessage(error.code);
    } else if (error instanceof Error) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = "Ein unerwarteter Fehler ist aufgetreten.";
    }
  }

  /**
   * Returns an error message based on the provided Firebase error code.
   * @param {string} errorCode - The Firebase error code.
   * @return {string} The corresponding error message.
   */
  getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return "Die E-Mail-Adresse wird bereits verwendet.";
      case 'auth/invalid-email':
        return "Ungültige E-Mail-Adresse.";
      default:
        return "Ein Fehler ist bei der Registrierung aufgetreten.";
    }
  }
}
