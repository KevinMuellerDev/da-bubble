import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AddUserToChannelDialogComponent } from '../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule, AddUserToChannelDialogComponent],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {
  channelService: ChannelService = inject(ChannelService);
  editChannelName: boolean = false;
  editDescription: boolean = false;

  newChannelValues = {
    'name': '',
    'newDescription': ''
  }

/**
 * The function `changeEditChannelStatus` updates the name of a channel and sets a flag to indicate
 * that the channel name is being edited.
 */
  changeEditChannelStatus() {
    this.newChannelValues.name = this.channelService.channelMsgData.title;
    this.editChannelName = true;
  }


/**
 * The function `saveEditChannelStatus` updates a channel title and resets the form.
 * @param {NgForm} channelName - This parameter is used to access and manipulate the form data within the function.
 */
  async saveEditChannelStatus(channelName: NgForm) {
    this.editChannelName = false;
    await this.channelService.updateChannelTitle(this.newChannelValues.name);
    console.log(this.newChannelValues.name);
    channelName.reset();
  }


/**
 * The function `changeEditDescriptionStatus` sets the `newDescription` property to the current channel
 * description and sets `editDescription` to true.
 */
  changeEditDescriptionStatus() {
    this.newChannelValues.newDescription = this.channelService.channelMsgData.description;
    this.editDescription = true;
  }


/**
 * The function `saveEditDescriptionStatus` updates a channel description and resets the form.
 * @param {NgForm} changedDescription -  In this function, it is being used to reset the form
 * after updating the channel description.
 */
  async saveEditDescriptionStatus(changedDescription: NgForm) {
    this.editDescription = false;
    await this.channelService.updateChannelDescription(this.newChannelValues.newDescription);
    console.log(this.newChannelValues.newDescription);
    changedDescription.reset();
  }

  
  leaveChannel() {
    console.log("ciao");
  }

}
