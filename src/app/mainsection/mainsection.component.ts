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
  imports: [CommonModule, HeaderComponent, SidebarComponent, ChannelComponent, ThreadComponent, HeaderComponent],
  templateUrl: './mainsection.component.html',
  styleUrl: './mainsection.component.scss'
})

export class MainsectionComponent implements AfterViewInit, OnDestroy {
  userService: UserService = inject(UserService);
  rotateToggle: boolean = false;
  mediumScreen: boolean = false;
  smallerMediumScreen: boolean = false;
  largerSmallScreen: boolean = false;
  smallScreen: boolean = false;
  sidenavOpen: boolean = true;
  threadOpen: boolean = false;
  unsubProfile;
  unsubUserChannels;
  unsubUserList;
  @ViewChild('toggle', { read: ElementRef }) toggleElement!: ElementRef;
  @ViewChild('sidebar', { read: ElementRef }) sidebarElement!: ElementRef;
  @ViewChild('threadBar', { read: ElementRef }) threadBarElement!: ElementRef;
  @ViewChild('channel', { read: ElementRef }) channelElement!: ElementRef;
  @ViewChild('overlay', { read: ElementRef }) overlayElement!: ElementRef;
  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;

  constructor() {
    this.unsubProfile = this.userService.retrieveUserProfile();
    this.unsubUserChannels = this.userService.retrieveUserChannels();
    this.unsubUserList = this.userService.retrieveAllUsers();
    this.userService.userLoggedIn();
  }


  ngOnInit(): void {
    this.checkInnerWidth({});
  }

  ngAfterViewInit() {
    this.displayHeadlineMobile();
    this.hideThread();
    this.sidebarElement.nativeElement.classList.add('margin-right');
    if (this.smallerMediumScreen) {
      this.hideSidenav();
      this.hideThread();
      this.rotateToggle = true;
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
    }
  }

  @HostListener('window:resize', ['$event'])
  checkInnerWidth(event: any) {
    setTimeout(() => {
      this.mediumScreen = window.innerWidth <= 1440 && window.innerWidth > 960;
      this.smallerMediumScreen = window.innerWidth <= 960 && window.innerWidth > 600;
      this.largerSmallScreen = window.innerWidth <= 600 && window.innerWidth > 480;
      this.smallScreen = window.innerWidth <= 480;
      this.updateOverlayDisplay();
      this.displayHeadlineMobile();
    },100);
  }

  updateOverlayDisplay() {
    if (this.overlayElement && this.overlayElement.nativeElement) {
      if (this.smallerMediumScreen && this.sidenavOpen == true || window.innerWidth <= 960 && this.threadOpen == true) {
        this.overlayElement.nativeElement.style.display = 'block';
      } else {
        this.overlayElement.nativeElement.style.display = 'none';
      }
    }
  }

  /**
   * Toggles the CSS class 'rotate-toggle' on the toggleElement and
   * shows/hides the side navigation menu based on the current state of the rotateToggle boolean variable.
   */
  rotateIndicator() {
    if (this.rotateToggle == false) {
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
      this.hideSidenav();
      this.rotateToggle = true;
    } else {
      this.toggleElement.nativeElement.classList.remove('rotate-toggle');
      this.showSidenav();
      this.rotateToggle = false;
    }
  }

  /**
   * Toggles the visibility of the app-thread based on the current screen size.
   */
  showThread() {
    this.threadBarElement.nativeElement.classList.add('margin-left');
    this.threadOpen = true;
    if (this.mediumScreen == true) {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
      this.hideSidenav();
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
      this.rotateToggle = true;
    } else {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
    }
    if (this.smallerMediumScreen == true) {
      this.overlayElement.nativeElement.style.display = 'block';
    }
    this.displayHeadlineMobile();
  }

  /**
   * Toggles the visibility of the app-sidebar based on the current screen size.
   */
  showSidenav() {
    this.sidebarElement.nativeElement.classList.add('margin-right');
    this.sidenavOpen = true;
    if (this.mediumScreen == true) {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
      this.hideThread();
    } else {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
    }
    if (this.smallerMediumScreen == true) {
      this.hideThread();
      this.overlayElement.nativeElement.style.display = 'block';
    }
    this.displayHeadlineMobile();
  }

  /**
   * Adds the 'hide-show' class to the thread bar element (app-sidebar) to hide the thread.
   */
  hideSidenav() {
    this.sidebarElement.nativeElement.classList.remove('margin-right');
    this.sidebarElement.nativeElement.classList.add('hide-show');
    this.sidenavOpen = false;
    this.overlayElement.nativeElement.style.display = 'none';
  }

  /**
   * Adds the 'hide-show' class to the thread bar element (app-thread) to hide the thread.
   */
  hideThread() {
    this.threadBarElement.nativeElement.classList.remove('margin-left');
    this.threadBarElement.nativeElement.classList.add('hide-show');
    this.threadOpen = false;
    this.overlayElement.nativeElement.style.display = 'none';

  }

  displayHeadlineMobile() {
    if (this.smallScreen && this.sidenavOpen == false) {
      this.headerComponent.headlineMobile.nativeElement.style.display = 'flex';
      this.headerComponent.headlineDesktop.nativeElement.style.display = 'none';
      this.rotateToggle = true;
    } else {
      this.headerComponent.headlineMobile.nativeElement.style.display = 'none';
      this.headerComponent.headlineDesktop.nativeElement.style.display = 'flex';
    }
  }

  closeSides() {
    if (this.rotateToggle == false) {
      this.hideSidenav();
      this.rotateToggle = true;
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
    } else {
      this.hideThread();
    }
  }


  getToggleText(): string {
    return this.sidenavOpen ? 'schließen' : 'öffnen';
  }

  ngOnDestroy() {
    console.log('hallo');
    this.unsubProfile();
    this.unsubUserChannels();
    this.unsubUserList();
    this.userService.userLoggedOut();
  }
}