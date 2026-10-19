import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface DetailHeaderAction {
  label: string;
  action: string;
  icon?: string;
  disabled?: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-detail-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './detail-page-header.component.html',
  styleUrl: './detail-page-header.component.scss'
})
export class DetailPageHeaderComponent {
  @Input({ required: true }) typeLabel = '';
  @Input({ required: true }) parentLabel = '';
  @Input({ required: true }) parentLink = '';
  @Input() itemName: string | null = '';
  @Input() itemId: number | null = null;
  @Input() active: boolean | null = null;
  @Input() icon = 'pi pi-info-circle';
  @Input() rtl = false;
  @Input() loading = false;
  @Input() actions: readonly DetailHeaderAction[] = [];
  @Output() actionClicked = new EventEmitter<{ action: string }>();

  runAction(action: DetailHeaderAction): void {
    if (!this.loading && !action.disabled && !action.hidden) this.actionClicked.emit({ action: action.action });
  }
}
