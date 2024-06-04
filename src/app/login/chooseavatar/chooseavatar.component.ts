import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-chooseavatar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './chooseavatar.component.html',
  styleUrls: ['./chooseavatar.component.scss']
})
export class ChooseavatarComponent implements OnInit {
  userService:UserService = inject(UserService);

  selectedAvatar: string = '../../assets/img/login/default_profil_img.png'; // default img

  avatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile2.svg?alt=media&token=fdc78ec8-f201-4138-8447-d49c957ba67a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile1.svg?alt=media&token=e8652777-3f75-4517-9789-e3b24ef87820',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile6.svg?alt=media&token=f7827bc5-1cd3-499d-be4e-2e748a170699',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile4.svg?alt=media&token=104a104e-712c-4d89-99c8-5c6d6eeb381b',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile5.svg?alt=media&token=25935b79-8ce7-4f23-9d2e-a82b95adfbc3',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile3.svg?alt=media&token=7bd92926-13d9-476b-8c39-fde34aa7044e'
  ];

  constructor(private storageService: StorageService) { }

  ngOnInit() {
    this.avatars = this.getAvatars();
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
    console.log(this.storageService.fileUrl);
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
}
