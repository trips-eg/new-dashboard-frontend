import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../Modules/primeng/primeng.module';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'search-field',
  standalone: true,
  imports: [PrimengModule, SharedModule],
  templateUrl: './search-field.component.html',
  styleUrl: './search-field.component.scss'
})
export class SearchFieldComponent implements OnInit {
  navigationItems = [];
  filteredItems = [];
  searchQuery: string = '';
  constructor(
    private router: Router,
    private navService: NavigationItem,
    private translate: TranslateService
  ) {}
  ngOnInit(): void {
    // Add a small delay to ensure navigation is ready
    setTimeout(() => {
      this.navigationItems = this.navService.get();
      this.filteredItems = this.navigationItems;
      // Translate titles during initialization
    }, 0);
  }

  onSearch(query: string): void {
    this.searchQuery = query;

    if (query) {
      this.filteredItems = this.filterItems(this.navigationItems, query.toLowerCase());
    } else {
      this.filteredItems = this.navigationItems;
    }
  }

  // Recursive function to filter items, including children
  filterItems(items: any[], query: string): any[] {
    let filtered = [];

    items.forEach((item) => {
      const match = item.title.toLowerCase().includes(query);
      if (match) {
        filtered.push(item);
      }

      // If the item has children, filter them
      if (item.children) {
        // Filter children recursively
        const filteredChildren = this.filterItems(item.children, query);

        // If any child matches, add them to the list
        if (filteredChildren.length > 0) {
          // Add the parent only once, even if it has matching children
          filtered.push(item);
          // Add the matching children to the list
          filtered.push(...filteredChildren);
        }
      }
    });

    return filtered;
  }

  onNavigate(url: string): void {
    this.router.navigate([url]);
  }
}
