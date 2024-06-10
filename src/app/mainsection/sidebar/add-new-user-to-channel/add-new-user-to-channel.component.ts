import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-add-new-user-to-channel',
  standalone: true,
  imports: [MatDialogModule, FormsModule, CommonModule],
  templateUrl: './add-new-user-to-channel.component.html',
  styleUrl: './add-new-user-to-channel.component.scss'
})
export class AddNewUserToChannelComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);

  specificUser: boolean;
  userList: object[] = [];
  inputs = {
    specificUser: ''
  }

  constructor() {
    this.specificUser = false;
  }

  onSubmit(addUserInputs: NgForm) {
    if (this.specificUser = true) {
      this.searchUser();
    } else{
      this.getUsersFromChannel();
    }
  }

  searchUser() {
    this.userService.allUsers.forEach(element => {
      const name:string = element['name'];
      const contains:boolean = name.toLocaleLowerCase().indexOf(this.inputs.specificUser.toLocaleLowerCase()) != -1;
      if (contains) {
        console.log(element['name']);
        this.userList.push({user: name ,uid: element['id']})
      }
    });
    console.log(this.userList);  
  }


  getUsersFromChannel(){
    return
  }


}
