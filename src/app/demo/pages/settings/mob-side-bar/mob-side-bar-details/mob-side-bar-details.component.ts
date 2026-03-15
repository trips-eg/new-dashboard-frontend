import { Component, OnInit } from '@angular/core';
import { ISideBar, SideBarItem } from 'src/app/shared/model/iside-bar';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MobSideBarService, SideBarItemType } from 'src/app/shared/services/mob-side-bar.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mob-side-bar-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './mob-side-bar-details.component.html',
  styleUrl: './mob-side-bar-details.component.scss'
})
export class MobSideBarDetailsComponent implements OnInit {
  sideBarItemDetails: ISideBar | null = null;
  loading = false;
  SideBarItemType = SideBarItemType;
  baseImageUrl = environment.imgUrl;

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private mobSideBarService: MobSideBarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.getSideBarDetails(+params['id']);
      }
    });
  }

  getSideBarDetails(id: number) {
    this.loading = true;
    this.mobSideBarService.getMobileSideBarById(id).subscribe({
      next: (res) => {
        this.sideBarItemDetails = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching details', err);
        this.loading = false;
      }
    });
  }

  getItemName(item: SideBarItem): string {
    if (item.outing) return item.outing.name;
    if (item.hajj) return item.hajj.name;
    if (item.trip) return item.trip.name || item.trip.title;
    if (item.room) return item.room.name;
    return 'Unknown Item';
  }

  getItemTypeClass(type: number): string {
    switch (type) {
      case SideBarItemType.Room:
        return 'bg-blue-100 text-blue-700';
      case SideBarItemType.Outing:
        return 'bg-green-100 text-green-700';
      case SideBarItemType.Hajj:
        return 'bg-purple-100 text-purple-700';
      case SideBarItemType.Trip:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getItemTypeIcon(type: number): string {
    switch (type) {
      case SideBarItemType.Room:
        return 'pi pi-home';
      case SideBarItemType.Outing:
        return 'pi pi-compass';
      case SideBarItemType.Hajj:
        return 'pi pi-building';
      case SideBarItemType.Trip:
        return 'pi pi-globe';
      default:
        return 'pi pi-tag';
    }
  }

  getItemImage(item: SideBarItem): string | null {
    if (item.outing?.images?.[0]) return this.baseImageUrl + item.outing.images[0].imageUrl || item.outing.images[0];
    if (item.hajj?.images?.[0]) return this.baseImageUrl + item.hajj.images[0].imageUrl || item.hajj.images[0];
    if (item.trip?.images?.[0]) return this.baseImageUrl + item.trip.images[0].imageUrl || item.trip.images[0];
    if (item.room?.images?.[0]) return this.baseImageUrl + item.room.images[0].imageUrl || item.room.images[0];
    return null;
  }
}
