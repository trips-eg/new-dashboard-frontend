import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationItem } from '../../navigation';

@Component({
  selector: 'app-nav-collapse',
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss']
})
export class NavCollapseComponent implements OnInit {
  private static nextId = 0;
  @Input() item!: NavigationItem;
  readonly submenuId = 'nav-submenu-' + NavCollapseComponent.nextId++;
  expanded = false;
  active = false;
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.updateActiveSection();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateActiveSection());
  }
  navCollapse(): void {
    this.expanded = !this.expanded;
  }

  private updateActiveSection(): void {
    this.active = this.containsActiveRoute(this.item);
    if (this.active) this.expanded = true;
  }
  private containsActiveRoute(item: NavigationItem): boolean {
    return (
      !!(
        item.url &&
        !item.external &&
        this.router.isActive(item.url, {
          paths: 'subset',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored'
        })
      ) || !!item.children?.some((child) => this.containsActiveRoute(child))
    );
  }
}
