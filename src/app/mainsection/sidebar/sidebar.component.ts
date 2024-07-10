import { Component, OnInit, inject } from '@angular/core';
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
import { ResizeListenerService } from '../../shared/services/resize-listener.service';
import { MainsectionComponent } from '../mainsection.component';
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

export class SidebarComponent implements OnInit {
  userService: UserService = inject(UserService);
  sidebarService: SidebarService = inject(SidebarService);
  channelService: ChannelService = inject(ChannelService);
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);
  activeChannelTitle: string = '';
  activePrivateChannel: string = '';
  activeDirectChannel: string = '';
  unsubChannels;
  unsubCurrentChannels;
  unsubUserDmIds;
  unsubUserDmData;

  constructor(public dialog: MatDialog, private mainsectionComponent: MainsectionComponent) {
    this.unsubChannels = this.sidebarService.retrieveChannels();
    this.unsubCurrentChannels = this.sidebarService.retrieveCurrentChannels();
    this.unsubUserDmIds = this.sidebarService.retrieveCurrentDirectMsgs();
    this.unsubUserDmData = this.sidebarService.retrieveDmUserData();
  }

  /**
   * Initializes the component and clears the active style.
   */
  ngOnInit() {
    this.clearactiveStyle();
  }

  /**
   * Opens the AddNewChannel dialog.
   */
  openDialog() {
    this.dialog.open(AddNewChannelComponent, { panelClass: ['add-new-channel', 'box-radius', 'box-shadow'] });
  }

  /**
   * Navigates to the specified channel and updates the active channel title.
   */
  goToChannel() {
    this.clearactiveStyle();
    this.checkMobileSmallScreen();
    this.activeChannelTitle = this.channelService.channelMsgData.title;
  }

  /**
   * Navigates to the private message and updates the active channel title.
   * This function clears the active style, checks if the mobile screen is small,
   * and sets the active private channel to the user's name.
   */
  goToPrivateMessage() {
    this.clearactiveStyle();
    this.checkMobileSmallScreen();
    this.activePrivateChannel = this.userService.userInfo.name;
  }

  /**
   * Navigates to the direct message and updates the active channel title.
   * @param {string} dm - The direct message to navigate to.
   */
  goToDirektMessage(dm: string) {
    this.clearactiveStyle();
    this.checkMobileSmallScreen();
    this.activeDirectChannel = dm;
  }

  /**
   * Checks if the screen size is small or extra small and calls the handleCloseMobile method of the mainsectionComponent if true.
   */
  checkMobileSmallScreen() {
    if (this.resizeListenerService.smScreen || this.resizeListenerService.xsmScreen) {
      this.mainsectionComponent.hanldeCloseMobile();
    }
  }

  /**
   * An object representing the states of different menus.
   * Each menu state can either be 'open' or 'closed'.
   * @type {{ [state: string]: 'open' | 'closed' }}
   */
  menuStates: { [state: string]: 'open' | 'closed' } = {
    channel: 'open',
    message: 'open',
  };

  /**
   * Toggles the state of the specified menu between 'open' and 'closed'.
   * @param {'channel' | 'message'} menu - The menu to be toggled. It can either be 'channel' or 'message'.
   */
  toggleMenu(menu: 'channel' | 'message') {
    this.menuStates[menu] = this.menuStates[menu] === 'open' ? 'closed' : 'open';
  }

  /**
   * Function returns the class of user status for online indicator div
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus() {
    const loggedIn = this.userService.userInfo.isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  /**
   * The function `getDmStatus` returns a CSS class name based on the login status of a user in the
   * sidebar.
   * @param {number} index - The `index` is a number that represents the position or index of the user 
   * in the `userDmData` array within the `sidebarService`.
   * @returns returns either 'online-div' or 'offline-div' based on the value
   * of `isLoggedIn` property in the `userDmData` array at the specified index.
   */
  getDmStatus(index: number) {
    const loggedIn = this.sidebarService.userDmData[index].isLoggedIn == true ? 'online-div' : 'offline-div';
    return loggedIn;
  }

  /**
   * The `newMessage` function resets message-related properties and clears active styles, and closes the
   * mobile section if the screen size is small.
   */
  newMessage() {
    this.channelService.privateMsg = false;
    this.channelService.channelMsg = false;
    this.channelService.messages = [];
    this.clearactiveStyle();
    if (this.resizeListenerService.smScreen || this.resizeListenerService.xsmScreen) {
      this.mainsectionComponent.hanldeCloseMobile();
    }
  }

  /**
   * The clearactiveStyle function resets the active channel titles in a TypeScript class.
   */
  clearactiveStyle() {
    this.activeChannelTitle = '';
    this.activePrivateChannel = '';
    this.activeDirectChannel = '';
  }

  /**
   * Performs cleanup operations when the component is destroyed.
   */
  ngOnDestroy() {
    this.unsubChannels();
    this.unsubCurrentChannels();
    this.unsubUserDmIds();
    this.unsubUserDmData();
    this.sidebarService.userDmData = [];
  }
}
