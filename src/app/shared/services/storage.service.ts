import { Injectable, OnInit, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { UserService } from './user.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements OnInit {
  private readonly storage: Storage = inject(Storage);
  sanitizer: DomSanitizer = inject(DomSanitizer);
  userService: UserService = inject(UserService);
  selectedAvatar!: string;
  files!: FileList;
  filesTextarea!: FileList;
  filesTextareaThread!: FileList;
  fileName!: string | undefined;
  fileNameTextarea!: string | undefined;
  fileNameTextareaThread!: string | undefined;
  fileUrl!: any;
  fileUrlTextarea!: SafeResourceUrl | string | ArrayBuffer | null;
  fileUrlTextareaThread!: SafeResourceUrl | string | ArrayBuffer | null;
  pdfUrl!: SafeResourceUrl | null;
  pdfUrlThread!: SafeResourceUrl | null;
  downloadUrl!: string;
  downloadUrlThread!: string;
  uploadedFileType!: string;
  uploadedFileTypeThread!: string;
  fileSizeToBig: boolean = false;
  wrongFileType: boolean = false;
  fileSizeToBigThread: boolean = false;
  avatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile2.svg?alt=media&token=fdc78ec8-f201-4138-8447-d49c957ba67a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile1.svg?alt=media&token=e8652777-3f75-4517-9789-e3b24ef87820',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile6.svg?alt=media&token=f7827bc5-1cd3-499d-be4e-2e748a170699',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile4.svg?alt=media&token=104a104e-712c-4d89-99c8-5c6d6eeb381b',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile5.svg?alt=media&token=25935b79-8ce7-4f23-9d2e-a82b95adfbc3',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-e6d79.appspot.com/o/template%2Fprofile3.svg?alt=media&token=7bd92926-13d9-476b-8c39-fde34aa7044e'
  ];

  constructor() { }

  /**
   * Initializes the component and assigns the list of avatars by calling the 'getAvatars' function.
   */
  ngOnInit() {
    this.avatars = this.getAvatars();
  }

  /**
   * Retrieves the list of avatars.
   * @return {string[]} The array of avatar paths.
   */
  getAvatars(): string[] {
    return this.avatars;
  }

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
      return;
    }
    if (!input.files || (input.files && !this.isValid(input))) {
      return;
    }
    this.files = input.files;
    this.fileName = this.files.item(0)?.name;
    this.fileUrl = this.files.item(0);
  }

  /**
   * The function `onFileSelectedTextarea` handles file selection in a textarea input, checks file size
   * and type, and calls appropriate handling functions based on the file type.
   * @param {HTMLInputElement} input - The `onFileSelectedTextarea` function takes an HTMLInputElement as
   * input. This function is responsible for handling file selection in a textarea element.
   * @returns The function `onFileSelectedTextarea` returns either nothing (undefined) or early exits
   * with a `return` statement if certain conditions are met.
   */
  onFileSelectedTextarea(input: HTMLInputElement) {
    const file = input.files?.item(0);
    if (!file || !this.isValid(input)) {
      return;
    }
    if (file.size > 1048576) {
      this.fileSizeToBig = true;
      return;
    }
    if (input.files) {
      this.filesTextarea = input.files;
      this.fileSizeToBig = false;
    }
    this.fileNameTextarea = file.name;
    if (this.isPdf(file)) {
      this.handlePdfFile(file);
    } else {
      this.handleImageFile(file);
    }
  }

  /**
   * The function `onFileSelectedTextareaForThread` handles file selection for a textarea input, checking
   * file size and type before processing the file accordingly.
   * @param {HTMLInputElement} input -  This function is responsible for handling file selection in a
   * textarea for a thread.
   * @returns If the file is not valid or if the file size is too big (greater than 1MB), the function
   * will return early without setting any properties or handling the file further. If the file is valid
   * and within size limits, it will set the `filesTextareaThread` property to the selected file, reset
   * the `fileSizeToBigThread` flag, set the `fileNameTextareaThread` property
   */
  onFileSelectedTextareaForThread(input: HTMLInputElement) {
    const file = input.files?.item(0);
    if (!file || !this.isValid(input)) {
      return;
    }
    if (file.size > 1048576) {
      this.fileSizeToBigThread = true;
      return;
    }
    if (input.files) {
      this.filesTextareaThread = input.files;
      this.fileSizeToBigThread = false;
    }
    this.fileNameTextareaThread = file.name;
    if (this.isPdf(file)) {
      this.handlePdfFileForThread(file);
    } else {
      this.handleImageFileForThread(file);
    }
  }

  /**
   * The function `handlePdfFileForThread` sets the PDF URL for a given file and updates the file URL for
   * a textarea.
   * @param {File} file - The `file` parameter in the `handlePdfFileForThread` function is of type
   * `File`, which represents a file from the user's system. In this context, it is likely a PDF file
   * that is being processed within the function.
   */
  private handlePdfFileForThread(file: File) {
    this.pdfUrlThread = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    this.fileUrlTextareaThread = 'assets/img/pdfDefault.jpg';
  }

  /**
   * The function `handleImageFileForThread` reads an image file and sets the result as a data URL in a
   * textarea.
   * @param {File} file - The `file` parameter in the `handleImageFileForThread` function is of type
   * `File`, which represents a file from the user's system. In this case, it is being used to read the
   * contents of an image file and convert it to a data URL using a `FileReader`.
   */
  private handleImageFileForThread(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result !== undefined) {
        this.fileUrlTextareaThread = result;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * This function uploads a file to storage and retrieves the download URL for a specific thread based
   * on the original message ID.
   * @param {string} originalMessageId - The `originalMessageId` parameter is a string that represents
   * the unique identifier of the message thread to which the file will be uploaded.
   * @returns If `this.wrongFileType` or `this.fileSizeToBigThread` is true, nothing will be returned.
   * Otherwise, the function will upload a file to a storage location and retrieve the download URL for
   * that file.
   */
  async uploadFileAndGetUrlForThread(originalMessageId: string) {
    if (this.wrongFileType || this.fileSizeToBigThread) {
      return;
    }
    const file = this.filesTextareaThread.item(0) as File;
    this.uploadedFileTypeThread = file.type;
    const storageRef = ref(this.storage, `${originalMessageId}/${file.name}`);
    await uploadBytesResumable(storageRef, file);
    await getDownloadURL(storageRef).then((url) => {
      this.downloadUrlThread = url;
    });
  }

  /**
   * The function `handlePdfFile` sets the PDF URL and a default image URL for a given file.
   * @param {File} file - The `file` parameter in the `handlePdfFile` function is of type `File`, which
   * represents a file from the user's system. In this context, it is used to handle a PDF file that is
   * passed to the function for processing.
   */
  private handlePdfFile(file: File) {
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
    this.fileUrlTextarea = 'assets/img/pdfDefault.jpg';
  }

  /**
   * The function `handleImageFile` reads an image file using FileReader and sets the result as the value
   * of `fileUrlTextarea`.
   * @param {File} file - The `file` parameter in the `handleImageFile` function is of type `File`, which
   * represents a file from the user's system that is being processed.
   */
  private handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result !== undefined) {
        this.fileUrlTextarea = result;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * The function `isImage` checks if a given file is an image based on its type.
   * @param {File | null | undefined} file - The `file` parameter in the `isImage` function is of type
   * `File` or `null` or `undefined`.
   * @returns A boolean value is being returned, indicating whether the file is an image or not.
   */
  isImage(file: File | null | undefined): boolean {
    if (!file) return false;
    const fileType = file.type.split('/')[0];
    return fileType === 'image';
  }

  /**
   * The function `isPdf` checks if a given file is a PDF file based on its type.
   * @param {File | null | undefined} file - The `file` parameter in the `isPdf` function is of type
   * `File` or may be `null` or `undefined`.
   * @returns The function `isPdf` returns a boolean value indicating whether the file is a PDF file or
   * not.
   */
  isPdf(file: File | null | undefined): boolean {
    if (!file) return false;
    const fileType = file.type;
    return fileType === 'application/pdf';
  }

  /**
   * The function `abortUploadForThread` clears the `fileNameTextareaThread` and `fileUrlTextareaThread`
   * variables.
   */
  abortUploadForThread() {
    this.fileNameTextareaThread = '';
    this.fileUrlTextareaThread = '';
  }

  /**
   * The `abortUpload` function clears the `fileNameTextarea` and `fileUrlTextarea` values.
   */
  abortUpload() {
    this.fileNameTextarea = '';
    this.fileUrlTextarea = '';
  }

  /**
   * The function `uploadFileAndGetUrl` uploads a file to a specified storage location and retrieves the
   * download URL.
   * @param {string} channelId - The `channelId` parameter in the `uploadFileAndGetUrl` function is a
   * string that represents the unique identifier of the channel where the file will be uploaded.
   * @returns If `this.wrongFileType` or `this.fileSizeToBig` is true, nothing will be returned as the
   * function will exit early. If neither of those conditions are met, the function will upload a file to
   * a storage location and retrieve the download URL for that file.
   */
  async uploadFileAndGetUrl(channelId: string) {
    if (this.wrongFileType || this.fileSizeToBig) {
      return;
    }
    const file = this.filesTextarea.item(0) as File;
    this.uploadedFileType = file.type;
    const storageRef = ref(this.storage, `${channelId}/${file.name}`);
    await uploadBytesResumable(storageRef, file);
    await getDownloadURL(storageRef).then((url) => {
      this.downloadUrl = url
    });
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
    if (dataType !== "jpeg" && dataType !== "jpg" && dataType !== "pdf") {
      this.wrongFileType = true;
      return
    } else {
      this.wrongFileType = false;
      return (dataType === 'jpeg' || dataType === 'jpg' || dataType === 'pdf')
    }
  }

  /**
   * The `uploadFile` function asynchronously uploads files to a storage location and updates the user's
   * profile picture URL.
   * @param {string} uid - The `uid` parameter in the `uploadFile` function is a string representing the
   * user ID.
   * @returns If the `this.files` variable is `undefined`, the function will return early without
   * executing the file upload logic.
   */
  async uploadFile(uid: string) {
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
