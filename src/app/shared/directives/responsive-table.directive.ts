import { AfterViewInit, Directive, ElementRef, NgZone, OnDestroy, Renderer2, RendererStyleFlags2, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';

/** Makes dense tables keyboard-scrollable without removing columns or changing paging. */
@Directive({ selector: 'p-table', standalone: true })
export class ResponsiveTableDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly table = inject(Table, { self: true });
  private readonly translate = inject(TranslateService);
  private observer?: ResizeObserver;
  private language?: Subscription;
  private wrapper?: HTMLElement;
  private hint?: HTMLElement;
  private frame = 0;
  private viewportWidth = 0;
  private originalAttributes = new Map<string, string | null>();

  ngAfterViewInit(): void {
    if (this.table.responsiveLayout === 'stack') return;
    this.wrapper = this.host.nativeElement.querySelector('.p-datatable-wrapper') || undefined;
    const content = this.host.nativeElement.querySelector('table');
    if (!this.wrapper || !content) return;
    this.renderer.addClass(this.host.nativeElement, 'dashboard-scroll-table');
    const columns = content.querySelector('thead tr')?.children.length || 5;
    this.renderer.setStyle(
      this.host.nativeElement,
      '--mobile-table-min-width',
      Math.min(1000, Math.max(360, columns * 120)) + 'px',
      RendererStyleFlags2.DashCase
    );
    for (const name of ['tabindex', 'role', 'aria-label']) this.originalAttributes.set(name, this.wrapper.getAttribute(name));
    this.hint = this.renderer.createElement('p');
    this.renderer.addClass(this.hint, 'dashboard-table-hint');
    this.renderer.setAttribute(this.hint, 'hidden', '');
    this.renderer.insertBefore(this.wrapper.parentNode, this.hint, this.wrapper);
    this.language = this.translate.onLangChange.subscribe(() => this.update());
    this.zone.runOutsideAngular(() => {
      this.observer = new ResizeObserver(() => {
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(() => this.update());
      });
      this.observer.observe(this.wrapper!);
      this.observer.observe(content);
      this.update();
    });
  }
  private update(): void {
    if (!this.wrapper || !this.hint) return;
    const width = this.wrapper.clientWidth;
    if (width > 0 && width !== this.viewportWidth) {
      this.viewportWidth = width;
      this.renderer.setStyle(this.host.nativeElement, '--table-viewport-width', width + 'px', RendererStyleFlags2.DashCase);
    }
    const overflow = this.wrapper.scrollWidth > this.wrapper.clientWidth + 1;
    this.renderer.setProperty(this.hint, 'textContent', this.translate.instant('RESPONSIVE.TABLE_HINT'));
    this.renderer.setProperty(this.hint, 'hidden', !overflow);
    const values: Record<string, string> = {
      tabindex: '0',
      role: 'region',
      'aria-label': this.translate.instant('RESPONSIVE.TABLE_REGION')
    };
    for (const [name, original] of this.originalAttributes) {
      if (original !== null) continue;
      if (overflow) this.renderer.setAttribute(this.wrapper, name, values[name]);
      else this.renderer.removeAttribute(this.wrapper, name);
    }
  }
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.language?.unsubscribe();
    cancelAnimationFrame(this.frame);
    if (this.hint?.parentNode) this.renderer.removeChild(this.hint.parentNode, this.hint);
  }
}
