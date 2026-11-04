import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { filter, take } from 'rxjs/operators';
import { ConfigureService } from './theme/shared/services/configure.service';

/** Signed in but untouched for this long, the dashboard signs out (so an open tab doesn't keep old data and a session). */
const IDLE_SIGN_OUT_MS = 2 * 60 * 60 * 1000;
/** The last time anyone used the dashboard, shared by its tabs. */
const LAST_ACTIVITY_KEY = 'trips.lastActivity';
/** How often an open tab asks the server for a newer dashboard. */
const UPDATE_CHECK_MS = 15 * 60 * 1000;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private timers: ReturnType<typeof setInterval>[] = [];
  private updateReady = false;

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private swUpdate: SwUpdate,
    private toastr: ToastrService,
    private config: ConfigureService,
    private zone: NgZone
  ) {
    const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
    this.translate.use(currentLang);

    const activeLang = this.translate.currentLang;
    const dir = activeLang === 'ar' ? 'rtl' : 'ltr';

    this.document.documentElement.lang = activeLang;
    this.document.documentElement.dir = dir;
  }

  ngOnInit(): void {
    this.setupForcedUpdates();
    this.setupIdleSignOut();
  }

  ngOnDestroy(): void {
    this.timers.forEach((t) => clearInterval(t));
  }

  private get arabic(): boolean {
    return this.translate.currentLang === 'ar';
  }

  // ---------- A newer dashboard is applied without asking ----------

  /**
   * The service worker keeps the app's files, and on its own looks for a newer build only when a tab opens, so a tab
   * left open stayed on the old screens after a deploy. Now an open tab checks every 15 minutes and when it comes
   * back into view, and a new build is applied by itself: at once when the tab is in the background or on a list,
   * otherwise on the next page change, so a form being filled is never reloaded under the user.
   */
  private setupForcedUpdates(): void {
    if (!this.swUpdate.isEnabled) return;

    const check = () => this.swUpdate.checkForUpdate().catch(() => false);
    this.zone.runOutsideAngular(() => this.timers.push(setInterval(check, UPDATE_CHECK_MS)));
    this.document.addEventListener('visibilitychange', () => {
      if (this.document.visibilityState === 'visible') check();
    });

    this.swUpdate.versionUpdates.pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')).subscribe(() => {
      if (this.updateReady) return;
      this.updateReady = true;
      if (this.document.visibilityState === 'hidden' || !this.inForm()) {
        this.applyUpdate();
        return;
      }
      this.router.events.pipe(filter((e) => e instanceof NavigationEnd), take(1)).subscribe(() => this.applyUpdate());
    });

    // The cached app can no longer be served (files removed on the server): load it fresh
    this.swUpdate.unrecoverable.subscribe(() => this.document.location.reload());
  }

  /** The screens where a reload would lose what was typed. */
  private inForm(): boolean {
    return /\/(form|new|edit|wallet|instapay)\b|\/bookings\/new/i.test(this.router.url);
  }

  private applyUpdate(): void {
    this.toastr.info(this.arabic ? 'نسخة جديدة من الداشبورد، بتتحدّث دلوقتي…' : 'A new version of the dashboard, updating now…', '', { timeOut: 1500 });
    setTimeout(() => {
      this.swUpdate
        .activateUpdate()
        .catch(() => false)
        .then(() => this.document.location.reload());
    }, 1500);
  }

  // ---------- Sign out after two hours without activity ----------

  private setupIdleSignOut(): void {
    const mark = () => {
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      } catch {
        // storage refused (private mode): the check below then never signs out
      }
    };
    const lastActivity = (): number => {
      try {
        return Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
      } catch {
        return 0;
      }
    };
    const check = () => {
      if (!this.config.UserToken()) return;
      const last = lastActivity();
      if (!last) return mark();
      if (Date.now() - last < IDLE_SIGN_OUT_MS) return;
      this.zone.run(() => {
        this.config.Logout();
        this.toastr.info(
          this.arabic ? 'خرجنا من الحساب بعد ساعتين من غير استخدام. سجّل دخول تاني.' : 'Signed out after two hours without use. Please sign in again.',
          '',
          { timeOut: 8000 }
        );
      });
    };

    // A tab opened after a long break signs out before showing anything old
    check();

    this.zone.runOutsideAngular(() => {
      let marked = 0;
      const onActivity = () => {
        const now = Date.now();
        if (now - marked < 30_000) return;
        marked = now;
        // Activity after the two hours have passed doesn't revive the session
        if (this.config.UserToken() && lastActivity() && now - lastActivity() >= IDLE_SIGN_OUT_MS) return check();
        mark();
      };
      ['click', 'keydown', 'mousemove', 'touchstart', 'scroll', 'wheel'].forEach((ev) =>
        this.document.addEventListener(ev, onActivity, { passive: true, capture: true })
      );
      this.timers.push(setInterval(check, 60_000));
    });
    this.document.addEventListener('visibilitychange', () => {
      if (this.document.visibilityState === 'visible') check();
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    const currentUrl = this.router.url;

    // Prevent back to login if already authenticated
    if (currentUrl === '/default') {
      this.router.navigate(['/default'], { replaceUrl: true });
    }
  }
}
