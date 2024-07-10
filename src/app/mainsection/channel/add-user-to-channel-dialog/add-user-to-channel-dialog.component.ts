import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { StateService } from '../../../shared/services/state-service.service';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-add-user-to-channel-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './add-user-to-channel-dialog.component.html',
  styleUrl: './add-user-to-channel-dialog.component.scss'
})
export class AddUserToChannelDialogComponent {
  @ViewChild('addUser', { read: ElementRef }) addUser!: ElementRef;
  @ViewChild('icon', { read: ElementRef }) icon!: ElementRef;
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  stateService: StateService = inject(StateService);
  initialReferenceElementPosition!: { top: number; left: number };
  stateEditChannelDialogOpenMobile: boolean = this.stateService.getEditChannelDialogOpenMobile();

  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<AddUserToChannelDialogComponent>) { }

  /**
   * A description of the entire function.
   * @param {boolean} userIsLoggedIn - description of parameter
   * @return {string} description of return value
   */
  getDmStatus(userIsLoggedIn: boolean) {
    const loggedIn = userIsLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  /**
   * A description of the entire function.
   * @param {any} user - description of parameter
   * @return description of return value
   */
  async getOtherUserData(user: any) {
    this.userService.otherUserInfo = user;
    this.openDialogUserInfo();
  }

  /**
   * Opens a dialog to display the user's profile information.
   * Sets the `otherUser` property of the `ShowProfileComponent` to `true` and
   * the `profileEditable` property to `false`.
   * Subscribes to the `afterClosed` event of the dialog and does nothing.
   */
  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  /**
   * Calculates and sets the initial position of the reference element.
   * This function retrieves the native element of the `addUser` component and
   * uses its `getBoundingClientRect()` method to get its position relative to
   * the viewport. It then sets the `top` and `left` properties of the
   * `initialReferenceElementPosition` object to the corresponding values.
   */
  refContainerPosition() {
    const referenceElement = this.addUser.nativeElement;
    this.initialReferenceElementPosition = {
      top: referenceElement.getBoundingClientRect().top,
      left: referenceElement.getBoundingClientRect().right
    };
  }

  /**
   * Opens dialog for adding user to channel over stateService
   */
  openDialogAddUser() {
    this.stateService.triggerAddUser();
    this.dialogRef.close();
  }
}

