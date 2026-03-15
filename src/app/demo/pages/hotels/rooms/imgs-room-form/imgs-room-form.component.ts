import { Component, input, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from '../../../../../shared/img-uploader/img-uploader.component';
import { RoomService } from 'src/app/shared/services/room.service';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { co } from '@fullcalendar/core/internal-common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-imgs-room-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  templateUrl: './imgs-room-form.component.html',
  styleUrl: './imgs-room-form.component.scss'
})
export class ImgsRoomFormComponent implements OnInit {
  newImages: File[] = [];
  roomId: number = null;
  displayFilesForUploader: any[] = [];
  @ViewChild(ImgUploaderComponent) imgUploader!: ImgUploaderComponent;

  constructor(
    private _RoomService: RoomService,
    private ActivatedRoute: ActivatedRoute,
    private ToastrService: ToastrService,
    private router: Router
  ) {}
  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
  }
  getRoomImgsById(roomId) {
    this._RoomService.getAllRoomgetAllRoomImages({ roomId }).subscribe({
      next: (res) => {
        this.displayFilesForUploader = res.data.data;
      }
    });
  }
  onImageRemoved(index: number): void {
    this.displayFilesForUploader.splice(index, 1);
  }
  onSave() {
    if (this.newImages.length === 0 || !this.roomId) {
      return;
    }
    const formData = new FormData();
    this.newImages.forEach((file, idx) => {
      formData.append('imagesFiles', file);
    });
    formData.append('roomId', this.roomId.toString());

    this._RoomService.addRoomImage(formData).subscribe({
      next: (res) => {
        this.ToastrService.success('Images uploaded successfully');
        // Optionally, you can navigate to another page or reset the form
        this.router.navigate(['/hotel-rooms']);
      },
      error: (err) => {
        // handle error, e.g., show an error message
      }
    });
  }

  ngOnInit(): void {
    this.ActivatedRoute.params.subscribe((params) => {
      this.roomId = params['id'];
      console.log(this.roomId);
    });
    if (this.roomId) {
      this.getRoomImgsById(this.roomId);
    }
  }
  oncansel() {
    this.router.navigate(['/hotel-rooms']);
  }
}
