import { Component, inject } from '@angular/core';
import {
  trigger,
  state,
  style
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AddNewChannelComponent } from './add-new-channel/add-new-channel.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,AddNewChannelComponent],
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
  constructor(public dialog: MatDialog) { }
  
  openDialog() {
    const dialogRef = this.dialog.open(AddNewChannelComponent,{panelClass: 'mod-dialog-window'});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  
  }
  
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
