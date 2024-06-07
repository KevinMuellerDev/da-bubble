import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm,FormGroup } from '@angular/forms';
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
