import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { ShowProfileComponent } from '../../show-profile/show-profile.component';
import { UserService } from '../../../services/user.service';
import { UserData } from '../../../models/userdata.class';
import { getAuth } from '@angular/fire/auth';
import { ChannelService } from '../../../services/channel.service';
import { subscribeOn } from 'rxjs';
import { AddUserDialogComponent } from '../../../../mainsection/channel/add-user-dialog/add-user-dialog.component';
import { AddUserToChannelDialogComponent } from '../../../../mainsection/channel/add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { ThreadService } from '../../../services/thread.service';
@Component({
  selector: 'app-user-menu-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, RouterLink],
  templateUrl: './user-menu-dialog.component.html',
  styleUrl: './user-menu-dialog.component.scss'
})
export class UserMenuDialogComponent {
  constructor(public dialog: MatDialog, private dialogRef: MatDialogRef<UserMenuDialogComponent>, private dialogRefAddUser: MatDialogRef<AddUserToChannelDialogComponent>, private userService: UserService) { }
  channelService: ChannelService = inject(ChannelService);
  threadService: ThreadService = inject(ThreadService);
  hoverProfile: boolean = false;
  hoverLogout: boolean = false;

  /**
   * The `logout` function logs out the user, clears session storage, signs out of authentication, stops
   * listening to channels and threads, resets user information, and closes a dialog.
   */
  async logout() {
    await this.userService.userLoggedOut();
    localStorage.removeItem('uid');
    getAuth().signOut();
    this.channelService.stopListener();
    this.threadService.stopListener();
    setTimeout(() => {
      this.userService.userInfo = new UserData();
    }, 200);
    this.dialogRef.close();
  }

  /**
   * This function opens the dialog and determines if the ShowProfile component is editable or not
   * @param profileEditable boolean - determine if ShowUser component is editable or not
   */
  openDialog() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile', 'box-shadow', 'box-radius-right-corner'] });
    dialogRef.componentInstance.profileEditable = true;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  /**
   * The closeDialog function closes all open dialog windows.
   */
  closeDialog() {
    this.dialog.closeAll();
  }
}
