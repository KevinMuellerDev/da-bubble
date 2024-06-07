import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MainsectionComponent } from '../mainsection.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule,FormsModule,MainsectionComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  message = {
  content:''
  }

  submitClick:boolean = false;

  @ViewChild('scroll', { read: ElementRef }) public scroll!: ElementRef<any>;
  @ViewChild('messageContent', { read: ElementRef }) public messageContent!: ElementRef<any>;

    ngAfterViewChecked() {
      this.scrollBottom()
      
      
      
  }
    public scrollBottom() {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

  onSubmit(form: NgForm) {
    this.submitClick = true;
    if (!form.valid) {
      console.log(form ,this.submitClick)
    } else if(form.valid) {
      console.log(this.message.content);
      form.reset();
      this.messageContent.nativeElement.focus()
       this.submitClick = false;
    }
  }
  showThreadBar() {
      document.getElementById('threadBar')?.classList.remove('hide-show','d-none')
  }
}
