import { Component, OnInit } from '@angular/core';
import { ImageUploadService } from '../services/image-upload.service';
import { HotToastService } from '@ngneat/hot-toast';
import { concatMap } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { UsersService } from 'src/app/services/users.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserProfile } from 'src/models/user-profile';
import { MatDialogRef } from '@angular/material/dialog';


@UntilDestroy()
@Component({
  selector: 'app-dialog-edit-user',
  templateUrl: './dialog-edit-user.component.html',
  styleUrls: ['./dialog-edit-user.component.scss'],
})
export class DialogEditUserComponent implements OnInit {
  user$ = this.usersService.currentUserProfile$;

  profileForm = new FormGroup({
    uid: new FormControl(''),
    displayName: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
  });

  constructor(
    private imageUploadService: ImageUploadService,
    private toast: HotToastService,
    private usersService: UsersService,
    public dialogRef: MatDialogRef<DialogEditUserComponent>
  ) {}

  ngOnInit(): void {
    this.usersService.currentUserProfile$
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.profileForm.patchValue({ ...user });
      });
  }

  uploadImage(event, { uid }: UserProfile) {
    this.imageUploadService
      .uploadImage(event.target.files[0], `images/profile/${uid}`)
      .pipe(
        this.toast.observe({
          loading: 'Uploading profile image...',
          success: 'Image uploaded successfully',
          error: 'There was an error in uploading the image',
        }),
        concatMap((photoURL) =>
          this.usersService.updateUser({
            uid,
            photoURL,
          })
        )
      )
      .subscribe();
  }

  saveProfile() {
    const { uid, ...data } = this.profileForm.value;
    this.dialogRef.close();
    if (!uid) {
      return;
    }

    this.usersService
      .updateUser({ uid, ...data })
      .pipe(
        this.toast.observe({
          loading: 'Saving profile data...',
          success: 'Profile updated successfully',
          error: 'There was an error in updating the profile',
        })
      )
      .subscribe();
  }
}
