import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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


  sendEmail() {

    // Simulate email sending logic

    console.log('Email sent!');
    this.popupState = 'in';

    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/confirmpassword']);
    }, 1000);
  }
}
