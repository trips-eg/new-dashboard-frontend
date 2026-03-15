import { CommonModule,Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'sub-header',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss'
})
export class SubHeaderComponent {
  @Input() mainHeader='';
  @Input() subHeader='';
  @Input() mainSection='';
  @Input() subSection='';
  @Input() actionButtons: {
    label: string;
    action: string;
    icon?: string;              // Optional icon
    class?: string;             // Optional CSS class
    disabled?: boolean;
    hidden?: boolean;
  }[] = [];

  @Output() actionClicked = new EventEmitter<{ action: string }>();
  constructor(private location: Location) {}



  goBack(): void {
    this.location.back();
  }


  onButtonClick(action: string): void {
    this.actionClicked.emit({ action });
  }
}
