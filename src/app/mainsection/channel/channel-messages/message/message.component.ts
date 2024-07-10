import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../../../mainsection.component';
import { AddUserToChannelDialogComponent } from '../../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { EditChannelDialogComponent } from '../../edit-channel-dialog/edit-channel-dialog.component';
import { ShowProfileComponent } from '../../../../shared/components/show-profile/show-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChannelService } from '../../../../shared/services/channel.service';
import { Unsubscribe } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { EmojiService } from '../../../../shared/services/emoji.service';
import { OutsideclickDirective } from '../../../../outsideclick.directive';
import { ThreadService } from '../../../../shared/services/thread.service';
import { MutationObserverService } from '../../../../shared/services/mutation.observer.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StorageService } from '../../../../shared/services/storage.service';

registerLocaleData(localeDe);

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, AddUserToChannelDialogComponent, AddUserDialogComponent, EditChannelDialogComponent, ShowProfileComponent, PickerComponent, EmojiComponent, FormsModule, OutsideclickDirective],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})

export class MessageComponent {
  channelService: ChannelService = inject(ChannelService);
  userService: UserService = inject(UserService);
  threadService: ThreadService = inject(ThreadService);
  storageService: StorageService = inject(StorageService);
  private dataSubscription!: Subscription;
  unsubMessageData!: Unsubscribe;
  dateToday!: number;
  userId!: string;
  private domChangesSubscription!: Subscription;
  isEmojiPickerVisible: boolean = false;
  isEditMessageTextareaVisible: boolean = false;
  dateMap: string[] = [];
  messages: any[] = [];
  newMessage: { message: string } = { message: '' };
  originalMessage!: string;
  emojiAdded: boolean = false;
  hoveredMessageIndex: number | null = null;
  hoveredEmojiIndex: number | null = null;
  userList: string[] = [];

  constructor(public dialog: MatDialog, public mainsectionComponent: MainsectionComponent, private changeDetectorRef: ChangeDetectorRef, public emojiService: EmojiService, private MutationObserverService: MutationObserverService, private sanitizer: DomSanitizer) {
    this.userId = localStorage.getItem('uid')!;
    this.channelService.messagesLoaded = false;
    this.dataSubscription = this.channelService.data$.subscribe(data => {
      if (data) {
        setTimeout(() => {
          emojiService.initMaps('channel');
        }, 500);
      }
    });
  }

  @ViewChild('scroll', { static: false }) scroll!: ElementRef;
  @ViewChild('emojiPickerContainer', { static: false }) emojiPickerContainer!: ElementRef;
  @ViewChild('editMessageContainer', { static: false }) editMessageContainer!: ElementRef;
  @ViewChild('editMessageTextarea', { static: false }) editMessageTextarea!: ElementRef;

  /**
   * Initializes the necessary data for the component.
   * @remarks
   * This function sets the current date to the `dateToday` property, which is used in the component's template.
   * It also subscribes to the `domChanges$` observable provided by the `MutationObserverService`.
   */
  ngOnInit() {
    this.dateToday = Date.now() as number;
    this.domChangesSubscription = this.MutationObserverService.domChanges$.subscribe((mutations: MutationRecord[]) => { });
  }

  /**
   * Checks if two dates represent different days.
   * @param oldDate - The first date to compare.
   * @param newDate - The second date to compare.
   */

  isNewDate(oldDate: number, newDate: number) {
    let oldDateAsString = new Date(oldDate).toLocaleDateString();
    let newDateAsString = new Date(newDate).toLocaleDateString();
    return oldDateAsString != newDateAsString;
  }

