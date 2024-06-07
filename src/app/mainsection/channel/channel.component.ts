import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';
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

  @ViewChild('scroll', { read: ElementRef }) public scroll!: ElementRef<any>;
  
    ngAfterViewChecked() {
    this.scrollBottom()
  }
    public scrollBottom() {
    console.log(this.scroll.nativeElement.scrollTop);
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }
    public scrollToTop() {
    this.scroll.nativeElement.scrollTop = 0;
  }

  onSubmit(form:NgForm) {
    if (!form.valid) {
      console.log(form)
    } else if(form.valid) {
      console.log(this.message.content);
      form.reset();
    }
  }
  showThreadBar() {
      document.getElementById('threadBar')?.classList.remove('hide-show','d-none')
  }
}
