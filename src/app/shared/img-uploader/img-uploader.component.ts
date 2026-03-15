import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-img-uploader',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './img-uploader.component.html',
  styleUrl: './img-uploader.component.scss'
})
export class ImgUploaderComponent implements AfterViewInit {
  @Input() multiple = true;
  @Input() maxFileSizeMB = 50;
  @Input() displayFiles: any[] = [];
  @Input() displayFile: any = '';
  @Output() filesChanged = new EventEmitter<File[]>();
  @Output() removeImgFromDB = new EventEmitter<number>();
  // @Output() removeImgFromDB = new EventEmitter<{ imgId: number; index: number }>();

  isDragging = false;
  files: File[] = [];
  previews: { file: string; imgId: number | null }[] = [];
  errorMessage: string | null = null;

  onChange: any = () => {};
  onTouched: any = () => {};
  environment = environment;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    if (!this.fileInput) {
      console.warn('fileInput ViewChild is not initialized');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    debugger;
    if (changes['displayFiles'] && changes['displayFiles'].currentValue) {
      this.generateOldImagesPreviews(changes['displayFiles'].currentValue);
    }
    if (changes['displayFile'] && changes['displayFile'].currentValue) {
      this.generateOldImagesPreviews(changes['displayFile'].currentValue);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      console.log(
        'Files selected:',
        Array.from(input.files).map((f) => f.name)
      );
      this.handleFiles(Array.from(input.files));
    } else {
      console.warn('No files selected in onFileSelect');
      this.errorMessage = 'No files selected';
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      console.log(
        'Files dropped:',
        Array.from(event.dataTransfer.files).map((f) => f.name)
      );
      this.handleFiles(Array.from(event.dataTransfer.files));
    } else {
      console.warn('No files dropped in onFileDrop');
      this.errorMessage = 'No files dropped';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  // removeFile(index: number) {
  //   console.log('Removing file at index:', index);
  //   this.files.splice(index, 1);
  //   this.previews.splice(index, 1);
  //   this.updateValue(this.files.length > 0 ? this.files : null);
  // }

  removeFileFromDB(index: number) {
    console.log('Removing DB image at index:', index);
    this.previews.splice(index, 1);
    this.removeImgFromDB.emit(index);
  }

  removeFileWithIdFromDB(index: number) {
    const imgId = this.previews[index]?.imgId ?? null;
    console.log('Removing DB image with id:', imgId, 'at index:', index);
    this.removeImgFromDBWithId.emit(imgId);
    this.previews.splice(index, 1);
  }
  @Output() removeImgFromDBWithId = new EventEmitter<number>();

 removeFile(index: number) {
  const preview = this.previews[index];
  const imgId = preview?.imgId;

  console.log('Removing image at index:', index, 'with id:', imgId);

  // شيل الصورة من UI
  this.previews.splice(index, 1);

  // لو مفيش أي صور خالص → فضي الـ files
  if (this.previews.length === 0 && this.files.length > 0) {
    this.files = [];
    this.updateValue(null); // عشان الـ form يعرف إن مفيش ملفات
  }

  // ابعت index و id مع بعض
  this.removeImgFromDB.emit(index);
  if (imgId !== null && imgId !== undefined) {
    this.removeImgFromDBWithId.emit(imgId);
  }
}


  // removeFileFromDB(index: number) {
  //   const imgId: number | null = this.previews[index]?.imgId ? Number(this.previews[index].imgId) : null;

  //   console.log('Removing DB image at index:', index, 'id:', imgId);

  //   this.removeImgFromDB.emit({ id: imgId, index }); // بعت الاتنين للأب
  // }

  // removeFileFromDB(index: number) {
  //   const imgId: number = Number(this.previews[index]?.imgId);
  //   if (imgId) {
  //     // بعت للأب imgId و index
  //     this.removeImgFromDB.emit({ imgId, index });
  //   }
  // }
  // // دى هنستخدمها من الأب بعد نجاح الحذف
  // public removePreviewAtIndex(index: number) {
  //   this.previews.splice(index, 1);
  // }
  get totalSizeMB(): number {
    return this.files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024;
  }

  get remainingSpaceMB(): number {
    return this.maxFileSizeMB - this.totalSizeMB;
  }

  private handleFiles(files: File[]) {
    this.errorMessage = null;
    const validFiles: File[] = [];

    const currentTotalMB = this.totalSizeMB;
    let remainingMB = this.maxFileSizeMB - currentTotalMB;

    if (remainingMB <= 0) {
      this.errorMessage = `Total size limit (${this.maxFileSizeMB}MB) reached`;
      console.warn(this.errorMessage);
      return;
    }

    for (const file of files) {
      const fileMB = file.size / 1024 / 1024;

      if (!file.type.startsWith('image/')) {
        this.errorMessage = `File '${file.name}' is not an image`;
        console.warn(this.errorMessage);
        continue;
      }

      if (fileMB > remainingMB) {
        this.errorMessage = `File '${file.name}' exceeds remaining space (${remainingMB.toFixed(1)}MB left)`;
        console.warn(this.errorMessage);
        continue;
      }

      if (fileMB > this.maxFileSizeMB) {
        this.errorMessage = `File '${file.name}' exceeds maximum file size (${this.maxFileSizeMB}MB)`;
        console.warn(this.errorMessage);
        continue;
      }

      validFiles.push(file);
      remainingMB -= fileMB;

      if (remainingMB <= 0) break;
    }

    if (validFiles.length > 0) {
      this.files = this.multiple ? [...this.files, ...validFiles] : [validFiles[0]];
      this.generatePreviews(validFiles);
      this.updateValue(this.files);
      console.log(
        'Updated files:',
        this.files.map((f) => f.name)
      );
    } else {
      console.warn('No valid files to process');
    }
  }

  // private generateOldImagesPreviews(files: any) {
  //   if (Array.isArray(files)) {
  //     this.previews = files.map(file => {
  //       if (typeof file === 'string') {
  //         // صورة من نوع string URL (زي من الـ API مباشرة)
  //         return { file, imgId: null };
  //       } else {
  //         // صورة من object فيه imagePath و imageId
  //         return {
  //           file: file.imagePath,
  //           imgId: file.imageId ?? null
  //         };
  //       }
  //     });
  //   } else if (typeof files === 'string') {
  //     // حالة واحدة لصورة واحدة في displayFile
  //     this.previews = [{ file: files, imgId: null }];
  //   }
  //   console.log('Generated old image previews:', this.previews);
  // }
  private generateOldImagesPreviews(files: any) {
    const toPreview = (file: any) => {
      // استعمل imageUrl من API
      const rawPath = file.imageUrl ?? file.url ?? file.imagePath ?? '';
      const finalUrl = rawPath.startsWith('http') ? rawPath : this.environment.imgUrl + rawPath.replace(/^\//, '');

      const imgId = file.id ?? file.imageId ?? null;
      return { file: finalUrl, imgId };
    };

    if (Array.isArray(files)) {
      this.previews = files.map((item) =>
        typeof item === 'string'
          ? { file: item.startsWith('http') ? item : this.environment.imgUrl + item.replace(/^\//, ''), imgId: null }
          : toPreview(item)
      );
    } else if (typeof files === 'string') {
      this.previews = [{ file: files.startsWith('http') ? files : this.environment.imgUrl + files.replace(/^\//, ''), imgId: null }];
    } else if (files && typeof files === 'object') {
      this.previews = [toPreview(files)];
    }

    console.log('Generated old image previews:', this.previews);
  }

  private generatePreviews(files: File[]) {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const preview = { file: e.target.result, imgId: null };
        if (!this.multiple) {
          this.previews = [preview];
        } else {
          this.previews.push(preview);
        }
        console.log('Generated preview for:', file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  private updateValue(value: File[] | null) {
    this.onChange(value);
    this.filesChanged.emit(value);
    console.log('Emitted filesChanged:', value ? value.map((f) => f.name) : null);
  }

  writeValue(files: File[]): void {
    if (files) {
      this.files = files;
      this.generatePreviews(files);
      console.log(
        'WriteValue set files:',
        files.map((f) => f.name)
      );
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  triggerFileInput() {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
      this.fileInput.nativeElement.click();
      console.log('Triggered file input');
    } else {
      console.warn('fileInput is not available');
    }
  }
}
