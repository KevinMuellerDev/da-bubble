import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: '1'
      })),
      state('out', style({
        transform: 'translateX(100%)' + 'rotate(-30deg)',

        opacity: '0'
      })),
      transition('out => in', [
        animate('0.3s ease-in-out')
      ]),
      transition('in => out', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})

export class ResetpasswordComponent {
  resetPassword: FormGroup;
  popupState = 'out';

  constructor(private router: Router) {
    this.resetPassword = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    })
  }

  /**
  * Returns an error message based on the provided Firebase error code.
  * @param {string} errorCode - The Firebase error code.
  * @return {string} The corresponding error message.
  */
  getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return "Benutzer nicht gefunden.";
      case 'auth/wrong-password':
        return "falsches Passwort.";
      case 'auth/invalid-email':
        return "falsche Email.";
      case 'auth/popup-closed-by-user':
        return "Das Popup wurde geschlossen, bevor die Anmeldung abgeschlossen war.";
      case 'auth/cancelled-popup-request':
        return "Die Popup-Anfrage wurde abgebrochen.";
      case 'auth/account-exists-with-different-credential':
        return "Es existiert bereits ein Konto mit einer anderen Anmeldemethode für diese E-Mail-Adresse.";
      case 'auth/invalid-credential':
        return "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingaben.";
      case 'auth/operation-not-allowed':
        return "Diese Anmeldemethode ist nicht erlaubt.";
      case 'auth/user-disabled':
        return "Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Support.";
      default:
        return "Bei der Anmeldung mit Google ist ein Fehler aufgetreten.";
    }
  }

  /**
   * The `sendEmail` function asynchronously sends a password reset email to a specified email address
   * and then navigates to the home page after a delay.
   */
  async sendEmail() {
    this.popupState = 'in';
    const auth = getAuth();
    await sendPasswordResetEmail(auth, this.resetPassword.value.email)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/']);
    }, 1000);
  }
}
