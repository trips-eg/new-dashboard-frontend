// Angular import
import { Component, DestroyRef, HostListener, Renderer2, inject } from '@angular/core';
import { DOCUMENT, Location, LocationStrategy } from '@angular/common';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrimeNGConfig } from 'primeng/api';

// Project import
import { BerryConfig } from '../../../app-config';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly primeConfig = inject(PrimeNGConfig);
  // public props
  berryConfig;
  navCollapsed: boolean;
  navCollapsedMob = false;
  windowWidth: number;

  // Constructor
  constructor(
    private location: Location,
    private locationStrategy: LocationStrategy
  ) {
    this.berryConfig = BerryConfig;

    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    if (current_url === baseHref + '/layout/theme-compact' || current_url === baseHref + '/layout/box') {
      this.berryConfig.isCollapse_menu = true;
    }

    this.windowWidth = window.innerWidth;
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
    this.renderer.addClass(this.document.body, 'dashboard-layout');
    const originalZIndex = this.primeConfig.zIndex;
    this.primeConfig.zIndex = { modal: 4000, overlay: 5000, menu: 5000, tooltip: 6000 };
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if ((event instanceof NavigationEnd || event instanceof NavigationSkipped) && this.navCollapsedMob) this.closeMenu(false);
    });
    this.destroyRef.onDestroy(() => {
      this.renderer.removeClass(this.document.body, 'dashboard-layout');
      this.renderer.removeClass(this.document.body, 'dashboard-menu-open');
      this.primeConfig.zIndex = originalZIndex;
    });
  }

  // public method
  navMobClick() {
    if (this.navCollapsedMob) {
      this.closeMenu();
      return;
    }
    this.navCollapsedMob = true;
    this.navCollapsed = false;
    this.renderer.addClass(this.document.body, 'dashboard-menu-open');
    requestAnimationFrame(() => {
      if (this.navCollapsedMob) (this.document.querySelector('#dashboard-sidebar a[href]') as HTMLElement)?.focus();
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (['Escape', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.closeMenu();
    }
  }

  closeMenu(restoreFocus = true) {
    this.navCollapsedMob = false;
    this.renderer.removeClass(this.document.body, 'dashboard-menu-open');
    if (restoreFocus) {
      requestAnimationFrame(() => {
        if (!this.navCollapsedMob) (this.document.querySelector('.header-mobile-collapse .mobile-menu') as HTMLElement)?.focus();
      });
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.navCollapsedMob) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize() {
    const previousWidth = this.windowWidth;
    this.windowWidth = window.innerWidth;
    const crossedMobileBreakpoint = previousWidth <= 1024 !== this.windowWidth <= 1024;
    if (crossedMobileBreakpoint) this.closeMenu(false);
  }
}
