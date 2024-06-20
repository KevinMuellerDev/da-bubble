import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule],
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

  changeEditChannelStatus() {
    this.editChannelName = true
  }
  async saveEditChannelStatus(channelName: NgForm) {
    this.editChannelName = false
    await this.channelService.updateChannelTitle(this.newChannelValues.name);
    console.log(this.newChannelValues.name);
    channelName.reset();
  }

  changeEditDescriptionStatus() {
    this.editDescription = true
  }

  async saveEditDescriptionStatus(changedDescription: NgForm) {
    this.editDescription = false
    await this.channelService.updateChannelDescription(this.newChannelValues.newDescription);
    console.log(this.newChannelValues.newDescription);
    changedDescription.reset();
  }

  leaveChannel() {
    console.log("ciao");
  }

}
