import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';
import { MatDialog } from '@angular/material/dialog';
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





}
