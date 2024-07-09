import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { confirmPasswordReset, getAuth, updatePassword } from '@angular/fire/auth';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-confirmpassword',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './confirmpassword.component.html',
  styleUrl: './confirmpassword.component.scss',
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: '1'
      })),
      state('out', style({
        transform: 'translateX(100%)' + 'rotate(180deg)',
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
  authService: AuthService = inject(AuthService);
  popupState = 'out';
  params!: URLSearchParams;
  code?: string | null;
  keyForm!: FormGroup;
  key!: string | null;
  isDisabled: boolean = true;

  /**
   * Initializes a new instance of the class with the given Router.
   * @param {Router} router - The Router instance to use for navigation.
   */
  constructor(private router: Router) {
    localStorage.setItem("hasSeenAnimation", 'true');
    localStorage.setItem("uid", '');
    this.params = new URLSearchParams(window.location.search);
    this.code = this.params.get('oobCode');
  }

  /**
   * Initializes the form with 'key' and 'repeatedKey' fields.
   * Validates 'repeatedKey' against 'key' using the 'mustMatch' validator.
   * Calls 'compareFormControl' on 'repeatedKey' value changes.
   */
  ngOnInit() {
    this.keyForm = new FormGroup({
      key: new FormControl(''),
      repeatedKey: new FormControl('')
    }, { validators: this.mustMatch('key', 'repeatedKey') });
    this.keyForm.controls['repeatedKey'].valueChanges
      .subscribe(() => { this.compareFormControl() })
  }

  /**
   * Confirms the password by retrieving the value from the 'key' form control,
   * and then calls the `confirmNewPassword` method of the `authService` with the
   * retrieved value and the `code` value. Finally, calls the `popUpDisplay` method.
   */
  async confirmPassword() {
    this.key = this.keyForm.controls['key'].value;
    await this.authService.confirmNewPassword(this.code as string, this.key as string);
    this.popUpDisplay();
  }

  /**
   * Compares the values of the 'key' and 'repeatedKey' form controls and sets the 'isDisabled' property accordingly.
   */
  compareFormControl() {
    const key1 = this.keyForm.controls['key'].value
    const key2 = this.keyForm.controls['repeatedKey'].value
    key1 === key2 ? this.isDisabled = false : this.isDisabled = true
  }

  /**
   * Displays a popup for a short duration and then navigates to the root route.
   */
  popUpDisplay() {
    this.popupState = 'in';
    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/']);
    }, 1000);
  }

  /**
   * Validator function to check if two form controls have the same value.
   * @param {string} controlName - The first form control.
   * @param {string} matchingControlName - The second form control.
   * @return {ValidatorFn} A validator that returns null if values match, or an error object if they don't.
   */
  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);
      if (!control || !matchingControl)
        return null;
      if (matchingControl.errors && !matchingControl.errors['mustMatch'])
        return null;
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }
}


