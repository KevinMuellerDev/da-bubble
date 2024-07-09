import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { UserMenuDialogComponent } from './user-menu-dialog/user-menu-dialog.component';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MainsectionComponent } from '../../../mainsection/mainsection.component';
import { SidebarComponent } from '../../../mainsection/sidebar/sidebar.component';
import { SidebarService } from '../../services/sidebar.service';
import { ChannelService } from '../../services/channel.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatMenuModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;
  userService: UserService = inject(UserService);
  sidebarService: SidebarService = inject(SidebarService);
  channelService: ChannelService = inject(ChannelService);
  userList: any[] = [];
  messageList: any[] = [];
  searchMsg = {
    msg: ''
  };
  @ViewChild('headlineMobile', { static: true, read: ElementRef }) headlineMobile!: ElementRef;
  @ViewChild('headlineDesktop', { static: true, read: ElementRef }) headlineDesktop!: ElementRef;

  constructor(public dialog: MatDialog, private mainsectionComponent: MainsectionComponent) { }

  /**
   * The `openDialog` function opens a dialog box for the UserMenuDialogComponent at a specific position
   * and subscribes to the afterClosed event.
   */
  openDialog() {
    this.dialog.open(UserMenuDialogComponent, { panelClass: ['user-menu', 'box-shadow', 'box-radius-right-corner'] })
      .afterClosed()
      .subscribe();
  }

  /**
   * Function returns the class of user status for online indicator div
   * @param type string - to determine which value should be returned
   * @returns class as a string
   */
  getUserStatus() {
    const loggedIn = this.userService.userInfo.isLoggedIn == true ? "online-div" : "offline-div";
    return loggedIn
  }

  /**
   * The `goBack` function shows the side navigation, displays the headline on desktop, and hides the
   * headline on mobile.
   */
  goBack() {
    this.mainsectionComponent.showSidenav();
    this.mainsectionComponent.toggleElement.nativeElement.classList.remove('rotate-toggle');
    this.mainsectionComponent.rotateToggle = false;
    this.headlineDesktop.nativeElement.style.display = 'block';
    this.headlineMobile.nativeElement.style.display = 'none';
  }

  /**
   * The scrollToMessage function scrolls the message container to a specific message based on its index.
   * @param {number} index - The `index` parameter represents the index of the message you
   * want to scroll to in the message container.
   */
  scrollToMessage(index: number) {
    const msgElement = document.getElementById('singleMessage-' + index);
    const topPos = msgElement!.offsetTop;
    document.getElementById('messageContainer')!.scrollTo({ top: topPos, behavior: 'smooth' });
    this.searchMsg.msg = '';
    this.messageList = [];
  }

  /**
   * The `getMenu` function opens the menu by triggering the `openMenu` method.
   */
  getMenu() {
    this.trigger.openMenu();
  }

  /**
   * The `searchMessage` function filters messages based on a search term and populates a list with
   * matching messages.
   */
  searchMessage() {
    this.messageList = [];
    this.channelService.messages.forEach((element, i) => {
      const message: string = element['message'];
      const contains: boolean = message.toLocaleLowerCase().indexOf(this.searchMsg.msg.toLocaleLowerCase()) != -1;
      element.index = i;
      if (contains && this.searchMsg.msg != '') {
        this.messageList.push(element);
      }
    });
  }
}
