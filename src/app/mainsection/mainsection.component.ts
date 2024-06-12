import { Component, OnDestroy, inject } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header.component';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-mainsection',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, ChannelComponent, ThreadComponent],
  templateUrl: './mainsection.component.html',
  styleUrl: './mainsection.component.scss'
})
export class MainsectionComponent {
  userService: UserService = inject(UserService);
  rotateToggle: boolean = false;
  unsubProfile;
  unsubUserChannels;
  unsubUserList;

  constructor() {
    this.unsubProfile = this.userService.retrieveUserProfile();
    this.unsubUserChannels = this.userService.retrieveUserChannels();
    this.unsubUserList = this.userService.retrieveAllUsers();
  }

  /**
   * The `rotateIndicator` function toggles a CSS class and shows/hides a side navigation menu based on
   * the current state of a boolean variable.
   */
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

  /**
   * The `hideSidenav` function adds the 'hide-show' class to the element with the id 'sidebar' to hide
   * it.
   */
  hideSidenav() {
    document.getElementById('sidebar')?.classList.add('hide-show')
  }

  /**
   * The `showSidenav` function removes the 'hide-show' class from the element with the id 'sidebar'.
   */
  showSidenav() {
    document.getElementById('sidebar')?.classList.remove('hide-show')
  }

  ngOnDestroy() {
    console.log('hallo');
    this.unsubProfile();
    this.unsubUserChannels();
    this.unsubUserList();
  }
}
