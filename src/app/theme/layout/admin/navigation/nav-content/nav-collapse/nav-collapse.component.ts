// Angular import
import { Component, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// project import
import { NavigationItem } from '../../navigation';
import { animate, style, transition, trigger } from '@angular/animations';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-nav-collapse',
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', display: 'block' }),
        animate('250ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(-100%)' }))])
    ])
  ]
})
export class NavCollapseComponent implements OnDestroy {
  // public props
  @Input() item!: NavigationItem;

  windowWidth = window.innerWidth;
  private userStateSubscription: Subscription;

  constructor(private configService: ConfigureService) {
    // Subscribe to user state changes
    this.userStateSubscription = this.configService.userState$.subscribe(() => {
      // Refresh any user-dependent data if needed
      this.refreshUserData();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userStateSubscription) {
      this.userStateSubscription.unsubscribe();
    }
  }

  // Method to refresh user data when user state changes
  refreshUserData() {
    // Add any user-dependent logic here if needed
  }

  // public method
  navCollapse(e: any) {
    // Check if the clicked element is the collapse trigger link itself
    const clickedElement = e.target;
    const isCollapseLink =
      clickedElement.classList.contains('nav-link') && clickedElement.closest('.coded-hasmenu') === clickedElement.parentElement;

    // If this is not a collapse trigger link click, don't handle collapse logic
    if (!isCollapseLink) {
      return;
    }

    let parent = e.target;
    parent = parent.parentElement;

    // Only close other sections if we're actually toggling this specific collapse
    const sections = document.querySelectorAll('.coded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] !== parent) {
        sections[i].classList.remove('coded-trigger');
      }
    }

    let first_parent = parent.parentElement;
    let pre_parent = parent.parentElement.parentElement;
    if (first_parent.classList.contains('coded-hasmenu')) {
      do {
        first_parent.classList.add('coded-trigger');
        first_parent = first_parent.parentElement.parentElement.parentElement;
      } while (first_parent.classList.contains('coded-hasmenu'));
    } else if (pre_parent.classList.contains('coded-submenu')) {
      do {
        pre_parent.parentElement.classList.add('coded-trigger');
        pre_parent = pre_parent.parentElement.parentElement.parentElement;
      } while (pre_parent.classList.contains('coded-submenu'));
    }
    parent.classList.toggle('coded-trigger');
  }
}
