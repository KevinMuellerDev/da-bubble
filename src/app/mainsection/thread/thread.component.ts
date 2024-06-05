import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MainsectionComponent } from '../mainsection.component';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule,MainsectionComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {


  openDialogUserInfo(){
    
  }
}
