import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddUserToChannelDialogComponent } from '../../add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from '../../add-user-dialog/add-user-dialog.component';
import { EditChannelDialogComponent } from '../../edit-channel-dialog/edit-channel-dialog.component';
import { ShowProfileComponent } from '../../../../shared/components/show-profile/show-profile.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule,AddUserToChannelDialogComponent,AddUserDialogComponent,EditChannelDialogComponent,ShowProfileComponent,PickerComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  constructor(public dialog: MatDialog) { }

  

  showEmojiPickerArray: boolean[] = [];

//test Nachrichtaufbau
  messages = [{
    'profilePicture': '/assets/img/profile/testchar1.svg',
    'userName': 'Noah Braun',
    'timeStamp': '14:25 Uhr',
    'messageText': 'Welche Version von Angular ist aktuell ?',
    'selectedEmoji': [] as string[], 
    'repliesCount': 2,
    'lastReplyTimeStamp':'14:56'
  }, {
    'profilePicture': '/assets/img/profile/testchar1.svg',
    'userName': 'Noah Braun',
    'timeStamp': '14:25 Uhr',
    'messageText': 'Welche Version von Angular ist aktuell ?',
      'selectedEmoji':[] as string[], 
    'repliesCount': 2,
    'lastReplyTimeStamp':'14:56'
    },
    {
      'profilePicture': '/assets/img/profile/testchar1.svg',
      'userName': 'Noah Braun',
      'timeStamp': '14:25 Uhr',
      'messageText': 'Welche Version von Angular ist aktuell?',
        'selectedEmoji':[] as string[], 
      'repliesCount': 2,
      'lastReplyTimeStamp':'14:56'
    }
  
  ]
  ngOnInit() {
    this.showEmojiPickerArray = this.messages.map(() => false);
  }
  
     toggleEmojiPicker(index: number) {
    this.showEmojiPickerArray = this.showEmojiPickerArray.map((value, i) => i === index ? !value : false);
  }

  addEmoji(event: any,index: number) {
    this.messages[index]['selectedEmoji'].push(event['emoji']['native']);
    console.log(this.messages[index]['selectedEmoji']);
    console.log(event['emoji']['name']);
    console.log(event['emoji']['native']);
    console.log(event['emoji']);
    this.toggleEmojiPicker(index);
  }
  
    @ViewChild('scroll', { read: ElementRef }) public scroll!: ElementRef<any>;
  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

      ngAfterViewChecked() {
    this.scrollBottom();
  }
  public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

    /**
  * This function opens the dialog and determines if the ShowProfile component is editable or not
  * 
  * @param profileEditable boolean - determine if ShowUser component is editable or not
  */

    openDialogUserInfo() {
    let dialogRef = this.dialog.open(ShowProfileComponent, { panelClass: 'verify' })
    dialogRef.componentInstance.otherUser = true;
    dialogRef.componentInstance.profileEditable = false;

    dialogRef
      .afterClosed()
      .subscribe();
  }

    showThreadBar() {
    document.getElementById('threadBar')?.classList.remove('hide-show')
  }

}
