import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule,FormsModule,CommonModule],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})
export class AddNewChannelComponent {
  inputs  = {
    'channelName': '',
    'description': ''
  }

  onSubmit(createNewChannel:NgForm) {
    console.log(this.inputs.channelName);
    console.log(this.inputs.description);
    createNewChannel.reset();
 }
}
