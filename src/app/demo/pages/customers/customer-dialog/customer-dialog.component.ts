import { Component, Input } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
export interface user {
  deviceToken: string
  imageUrl: string
  iActive: boolean
  id: number
  name: string
  email: string
  userName: string
  phoneNumber: string
  nationality: any
}

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.scss'
})
export class CustomerDialogComponent {
  data: user;
  baseImgUrl = environment.imgUrl;
 constructor(public config: DynamicDialogConfig) {}


  ngOnInit() {
    this.data = this.config.data; 

  }

  getAvatar(url?: string): string {
    const fallback = `${this.baseImgUrl}/Default/avatar.png`;

    if (!url || url === 'NULL') return fallback;

    if (url.startsWith('http')) return url;

    return `${this.baseImgUrl}${url}`;
  }









}
