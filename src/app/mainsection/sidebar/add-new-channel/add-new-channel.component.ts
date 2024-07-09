import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../../shared/services/channel.service';
import { ChannelInfo } from '../../../shared/interfaces/channelinfo';
import { ChannelData } from '../../../shared/models/channels.class';
import { AddNewUserToChannelComponent } from '../add-new-user-to-channel/add-new-user-to-channel.component';
import { SidebarService } from '../../../shared/services/sidebar.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [MatDialogModule, FormsModule, CommonModule, AddNewUserToChannelComponent],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})

export class AddNewChannelComponent {
  channelService: ChannelService = inject(ChannelService);
  sidebarService: SidebarService = inject(SidebarService);
  newChannel!: ChannelInfo;
  inputs = {
    'channelName': '',
    'description': ''
  }
  channelNameExists: boolean = false;

  constructor(public dialog: MatDialog, private dialogRef: DialogRef<AddNewChannelComponent>) { }

  /**
   * The `openDialog` function opens a dialog window to add new user to a channel using the
   * `AddNewUserToChannelComponent`.
   */
  openDialog() {
    this.dialog.open(AddNewUserToChannelComponent, { panelClass: ['add-user', 'box-radius', 'box-shadow'] });
  }

  /**
   * The onSubmit function prepares new channel data, sets it in the channel service, and resets the
   * form.
   * @param {NgForm} createNewChannel - `createNewChannel` is a parameter of type `NgForm`.
   * The function `onSubmit` is called when a form is submitted, and it resets the form
   * afterwards.
   */
  async onSubmit(createNewChannel: NgForm) {
    try {
      this.sidebarService.channels.forEach(() => {
        const checkTitle = (obj: { title: any; }) => obj.title === this.inputs.channelName;
        if (this.sidebarService.channels.some(checkTitle)) {
          throw new Error('Titel schon vorhanden !')
        }
      });
    } catch (error) {
      console.error(error);
      createNewChannel.reset();
      this.channelNameExists = true;
      return
    }
    this.prepareNewChannelData();
    this.channelService.newChannel = this.newChannel;
    createNewChannel.reset();
    this.dialogRef.close();
    this.openDialog();
  }

  /**
   * The function `prepareNewChannelData` creates a new channel object with data from input fields and
   * converts it to JSON format.
   */
  prepareNewChannelData() {
    let channelDummy = new ChannelData('');
    channelDummy.setData(this.inputs.channelName, this.inputs.description, this.inputs.channelName);
    this.newChannel = channelDummy.toJson();
  }
}
