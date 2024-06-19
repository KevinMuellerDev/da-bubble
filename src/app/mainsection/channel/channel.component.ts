import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelMessagesComponent } from './channel-messages/channel-messages.component';
import { ChannelService } from '../../shared/services/channel.service';
import { MessageData } from '../../shared/models/message.class';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelMessagesComponent, MainsectionComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  dmData!: any;
  message = {
    content: ''
  }

  submitClick: boolean = false;
  textareaBlur: boolean = false;

  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

  constructor(public dialog: MatDialog) {
    this.channelService.messagesLoaded = false;
  }

  async onSubmit(form: NgForm) {
    this.submitClick = true;
    this.textareaBlur = true;
    if (!form.valid) {
      console.log(form)
      form.reset();
    } else if (form.valid) {

      this.arrangeDirectData();

      form.reset();
      this.messageContent.nativeElement.focus()
      this.submitClick = false;
    }
  }

  /**
   * The function `arrangeDirectData` creates a new `MessageData` object, populates it with data from
   * user input and session storage, and then sends it to the `channelService` to create a direct
   * message.
   */
  arrangeDirectData() {
    let dummy = new MessageData();
    dummy.id = sessionStorage.getItem('uid')!;
    dummy.name = this.userService.userInfo.name;
    dummy.profilePicture = this.userService.userInfo.profilePicture;
    dummy.message = this.message.content;
    dummy.emoji = [];
    this.chooseMsgType(dummy)
  }



/**
 * The function `chooseMsgType` determines whether to create a direct message or a channel message
 * based on the type of message data provided.
 * @param {MessageData} dummy - The `dummy` parameter is an object of type `MessageData`.
 */
  chooseMsgType(dummy: MessageData) {
    if (this.channelService.privateMsg) {
      const dmData = dummy.toJson();
      this.channelService.createDirectMessage(dmData);
    } else if (this.channelService.channelMsg) {
      const messageData = dummy.toJson();
      this.channelService.createChannelMessage(messageData);
    }
  }
}
