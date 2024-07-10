import { Component, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header.component';
import { UserService } from '../shared/services/user.service';
import { ResizeListenerService } from '../shared/services/resize-listener.service';
import { Subscription } from 'rxjs';
import { ThreadService } from '../shared/services/thread.service';

@Component({
  selector: 'app-mainsection',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, ChannelComponent, ThreadComponent, HeaderComponent],
  templateUrl: './mainsection.component.html',
  styleUrl: './mainsection.component.scss'
})

export class MainsectionComponent implements AfterViewInit, OnDestroy {
  userService: UserService = inject(UserService);
  resizeListenerService: ResizeListenerService = inject(ResizeListenerService);
  threadService: ThreadService = inject(ThreadService);
  private hideThreadSubscription: Subscription = new Subscription;
  private changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
  rotateToggle: boolean = false;
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
    this.resizeListenerService.registerResizeCallback(this.onResize.bind(this));
    this.unsubProfile = this.userService.retrieveUserProfile();
    this.unsubUserChannels = this.userService.retrieveUserChannels();
    this.unsubUserList = this.userService.retrieveAllUsers();
    this.userService.userLoggedIn();
  }

  /**
   * Initializes the component and subscribes to the hideThread$ observable of the threadService.
   * When the observable emits a value, it calls the hideThread() method.
   * It also calls the onResize() method.
   */
  ngOnInit(): void {
    this.hideThreadSubscription = this.threadService.hideThread$.subscribe(() => {
      this.hideThread();
    })
    this.onResize();
  }

  /**
   * Executes a resize operation after a delay of 100 milliseconds.
   * Calls the `updateOverlayDisplay`, `displayHeadlineMobile`, and `sidesStatus` methods.
   */
  onResize() {
    setTimeout(() => {
      this.updateOverlayDisplay();
      this.displayHeadlineMobile();
      this.sidesStatus();
    }, 100);
  }

  /**
   * Initializes the component after the view has been initialized.
   * Adds the 'margin-right' class to the sidebar element to make it appear on the right side.
   * Checks the current screen size and the states of the sidenav and thread, and hides the sidenav and rotates the toggle element if necessary.
   */
  ngAfterViewInit() {
    this.hideThread();
    this.sidebarElement.nativeElement.classList.add('margin-right');
    if (this.resizeListenerService.mdScreen) {
      this.hideSidenav();
      this.hideThread();
      this.rotateToggle = true;
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
    }
    this.changeDetector.detectChanges();
  }

  /**
   * Checks the current screen size and the states of the sidenav and thread, and hides the sidenav and rotates the toggle element if necessary.
   */
  sidesStatus() {
    if (!this.resizeListenerService.lgScreen && this.sidenavOpen == true && this.threadOpen == true) {
      this.hideSidenav();
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
      this.rotateToggle = true;
    }
  }

  /**
   * Updates the display of the overlay element based on the current screen size and sidenav/thread states.
   */
  updateOverlayDisplay() {
    if (this.overlayElement && this.overlayElement.nativeElement) {
      if (this.resizeListenerService.mdScreen && this.sidenavOpen == true || this.resizeListenerService.mdScreen && this.threadOpen == true) {
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
    if (this.resizeListenerService.xmdScreen == true) {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
      this.hideSidenav();
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
      this.rotateToggle = true;
    } else {
      this.threadBarElement.nativeElement.classList.remove('hide-show');
    }
    if (this.resizeListenerService.mdScreen == true) {
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
    if (this.resizeListenerService.xmdScreen == true) {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
      this.hideThread();
    } else {
      this.sidebarElement.nativeElement.classList.remove('hide-show');
    }
    if (this.resizeListenerService.mdScreen == true) {
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

  /**
   * Toggles the display of the mobile headline and desktop headline based on screen size and sidenav state.
   */
  displayHeadlineMobile() {
    if (this.resizeListenerService.smScreen && this.sidenavOpen == false) {
      this.headerComponent.headlineMobile.nativeElement.style.display = 'flex';
      this.headerComponent.headlineDesktop.nativeElement.style.display = 'none';
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
      this.rotateToggle = true;
    } else {
      this.headerComponent.headlineMobile.nativeElement.style.display = 'none';
      this.headerComponent.headlineDesktop.nativeElement.style.display = 'flex';
    }
  }

  /**
   * Toggles between hiding the side navigation menu and showing the thread based on the state of 'rotateToggle'.
   */
  closeSides() {
    if (this.rotateToggle == false) {
      this.hideSidenav();
      this.rotateToggle = true;
      this.toggleElement.nativeElement.classList.add('rotate-toggle');
    } else {
      this.hideThread();
    }
  }

  /**
   * A function that handles the closing of the mobile view by executing various actions.
   */
  hanldeCloseMobile() {
    this.closeSides();
    this.hideSidenav();
    this.hideThread();
    this.displayHeadlineMobile();
  }

  /**
   * A function that returns the text 'schließen' if 'sidenavOpen' is true, otherwise returns 'öffnen'.
   * @return {string} The text 'schließen' or 'öffnen'
   */
  getToggleText(): string {
    return this.sidenavOpen ? 'schließen' : 'öffnen';
  }

  /**
   * Executes cleanup actions when the component is destroyed.
   */
  ngOnDestroy() {
    this.unsubProfile();
    this.unsubUserChannels();
    this.unsubUserList();
    this.userService.userLoggedOut();
    this.hideThreadSubscription.unsubscribe();
    this.resizeListenerService.unregisterResizeCallback(this.onResize.bind(this));
  }
}