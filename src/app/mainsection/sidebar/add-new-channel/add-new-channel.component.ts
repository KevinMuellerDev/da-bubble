import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule,NgForm } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddNewUserToChannelComponent } from '../add-new-user-to-channel/add-new-user-to-channel.component';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule, FormsModule, CommonModule,AddNewUserToChannelComponent],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})
export class AddNewChannelComponent {
  inputs  = {
    'channelName': '',
    'description': ''
  }

  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(AddNewUserToChannelComponent, { panelClass: 'mod-dialog-window' });
  }

  onSubmit(createNewChannel:NgForm) {
    console.log(this.inputs.channelName);
    console.log(this.inputs.description);
    createNewChannel.reset();
 }
}
