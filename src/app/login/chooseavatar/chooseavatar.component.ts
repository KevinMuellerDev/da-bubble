import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';
import { UserService } from '../../shared/services/user.service';
import { User, sendEmailVerification, getAuth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { RegisterComponent } from '../register/register.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-chooseavatar',
  standalone: true,
  imports: [RouterLink, CommonModule, RegisterComponent],
  templateUrl: './chooseavatar.component.html',
  styleUrls: ['./chooseavatar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: '1'
      })),
      state('out', style({
        transform: 'translateX(100%)' + 'rotate(-180deg)',
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

export class ChooseavatarComponent implements OnInit {
  selectedAvatar: string = '../../assets/img/login/default_profil_img.png'; // default img
  popupState = 'out';
  showLoading = false;
  userName: string = '';
  avatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile2.svg?alt=media&token=fdc78ec8-f201-4138-8447-d49c957ba67a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile1.svg?alt=media&token=e8652777-3f75-4517-9789-e3b24ef87820',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile6.svg?alt=media&token=f7827bc5-1cd3-499d-be4e-2e748a170699',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile4.svg?alt=media&token=104a104e-712c-4d89-99c8-5c6d6eeb381b',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile5.svg?alt=media&token=25935b79-8ce7-4f23-9d2e-a82b95adfbc3',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile3.svg?alt=media&token=7bd92926-13d9-476b-8c39-fde34aa7044e'
  ];

  userService: UserService = inject(UserService);

  constructor(private storageService: StorageService, private router: Router) { }

/**
 * Initializes the component, setting the list of avatars and the user's name.
 * Called automatically by Angular on component initialization.
 */
  ngOnInit() {
    this.avatars = this.getAvatars();
    this.userName = this.userService.createUserInfo.name;
  }

  /**
   * Retrieves the list of avatars.
   * @return {string[]} The array of avatar paths.
   */
  getAvatars(): string[] {
    return this.avatars;
  }

  /**
   * Selects an avatar by setting the selectedAvatar property to the provided avatar.
   * @param {string} avatar - The avatar to be selected.
   */
  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
    this.storageService.files = {} as FileList;
    this.userService.createUserInfo.profilePicture = this.selectedAvatar;
  }

  /**
   * Triggers the file input element to open the file selection dialog.
   */
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
    this.selectedAvatar;
  }

  /**
   * Handles the event when a file is selected.
   * @param {HTMLInputElement} input - The input element that triggered the file selection.
   */
  refFile(input: HTMLInputElement) {
    this.storageService.onFileSelected(input);
    const file = this.storageService.files?.item(0);
    if (file) {
      this.selectedAvatar = URL.createObjectURL(this.storageService.fileUrl);
      console.log(this.selectedAvatar);
    }
  }

  /**
   * Registers a new user.
   */
  registerUser() {
    this.loadingScreen();
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, this.userService.createUserInfo.email, this.userService.key)
      .then(async (userCredential) => {
        this.userService.createUserInfo.id = userCredential.user.uid;
        await this.storageService.uploadFile(this.userService.createUserInfo.id);
        /* await sendEmailVerification(auth.currentUser as User); */
        await this.userService.createUserProfile();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Creates a Promise that resolves after a specified delay.
   * @param {number} ms - The delay in milliseconds.
   */
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Displays a loading screen for a specified duration and navigates to the home page.
   */
  async loadingScreen() {
    this.showLoading = true;
    await this.delay(2500);
    this.showLoading = false;
    this.popupState = 'in';
    await this.delay(1000);
    this.popupState = 'out';
    this.router.navigate(['/']);
  }
}
