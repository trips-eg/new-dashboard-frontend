// Angular import
import { Component, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-nav-left',
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnDestroy {
  @Input() mobileMenuOpen = false;
  // public props
  @Output() NavCollapsedMob = new EventEmitter();

  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private readonly sub: Subscription;

  /**
   * A back button in the header for every screen but Home. The TRIPS Staff screens draw their own (ts-appbar), so the
   * header one hides there instead of showing two; screens load lazily, so it looks again shortly after each navigation.
   */
  showBack = false;

  constructor() {
    this.sub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.check());
    this.check();
  }

  private check(): void {
    this.timers.splice(0).forEach(clearTimeout);
    for (const ms of [0, 300, 1200]) this.timers.push(setTimeout(() => this.update(), ms));
  }

  private update(): void {
    const path = this.router.url.split('?')[0];
    const home = path === '/' || path === '/default' || path === '/login';
    this.showBack = !home && !document.querySelector('.ts-appbar__back');
  }

  goBack(): void {
    // Opened from a link (no history in the app): go Home instead of leaving the dashboard
    if (window.history.length > 1) this.location.back();
    else this.router.navigateByUrl('/default');
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.timers.forEach(clearTimeout);
  }
}
