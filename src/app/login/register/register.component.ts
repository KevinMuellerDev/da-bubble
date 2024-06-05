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


  constructor(private router: Router,private userService:UserService = inject(UserService)) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async continue() {
    this.isFormSubmitted = true;
    if (this.registerForm.valid) {
      await this.userService.prepareDataNewUser(this.registerForm.value);
      this.userService.key = this.registerForm.controls['password'].value
      this.router.navigate(['/register/chooseavatar']);
    }
  }

/*   register() {
    const auth = getAuth();
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log('user.uid:', user.uid, user);
        await sendEmailVerification(auth.currentUser as User)
        .then(() => {
          console.log(auth.currentUser);
          
        });
        this.router.navigate(['/register/chooseavatar']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });



  } */
}
