// Angular import
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-left',
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent {
  @Input() mobileMenuOpen = false;
  // public props
  @Output() NavCollapsedMob = new EventEmitter();
}
