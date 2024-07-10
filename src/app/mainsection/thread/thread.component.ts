import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MainsectionComponent } from '../mainsection.component';
import { ShowProfileComponent } from '../../shared/components/show-profile/show-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadService } from '../../shared/services/thread.service';
import { EmojiService } from '../../shared/services/emoji.service';
import { MutationObserverService } from '../../shared/services/mutation.observer.service';
import { Subscription, Subject } from 'rxjs';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule, NgForm } from '@angular/forms';
import { OutsideclickDirective } from '../../outsideclick.directive';
import { UserService } from '../../shared/services/user.service';
import { MessageData } from '../../shared/models/message.class';
import { StorageService } from '../../shared/services/storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, MainsectionComponent, EmojiComponent, PickerComponent, FormsModule, OutsideclickDirective],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})

export class ThreadComponent {
  channelService: ChannelService = inject(ChannelService);
  threadService: ThreadService = inject(ThreadService);
  userService: UserService = inject(UserService);
  storageService: StorageService = inject(StorageService);
  mainsectionComponent: MainsectionComponent = inject(MainsectionComponent);
  private dataSubscription!: Subscription;
  private domChangesSubscription!: Subscription;
  userId!: string;
  messages: any[] = [];
  dateToday!: number;
  newMessage: { message: string } = { message: '' };
  originalMessage!: string;
  emojiAdded: boolean = false;
  isEmojiPickerVisible: boolean = false;
  isEditMessageTextareaVisible: boolean = false;
  private hasScrolled: boolean = false;
  isTagUserOpen: boolean = false;
  tagUserList: string[] = [];
  submitClick: boolean = false;
  textareaBlur: boolean = false;
  isEmojiPickerVisibleThreadMessageInput: boolean = false;
  showEmojiPickerTextarea: boolean = false;
  selectedEmojis: string[] = [];
  hoveredMessageIndexThread: number | null = null;
  hoveredEmojiIndexThread: number | null = null;
  messageThread = {
    content: ''
  }

  constructor(public dialog: MatDialog, public emojiService: EmojiService, private MutationObserverService: MutationObserverService, private sanitizer: DomSanitizer) {
    this.userId = localStorage.getItem('uid')!;
    this.dateToday = Date.now() as number;
    this.dataSubscription = this.threadService.data$.subscribe(data => {
      if (data) {
        setTimeout(() => {
          emojiService.initMaps('thread');
        }, 500);
      }
    });
  }

  @ViewChild('threadMessageContent', { read: ElementRef, static: false }) threadMessageContent!: ElementRef;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('fileInputThread') fileInputThread!: ElementRef<HTMLInputElement>;

  /**
   * This lifecycle hook is called after Angular has checked the view of the component and its children.
   * It is called after the ngAfterViewInit method and whenever any data-bound property of the directive changes.
   * The function checks if the mutation observer should be started, the scroll container exists, and the component has not been scrolled yet.
   * If all conditions are met, it observes the scroll container and sets the `hasScrolled` flag to true.
   * Additionally, if the thread message content exists and the edit message textarea is not visible, it focuses the thread message content.
   */
  ngAfterViewChecked() {
    if (this.threadService.startMutationObserver && this.scrollContainer && !this.hasScrolled) {
      this.MutationObserverService.observe(this.scrollContainer, true);
      this.hasScrolled = true;
    }
    if (this.threadMessageContent && !this.isEditMessageTextareaVisible) {
      this.threadMessageContent.nativeElement.focus();
    }
  }

  /**
   * Handles the click event outside the specified element.
   * It toggles the edit message toggle and emoji picker visibility for a thread message.
   * @param index - The index of the thread message.
   * @param event - The click event.
   */
  onOutsideClick(index: number, event: Event): void {
    this.emojiService.openEditMessageToggleThread[index] = false;
    const target = event.target as HTMLElement;
    if (target.tagName === 'svg' || 'path' && (this.isEditMessageTextareaVisible && this.emojiAdded)) {
      return
    }
    if (!this.emojiAdded && !this.isEditMessageTextareaVisible) {
      this.emojiService.editMessageThread[index] = false;
    }
    if (this.isEditMessageTextareaVisible && !this.emojiService.showEmojiPickerArrayThread[index]) {
      this.emojiService.editMessageThread[index] = false;
      this.editMessageAbort(index);
    }
    this.emojiService.showEmojiPickerArrayThread[index] = false;
  }

