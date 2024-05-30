import { Component } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { UserMenuDialogComponent } from './user-menu-dialog/user-menu-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(public dialog: MatDialog){}

  openDialog() {
    this.dialog.open(UserMenuDialogComponent,{position: {top: '120px', right: '25px'}})
    .afterClosed()
    .subscribe();
  }
}
