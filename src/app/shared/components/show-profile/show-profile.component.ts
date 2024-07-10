import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
} from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { VerifyComponent } from '../verify/verify.component';
import { ChannelService } from '../../services/channel.service';
import { SidebarService } from '../../services/sidebar.service';
import { ThreadService } from '../../services/thread.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-show-profile',
  standalone: true,
  imports: [MatDialogActions, MatDialogClose, CommonModule, ReactiveFormsModule],
  templateUrl: './show-profile.component.html',
  styleUrl: './show-profile.component.scss'
})

export class ShowProfileComponent {
  threadService: ThreadService = inject(ThreadService);
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  sidebarService: SidebarService = inject(SidebarService);
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedAvatar: string = '../../assets/img/login/default_profil_img.png';
  avatars: any = this.storageService.avatars;
  updateUserForm: FormGroup;
  otherUser: boolean = false;
  profileEditable: boolean = false;
  editMode: boolean = false;
  editProfilePic: boolean = false;
  otherUserInfo!: any;
  otherUserId!: string;
  dummySelected: boolean= false;

  constructor(
    private storageService: StorageService,
    public dialog: MatDialog,
    public authService: AuthService,
    private dialogRef: MatDialogRef<ShowProfileComponent>) {
    this.updateUserForm = new FormGroup({
      name: new FormControl(this.userService.userInfo.name),
      email: new FormControl(this.userService.userInfo.email, [Validators.required, Validators.email]),
    });
    this.avatars = this.storageService.avatars;
    this.selectedAvatar = this.userService.userInfo.profilePicture;
  }

  /**
   * The `selectAvatar` function in TypeScript sets the selectedAvatar property to the provided avatar
   * string.
   * @param {string} avatar - The `selectAvatar` function takes a parameter `avatar` of type string. When
   * this function is called, it sets the `selectedAvatar` property of the object to the value of the
   * `avatar` parameter.
   */
  selectAvatar(avatar: string) {
    this.selectedAvatar = avatar;
    this.dummySelected = true;
  }

  /**
   * The `triggerFileInput` function triggers a click event on a file input element and sets the
   * selectedAvatar property to null.
   */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
    this.selectedAvatar;
  }

  /**
   * The function `onImageSelected` takes an HTML input element, selects a file from storage service, and
   * creates a URL for the selected file.
   * @param {HTMLInputElement} input - The `input` parameter in the `onImageSelected` function is of type
   * `HTMLInputElement`. It is used to represent an input element in an HTML form, such as an input field
   * of type "file" that allows users to select files from their device.
   */
  onImageSelected(input: HTMLInputElement) {
    this.storageService.onFileSelected(input);
    const file = this.storageService.files?.item(0);
    if (file) {
      this.selectedAvatar = URL.createObjectURL(this.storageService.fileUrl);
    }
  }

  /**
   * The `newProfilePicture` function asynchronously uploads a file to storage and updates the user's
   * profile picture.
   */
  async newProfilePicture() {
    if(!this.dummySelected){
      await this.storageService.uploadFile(this.userService.currentUser!);
    } else{
      this.userService.createUserInfo.profilePicture = this.selectedAvatar;
      this.dummySelected = false;
    }
    await this.userService.updateUserProfilePicture(this.userService.createUserInfo.profilePicture)
  }

  /**
   * Function returns the class of user status for online indicator div and text
   * depending on given type as a string
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus(type: string) {
    if (!this.otherUser) {
      const status = this.userService.userInfo.isLoggedIn == true ? "online" : "offline";
      if (type == 'text')
        return status
      return status + '-div'
    } else {
      const status = this.userService.otherUserInfo.isLoggedIn == true ? "online" : "offline";
      if (type == 'text')
        return status
      return status + '-div'
    }
  }

  /**
   * The `getStatusText` function returns "Aktiv" if the user is logged in and "Inaktiv" if the user is
   * not logged in.
   * @returns `string`
   */
  getStatusText() {
    if (!this.otherUser) {
      const text = this.userService.userInfo.isLoggedIn == true ? "Aktiv" : "Inaktiv";
      return text
    } else {
      const text = this.userService.otherUserInfo.isLoggedIn == true ? "Aktiv" : "Inaktiv";
      return text
    }
  }

  /**
   * The function `checkUpdateInput` checks if the `updateUserForm` is valid and opens a dialog if it is.
   */
  checkUpdateInput() {
    if (this.updateUserForm.valid) {
      this.openDialog()
    }
  }

  async sendMessage() {
    let alreadyPushed = false;
    await this.channelService.updateUserDm(this.userService.otherUserInfo);
    this.sidebarService.userDmData.forEach(element => {
      if (element.id == this.userService.otherUserInfo.id)
        alreadyPushed = true;
    });
    if (!alreadyPushed)
      this.sidebarService.userDmData.push(this.userService.otherUserInfo);
    this.channelService.chooseChannelType(true, this.userService.otherUserInfo);
    this.threadService.stopListener();
    this.threadService.triggerHideThread();
    this.threadService.isActive = false;
    this.closeDialog();
  }

  /**
   * The `openDialog` function opens a dialog window to verify user information and updates user email
   * and profile if verified.
   */
  openDialog() {
    this.dialog.open(VerifyComponent, { panelClass: ['box-shadow', 'box-radius'] })
      .afterClosed()
      .subscribe(() => {
        if (this.authService.verified == true) {
          this.authService.updateUserMail(this.updateUserForm.controls['email'].value)
          this.userService.updateUserProfile(this.updateUserForm);
          this.editMode = false;
        } else {
          return
        }
      })
  }

  /**
   * Toggles the value of `editProfilePic`, which controls whether the profile picture can be changed.
   */
  toggleChangeProfilePic() {
    this.editProfilePic = !this.editProfilePic;
  }

  /**
   * The closeDialog function closes all open dialog windows.
   */
  closeDialog() {
    this.otherUser ? this.dialog.closeAll() : this.dialogRef.close()
  }
}
