import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { MainsectionComponent } from '../../mainsection.component';
import { MatDialog, MatDialogRef  } from '@angular/material/dialog';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';
import { EditChannelDialogComponent } from '../edit-channel-dialog/edit-channel-dialog.component';
import { AddUserToChannelDialogComponent } from '../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { MessageComponent } from './message/message.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { SidebarService } from '../../../shared/services/sidebar.service';
import { UserService } from '../../../shared/services/user.service';


@Component({
  selector: 'app-channel-messages',
  standalone: true,
  imports: [
    CommonModule,
    ShowProfileComponent,
    EditChannelDialogComponent,
    AddUserToChannelDialogComponent,
    AddUserDialogComponent,
    MessageComponent,
    NgOptimizedImage,
    MainsectionComponent
  ],
  templateUrl: './channel-messages.component.html',
  styleUrl: './channel-messages.component.scss'
})
export class ChannelMessagesComponent {
  channelService: ChannelService = inject(ChannelService);
  sidebarService: SidebarService = inject(SidebarService);
  userService: UserService = inject(UserService);
  @ViewChild('editChannel', { read: ElementRef }) editChannel!: ElementRef;
  @ViewChild('addUserToChannel', { read: ElementRef }) addUserToChannel!: ElementRef;
  @ViewChild('addUser', { read: ElementRef }) addUser!: ElementRef;
  private dialogRefs: MatDialogRef<any>[] = [];
  constructor(public dialog: MatDialog) { }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateDialogPositions();
  }

  openDialogAddUser() {
    const rect = this.addUser.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      panelClass: ['add-user', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.right - 514}px` }
    });
    this.dialogRefs.push(dialogRef);
  }


  openDialogAddUserToChannel() {
    const rect = this.addUserToChannel.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(AddUserToChannelDialogComponent, {
      panelClass: ['add-user-to-channel', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.right - 415}px` }
    });
    this.dialogRefs.push(dialogRef);
  }

  openDialogEditChannel() {
    const rect = this.editChannel.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(EditChannelDialogComponent, {
      panelClass: ['edit-channel', 'box-radius-left-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.left - 20}px` }
    });
    this.dialogRefs.push(dialogRef);
  }

  async getOtherUserData(id?: string) {
    await this.userService.retrieveOtherUserProfile(id!);
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

  updateDialogPositions() {
    this.dialogRefs.forEach(dialogRef => {
      const dialogComponentInstance = dialogRef.componentInstance;
      if (dialogComponentInstance instanceof AddUserDialogComponent) {
        const rect = this.addUser.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.right - 514}px` });
      } else if (dialogComponentInstance instanceof AddUserToChannelDialogComponent) {
        const rect = this.addUserToChannel.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.right - 415}px` });
      } else if (dialogComponentInstance instanceof EditChannelDialogComponent) {
        const rect = this.editChannel.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.left - 20}px` });
      }
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.channelService.privateMsgData = undefined;
    this.channelService.privateMsg = false;
    this.channelService.channelMsg = false;
  }
}
