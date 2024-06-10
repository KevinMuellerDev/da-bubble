import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule ,NgForm} from '@angular/forms';
import {  MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [MatDialogModule,CommonModule,FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {

  editChannelName: boolean = false;
  editDescription: boolean = false;
  
  newChannelValues = {
    'name': '',
    'newDescription':''
  }

  changeEditChannelStatus() {
    this.editChannelName =true
  }
    saveEditChannelStatus(channelName:NgForm) {
      this.editChannelName = false
      console.log(this.newChannelValues.name);
      channelName.reset();
  }

    changeEditDescriptionStatus() {
    this.editDescription =true
  }

    saveEditDescriptionStatus(changedDescription:NgForm) {
      this.editDescription = false
      console.log(this.newChannelValues.newDescription);
      changedDescription.reset();
  }

  leaveChannel() {
    console.log("ciao");
    
  }

}
