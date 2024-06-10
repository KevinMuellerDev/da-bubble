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
   * Initializes the login form with email and password controls.
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
   * Logs in a user asynchronously.
   * - Hides intro animation, removes 'hasSeenAnimation' flag.
   * - Submits form if valid or guest user.
   * - Authenticates with Firebase, stores UID, navigates on success.
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
   * Logs in a user asynchronously using Google authentication.
   * - Hides intro animation, removes 'hasSeenAnimation' flag.
   * - Authenticates with Firebase using Google provider.
   * - Stores UID, creates user profile, navigates on success.
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
