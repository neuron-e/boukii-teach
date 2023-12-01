import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as pica from 'pica';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  @Input() title: string = 'Téléverser un fichier';
  @Input() allowImage: boolean = true;
  @Input() allowVideo: boolean = true;
  
  filePreview: any;
  fileResult: any;
  isVideo: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<{ base64: string, isVideo: boolean }>();

  constructor() {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isVideo = file.type.startsWith('video');
      if (!this.isVideo) {
        // Process image file
        this.resizeAndPreviewImage(file);
      } else {
        // Process video file
        this.previewVideo(file);
      }
    }
  }

  async openCamera() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera // or CameraSource.Photos for gallery
      });

      this.isVideo = image.format === 'video';
      if (!this.isVideo) {
        // Handle image file
        const imageFile = await fetch(image.webPath!).then(r => r.blob());
        this.resizeAndPreviewImage(imageFile);
      } else {
        // Handle video file (if your logic supports it)
        this.filePreview = image.webPath;
        // Set fileResult for video
        this.fileResult = { base64: image.webPath, isVideo: true };
      }
    } catch (error) {
      console.error('Error accessing camera or gallery', error);
    }
  }

  resizeAndPreviewImage(file: Blob) {
    const MAX_SIZE = 600;
    this.resizeImage(file, MAX_SIZE).then(resizedBase64 => {
      this.filePreview = resizedBase64;
      this.fileResult = { base64: resizedBase64, isVideo: false };
    }).catch(error => {
      console.error('Error resizing image:', error);
    });
  }

  previewVideo(file: Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      this.filePreview = reader.result;
      this.fileResult = { base64: reader.result as string, isVideo: true };
    };
    reader.readAsDataURL(file);
  }

  saveFile() {
    if(this.fileResult){
      this.fileSelected.emit(this.fileResult);
      this.close.emit();
    }
  }

  doCloseModal() {
    this.close.emit();
  }

  get acceptTypes(): string {
    let types = '';
    if (this.allowImage) types += 'image/*';
    if (this.allowVideo) types += this.allowImage ? ',video/*' : 'video/*';
    return types;
  }

  resizeImage(file: Blob, maxSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const isPNG = file.type === 'image/png';
      const shouldConvertToJPEG = ['image/png', 'image/gif', 'image/avif', 'image/bmp', 'image/tiff', 'image/ico', 'image/heic'].includes(file.type);
      const outputMimeType = shouldConvertToJPEG ? 'image/jpeg' : file.type || 'image/jpeg';
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              const ratio = maxSize / width;
              width = maxSize;
              height = height * ratio;
            } else {
              const ratio = maxSize / height;
              height = maxSize;
              width = width * ratio;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          if (isPNG) {
            const ctx: any = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = width;
          offscreenCanvas.height = height;

          pica().resize(img, offscreenCanvas).then(result => {
            const ctx: any = canvas.getContext('2d');
            ctx.drawImage(offscreenCanvas, 0, 0, width, height);
            return pica().toBlob(canvas, outputMimeType, 0.60);
          }).then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }).catch(reject);
        };
      };
      reader.readAsDataURL(file as any); // Convert Blob to File for FileReader
    });
  }
}
