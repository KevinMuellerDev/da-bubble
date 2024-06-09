import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseError, firebaseApp$ } from '@angular/fire/app';
import { signOut } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from '../shared/services/user.service';
import { StorageService } from '../shared/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  storageService: StorageService = inject(StorageService);
  showIntroAnimation: boolean = false;
  showPassword: boolean = false;
  isFormSubmitted: boolean = false;
  loginForm: FormGroup;
  guest!: boolean;

  /**
   * Initializes the login form with email and password form controls.
   * The email form control requires a value and must be a valid email address.
   * The password form control requires a value and must have a minimum length of 8 characters.
   * @constructor
   */
  constructor(private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  /**
   * Initializes the component and checks if the animation has been seen before.
   * If not, sets the `showIntroAnimation` flag to true and stores it in the session storage.
   */
  ngOnInit() {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');
    if (!hasSeenAnimation) {
      this.showIntroAnimation = true;
      sessionStorage.setItem('hasSeenAnimation', 'true');
    }
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Asynchronously logs in a user with the provided email and password.
   * This function first hides the intro animation and removes the 'hasSeenAnimation'
   * flag from the session storage. It then sets the 'isFormSubmitted' flag to true.
   * If the login form is valid or the user is a guest, it retrieves the authentication
   * instance and the email and password from the login form. It then attempts to
   * sign in the user with the provided email and password using the signInWithEmailAndPassword
   * function from the Firebase Authentication library. If successful, it retrieves the
   * user from the user credential, logs the user's UID to the console, stores the UID
   * in the session storage, navigates to the main section page for the user, and sets
   * the 'isFormSubmitted' flag to false. If an error occurs during the login process,
   * it logs the error to the console.
   */
  async login() {
    this.showIntroAnimation = false;
    sessionStorage.removeItem('hasSeenAnimation');
    this.isFormSubmitted = true;
    if (this.loginForm.valid || this.guest) {
      const auth = getAuth();
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.guest = false;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('user.uid:', user.uid, user);
        sessionStorage.setItem("uid", user.uid);
        this.router.navigate(['/mainsection/' + user.uid]);
        this.isFormSubmitted = false;
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Asynchronously logs in a user with Google authentication.
   * This function first hides the intro animation and removes the 'hasSeenAnimation'
   * flag from the session storage. It then attempts to sign in the user with Google
   * authentication using the signInWithPopup function from the Firebase Authentication
   * library. If successful, it retrieves the user from the user credential, logs the
   * user's UID to the console, stores the UID in the session storage, creates the
   * user's profile, and navigates to the main section page for the user. If an error
   * occurs during the login process, it logs the error to the console.
   */
  async loginWithGoogle() {
    this.showIntroAnimation = false;
    sessionStorage.removeItem('hasSeenAnimation');
    try {
      const result = await signInWithPopup(getAuth(), new GoogleAuthProvider());
      const user = result.user;
      console.log(user);
      this.userService.prepareDataNewUserGoogle(user)
      this.userService.createUserProfile();
      console.log('user.uid:', user.uid, user);
      sessionStorage.setItem("uid", user.uid);
      this.router.navigate(['/mainsection/' + user.uid]);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Logs in as a guest by setting the email and password of the login form to the guest's credentials.
   */
  loginGuest() {
    this.loginForm.value.email = "guest@dabubble.de";
    this.loginForm.value.password = "guest123";
    this.guest = true
    this.login();
  }
}
