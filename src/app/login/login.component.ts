import { Component, OnInit, inject, HostListener, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FirebaseError } from '@angular/fire/app';
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
        animate('1.25s ease-in-out')
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
        fontSize: '0.75rem',
      })),
      state('final', style({
        fontSize: '1rem',
      })),
      transition('initial=>final', [
        animate('2.5s ease-in-out', keyframes([
          style({ fontSize: '0.75rem', offset: 0 }),
          style({ fontSize: '1.8rem', transform: 'rotate(360deg)', offset: 0.01 }),
          style({ fontSize: '{{fontSize}}', offset: 0.5 }),
          style({ fontSize: '1.8rem', offset: 0.9 }),
          style({ fontSize: '1rem', offset: 1 })
        ]))
      ], { params: { fontSize: '5.5rem' } })
    ]),
    trigger('slideLogo', [
      state('initial', style({
        width: '{{width}}',
        height: '{{height}}',
      }),
        {
          params: {
            width: '70px',
            height: '70px'
          }
        }),
      state('final', style({
        width: '70px',
        height: '70px',
      })),
      transition('initial=>final', [
        animate('1.25s ease-in-out')
      ])
    ]),
  ]
})

export class LoginComponent implements OnInit, AfterViewInit {
  firestore: Firestore = inject(Firestore);
  userService: UserService = inject(UserService);
  storageService: StorageService = inject(StorageService);
  showIntroAnimation: boolean = false;
  showPassword: boolean = false;
  isFormSubmitted: boolean = false;
  loginForm: FormGroup;
  firstFocus: boolean = true;
  guest!: boolean;
  logoContainerState: string = 'initial';
  logoState: string = 'initial';
  logoTextContainerState: string = 'initial';
  logoTextState: string = 'initial';
  errorMessage: string = '';
  leftPosition: string = '';
  transform: string = '';
  logoWidth: string = '';
  logoHeight: string = '';
  logoTextSize: string = '';
  @ViewChild('emailInput') emailInput!: ElementRef;

  /**
   * Initializes the login form with email and password controls.
   * @constructor
   */
  constructor(private router: Router) {
    localStorage.setItem('uid', '')
    this.checkScreenWidth();
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)])
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  /**
   * Initializes the component when it is created.
   * Checks if the animation has been seen before, sets animation flag, and delays animation.
   * Also, checks the screen width for responsive design.
   */
  ngOnInit() {
    this.checkScreenWidth();
    const hasSeenAnimation = localStorage.getItem('hasSeenAnimation');
    if (!hasSeenAnimation) {
      this.showIntroAnimation = true;
      localStorage.setItem('hasSeenAnimation', 'true');
      this.delayIntroAnimation();
    }
  }

  /**
   * Initializes the component after the view has been initialized.
   * Sets the focus on the email input element and checks the screen width for responsive design.
   */
  ngAfterViewInit(): void {
    this.checkScreenWidth();
  }

  /**
   * The `onInput` function sets the `firstFocus` property to false.
   */
  onInput() {
    this.firstFocus = false;
    this.errorMessage = '';
  }

  /**
   * Sets the CSS properties based on the current window width for responsive design.
   */
  checkScreenWidth() {
    this.leftPosition = window.innerWidth <= 768 ? '50%' : '70px';
    this.transform = window.innerWidth <= 768 ? 'translate(-50%, -50%)' : 'translate(0%, 0%)';
    this.logoWidth = window.innerWidth <= 624 ? '100px' : '147px';
    this.logoHeight = window.innerWidth <= 624 ? '100px' : '147px';
    this.logoTextSize = window.innerWidth <= 624 ? '3rem' : '5rem';
    this.logoWidth = window.innerWidth <= 375 ? '80px' : '127px';
    this.logoHeight = window.innerWidth <= 375 ? '80px' : '127px';
    this.logoTextSize = window.innerWidth <= 375 ? '3rem' : '5rem';
  }

  /**
   * A function that introduces a delay before resolving a Promise.
   * @param {number} ms - The delay time in milliseconds.
   * @return {Promise} A Promise that resolves after the specified delay.
   */
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * A function that delays the intro animation by setting different states at different time intervals.
   */
  delayIntroAnimation() {
    this.delay(500).then(() => {
      this.logoTextState = 'final';
    });
    this.delay(1500).then(() => {
      this.logoState = 'final';
    });
    this.delay(250).then(() => {
      this.logoTextContainerState = 'final';
    });
    this.delay(1750).then(() => {
      this.logoContainerState = 'final';
    });
    this.delay(3500).then(() => {
      this.emailInput.nativeElement.focus();
    });
  }

  /**
  * Toggles the visibility of the password field.
  */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * A function that removes the intro animation flag and corresponding session storage item.
   */
  removeShowIntroAnimationFlag() {
    this.showIntroAnimation = false;
    localStorage.removeItem('hasSeenAnimation');
  }

  /**
   * Logs in a user asynchronously.
   * - Hides intro animation, removes 'hasSeenAnimation' flag.
   * - Submits form if valid or guest user.
   * - Authenticates with Firebase, stores UID, navigates on success.
   */
  async login() {
    this.removeShowIntroAnimationFlag();
    this.isFormSubmitted = true;
    if (this.loginForm.valid || this.guest) {
      const auth = getAuth();
      const email = this.loginForm.value.email;
      const password = this.loginForm.value.password;
      this.guest = false;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        localStorage.setItem("uid", user.uid);
        this.router.navigate(['/mainsection/' + user.uid]);
        this.isFormSubmitted = false;
      } catch (error) {
        this.handleLoginError(error);
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
    this.removeShowIntroAnimationFlag();
    try {
      const result = await signInWithPopup(getAuth(), new GoogleAuthProvider());
      const user = result.user;
      const userExists = await this.userService.checkIfUserExists(user.uid);
      if (!userExists) {
        this.userService.prepareDataNewUserGoogle(user);
        await this.userService.createUserProfile();
      }
      localStorage.setItem("uid", user.uid);
      this.router.navigate(['/mainsection/' + user.uid]);
    } catch (error) {
      this.handleLoginError(error);
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

  /**
   * Handles errors during the login process.
   * @param error - The error object.
   */
  private handleLoginError(error: any) {
    if (error instanceof FirebaseError) {
      this.errorMessage = this.getFirebaseErrorMessage(error.code);
    } else {
      this.errorMessage = "An unexpected error occurred.";
    }
  }

  /**
  * Returns an error message based on the provided Firebase error code.
  * @param {string} errorCode - The Firebase error code.
  * @return {string} The corresponding error message.
  */
  getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return "Benutzer nicht gefunden.";
      case 'auth/wrong-password':
        return "falsches Passwort.";
      case 'auth/invalid-email':
        return "falsche Email.";
      case 'auth/popup-closed-by-user':
        return "Das Popup wurde geschlossen, bevor die Anmeldung abgeschlossen war.";
      case 'auth/cancelled-popup-request':
        return "Die Popup-Anfrage wurde abgebrochen.";
      case 'auth/account-exists-with-different-credential':
        return "Es existiert bereits ein Konto mit einer anderen Anmeldemethode für diese E-Mail-Adresse.";
      case 'auth/invalid-credential':
        return "Ungültige Anmeldedaten. Bitte überprüfen Sie Ihre Eingaben.";
      case 'auth/operation-not-allowed':
        return "Diese Anmeldemethode ist nicht erlaubt.";
      case 'auth/user-disabled':
        return "Ihr Konto wurde deaktiviert. Bitte kontaktieren Sie den Support.";
      default:
        return "Bei der Anmeldung mit Google ist ein Fehler aufgetreten.";
    }
  }
}
