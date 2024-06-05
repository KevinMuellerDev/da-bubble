import { Component, OnDestroy, inject } from '@angular/core';

import { SidebarComponent } from './sidebar/sidebar.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header.component';
import { UserService } from '../shared/services/user.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-mainsection',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, ChannelComponent, ThreadComponent],
  templateUrl: './mainsection.component.html',
  styleUrl: './mainsection.component.scss'
})
export class MainsectionComponent {
  rotateToggle: boolean = false;

  constructor(private userService:UserService){
    userService.retrieveUserProfile();
  }
  
  rotateIndicator() {
    if (this.rotateToggle == false) {
      document.getElementById('toggle')?.classList.add('rotate-toggle')
      this.hideSidenav();
      this.rotateToggle = true;
    } else {
      document.getElementById('toggle')?.classList.remove('rotate-toggle')
      this.showSidenav();
      this.rotateToggle = false;
    }
  }


  hideSidenav(){
    document.getElementById('sidebar')?.classList.add('hide-show')
  }


  showSidenav(){
    document.getElementById('sidebar')?.classList.remove('hide-show')
  }


}
