import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-confirmpassword',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmpassword.component.html',
  styleUrl: './confirmpassword.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: '1'
      })),
      state('out', style({
        transform: 'translateX(100%)',
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

export class ConfirmpasswordComponent {
  popupState = 'out';

  constructor(private router: Router) {
  }


  confirmPassword() {





    this.popupState = 'in';
    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/']);
    }, 1000);
  }
}
