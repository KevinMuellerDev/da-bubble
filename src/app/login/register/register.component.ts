import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { UserService } from '../../shared/services/user.service';
import { User, sendEmailVerification } from '@angular/fire/auth';


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

  userService: UserService = inject(UserService);

  constructor(private router: Router) {
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


  test(id:string) {
    this.userService.prepareDataNewUser(this.registerForm, id)
  }


  // ---------------------------------------------------------------------------
  //TODO:  manage errors & set userdata & set avatar to complete registration!
  //       Add name :) <3 <3 <3 und ID bitte mit übergeben <3
  register() {
    const auth = getAuth();
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    let user;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        user = userCredential.user;
        console.log('user.uid:', user.uid, user);
        this.router.navigate(['/register/chooseavatar']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });

    sendEmailVerification(auth.currentUser as User)
      .then(() => {
        console.log(auth.currentUser);
        
      });

  }
}
