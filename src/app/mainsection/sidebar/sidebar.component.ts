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
import { ChannelService } from '../../shared/services/channel.service';
import { Unsubscribe } from '@angular/fire/firestore';

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
  userService: UserService = inject(UserService);
  sidebarService: SidebarService = inject(SidebarService);
  channelService: ChannelService = inject(ChannelService);
  unsubChannels;
  unsubCurrentChannels;
  unsubUserDmIds;
  unsubUserDmData;

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
    this.dialog.open(AddNewChannelComponent, { panelClass: ['box-radius', 'box-shadow'] });
  }

  /**
   * An object representing the states of different menus.
   * Each menu state can either be 'open' or 'closed'.
   *
   * @type {{ [state: string]: 'open' | 'closed' }}
   */
  menuStates: { [state: string]: 'open' | 'closed' } = {
    channel: 'open',
    message: 'open',
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

  getDmStatus(index: number) {
    const loggedIn = this.sidebarService.userDmData[index].isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  newMessage(){
    this.channelService.privateMsg = false;
    this.channelService.channelMsg = false;
    this.channelService.messages = [];
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubCurrentChannels();
    this.unsubUserDmIds();
    this.unsubUserDmData();
    this.sidebarService.userDmData = [];
    console.log(this.sidebarService.userDmData);
    
  }
}
