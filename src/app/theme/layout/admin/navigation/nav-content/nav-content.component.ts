// Angular import
import { Component, EventEmitter, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { Subscription } from 'rxjs';

// project import
import { NavigationItem } from '../navigation';
import { environment } from 'src/environments/environment';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-nav-content',
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, OnDestroy {
  // public props
  @Output() NavCollapsedMob: EventEmitter<any> = new EventEmitter();

  // version
  currentApplicationVersion = environment.appVersion;

  navigation: any;
  windowWidth = window.innerWidth;
  private userStateSubscription: Subscription;
  private navigationSubscription: Subscription;

  // Constructor
  constructor(
    public nav: NavigationItem,
    private location: Location,
    private locationStrategy: LocationStrategy,
    private configService: ConfigureService,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to navigation changes
    this.navigationSubscription = this.nav.navigation$.subscribe((navigation) => {
      //console.log('NavContent: Navigation data updated:', navigation);
      this.navigation = navigation;
      // Use markForCheck instead of detectChanges to avoid change detection issues
      this.cdr.markForCheck();
    });

    // Subscribe to user state changes
    this.userStateSubscription = this.configService.userState$.subscribe(() => {
     // console.log('NavContent: User state changed, forcing navigation refresh');
      // Force navigation refresh when user state changes
      setTimeout(() => {
        this.forceRefreshNavigation();
      }, 100); // Small delay to ensure user data is updated
    });
  }

  // Life cycle events
  ngOnInit() {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      if (this.windowWidth < 1025) {
        const navbar = document.querySelector('.coded-navbar') as HTMLDivElement;
        if (navbar) {
          navbar.classList.add('menupos-static');
        }
      }
    }, 0);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.userStateSubscription) {
      this.userStateSubscription.unsubscribe();
    }
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  // Method to force refresh navigation
  forceRefreshNavigation() {
    //console.log('NavContent: Force refreshing navigation');
    this.nav.refreshNavigation();
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar').classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
