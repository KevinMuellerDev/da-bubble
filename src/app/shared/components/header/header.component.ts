import { Component, inject, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,MatMenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements AfterViewInit, OnInit {
  userService: UserService = inject(UserService);
  sidebarService:SidebarService = inject(SidebarService);
  userList:any[]=[];
  @ViewChild('headlineMobile', { static: true, read: ElementRef }) headlineMobile!: ElementRef;
  @ViewChild('headlineDesktop', { static: true, read: ElementRef }) headlineDesktop!: ElementRef;

  constructor(public dialog: MatDialog, private mainsectionComponent: MainsectionComponent) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

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

  goBack() {
    this.mainsectionComponent.showSidenav();
    this.headlineDesktop.nativeElement.style.display = 'block';
    this.headlineMobile.nativeElement.style.display = 'none';
  }
}
