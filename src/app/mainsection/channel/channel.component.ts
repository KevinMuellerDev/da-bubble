import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  message = {
  content:''
}

  onSubmit() {
    if (this.message.content === '') {
      console.log("nüscht")
    } else {
      console.log(this.message.content)
      this.message.content = '';
      console.log(this.message.content)
    }
}
}
