import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelMessagesComponent } from './channel-messages/channel-messages.component';
import { ChannelService } from '../../shared/services/channel.service';
import { MessageData } from '../../shared/models/message.class';
import { UserService } from '../../shared/services/user.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { OutsideclickDirective } from '../../outsideclick.directive';
import { StorageService } from '../../shared/services/storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ThreadService } from '../../shared/services/thread.service';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelMessagesComponent, MainsectionComponent, PickerComponent, OutsideclickDirective],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  threadService: ThreadService = inject(ThreadService);
  dmData!: any;
  message = {
    content: ''
  }
  submitClick: boolean = false;
  textareaBlur: boolean = false;
  isEmojiPickerVisible: boolean = false;
  showEmojiPicker: boolean = false;
  selectedEmojis: string[] = [];
  isTagUserOpen: boolean = false;
  tagUserList: string[] = [];

  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;
  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(public dialog: MatDialog, public storageService: StorageService, private sanitizer: DomSanitizer) {
    this.channelService.messagesLoaded = false;
  }

  private changeChannelSubscription!: Subscription;
  private closeAndFocusChannelTextarea!: Subscription;

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   * Subscribes to channel change and thread close events to set focus on the textarea accordingly.
   */
  ngOnInit() {
    this.changeChannelSubscription = this.channelService.channelChanged$.subscribe(() => {
      this.setFocusOnTextarea();
    });
    this.closeAndFocusChannelTextarea = this.channelService.threadClosed$.subscribe(() => {
      this.setFocusOnTextarea();
    });
  }

  /**
   * Sets focus on the textarea asynchronously using setTimeout.
   * This is typically used to ensure focus is set after a short delay, allowing Angular
   * to complete its rendering cycle.
   */
  setFocusOnTextarea() {
    setTimeout(() => {
      this.messageContent.nativeElement.focus();
    }, 0);
  }

  /**
   * Handles the submission of a form asynchronously.
   * @param form - The form to submit.
   */
  async onSubmit(form: NgForm) {
    this.submitClick = true;
    this.textareaBlur = true;
    if (!form.valid) {
      form.reset();
    } else if (form.valid) {
      this.arrangeDirectData();
      form.reset();
      this.messageContent.nativeElement.focus()
      this.submitClick = false;
      this.selectedEmojis = [];
      setTimeout(() => {
        this.clearFileInput();
      }, 500);
    }
  }

  /**
   * The function `arrangeDirectData` creates a new `MessageData` object, populates it with data from
   * user input and session storage, and then sends it to the `channelService` to create a direct
   * message.
   */
  arrangeDirectData() {
    let dummy = new MessageData();
    dummy.id = localStorage.getItem('uid')!;
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
   * Handles the click event outside of the emoji picker, file upload preview, and user tag dropdown.
   * It closes the emoji picker, file upload preview, and user tag dropdown by toggling their visibility properties.
   * @returns {void}
   */
  onOutsideClick(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.isEmojiPickerVisible = false;
    this.isTagUserOpen = false;
  }

  /**
   * Handles clicks outside the file upload preview area.
   * Clears the file input and aborts the upload process if the click target is outside the message content area.
   * @param {Event} event - The click event outside the file upload preview area.
   */
  onOutsideClickFileUploadPreview(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.id === 'messageContent') {
      return
    } else {
      this.clearFileInput();
      this.storageService.abortUpload();
    }
  }

  /**
   * Toggles the visibility of the emoji picker.
   * @param event - The event that triggered the emoji picker toggle.
   */
  toggleEmojiPickerEvent(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  /**
   * Adds an emoji to the message content and updates the selected emojis array.
   * @param event - The event object containing the emoji data.
   */
  addChannelMessageEmoji(event: any) {
    const selectedEmoji = event['emoji']['native'];
    this.selectedEmojis.push(selectedEmoji);
    if (this.message.content == null) {
      this.message.content = '';
    }
    this.message.content += selectedEmoji;
  }

  /**
   * Triggers the click event on the file input element to open the file selection dialog.
   * This function is called when the user clicks on the file upload button.
   * @param event - The event object that triggered the function.
   */
  triggerFileInput(event: Event) {
    event.stopPropagation();
    this.fileInput.nativeElement.click();
  }

  /**
   * Clears the file input element and sets focus on the message content textarea.
   * This function is called when the user cancels file selection or uploads a new file.
   */
  clearFileInput() {
    this.fileInput.nativeElement.value = '';
    this.messageContent.nativeElement.focus();
  }

  /**
   * Handles the file selection event triggered by the user.
   * It retrieves the selected file from the event target, updates the text area with the file name,
   * and initiates the file upload process to the server.
   * @param event - The event object that triggered the function.
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.storageService.onFileSelectedTextarea(input);
    this.storageService.uploadFileAndGetUrl(this.channelService.currentChannel);
  }

  /**
   * Opens a new window to preview a PDF file.
   * @param pdfUrl - The URL of the PDF file to be previewed.
   * This parameter should be a SafeResourceUrl or null.
   * @remarks
   * If the provided `pdfUrl` is not null, it is sanitized using the Angular's DomSanitizer.
   * Then, a new window is opened with the sanitized URL.
   * The new window contains an HTML document with an embedded PDF file.
   * The PDF file is displayed in the new window with 100% width and height.
   */
  openPdf(pdfUrl: SafeResourceUrl | null) {
    if (pdfUrl) {
      const pdfBlobUrl = this.sanitizer.sanitize(4, pdfUrl);
      if (pdfBlobUrl) {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>PDF Preview</title>
              </head>
              <body style="margin: 0;">
                <embed src="${pdfBlobUrl}" type="application/pdf" width="100%" height="100%" />
              </body>
            </html>
          `);
        }
      }
    }
  }

  /**
   * Handles the user tag functionality in the channel component.
   * When a user clicks on the tag user button, it toggles the visibility of the user tag dropdown.
   * If the current message type is a direct message, it adds the recipient's name to the tag user list.
   * If the current message type is a channel message, it adds all the channel users' names to the tag user list.
   * The event's stopPropagation method is called to prevent event bubbling.
   * @param event - The event that triggered the tag user functionality.
   */
  tagUser(event: Event) {
    event.stopPropagation();
    this.tagUserList = [];
    this.isTagUserOpen = !this.isTagUserOpen;
    if (this.channelService.privateMsg) {
      this.tagUserList.push(this.channelService.privateMsgData.name);
    } else if (this.channelService.channelMsg) {
      this.tagUserList = this.channelService.currentChannelUsers.map(channelUser => channelUser.name);
    }
  }

  /**
   * Handles the user selection from the tag user dropdown.
   * It replaces spaces in the selected user's name with underscores,
   * appends the formatted name to the message content with a preceding '@' symbol,
   * and closes the tag user dropdown.
   * @param user - The name of the selected user.
   */
  onUserClick(user: string) {
    const formattedUser = user.replace(/ /g, '_');
    if (this.message.content == null) {
      this.message.content =''
    }
    this.message.content += `@${formattedUser} `;
    this.isTagUserOpen = false;
  }

  /**
   * Unsubscribes from all subscriptions when the component is destroyed.
   * This ensures that no memory leaks occur and that resources are properly cleaned up.
   */
  ngOnDestroy() {
    if (this.changeChannelSubscription) {
      this.changeChannelSubscription.unsubscribe();
    }
  }
}



