import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { MainsectionComponent } from '../../mainsection.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShowProfileComponent } from '../../../shared/components/show-profile/show-profile.component';
import { EditChannelDialogComponent } from '../edit-channel-dialog/edit-channel-dialog.component';
import { AddUserToChannelDialogComponent } from '../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { MessageComponent } from './message/message.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { SidebarService } from '../../../shared/services/sidebar.service';
import { UserService } from '../../../shared/services/user.service';
import { StateService } from '../../../shared/services/state-service.service';
import { ResizeListenerService } from '../../../shared/services/resize-listener.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { User } from '@angular/fire/auth';


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
    MainsectionComponent,
    MatMenuModule,
    FormsModule
  ],
  templateUrl: './channel-messages.component.html',
  styleUrl: './channel-messages.component.scss'
})

export class ChannelMessagesComponent implements OnInit {
  channelService: ChannelService = inject(ChannelService);
  sidebarService: SidebarService = inject(SidebarService);
  userService: UserService = inject(UserService);
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);
  stateService: StateService = inject(StateService);
  @ViewChild('editChannel', { read: ElementRef }) editChannel!: ElementRef;
  @ViewChild('addUserToChannel', { read: ElementRef }) addUserToChannel!: ElementRef;
  @ViewChild('addUser', { read: ElementRef }) addUser!: ElementRef;
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  activeChannelHead = '';
  searchReceiver = {
    receiver: ''
  }
  public dialogRefs: MatDialogRef<any>[] = [];
  userList: any[] = [];
  channelList: any[] = [];

  constructor(public dialog: MatDialog) {
    this.resizeListenerService.registerResizeCallback(this.updateDialogPositions.bind(this));
    this.dialogRefs = [];
  }

  ngOnInit(): void {
    this.stateService.setEditChannelDialogOpenMobile(true);
  }

  /**
   * Opens dialog to add user.
   * position is set to the bottom right corner of the addUser element.
   * Depends on screen size for mobile or desktop
   */
  openDialogAddUserDependentBrowserSize() {
    if (this.resizeListenerService.xsmScreen || this.resizeListenerService.smScreen) {
      this.dialogRefs = [];
      this.openDialogAddUserToChannel();
    } else {
      this.openDialogAddUser();
    }
  }

  /**
   * Opens dialog to add user.
   * position is set to the bottom right corner of the addUser element.
   */
  openDialogAddUser() {
    const rect = this.addUser.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      panelClass: ['add-user', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.right - 538}px` }
    });
    this.dialogRefs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRefs = [];
    });
  }

  /**
   * Opens dialog for adding user to channel.
   * position is set to the bottom right corner of the addUserToChannel element.
   */
  openDialogAddUserToChannel() {
    this.stateService.setEditChannelDialogOpenMobile(false);
    const rect = this.addUserToChannel.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(AddUserToChannelDialogComponent, {
      panelClass: ['add-user-to-channel', 'box-radius-right-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.right - 438}px` }
    });
    this.dialogRefs.push(dialogRef);
    dialogRef.afterClosed().subscribe(() => {
      this.stateService.setEditChannelDialogOpenMobile(true);
      this.dialogRefs = [];
    });
  }

  /**
   * Opens a dialog to edit a channel.
   * position is set to the bottom left corner of the editChannel element.
   */
  openDialogEditChannel() {
    this.activeChannelHead = '';
    const rect = this.editChannel.nativeElement.getBoundingClientRect();
    const dialogRef = this.dialog.open(EditChannelDialogComponent, {
      panelClass: ['edit-channel', 'box-radius-left-corner', 'box-shadow'],
      position: { top: `${rect.bottom}px`, left: `${rect.left - 20}px` }
    });
    this.dialogRefs.push(dialogRef);
    this.activeChannelHead = 'edit-channel';
    dialogRef.afterClosed().subscribe(() => {
      this.dialogRefs = [];
      this.activeChannelHead = '';
    });
  }

  async getOtherUserData(id?: string) {
    await this.userService.retrieveOtherUserProfile(id!);
    this.openDialogUserInfo();
  }

  /**
   * Opens dialog to display user's profile info. Opens ShowProfileComponent, sets
   * otherUser to true and profileEditable to false. Closes dialog when user clicks
   * outside or presses escape key.
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
   * Updates the positions of the dialogs based on the type of dialog component instance.
   */
  updateDialogPositions() {
    this.dialogRefs.forEach(dialogRef => {
      const dialogComponentInstance = dialogRef.componentInstance;
      if (dialogComponentInstance instanceof AddUserDialogComponent) {
        const rect = this.addUser.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.right - 538}px` });
      } else if (dialogComponentInstance instanceof AddUserToChannelDialogComponent) {
        const rect = this.addUserToChannel.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.right - 438}px` });
      } else if (dialogComponentInstance instanceof EditChannelDialogComponent) {
        const rect = this.editChannel.nativeElement.getBoundingClientRect();
        dialogRef.updatePosition({ top: `${rect.bottom}px`, left: `${rect.left - 20}px` });
      }
    });
  }

  getMenu() {
    this.trigger.openMenu();
  }

  searchUser() {
    this.userList = [];
    this.userService.allUsers.forEach(element => {
      const name: string = element['name'];

      const contains: boolean = name.toLocaleLowerCase().indexOf(this.searchReceiver.receiver.toLocaleLowerCase().substring(1)) != -1;
      if (contains && this.searchReceiver.receiver != '') {
        this.userList.push(element);
      }
    });
  }

  searchChannel() {
    this.channelList = [];
    this.sidebarService.channels.forEach(element => {
      const title: string = element['title'];
      const contains: boolean = title.toLocaleLowerCase().indexOf(this.searchReceiver.receiver.toLocaleLowerCase().substring(1)) != -1;
      if (contains && this.searchReceiver.receiver != '') {
        this.channelList.push({ title: title, collection: element['collection'] });
      }
    });
  }

  resetInput() {
    this.searchReceiver.receiver = '';
  }

  /**
   * Called once, before the instance is destroyed.
   * Add 'implements OnDestroy' to the class.
   * removes the resize listener
   */
  ngOnDestroy(): void {
    this.channelService.privateMsgData = undefined;
    this.channelService.privateMsg = false;
    this.channelService.channelMsg = false;
    this.resizeListenerService.unregisterResizeCallback(this.updateDialogPositions.bind(this));
  }
}
