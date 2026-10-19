// Angular import
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {
  // public props
  @Input() navCollapsed: boolean;
  @Output() NavCollapse = new EventEmitter();

  // public import
  navCollapse() {
    if (window.innerWidth >= 1025) {
      this.NavCollapse.emit();
    }
  }
}
