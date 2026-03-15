// Angular import
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Project import
import { NavigationItem } from '../../navigation';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { Role } from 'src/app/shared/Enums/roles';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit, OnDestroy {
  @Input() item!: NavigationItem;
  userId: string;
  isVisible: boolean = true; // Controls whether the item is shown
  private userStateSubscription: Subscription;

  constructor(private configService: ConfigureService) {
    this.userId = this.configService.UserId();

    // Subscribe to user state changes
    this.userStateSubscription = this.configService.userState$.subscribe(() => {
      //console.log('NavItem: User state changed, refreshing visibility for item:', this.item?.id);
      this.refreshUserData();
    });
  }

  ngOnInit() {
    // Add a small delay to ensure the component is fully initialized
    setTimeout(() => {
      this.refreshUserData();
    }, 0);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.userStateSubscription) {
      this.userStateSubscription.unsubscribe();
    }
  }

  // Method to refresh user data when user state changes
  refreshUserData() {
    this.userId = this.configService.UserId();
    this.checkItemVisibility();
  }

  // Method to check if the item should be visible based on current user roles
  // Method to check if the item should be visible based on current user permissions
checkItemVisibility() {
  const userPermissions = this.configService.userPermissions(); 
  const user = this.configService.User();

  // تأمين على اليوزر والبيرميشنز والآيتيم نفسه
  if (!user || !userPermissions || userPermissions.length === 0 || !this.item) {
    this.isVisible = false;
    return;
  }

  // لو الـ item مش محتاج صلاحيات معينة يبقى ظاهر
  if (!this.item.permissions || this.item.permissions.length === 0) {
    this.isVisible = true;
    return;
  }

  // لو عنده أي permission من اللي محتاجها الـ item يبقى ظاهر
  this.isVisible = this.item.permissions.some((perm: string) =>
    userPermissions.includes(perm)
  );
}



 

  // public method
  closeOtherMenu(event: any) {
    const ele = event.target;
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;

      // Remove 'active' class from all sections but preserve 'coded-trigger' for parent collapses
      const sections = document.querySelectorAll('.coded-hasmenu');
      for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
        // Don't remove 'coded-trigger' here - let the collapse component handle that
      }

      // Add active class to the appropriate parent without affecting collapse state
      if (parent.classList.contains('coded-hasmenu')) {
        parent.classList.add('active');
      } else if (up_parent.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('active');
      }
    }
    if ((document.querySelector('app-navigation.coded-navbar') as HTMLDivElement).classList.contains('mob-open')) {
      (document.querySelector('app-navigation.coded-navbar') as HTMLDivElement).classList.remove('mob-open');
    }
  }
}
