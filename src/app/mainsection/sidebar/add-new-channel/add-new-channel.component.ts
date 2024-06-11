import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { ChannelInfo } from '../../../shared/interfaces/channelinfo';
import { ChannelData } from '../../../shared/models/channels.class';
import { AddNewUserToChannelComponent } from '../add-new-user-to-channel/add-new-user-to-channel.component';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule, FormsModule, CommonModule, AddNewUserToChannelComponent],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})

export class AddNewChannelComponent {
  channelService: ChannelService = inject(ChannelService)
  newChannel!: ChannelInfo;
  inputs = {
    'channelName': '',
    'description': ''
  }

  constructor(public dialog: MatDialog) { }

  openDialog() {
    this.dialog.open(AddNewUserToChannelComponent, { panelClass: 'mod-dialog-window' });
  }

  async onSubmit(createNewChannel: NgForm) {
    this.prepareNewChannelData();
    this.channelService.newChannel = this.newChannel;
    createNewChannel.reset();
  }

  prepareNewChannelData() {
    let channelDummy = new ChannelData('');
    channelDummy.setData(this.inputs.channelName, this.inputs.description, this.inputs.channelName);
    this.newChannel = channelDummy.toJson();
  }
}
