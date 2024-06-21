import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject,HostListener } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelMessagesComponent } from './channel-messages/channel-messages.component';
import { ChannelService } from '../../shared/services/channel.service';
import { MessageData } from '../../shared/models/message.class';
import { UserService } from '../../shared/services/user.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelMessagesComponent, MainsectionComponent,PickerComponent],
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
  isEmojiPickerVisible: boolean = false;
  showEmojiPicker:boolean = false;
  selectedEmojis: string[] = [];

  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

  constructor(public dialog: MatDialog) {
    this.channelService.messagesLoaded = false;
  }

    @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;

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
      this.selectedEmojis = [];
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

    /**
 * Checks if a given element or any of its parent elements have a specific class.
 * @param element - The element to check.
 * @param className - The class name to search for.
 * @returns True if the element or any of its parent elements have the specified class, false otherwise.
 */
  isClickedElementOrChildWithClass(element: any, className: string): boolean {
    while (element) {
      if (element.classList.contains(className)) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }


/**
 * Toggles the visibility of the emoji picker.
 * @param event - The event that triggered the emoji picker toggle.
 * @remarks This method is called when the user clicks on the emoji picker icon.
 *          It stops the event propagation to prevent it from bubbling up to parent elements.
 *          It then toggles the `isEmojiPickerVisible` property, which controls the visibility of the emoji picker.
 * @returns {void}
 */
    toggleEmojiPickerEvent(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }


  /**
 * Listens for click events on the document and closes the emoji picker if the click is outside of it.
 * @param event - The click event.
 */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!this.isEmojiPickerVisible || !this.emojiPickerContainer) {
      return;
    }

    if (!this.isClickedElementOrChildWithClass(event.target, 'emoji-mart') && this.emojiPickerContainer) {
      this.showEmojiPicker = !this.showEmojiPicker;
      this.isEmojiPickerVisible = false;
    }
  }
  addChannelMessageEmoji(event: any) {
    const selectedEmoji = event['emoji']['native'];
    this.selectedEmojis.push(selectedEmoji);
    this.message.content += selectedEmoji;
}


}
