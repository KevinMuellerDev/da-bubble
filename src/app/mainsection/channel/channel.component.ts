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

  constructor(public dialog: MatDialog, public storageService: StorageService, private sanitizer: DomSanitizer) {
    this.channelService.messagesLoaded = false;
  }

  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private changeChannelSubscription!: Subscription;
  private closeAndFocusChannelTextarea!: Subscription;
  ngOnInit() {
    this.changeChannelSubscription = this.channelService.channelChanged$.subscribe(() => {
      this.setFocusOnTextarea();
    });
    this.closeAndFocusChannelTextarea = this.channelService.threadClosed$.subscribe(() => {
      this.setFocusOnTextarea();
    });
  }

  setFocusOnTextarea() {
    setTimeout(() => {
      this.messageContent.nativeElement.focus();
    }, 0);
  }
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

  onOutsideClick(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
    this.isEmojiPickerVisible = false;
    this.isTagUserOpen = false;
  }

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
   * @remarks This method is called when the user clicks on the emoji picker icon.
   *          It stops the event propagation to prevent it from bubbling up to parent elements.
   *          It then toggles the `isEmojiPickerVisible` property, which controls the visibility of the emoji picker.
   * @returns {void}
   */
  toggleEmojiPickerEvent(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addChannelMessageEmoji(event: any) {
    const selectedEmoji = event['emoji']['native'];
    this.selectedEmojis.push(selectedEmoji);
    this.message.content += selectedEmoji;
  }

  triggerFileInput(event: Event) {
    event.stopPropagation();
    this.fileInput.nativeElement.click();
  }

  clearFileInput() {
    this.fileInput.nativeElement.value = '';
    this.messageContent.nativeElement.focus();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.storageService.onFileSelectedTextarea(input);
    this.storageService.uploadFileAndGetUrl(this.channelService.currentChannel);

  }

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

  tagUser(event: Event) {
    event.stopPropagation();
    this.isTagUserOpen = !this.isTagUserOpen;
    this.tagUserList = this.channelService.currentChannelUsers.map(channelUser => channelUser.name);
  }

  onUserClick(user: string) {
   const formattedUser = user.replace(/ /g, '_');
   this.message.content += `@${formattedUser} `;
   this.isTagUserOpen = false;
  }

  ngOnDestroy() {
    if (this.changeChannelSubscription) {
      this.changeChannelSubscription.unsubscribe();
    }
  }

}



