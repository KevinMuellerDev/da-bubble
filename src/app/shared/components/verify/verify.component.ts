import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, MatDialogClose, ReactiveFormsModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent {
  authService: AuthService = inject(AuthService);
  keyForm: FormGroup;
  key!: string;

  constructor(private dialogRef: MatDialogRef<VerifyComponent>) {
    this.keyForm = new FormGroup({
      key: new FormControl(''),
    });
  }

  /**
   * The `submitKey` function asynchronously verifies a key input, sets a flag to indicate verification,
   * and closes a dialog window.
   */
  async submitKey() {
    await this.authService.verifyChange(this.keyForm.controls['key'].value);
    this.authService.verified = true;
    this.dialogRef.close()
  }
}