  /**
   * Handles the click event outside the emoji picker textarea in the thread component.
   * It toggles the visibility of the emoji picker and resets the `isEmojiPickerVisibleThreadMessageInput` flag.
   */
  onOutsideClickTextarea() {
    this.showEmojiPickerTextarea = !this.showEmojiPickerTextarea;
    this.isEmojiPickerVisibleThreadMessageInput = false;
  }

  /**
   * Handles the click event outside the tag user area in the thread component.
   * It closes the tag user dropdown by setting the `isTagUserOpen` flag to false.
   */
  onOutsideClickTagArea() {
    this.isTagUserOpen = false;
  }

  /**
   * Handles the click event outside the file upload preview in the thread component.
   * If the clicked element's id is 'threadMessageContent', the function returns early.
   * Otherwise, it clears the file input, aborts the ongoing file upload for the thread,and resets the thread message content.
   * @param event - The click event.
   */
  onOutsideClickFileUploadPreview(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.id === 'threadMessageContent') {
      return
    } else {
      this.clearFileInput();
      this.storageService.abortUploadForThread();
    }
  }

  /**
   * Retrieves the username associated with a given user ID from the current channel's users.
   * @param emojiUserId - The ID of the user whose username needs to be retrieved.
   * @returns The username of the user with the given ID, or `undefined` if no user is found.
   */
  getUsernameByUserId(emojiUserId: string): string | undefined {
    const currentChannelUsers = this.channelService.currentChannelUsers;
    const user = currentChannelUsers.find(user => user.id === emojiUserId);
    return user ? user.name : undefined;
  }

  /**
   * Toggles the edit message toggle for a specific thread message.
   * @param index - The index of the thread message for which the edit message toggle needs to be toggled.
   */
  toggleOpenEditMessage(index: number): void {
    this.emojiService.openEditMessageToggleThread[index] = !this.emojiService.openEditMessageToggleThread[index]
  }

  /**
   * Toggles the emoji picker visibility for a specific thread message.
   * @param index - The index of the thread message for which the emoji picker needs to be toggled.
   */
  toggleEmojiPicker(index: number): void {
    this.emojiService.showEmojiPickerArrayThread[index] = !this.emojiService.showEmojiPickerArrayThread[index]
  }

  /**
   * Handles the addition of an emoji to a thread message.
   * @param event - The event object that triggered the emoji addition.
   * @param index - The index of the thread message to which the emoji is being added.
   * @param messageId - The unique identifier of the thread message.
   * @param userId - The unique identifier of the user who added the emoji.
   * @param calledFromFunction - A flag indicating whether the function was called from another function.
   */
  onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    this.emojiService.addEmoji(event, index, messageId, userId, 'thread');
    this.emojiAdded = true;
    setTimeout(() => {
      this.emojiAdded = false;
    }, 500);
    this.emojiService.showEmojiPickerArrayThread[index] = false;
  }

  /**
   * Updates the reaction for a specific emoji in a thread message.
   * @param currentEmojiIndex - The index of the emoji in the current message.
   * @param currentMessageIndex - The index of the current message in the thread.
   * @param currentEmoji - The emoji for which the reaction needs to be updated.
   * @param messageId - The unique identifier of the thread message.
   * @param userId - The unique identifier of the user who added the reaction.
   */
  onUpdateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    this.emojiService.updateReaction(currentEmojiIndex, currentMessageIndex, currentEmoji, messageId, userId, 'thread');
  }

  /**
   * Handles the mouseenter event for a specific emoji in a thread message.
   * Updates the `hoveredMessageIndexThread` and `hoveredEmojiIndexThread` properties
   * @param messageIndex - The index of the thread message.
   * @param emojiIndex - The index of the emoji within the thread message.
   */
  onMouseEnter(messageIndex: number, emojiIndex: number): void {
    this.hoveredMessageIndexThread = messageIndex;
    this.hoveredEmojiIndexThread = emojiIndex;
  }

  /**
   * Handles the mouseleave event for a specific emoji in a thread message.
   * Updates the `hoveredMessageIndexThread` and `hoveredEmojiIndexThread` properties to `null`
   * indicating that no emoji is currently being hovered over.
   */
  onMouseLeave(): void {
    this.hoveredMessageIndexThread = null;
    this.hoveredEmojiIndexThread = null;
  }

  /**
   * Handles the event that toggles the visibility of various elements in the thread component.
   * This function is called when a user interacts with specific elements in the thread message.
   * @param event - The event object that triggered the function.
   */
  toggleEvent(event: any): void {
    if (event.target.classList.contains('edit-message-icon') ||
      event.target.classList.contains('add-reaction-icon') ||
      event.target.classList.contains('text-area-editable') ||
      event.target.classList.contains('emoji-mart-anchor-bar')
    ) {
      event.stopPropagation();
    }
  }

  /**
   * Initializes the process of editing a message in the thread component.
   * @param index - The index of the message to be edited within the thread messages array.
   */
  initEditMessage(index: number) {
    this.originalMessage = this.threadService.messages[index].message;
    this.emojiService.threadMessageEdit = true;
    this.isEditMessageTextareaVisible = true;
    this.emojiService.editMessageThread[index] = !this.emojiService.editMessageThread[index];
  }

  /**
   * Handles the initialization of editing a message in the thread component.
   * @param index - The index of the message to be edited within the thread messages array.
   * @param event - The event object that triggered the function.
   */
  editMessageFunction(index: number, event: any): void {
    this.initEditMessage(index)
    const textareaId = 'editThreadMessageTextarea-' + index;
    this.toggleEvent(event);
    this.newMessage = { message: this.threadService.messages[index].message };
    setTimeout(() => {
      const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }, 0);
    this.emojiService.openEditMessageToggleThread[index] = !this.emojiService.openEditMessageToggleThread[index];
  }

  /**
   * Handles the submission of a new message in the thread component.
   * @param formThread - The form object representing the thread message form.
   * This function is called when the user submits a new message in the thread.
   */
  onSubmit(formThread: NgForm): void {
    this.submitClick = true;
    this.textareaBlur = true;
    if (!formThread.valid) {
    } else if (formThread.valid) {
      this.arrangeThreadData();
      this.threadMessageContent.nativeElement.focus()
      formThread.reset();
      this.clearDataAfterSubmit();
    }
  }

  /**
   * Clears the data and resets the necessary variables after a message is submitted in the thread component.
   */
  clearDataAfterSubmit(): void {
    this.submitClick = false;
    this.selectedEmojis = [];
    this.emojiService.initMaps('thread')
    setTimeout(() => {
      this.clearFileInput();
    }, 500);
  }

  /**
  * The function `arrangeDirectData` creates a new `MessageData` object, populates it with data from
  * user input and session storage, and then sends it to the `channelService` to create a direct
  * message.
  */
  arrangeThreadData() {
    let dummy = new MessageData();
    dummy.id = localStorage.getItem('uid')!;
    dummy.name = this.userService.userInfo.name;
    dummy.profilePicture = this.userService.userInfo.profilePicture;
    dummy.message = this.messageThread.content;
    dummy.email = this.userService.userInfo.email;
    dummy.emoji = [];
    this.threadService.createThreadMessage(dummy.toJson());
  }

  /**
   * Handles the submission of a edited message in the thread component.
   * @param editMessageForm - The form object representing the thread message form.
   * @param index - The index of the message to be edited within the thread messages array.
   */
  editMessageSubmit(editMessageForm: NgForm, index: number) {
    if (editMessageForm.valid) {
      this.threadService.messages[index].message = this.newMessage.message;
      this.threadService.updateChannelMessage(this.threadService.messages[index]);
    }
    this.emojiService.editMessageThread[index] = false;
    editMessageForm.reset();
    this.emojiService.threadMessageEdit = false;
    this.isEditMessageTextareaVisible = false;
    this.emojiService.openEditMessageToggleThread[index] = false;
  }

  /**
   * Handles the abortion of editing a message in the thread component.
   * @param index - The index of the message to be edited within the thread messages array.
   */
  editMessageAbort(index: number) {
    this.selectedEmojis = [];
    this.emojiService.editMessageThread[index] = false;
    this.emojiService.threadMessageEdit = false;
    this.isEditMessageTextareaVisible = false;
    this.newMessage = { message: this.originalMessage };
    this.threadService.messages[index].message = this.originalMessage;
  }

  /**
   * Handles the submission of a edited message in the thread component.
   * @param event - The keyboard event that triggered the function.
   * @param editMessageForm - The form object representing the thread message form.
   * @param index - The index of the message to be edited within the thread messages array.
   */
  onKeyup(event: KeyboardEvent, editMessageForm: NgForm, index: number) {
    this.threadService.messages[index].message = this.newMessage.message;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.editMessageSubmit(editMessageForm, index);
    }
  }

  /**
   * Updates the message content in the thread component after an emoji has been selected.
   * @param index - The index of the message in the thread messages array.
   */
  updateMessageAfterEmojiSelection(index: number) {
    this.newMessage = { message: this.threadService.messages[index].message };
  }

  /**
   * Handles the toggle event for the emoji picker in the thread message textarea.
   * This function prevents the event from propagating up the DOM tree and toggles the visibility
   * of the emoji picker for the thread message textarea.
   * @param event - The event object that triggered the function.
   */
  toggleEmojiPickerEventTextarea(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisibleThreadMessageInput = !this.isEmojiPickerVisibleThreadMessageInput;
  }

  /**
   * Adds an emoji to the message thread.
   * @param event - The event object containing the emoji data.
   */
  addThreadMessageEmoji(event: any) {
    const selectedEmoji = event['emoji']['native'];
    this.selectedEmojis.push(selectedEmoji);
    if (this.messageThread.content == null) {
      this.messageThread.content = '';
    }
    
    this.messageThread.content += selectedEmoji;
    this.onOutsideClickTextarea()
  }

  /**
   * Closes the current thread and resets relevant services and components.
   */
  closeThread() {
    this.channelService.closeAndFocusChannelTextarea.next();
    this.threadService.stopListener();
    this.mainsectionComponent.hideThread();
    this.threadService.isActive = false;
  }

  /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */
  async openDialogUserInfo(user: any) {
    this.userService.otherUserInfo = user;
    await this.userService.getOnlineStatusProfile(user.id);
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }

  /**
   * Triggers the file input element to open the file picker dialog.
   */
  triggerFileInput() {
    this.fileInputThread.nativeElement.click();
  }

  /**
   * Handles the file selection event, triggering the file upload process and obtaining the file URL.
   * @param event - The file selection event.
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.storageService.onFileSelectedTextareaForThread(input);
    this.storageService.uploadFileAndGetUrlForThread(this.threadService.originMessage.msgId);
  }

  /**
   * Toggles the user tagging interface and populates the list of users in the current channel.
   * @param event - The event object.
   */
  tagUser(event: Event) {
    event.stopPropagation();
    this.isTagUserOpen = !this.isTagUserOpen;
    this.tagUserList = this.channelService.currentChannelUsers.map(channelUser => channelUser.name);
  }

  /**
   * Handles the event when a user is clicked in the tag user list.
   * Formats the username and appends it to the message thread content.
   * @param user - The username of the clicked user.
   */
  onUserClick(user: string) {
    const formattedUser = user.replace(/ /g, '_');
    if (this.messageThread.content == null) {
      this.messageThread.content =''
    }
    this.messageThread.content += `@${formattedUser} `;
    this.isTagUserOpen = false;
  }

  /**
   * Clears the file input element and sets focus to the thread message content.
   */
  clearFileInput() {
    this.fileInputThread.nativeElement.value = '';
    this.threadMessageContent.nativeElement.focus();
  }

  /**
   * Highlights usernames in a message by wrapping them in a span with a specified class.
   * @param message - The message containing usernames to be highlighted.
   * @returns {string} - The message with highlighted usernames.
   */
  highlightUsernames(message: string): string {
    const usernameRegex = /@([^@<>\s]+)/g;
    return message.replace(usernameRegex, `<span class="highlighted">$&</span>`);
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
