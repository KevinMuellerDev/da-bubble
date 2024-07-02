import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { StateService } from '../../../shared/services/state-service.service';
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
  @ViewChild('icon', { read: ElementRef }) icon!: ElementRef;
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  stateService: StateService = inject(StateService);
  initialReferenceElementPosition!: { top: number; left: number };
  stateEditChannelDialogOpenMobile: boolean = this.stateService.getEditChannelDialogOpenMobile();
  public dialogRefs: MatDialogRef<any>[] = [];
  constructor(public dialog: MatDialog) {
  }

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

  refContainerPosition() {
    const referenceElement = this.addUser.nativeElement;
    this.initialReferenceElementPosition = {
      top: referenceElement.getBoundingClientRect().top,
      left: referenceElement.getBoundingClientRect().right
    };
  }

  openDialogAddUser() {
    this.refContainerPosition();
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      panelClass: ['add-user', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${this.initialReferenceElementPosition.top - 24}px`, left: `${this.initialReferenceElementPosition.left - 478}px` },
    });
    this.dialogRefs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRefs = [];
    });
  }

  ngOnDestroy(): void {
  }
}

