import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule,FormsModule],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})
export class AddNewChannelComponent {
  inputs  = {
    'channelName': '',
    'description': ''
  }

  onSubmit() {
    console.log(this.inputs.channelName);
    console.log(this.inputs.description);
   
 }
}
