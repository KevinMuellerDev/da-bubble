import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { AddUserToChannelDialogComponent } from './add-user-to-channel-dialog/add-user-to-channel-dialog.component';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import { ChannelMessagesComponent } from './channel-messages/channel-messages.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, MainsectionComponent,ChannelMessagesComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  message = {
    content: ''
  }

  submitClick: boolean = false;
  textareaBlur: boolean = false;


  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

  constructor(public dialog: MatDialog) { }
  
  onSubmit(form: NgForm) {
   this.submitClick = true;
    this.textareaBlur = true;
    if (!form.valid) {
      console.log(form)
      form.reset();
    } else if (form.valid) {
      console.log(this.message.content);
      form.reset();
      this.messageContent.nativeElement.focus()
      this.submitClick = false;
    }
  }

  openDialogEditChannel() {
       this.dialog.open(EditChannelDialogComponent, { panelClass: 'mod-dialog-window-2' })
  }

    openDialogAddUser() {
       this.dialog.open(AddUserDialogComponent, { panelClass: 'mod-dialog-window-3' })
  }

    openDialogAddUserToChannel() {
       this.dialog.open(AddUserToChannelDialogComponent, { panelClass: 'mod-dialog-window-3' })
  }
}
