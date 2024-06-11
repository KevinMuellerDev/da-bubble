import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-add-new-user-to-channel',
  standalone: true,
  imports: [MatDialogModule, MatMenuModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './add-new-user-to-channel.component.html',
  styleUrl: './add-new-user-to-channel.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AddNewUserToChannelComponent {
  @ViewChild("specificUserInput") specificUserInput?: { nativeElement: { focus: () => void; }; };
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);

  specificUser: boolean;
  userList: any[] = [];
  selectedUser: any[] = [];
  inputs = {
    specificUser: ''
  }

  constructor() {
    this.specificUser = false;
  }


  onSubmit(addUserInputs: NgForm) {
    if (this.specificUser = true) {
      this.selectedUser.forEach(user => {
        this.channelService.newChannel?.users.push(user.uid)
      });
      this.channelService.createNewChannel(this.channelService.newChannel!);
    } else {
      this.getUsersFromChannel();
    }
  }


  searchUser() {
    this.userList = [];
    this.userService.allUsers.forEach(element => {
      const name: string = element['name'];
      const contains: boolean = name.toLocaleLowerCase().indexOf(this.inputs.specificUser.toLocaleLowerCase()) != -1;
      if (contains && this.inputs.specificUser != '') {
        this.userList.push({ user: name, uid: element['id'], img: element['profilePicture'] });
      }
    });
    console.log(this.userList);
  }

  pushToSelection(user:object){
    this.selectedUser.push(user);
    this.userList=[];
    this.inputs.specificUser =''
  }

  removeUserFromSelection(user:any){
    const contains = this.selectedUser.indexOf(user);
    this.selectedUser.splice(contains,1);
  }

  focusOnUserInput() {
    this.specificUserInput?.nativeElement.focus();
  }


  getUsersFromChannel() {
    return
  }


}