  /**
   * This function is called after the view has been initialized.
   * 1. Calls `detectChanges` on the `ChangeDetectorRef` to trigger change detection.
   * 2. Observes the `scroll` element using the `MutationObserverService` to detect changes.
   */

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
    this.MutationObserverService.observe(this.scroll, false);
  }

  /**
   * This function is called after the view has been initialized.
   * It triggers change detection on the `ChangeDetectorRef` and observes the `scroll` element using the `MutationObserverService`.
   */
  pushTimestamp(timestamp: string | null) {
    this.dateMap.push(timestamp as string);
  }

  /**
   * Handles the click event outside the specified element.
   * It toggles the visibility of the edit message toggle, emoji picker, and edit message textarea.
   * @param index - The index of the message associated with the event.
   * @param event - The click event that triggered this function.
   */
  onOutsideClick(index: number, event: Event): void {
    this.emojiService.openEditMessageToggle[index] = false;
    const target = event.target as HTMLElement;
    if (target.tagName === 'svg' || 'path' && (this.isEditMessageTextareaVisible && this.emojiAdded)) {
      return
    }
    if (!this.emojiAdded && !this.isEditMessageTextareaVisible) {
      this.emojiService.editMessage[index] = false;
    }
    if (this.isEditMessageTextareaVisible && !this.emojiService.showEmojiPickerArray[index]) {
      this.emojiService.editMessage[index] = false;
      this.editMessageAbort(index);
    }
    this.emojiService.showEmojiPickerArray[index] = false;
  }

  /**
   * Retrieves the username associated with a given user ID from the current channel's user list.
   * @param emojiUserId - The user ID for which the username needs to be retrieved.
   * @returns The username associated with the given user ID, or `undefined` if no user is found.
   */
  getUsernameByUserId(emojiUserId: string): string | undefined {
    const currentChannelUsers = this.channelService.currentChannelUsers;
    const user = currentChannelUsers.find(user => user.id === emojiUserId);
    return user ? user.name : undefined;
  }

  /**
   * Handles the addition of an emoji to a message.
   * @param event - The event object that triggered the emoji addition.
   * @param index - The index of the message to which the emoji will be added.
   * @param messageId - The unique identifier of the message.
   * @param userId - The unique identifier of the user who added the emoji.
   * @param calledFromFunction - A flag indicating whether the function was called from another function.
   */
  onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    this.emojiService.addEmoji(event, index, messageId, userId, 'channel');
    this.emojiAdded = true;
    setTimeout(() => {
      this.emojiAdded = false;
    }, 500);
    if (!calledFromFunction) {
      this.toggleEmojiPicker(index);
      this.isEmojiPickerVisible = false;
    }
  }

  /**
   * Updates the reaction for a specific emoji in a message.
   * @param currentEmojiIndex - The index of the emoji in the message's emoji array.
   * @param currentMessageIndex - The index of the message in the channel's messages array.
   * @param currentEmoji - The emoji for which the reaction is being updated.
   * @param messageId - The unique identifier of the message.
   * @param userId - The unique identifier of the user who added the reaction.
   */
  onUpdateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    this.emojiService.updateReaction(currentEmojiIndex, currentMessageIndex, currentEmoji, messageId, userId, 'channel');
  }

  /**
   * Handles the addition of a check emoji to a message.
   * @param event - The event object that triggered the emoji addition.
   * @param currentMessageIndex - The index of the message in the channel's messages array.
   * @param messageId - The unique identifier of the message.
   * @param userId - The unique identifier of the user who added the emoji.
   */
  onAddCheckEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string) {
    this.emojiService.addCheckEmoji(event, currentMessageIndex, messageId, userId, 'channel');
  }

  /**
   * Handles the addition of a raised hands emoji to a message.
   * @param event - The event object that triggered the emoji addition.
   * @param currentMessageIndex - The index of the message in the channel's messages array.
   * @param messageId - The unique identifier of the message.
   * @param userId - The unique identifier of the user who added the emoji.
   */
  onAddRaisedHandsEmoji(event: any, currentMessageIndex: number, messageId: string, userId: string) {
    this.emojiService.addRaisedHandsEmoji(event, currentMessageIndex, messageId, userId, 'channel');
  }

  /**
   * Handles the mouseenter event for a specific emoji in a message.
   * Updates the `hoveredMessageIndex` and `hoveredEmojiIndex` properties to highlight the corresponding emoji.
   * @param messageIndex - The index of the message in the channel's messages array.
   * @param emojiIndex - The index of the emoji in the message's emoji array.
   */
  onMouseEnter(messageIndex: number, emojiIndex: number): void {
    this.hoveredMessageIndex = messageIndex;
    this.hoveredEmojiIndex = emojiIndex;
  }

  /**
   * Handles the mouseleave event for a specific emoji in a message.
   * Updates the `hoveredMessageIndex` and `hoveredEmojiIndex` properties to remove the highlight from the corresponding emoji.
   */
  onMouseLeave(): void {
    this.hoveredMessageIndex = null;
    this.hoveredEmojiIndex = null;
  }

  /**
   * Toggles the visibility of the emoji picker for a specific message.
   * @param index - The index of the message for which the emoji picker should be toggled.
   */
  toggleEmojiPicker(index: number) {
    this.emojiService.showEmojiPickerArray[index] = !this.emojiService.showEmojiPickerArray[index];
  }

  /**
   * This function toggles the visibility of the edit message toggle for a specific message.
   * @param index - The index of the message for which the edit message toggle should be toggled.
   */
  toggleOpenEditMessage(index: number) {
    this.emojiService.openEditMessageToggle[index] = !this.emojiService.openEditMessageToggle[index];
  }

  /**
   * Handles the event triggered by clicking on specific elements within the message component.
   * If the clicked element has the class 'edit-message-icon', 'add-reaction-icon', or 'text-area-editable',
   * the event propagation is stopped to prevent further event handling.
   * @param event - The event object that triggered this function.
   * @param index - The index of the message associated with the event.
   */
  toggleEvent(event: any, index: number): void {
    if (event.target.classList.contains('edit-message-icon') || event.target.classList.contains('add-reaction-icon') || event.target.classList.contains('text-area-editable')) {
      event.stopPropagation();
    }
  }

  /**
   * Updates the `newMessage` object with the message from the selected index in the `channelService.messages` array.
   * @param index - The index of the message in the `channelService.messages` array.
   */
  updateMessageAfterEmojiSelection(index: number) {
    this.newMessage = { message: this.channelService.messages[index].message };
  }

  /**
   * Initializes the necessary data for editing a message.
   * @param index - The index of the message in the `channelService.messages` array.
   */
  initMessageData(index: number) {
    this.originalMessage = this.channelService.messages[index].message;
    this.emojiService.messageEdit = true;
    this.isEditMessageTextareaVisible = true;
    this.emojiService.editMessage[index] = !this.emojiService.editMessage[index];
  }

  /**
   * Initializes the necessary data for editing a message.
   * @param index - The index of the message in the `channelService.messages` array.
   */
  editMessageFunction(index: number) {
    this.initMessageData(index);
    const textareaId = 'editMessageTextarea-' + index;
    this.newMessage = { message: this.channelService.messages[index].message };
    setTimeout(() => {
      const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }, 0);
    this.emojiService.openEditMessageToggle[index] = !this.emojiService.openEditMessageToggle[index];
  }

  /**
   * This function aborts the editing of a message.
   * @param index - The index of the message in the `channelService.messages` array.
   */
  editMessageAbort(index: number) {
    this.emojiService.editMessage[index] = false;
    this.emojiService.messageEdit = false;
    this.isEditMessageTextareaVisible = false;
    this.newMessage = { message: this.originalMessage };
    this.channelService.messages[index].message = this.originalMessage;
  }

  /**
   * Handles the keyup event for editing a message.
   * Updates the message in the channel service and submits the form if Enter is pressed without Shift.
   * @param  event - The keyboard event object.
   * @param editMessageForm - The form used to edit the message.
   * @param  index - The index of the message being edited in the channel's message array.
   */
  onKeyup(event: KeyboardEvent, editMessageForm: NgForm, index: number) {
    this.channelService.messages[index].message = this.newMessage.message;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit(editMessageForm, index);
    }
  }

  /**
   * Handles the keyup event for editing a message.
   * Updates the message in the `channelService.messages` array based on the entered key.
   * @param event - The KeyboardEvent object that triggered this function.
   * @param editMessageForm - The NgForm object representing the edit message form.
   * @param index - The index of the message in the `channelService.messages` array.
   */
  onSubmit(editMessageForm: NgForm, index: number) {
    if (editMessageForm.valid) {
      this.channelService.messages[index].message = this.newMessage.message;
      if (this.channelService.privateMsg) {
        this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else {
        this.channelService.updateChannelMessage(this.channelService.messages[index]);
      }
      this.emojiService.editMessage[index] = false;
      editMessageForm.reset();
      this.emojiService.messageEdit = false;
    }

  }

  /**
   * The function `getOtherUserData` asynchronously retrieves other user data and opens a dialog with
   * the user information.
   * @param {string} [id] - The `id` parameter in the `getOtherUserData` function is a string that
   * represents the user ID of the other user whose profile information you want to retrieve.
   */
  async getOtherUserData(id?: string) {
    await this.userService.retrieveOtherUserProfile(id!);
    this.openDialogUserInfo();
  }

  /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */
  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  /**
   * The `showThreadBar` function calls the `showThread` method of the `mainsectionComponent`.
   */
  showThreadBar(message?: object) {
    this.threadService.originMessage = message;
    this.mainsectionComponent.showThread();
    this.threadService.isActive = true;
    this.threadService.startMutationObserver = true;
    this.threadService.changeData('');
  }

  /**
   * This function highlights usernames in a given message by wrapping them in a span with the class "highlighted".
   * @param {string} message - The message in which to highlight usernames.
   * @returns {string} - The modified message with highlighted usernames.
   */
  highlightUsernames(message: string): string {
    const usernameRegex = /@([^@<>\s]+)/g;
    return message.replace(usernameRegex, `<span class="highlighted">$&</span>`);
  }

  /**
   * This function is called when the component is destroyed.
   * It performs cleanup tasks such as resetting message data,
   * unsubscribing from data subscriptions, and disconnecting from the MutationObserver.
   */
  ngOnDestroy() {
    this.channelService.messages = [];
    this.channelService.messagesLoaded = false;
    this.channelService.currentMessagesId = '';
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.domChangesSubscription) {
      this.domChangesSubscription.unsubscribe();
    }
    this.MutationObserverService.disconnect();
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
}

