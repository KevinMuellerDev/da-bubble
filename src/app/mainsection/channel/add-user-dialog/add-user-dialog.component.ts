import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../../shared/services/user.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Firestore, addDoc, arrayUnion, collection, doc, updateDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../../shared/services/channel.service';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [MatDialogModule, MatMenuModule, CommonModule, FormsModule],
  templateUrl: './add-user-dialog.component.html',
  styleUrl: './add-user-dialog.component.scss',
})

export class AddUserDialogComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  userService: UserService = inject(UserService);
  channelService: ChannelService = inject(ChannelService);
  firestore: Firestore = inject(Firestore);
  addUser = {
    name: ''
  }
  userList: any[] = [];
  selectedUser: any[] = [];

  async submitUser(addedUser: NgForm) {
    console.log(addedUser.name);
    await this.updateChannelUsers();
    addedUser.reset();
  }

  /**
  * The `searchUser` function filters a list of users based on a specific user input and populates a new
  * list with matching users' information.
  */
  searchUser() {
    this.userList = [];
    this.userService.allUsers.forEach(element => {
      const name: string = element['name'];
      const contains: boolean = name.toLocaleLowerCase().indexOf(this.addUser.name.toLocaleLowerCase()) != -1;
      const checkUid = (obj: { id: any; }) => obj.id === element['id'];
      if (contains && this.addUser.name != '' && !this.channelService.currentChannelUsers.some(checkUid)) {
        this.userList.push({ user: name, uid: element['id'], img: element['profilePicture'] });
      }
    });
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
    this.addUser.name = ''
  }

  async updateChannelUsers() {
    console.log(this.selectedUser);
    this.selectedUser.forEach(async user => {
      console.log(user);
      await updateDoc(doc(this.firestore, "Channels", this.channelService.channelMsgData.collection), {
        users: arrayUnion(user.uid)
      });
      await addDoc(collection(this.firestore, 'user', user.uid, 'userchannels'), { channelid: this.channelService.channelMsgData.collection });
    });
  }
}
