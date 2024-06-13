import { Component, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
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

export class MainsectionComponent implements AfterViewInit, OnDestroy {
  userService: UserService = inject(UserService);
  rotateToggle: boolean = false;
  mediumScreen: boolean = false;
  unsubProfile;
  unsubUserChannels;
  unsubUserList;
  @ViewChild('toggle', { read: ElementRef }) toggleElement!: ElementRef;
  @ViewChild('sidebar', { read: ElementRef }) sidebarElement!: ElementRef;
  @ViewChild('threadBar', { read: ElementRef }) threadBarElement!: ElementRef;

  constructor() {
    this.unsubProfile = this.userService.retrieveUserProfile();
    this.unsubUserChannels = this.userService.retrieveUserChannels();
    this.unsubUserList = this.userService.retrieveAllUsers();
    this.userService.userLoggedIn();
  }

  /**
   * Initializes the component after the view has been fully initialized.
   * Calls the `checkInnerWidth` method to check the inner width of the window and sets the `mediumScreen` boolean variable accordingly.
   */
  ngOnInit(): void {
    this.checkInnerWidth(window.innerWidth);
  }

  /**
   * Initializes the component after the view has been fully initialized.
   * Calls the `showSidenav()` and `hideThread()` methods to show and hide the side navigation menu and thread respectively.
   */
  ngAfterViewInit() {
    this.showSidenav();
    this.hideThread();
  }

  @HostListener('window:resize', ['$event'])
  checkInnerWidth(event: any) {
    if (window.innerWidth <= 1440) {
      this.mediumScreen = true;
    }
  }

  /**
   * Toggles the CSS class 'rotate-toggle' on the toggleElement and
   * shows/hides the side navigation menu based on the current state of the rotateToggle boolean variable.
   */
  rotateIndicator() {
    if (this.rotateToggle == false) {
      this.toggleElement.nativeElement.classList.add('rotate-toggle')
      this.hideSidenav();
      this.rotateToggle = true;
    } else {
      this.toggleElement.nativeElement.classList.remove('rotate-toggle')
      this.showSidenav();
      this.rotateToggle = false;
    }
  }

  /**
   * Toggles the visibility of the app-thread based on the current screen size.
   */
  showThread() {
    if (this.mediumScreen == true) {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
      this.hideSidenav();
      this.toggleElement.nativeElement.classList.add('rotate-toggle')
      this.rotateToggle = true;
    } else {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
    }
  }

  /**
   * Toggles the visibility of the app-sidebar based on the current screen size.
   */
  showSidenav() {
    if (this.mediumScreen == true) {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
      this.hideThread();
    } else {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
    }
  }

  /**
   * Adds the 'hide-show' class to the thread bar element (app-sidebar) to hide the thread.
   */
  hideSidenav() {
    this.sidebarElement.nativeElement.classList.add('hide-show');
  }

  /**
   * Adds the 'hide-show' class to the thread bar element (app-thread) to hide the thread.
   */
  hideThread() {
    this.threadBarElement.nativeElement.classList.add('hide-show');
  }

  ngOnDestroy() {
    console.log('hallo');
    this.unsubProfile();
    this.unsubUserChannels();
    this.unsubUserList();
    this.userService.userLoggedOut();
  }
}