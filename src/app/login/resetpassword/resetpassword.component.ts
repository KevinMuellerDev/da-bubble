import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [RouterLink, CommonModule],
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
  popupState = 'out';
  constructor(private router: Router) { }


  async sendEmail() {

    // Simulate email sending logic

    console.log('Email sent!');
    this.popupState = 'in';

    const auth = getAuth();
    await sendPasswordResetEmail(auth, 'kevin.mueller@fenrirdev.de')
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });

    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/']);
    }, 1000);
  }
}
