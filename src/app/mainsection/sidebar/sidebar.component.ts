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
import { SidebarService } from '../../shared/services/sidebar.service';
import { Unsubscribe } from '@angular/fire/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, AddNewChannelComponent],
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
  userService:UserService = inject(UserService);
  sidebarService:SidebarService = inject(SidebarService);
  unsubChannels;
  unsubCurrentChannels;
  unsubUserDmIds;
  unsubUserDmData?:Unsubscribe;


  constructor(public dialog: MatDialog) {
    this.unsubChannels = this.sidebarService.retrieveChannels();
    this.unsubCurrentChannels = this.sidebarService.retrieveCurrentChannels();
    this.unsubUserDmIds = this.sidebarService.retrieveCurrentDirectMsgs();
    this.unsubUserDmData = this.sidebarService.retrieveDmUserData();
  }

/**
 * Opens the AddNewChannel dialog.
 */
  openDialog() {
   this.dialog.open(AddNewChannelComponent, { panelClass: 'mod-dialog-window' });

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
    const loggedIn = this.userService.userInfo.isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  getDmStatus(index:number){
    const loggedIn = this.sidebarService.userDmData[index].isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  ngOnDestroy(){
    this.unsubChannels();
    this.unsubCurrentChannels();
    this.unsubUserDmIds();
  }
}
