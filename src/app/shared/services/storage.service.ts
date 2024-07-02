import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storage: Storage = inject(Storage);
  userService: UserService = inject(UserService);
  selectedAvatar!: string;
  files!: FileList;
  filesTextarea!: FileList;
  fileName!: string | undefined;
  fileNameTextarea!: string | undefined;
  fileUrl!: any;
  fileUrlTextarea!: string | ArrayBuffer | null;

  constructor() { }

/**
 * The function `onFileSelected` checks if a selected file exceeds a certain size limit and sets the
 * file name and URL if it is valid.
 * @param {HTMLInputElement} input - The `onFileSelected` function takes an `HTMLInputElement` as input
 * parameter. This function is used to handle file selection events, such as when a user selects a file.
 * @returns If the file selected exceeds the size of 1024kb, the function will return a message
 * indicating that the file exceeds the size limit. If there are no files selected or the selected file
 * is not valid, the function will return without further action. If a valid file is selected, the
 * function will set the selected file to be used in the application.
 */
  onFileSelected(input: HTMLInputElement) {
    if (input.files?.item(0)?.size! > 1048576) {
      this.fileName = "This file exceeds the size of 1024kb !";
      return;
    }
    if (!input.files || (input.files && !this.isValid(input))) {
      return;
    }
    this.files = input.files;
    this.fileName = this.files.item(0)?.name;
    this.fileUrl = this.files.item(0);
  }

// only for elements from Textarea
onFileSelectedTextarea(input: HTMLInputElement) {
  if (input.files?.item(0)?.size! > 1048576) {
    this.fileNameTextarea = "This file exceeds the size of 1024kb !";
    return;
  }
  if (!input.files || (input.files && !this.isValid(input))) {
    return;
  }
  this.filesTextarea = input.files;
  this.fileNameTextarea = this.filesTextarea.item(0)?.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result !== undefined) {
      this.fileUrlTextarea = result;
    }
  };
  reader.readAsDataURL(this.filesTextarea.item(0)!);
}
  
isImage(files: FileList) {
  const fileType = files?.item(0)?.type.split('/')[0];
  return fileType === 'image';
  }
  
  abortUpload() {
  this.filesTextarea = null!;
  this.fileNameTextarea = undefined;
  this.fileUrlTextarea = null;
  }


/**
 * The function `isValid` checks if the file uploaded through an HTML input element is a valid image
 * file and logs the file size in bytes.
 * @param {HTMLInputElement} input - The `isValid` function takes an `HTMLInputElement` as input. This
 * input is expected to be a file input element where the user can select a file. The function then
 * checks if the selected file is a valid image file 
 * @returns The function `isValid` is returning a boolean value based on whether the file type of the
 * input element is 'jpeg', 'jpg', 'png', or 'gif'.
 */
  isValid(input: HTMLInputElement) {
    let dataType = input.files?.item(0)?.type
    dataType = dataType?.split('/').pop();
    console.log('your file size is', input.files?.item(0)?.size!, 'bytes');
    console.log(input.files);
    

    return (dataType === 'jpeg' || dataType === 'jpg' || dataType === 'png' || dataType === 'gif')
  }

  
/**
 * The `uploadFile` function asynchronously uploads files to a storage location and updates the user's
 * profile picture URL.
 * @param {string} uid - The `uid` parameter in the `uploadFile` function is a string representing the
 * user ID.
 * @returns If the `this.files` variable is `undefined`, the function will return early without
 * executing the file upload logic.
 */
  async uploadFile(uid:string) {
    if (this.files == undefined) return
    for (let i = 0; i < this.files.length; i++) {
      const file = this.files.item(i);
      if (file) {

        const storageRef = ref(this.storage, uid + '/' + 'profile');
        await uploadBytesResumable(storageRef, file);
        await getDownloadURL(storageRef).then((url) => {
          this.userService.createUserInfo.profilePicture = url;
        })
      }
    }
  }
}
