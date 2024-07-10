import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { AddUserToChannelDialogComponent } from '../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { Firestore, arrayRemove, deleteDoc, doc, getDocs, query, updateDoc } from '@angular/fire/firestore';
import { SidebarService } from '../../../shared/services/sidebar.service';

@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [MatDialogModule, CommonModule, FormsModule, AddUserToChannelDialogComponent],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  sidebarService: SidebarService = inject(SidebarService);
  firestore: Firestore = inject(Firestore);
  editChannelName: boolean = false;
  editDescription: boolean = false;
  channelNameExists: boolean = false;
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
    try {
      this.sidebarService.channels.forEach(() => {
        const checkTitle = (obj: { title: any; }) => obj.title === this.newChannelValues.name;
        if (this.sidebarService.channels.some(checkTitle) || this.newChannelValues.name.length == 0) {
          throw new Error('Titel schon vorhanden !')
        }
      });
    } catch (error) {
      channelName.reset();
      this.channelNameExists = true;
      return
    }
    this.editChannelName = false;
    await this.channelService.updateChannelTitle(this.newChannelValues.name);
    this.channelNameExists = false;
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
    changedDescription.reset();
  }

  /**
   * A function to handle leaving a channel by removing the current user from the channel users list and updating the user's channels. It also resets the message type of the channel service.
   * @returns A promise that resolves to void.
   */
  async leaveChannel(): Promise<void> {
    await updateDoc(doc(this.firestore, "Channels", this.channelService.channelMsgData.collection), {
      users: arrayRemove(this.userService.currentUser)
    });
    const querySnapshot = await getDocs(query(this.userService.refUserChannels()));
    querySnapshot.forEach(async (dataset) => {
      if (dataset.data()['channelid'] === this.channelService.channelMsgData.collection) {
        await deleteDoc(doc(this.firestore, "user", this.userService.currentUser!, 'userchannels', dataset.id));
      }
    });
    this.channelService.resetMessageType();
  }
}
