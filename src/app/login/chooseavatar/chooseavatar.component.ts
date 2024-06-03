import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'app-chooseavatar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './chooseavatar.component.html',
  styleUrls: ['./chooseavatar.component.scss']
})
export class ChooseavatarComponent implements OnInit {

  selectedAvatar: string = '../../assets/img/login/default_profil_img.png'; // default img

  avatars: string[] = [
    '../assets/img/profile/elias_neumann.png',
    '../assets/img/profile/elise_roth.png',
    '../assets/img/profile/frederik_beck.png',
    '../assets/img/profile/noah_braun.png',
    '../assets/img/profile/sofia_müller.png',
    '../assets/img/profile/steffen_hoffmann.png'
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
  }

  /**
   * Triggers the file input element to open the file selection dialog.
   */
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
    this.selectedAvatar;
  }


  /**-------------mit dem StorageService abstimmen!!--------------- */
  /**
   * Handles the event when a file is selected.
   * @param {HTMLInputElement} input - The input element that triggered the file selection.
   */
  onFileSelected(input: HTMLInputElement) {
    this.storageService.onFileSelected(input);



    // Set the selectedAvatar property to the URL of the selected file.
    const file = this.storageService.files?.item(0);
    if (file) {
      this.selectedAvatar = URL.createObjectURL(file);
      console.log(this.selectedAvatar);
    }
  }
}
