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
  imports: [CommonModule,RouterLink, ReactiveFormsModule],
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
  authService:AuthService = inject(AuthService);
  popupState = 'out';
  params!: URLSearchParams;
  code?: string | null;
  keyForm!: FormGroup;
  key!: string | null;
  isDisabled: boolean = true;

  constructor(private router: Router) {
    this.params = new URLSearchParams(window.location.search);
    this.code = this.params.get('oobCode');
    console.log(this.code);
  }

  ngOnInit(){
    this.keyForm = new FormGroup({
      key: new FormControl(''),
      repeatedKey: new FormControl('')
    },{validators:this.mustMatch('key', 'repeatedKey')});
    
    this.keyForm.controls['repeatedKey'].valueChanges
      .subscribe(() => { this.compareFormControl() })
  }


  async confirmPassword() {
    this.key = this.keyForm.controls['key'].value	;

    await this.authService.confirmNewPassword(this.code as string, this.key as string);
    this.popUpDisplay();
  }


  compareFormControl() {
    const key1 = this.keyForm.controls['key'].value
    const key2 = this.keyForm.controls['repeatedKey'].value
    key1 === key2 ? this.isDisabled = false : this.isDisabled = true 
  }


  popUpDisplay() {
    this.popupState = 'in';
    setTimeout(() => {
      this.popupState = 'out';
      this.router.navigate(['/']);
    }, 1000);
  }

  
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


