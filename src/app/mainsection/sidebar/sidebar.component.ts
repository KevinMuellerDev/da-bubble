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
  /**
   * An object representing the states of different menus.
   * Each menu state can either be 'open' or 'closed'.
   *
   * @type {{ [state: string]: 'open' | 'closed' }}
   */

  menuStates: { [state: string]: 'open' | 'closed' } = {
    channel: 'closed',
    message: 'closed',
  };
  userService: UserService = inject(UserService);

  /**
   * Toggles the state of the specified menu between 'open' and 'closed'.
   *
   * @param {'channel' | 'message'} menu - The menu to be toggled. It can either be 'channel' or 'message'.
   */
  toggleMenu(menu: 'channel' | 'message') {
    this.menuStates[menu] = this.menuStates[menu] === 'open' ? 'closed' : 'open';
  }

  /**
   * Function returns the class of user status for online indicator div
   *
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus() {
    const loggedIn =
      this.userService.userInfo.isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }
}
