import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { firebaseAppFactory } from '@angular/fire/app/app.module';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-add-new-user-to-channel',
  standalone: true,
  imports: [MatDialogModule, MatMenuModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './add-new-user-to-channel.component.html',
  styleUrl: './add-new-user-to-channel.component.scss',
})
export class AddNewUserToChannelComponent {
  @ViewChild("specificUserInput") specificUserInput?: { nativeElement: { focus: () => void; }; }
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  channelService: ChannelService = inject(ChannelService);
  sidebarService: SidebarService = inject(SidebarService);
  userService: UserService = inject(UserService);
  menuOpened: boolean = false;
  specificUser: boolean;
  userList: any[] = [];
  selectedUser: any[] = [];
  inputs = {
    specificUser: ''
  }

  constructor() {
    this.specificUser = false;
  }

  /**
   * The onSubmit function checks if a specific user is selected and adds them to a new channel,
   * otherwise it retrieves users from an existing channel.
   */
  onSubmit() {
    const creatorId = localStorage.getItem('uid')
    this.channelService.newChannel?.users.push(creatorId as string)
    if (this.specificUser == true) {
      this.selectedUser.forEach(user => {
        this.channelService.newChannel?.users.push(user.uid)
      });
      this.channelService.createNewChannel(this.channelService.newChannel!);
    } else {
      this.getUsersFromChannel();
      this.channelService.createNewChannel(this.channelService.newChannel!);
    }
  }

  /**
   * The `searchUser` function filters a list of users based on a specific user input and populates a new
   * list with matching users' information.
   */
  searchUser() {
    this.userList = [];
    this.userService.allUsers.forEach(element => {
      const name: string = element['name'];
      const contains: boolean = name.toLocaleLowerCase().indexOf(this.inputs.specificUser.toLocaleLowerCase()) != -1;
      const checkUid = (obj: { uid: any; }) => obj.uid === element['id'];
      if (contains && this.inputs.specificUser != '' && !this.selectedUser.some(checkUid)) {
        this.userList.push({ user: name, uid: element['id'], img: element['profilePicture'] });
      }
    });
  }

  /**
   * The `getMenu` function opens the menu by calling the `openMenu` method on the `trigger` object.
   */
  getMenu() {
    this.trigger.openMenu();
  }

  /**
   * The function `pushToSelection` adds a user object to the selectedUser array, clears the userList
   * array, and resets the specificUser input field.
   * @param {object} user - takes an `object` as a parameter named `user` and pushes it into `selectedUser`.
   */
  pushToSelection(user: any) {
    const checkUid = (obj: { uid: any; }) => obj.uid === user.uid;
    if (!this.selectedUser.some(checkUid))
      this.selectedUser.push(user);
    this.userList = [];
    this.inputs.specificUser = ''
  }

  /**
   * The function `removeUserFromSelection` removes a specified user from the `selectedUser` array.
   * @param {any} user - The `user` parameter in the `removeUserFromSelection` function is of type `any`,
   * which means it can accept any data type as its value.
   */
  removeUserFromSelection(user: any) {
    const contains = this.selectedUser.indexOf(user);
    this.selectedUser.splice(contains, 1);
  }

  /**
   * The function `focusOnUserInput` focuses on a specific user input element if it exists.
   */
  focusOnUserInput() {
    this.specificUserInput?.nativeElement.focus();
  }

  /**
   * The function `getUsersFromChannel` asynchronously retrieves users from a channel and adds them to a
   * user list.
   */
  async getUsersFromChannel() {
    this.userList = [];
    await this.sidebarService.getUsersFromChannel();
    this.sidebarService.channelUsers.forEach(user => {
      this.channelService.newChannel?.users.push(user);
    });
  }
}
