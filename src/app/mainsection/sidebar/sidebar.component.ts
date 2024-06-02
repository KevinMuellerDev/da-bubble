import { Component, inject } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      state('closed', style({ display: 'none' })),
      state('open', style({ display: 'flex' })),
    ]),
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})

export class SidebarComponent {
  menuStates: { [state: string]: 'open' | 'closed' } = {
    channel: 'closed',
    message: 'closed',
  };
  userService: UserService = inject(UserService);


  toggleMenu(menu: 'channel' | 'message') {
    this.menuStates[menu] =
      this.menuStates[menu] === 'open' ? 'closed' : 'open';
  }

  /**
  * Function returns the class of user status for online indicator div
  * 
  * @param type string - to determine which value should be returned
  * @returns class as a string
  */
  getUserStatus() {
    const loggedIn = this.userService.userInfo.isLoggedIn == true ? "online-div" : "offline-div";
    return loggedIn
  }
}
