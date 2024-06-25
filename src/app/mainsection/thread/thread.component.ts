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
  private dataSubscription!: Subscription;
  private domChangesSubscription!: Subscription;
  userId!: string;
  messages: any[] = [];
  newMessage: { message: string } = { message: '' };
  originalMessage!: string;
  emojiAdded: boolean = false;
  isEmojiPickerVisible: boolean = false;
  isEditMessageTextareaVisible: boolean = false;

  submitClick: boolean = false;
  textareaBlur: boolean = false;
  isEmojiPickerVisibleThreadMessageInput: boolean = false;
  showEmojiPickerTextarea:boolean = false;
  selectedEmojis: string[] = [];
    messageThread = {
    content: ''
  }

  constructor(public dialog: MatDialog, private mainsectionComponent: MainsectionComponent, public emojiService: EmojiService, private MutationObserverService: MutationObserverService) {
    this.userId = sessionStorage.getItem('uid')!;
    this.dataSubscription = this.threadService.data$.subscribe(data => {
      if (data) {
        console.log(data);
        setTimeout(() => {
          emojiService.initMaps();
        }, 500);
      }
    });
  }


  @ViewChild('threadMessageContent', { static: false }) threadMessageContent!: ElementRef; 
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  ngOnInit() {
    this.domChangesSubscription = this.MutationObserverService.domChanges$.subscribe((mutations: MutationRecord[]) => {
      console.log('DOM changes detected:', mutations);
    });
  }

  ngAfterViewInit() {
    if (this.scrollContainer) {
      this.MutationObserverService.observe(this.scrollContainer);
    }
  }

  onOutsideClick(index: number,event:Event): void {
    this.emojiService.showEmojiPickerArrayThread[index] = false;
    this.emojiService.openEditMessageToggleThread[index] = false;
    if (!this.emojiAdded) {
      this.emojiService.editMessage[index] = false;
      //this.editMessageAbort(index)
    }
  }

  onOutsideClickTextarea() {
     this.showEmojiPickerTextarea = !this.showEmojiPickerTextarea;
      this.isEmojiPickerVisibleThreadMessageInput = false;
  }

  emojiclick() {
    console.log("emojiclick");

  }

    toggleOpenEditMessage(index: number) {
    this.emojiService.openEditMessageToggleThread = this.emojiService.openEditMessageToggleThread.map((value, i) => i === index ? !value : false);
  }

  toggleEmojiPicker(index: number): void {
    this.emojiService.showEmojiPickerArrayThread = this.emojiService.showEmojiPickerArrayThread.map((value, i) => i === index ? !value : false);
  }

  onAddEmoji(event: any, index: number, messageId: string, userId: string, calledFromFunction: boolean = false) {
    // TODO es muss nun unterschieden werden welcher MEssage service geprüft und geupdatet werden soll
   /*this.emojiService.addEmoji(event, index, messageId, userId);
    this.emojiAdded = true;
    setTimeout(() => {
      this.emojiAdded = false;
    }, 500);
    if (!calledFromFunction) {
      this.toggleEmojiPicker(index);
      this.isEmojiPickerVisible = false;
    }*/
  }

  toggleEvent(event: any): void {
    if (event.target.classList.contains('edit-message-icon') || event.target.classList.contains('add-reaction-icon') || event.target.classList.contains('text-area-editable')) {
      event.stopPropagation();
    }
  }

  editMessageFunction(index: number): void {
 this.originalMessage = this.threadService.messages[index].message;
    this.emojiService.threadMessageEdit = true;
    this.isEditMessageTextareaVisible = true;
    this.emojiService.editMessageThread[index] = !this.emojiService.editMessageThread[index];
    const textareaId = 'editThreadMessageTextarea-' + index;
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
      console.log(this.messageThread.content)
      this.threadMessageContent.nativeElement.focus()
      this.submitClick = false;
      this.selectedEmojis = [];
       formThread.reset();
    }
  }

  editMessageSubmit(editMessageForm: NgForm, index: number) {
    if (editMessageForm.valid) {
      this.threadService.messages[index].message = this.newMessage.message;
     // if (this.channelService.privateMsg) {
     //   this.channelService.updateDirectMessage(this.channelService.messages[index]);
      } else {
       // this.channelService.updateChannelMessage(this.channelService.messages[index]);
      }
      this.emojiService.editMessageThread[index] = false;
      editMessageForm.reset();
      this.emojiService.threadMessageEdit = false;
  }

  editMessageAbort(index: number) {
    this.emojiService.editMessageThread[index] = false;
    this.emojiService.threadMessageEdit = false;
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
  async openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: ['show-profile-from-message', 'box-shadow', 'box-radius'] });
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;
    dialogRef
      .afterClosed()
      .subscribe();
  }
}
