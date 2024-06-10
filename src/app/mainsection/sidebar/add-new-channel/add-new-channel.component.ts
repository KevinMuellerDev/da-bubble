import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { ChannelInfo } from '../../../shared/interfaces/channelinfo';
import { ChannelData } from '../../../shared/models/channels.class';
@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule,FormsModule,CommonModule],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})
export class AddNewChannelComponent {
  channelService:ChannelService = inject(ChannelService)
  newChannel!:ChannelInfo;
  inputs  = {
    'channelName': '',
    'description': ''
  }

  async onSubmit(createNewChannel:NgForm) {    
    this.prepareNewChannelData();
    console.log(this.newChannel);
    await this.channelService.createNewChannel(this.newChannel);
    console.log(this.newChannel);
    createNewChannel.reset();
 }

 prepareNewChannelData(){
  let channelDummy= new ChannelData('');
  channelDummy.setData(this.inputs.channelName, this.inputs.description, this.inputs.channelName);
  this.newChannel = channelDummy.toJson();
 }
}
