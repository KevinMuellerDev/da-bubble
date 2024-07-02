import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MainsectionComponent } from '../mainsection.component';
import { ShowProfileComponent } from '../../shared/components/show-profile/show-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { ChannelService } from '../../shared/services/channel.service';
import { ThreadService } from '../../shared/services/thread.service';
import { EmojiService } from '../../shared/services/emoji.service';
import { MutationObserverService } from '../../shared/services/mutation.observer.service';
import { Subscription } from 'rxjs';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule, NgForm } from '@angular/forms';
import { OutsideclickDirective } from '../../outsideclick.directive';
import { UserService } from '../../shared/services/user.service';
import { MessageData } from '../../shared/models/message.class';



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

  submitClick: boolean = false;
  textareaBlur: boolean = false;
  isEmojiPickerVisibleThreadMessageInput: boolean = false;
  showEmojiPickerTextarea: boolean = false;
  selectedEmojis: string[] = [];
  messageThread = {
    content: ''
  }

  constructor(public dialog: MatDialog, public emojiService: EmojiService, private MutationObserverService: MutationObserverService) {
    this.userId = sessionStorage.getItem('uid')!;
    this.dateToday = Date.now() as number;
    this.dataSubscription = this.threadService.data$.subscribe(data => {
      if (data) {
        console.log(data);
        setTimeout(() => {
          emojiService.initMaps('thread');
        }, 500);
      }
    });
  }


  @ViewChild('threadMessageContent', { static: false }) threadMessageContent!: ElementRef;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    if (this.threadService.startMutationObserver && this.scrollContainer && !this.hasScrolled) {
      console.log(this.scrollContainer);
      this.MutationObserverService.observe(this.scrollContainer, true);
      this.hasScrolled = true;
    }
  }


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

  onOutsideClickTextarea() {
    this.showEmojiPickerTextarea = !this.showEmojiPickerTextarea;
    this.isEmojiPickerVisibleThreadMessageInput = false;
  }

  toggleOpenEditMessage(index: number): void {
    this.emojiService.openEditMessageToggleThread[index] = !this.emojiService.openEditMessageToggleThread[index]
  }

  toggleEmojiPicker(index: number): void {
    this.emojiService.showEmojiPickerArrayThread[index] = !this.emojiService.showEmojiPickerArrayThread[index]
  }

  onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    // Es gibt nun einen zusatzparameter / thread oder channel
    this.emojiService.addEmoji(event, index, messageId, userId, 'thread');
    this.emojiAdded = true;
    setTimeout(() => {
      this.emojiAdded = false;
    }, 500);
    this.emojiService.showEmojiPickerArrayThread[index] = false;
  }

  onUpdateReaction(currentEmojiIndex: number, currentMessageIndex: number, currentEmoji: string, messageId: string, userId: string) {
    this.emojiService.updateReaction(currentEmojiIndex, currentMessageIndex, currentEmoji, messageId, userId, 'thread');
  }


  toggleEvent(event: any): void {
    if (event.target.classList.contains('edit-message-icon') ||
      event.target.classList.contains('add-reaction-icon') ||
      event.target.classList.contains('text-area-editable') ||
      event.target.classList.contains('emoji-mart-anchor-bar')
    ) {
      event.stopPropagation();
    }
  }

  editMessageFunction(index: number, event: any): void {
    this.originalMessage = this.threadService.messages[index].message;
    this.emojiService.threadMessageEdit = true;
    this.isEditMessageTextareaVisible = true;
    this.emojiService.editMessageThread[index] = !this.emojiService.editMessageThread[index];
    const textareaId = 'editThreadMessageTextarea-' + index;
    this.toggleEvent(event);
    this.newMessage = { message: this.threadService.messages[index].message };
    // Der timeout gleicht Verzögerung im DOM aus. Sonst gibt es ab und zu Fokusprobleme
    setTimeout(() => {
      const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement;
      if (textareaElement) {
        textareaElement.focus();
      }
    }, 0);
    this.emojiService.openEditMessageToggleThread[index] = !this.emojiService.openEditMessageToggleThread[index];
  }


  onSubmit(formThread: NgForm): void {
    this.submitClick = true;
    this.textareaBlur = true;

    if (!formThread.valid) {
      console.log(formThread)
      formThread.reset();
    } else if (formThread.valid) {
      this.arrangeThreadData();
      console.log(this.messageThread.content)
      this.threadMessageContent.nativeElement.focus()
      this.submitClick = false;
      this.selectedEmojis = [];
      formThread.reset();
      this.emojiService.initMaps('thread')
    }
  }

  /**
* The function `arrangeDirectData` creates a new `MessageData` object, populates it with data from
* user input and session storage, and then sends it to the `channelService` to create a direct
* message.
*/
  arrangeThreadData() {
    let dummy = new MessageData();
    dummy.id = sessionStorage.getItem('uid')!;
    dummy.name = this.userService.userInfo.name;
    dummy.profilePicture = this.userService.userInfo.profilePicture;
    dummy.message = this.messageThread.content;
    dummy.email = this.userService.userInfo.email;
    dummy.emoji = [];
    this.threadService.createThreadMessage(dummy.toJson());
  }

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

  editMessageAbort(index: number) {
    this.selectedEmojis = [];
    this.emojiService.editMessageThread[index] = false;
    this.emojiService.threadMessageEdit = false;
    this.isEditMessageTextareaVisible = false;
    this.newMessage = { message: this.originalMessage };
    this.threadService.messages[index].message = this.originalMessage;
  }

  onKeyup(event: KeyboardEvent, editMessageForm: NgForm, index: number) {
    this.threadService.messages[index].message = this.newMessage.message;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.editMessageSubmit(editMessageForm, index);
    }
  }

  updateMessageAfterEmojiSelection(index: number) {
    this.newMessage = { message: this.threadService.messages[index].message };
  }

  toggleEmojiPickerEventTextarea(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerVisibleThreadMessageInput = !this.isEmojiPickerVisibleThreadMessageInput;
  }

  addThreadMessageEmoji(event: any) {
    const selectedEmoji = event['emoji']['native'];
    this.selectedEmojis.push(selectedEmoji);
    this.messageThread.content += selectedEmoji;
    this.onOutsideClickTextarea()
  }

  closeThread() {
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
    console.log(user);

    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }
}
