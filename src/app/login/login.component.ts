import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseError, firebaseApp$ } from '@angular/fire/app';
import { signOut } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from '../shared/services/user.service';
import { StorageService } from '../shared/services/storage.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('slideLogoContainer', [
      state('initial', style({ opacity: 1 })),
      state('final', style({
        opacity: 0,
        transform: '{{transform}}',
        height: '70px',
        gap: '16px',
        top: '55px', left: '{{left}}'
      }),
        {
          params: {
            left: '70px',
            transform: 'translate(0%, 0%)'
          }
        }),
      transition('initial=>final', [
        animate('1.15s ease-in-out')
      ])
    ]),
    trigger('slideLogoTextContainer', [
      state('initial', style({ opacity: 0 })),
      state('final', style({
        opacity: 1,
        transform: 'translate(0%, 0%)'
      })),
      transition('initial=>final', [
        animate('0.25s ease-in-out')
      ])
    ]),
    trigger('slideLogoText', [
      state('initial', style({
        fontSize: '1rem',
      })),
      state('final', style({
        fontSize: '1rem',
      })),
      transition('initial=>final', [
        animate('2.5s ease-in-out', keyframes([
          style({ fontSize: '0.75rem', offset: 0 }),
          style({ fontSize: '2rem', transform: 'rotate(360deg)', offset: 0.01 }),
          style({ fontSize: '4rem', offset: 0.45 }),
          style({ fontSize: '4.5rem', offset: 0.5 }),
          style({ fontSize: '4rem', offset: 0.55 }),
          style({ fontSize: '3rem', offset: 0.9 }),
          style({ fontSize: '1rem', offset: 1 }),
        ]))
      ])
    ]),
    trigger('slideLogo', [
      state('initial', style({
        width: '187px',
        height: '184px',
      })),
      state('final', style({
        width: '70px',
        height: '70px',
      })),
      transition('initial=>final', [
        animate('1s ease-in-out')
      ])
    ]),
  ]
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
  logoContainerState: string = 'initial';
  logoState: string = 'initial';
  logoTextContainerState: string = 'initial';
  logoTextState: string = 'initial';
  leftPosition: string = '';
  transform: string = '';

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


  ngOnInit() {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');
    if (!hasSeenAnimation) {
      this.showIntroAnimation = true;
      // sessionStorage.setItem('hasSeenAnimation', 'true');
      this.delayIntroAnimation();
      this.checkScreenWidth();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.leftPosition = window.innerWidth <= 768 ? '50%' : '70px';
    this.transform = window.innerWidth <= 768 ? 'translate(-50%, -50%)' : 'translate(0%, 0%)';
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  delayIntroAnimation() {
    this.delay(500).then(() => {
      this.logoTextState = 'final';
    });
    this.delay(1750).then(() => {
      this.logoState = 'final';
    });
    this.delay(250).then(() => {
      this.logoTextContainerState = 'final';
    });
    this.delay(1750).then(() => {
      this.logoContainerState = 'final';
    });
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
