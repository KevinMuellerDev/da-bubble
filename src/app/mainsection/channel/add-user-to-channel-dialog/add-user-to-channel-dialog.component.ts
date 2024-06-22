import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';

@Component({
  selector: 'app-add-user-to-channel-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
  templateUrl: './add-user-to-channel-dialog.component.html',
  styleUrl: './add-user-to-channel-dialog.component.scss'
})
export class AddUserToChannelDialogComponent {
  @ViewChild('addUser', { read: ElementRef }) addUser!: ElementRef;
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  constructor(public dialog: MatDialog) { }

  getDmStatus(userIsLoggedIn: boolean) {
    const loggedIn = userIsLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  async getOtherUserData(user: any) {
    this.userService.otherUserInfo = user;
    this.openDialogUserInfo();
  }

  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  openDialogAddUser() {
    const rect = this.addUser.nativeElement.getBoundingClientRect();
    this.dialog.open(AddUserDialogComponent, {
      panelClass: ['add-user', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${rect.top}px`, left: `${rect.right - 464}px` }
    });
  }
}

