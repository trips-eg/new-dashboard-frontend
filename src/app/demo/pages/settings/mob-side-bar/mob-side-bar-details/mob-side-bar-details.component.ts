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
    const company = this.getCompanyItem(item);
    if (company) return company.name || company.title;
    if (item.sideBarItemType === SideBarItemType.Company) return `Company #${this.getItemId(item)}`;
    return 'Unknown Item';
  }

  getItemId(item: SideBarItem): number | string {
    return (
      item.outing?.id ||
      item.hajj?.id ||
      item.trip?.id ||
      item.room?.id ||
      this.getCompanyItem(item)?.id ||
      (item as any).companyId ||
      item.id ||
      '-'
    );
  }

  getCompanyItem(item: SideBarItem): any {
    return item.company || item.companyDto || null;
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
      case SideBarItemType.Company:
        return 'bg-gray-100 text-gray-700';
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
      case SideBarItemType.Company:
        return 'pi pi-briefcase';
      default:
        return 'pi pi-tag';
    }
  }

  getItemImage(item: SideBarItem): string | null {
    const imageValue =
      this.extractImageValue(item.outing) ||
      this.extractImageValue(item.hajj) ||
      this.extractImageValue(item.trip) ||
      this.extractImageValue(item.room) ||
      this.extractImageValue(this.getCompanyItem(item));

    if (imageValue) {
      return this.toImageUrl(imageValue);
    }

    return null;
  }

  getCompanyContact(item: SideBarItem): string {
    const company = this.getCompanyItem(item);
    return company?.email || company?.phone || company?.phoneNumber || '';
  }

  getCompanyAddress(item: SideBarItem): string {
    return this.getCompanyItem(item)?.address || '';
  }

  getCompanyDocumentsCount(item: SideBarItem): number {
    const company = this.getCompanyItem(item);
    return (company?.licenceDocuments?.length || 0) + (company?.commercialDocuments?.length || 0);
  }

  getCompanyCommissions(item: SideBarItem): string[] {
    const company = this.getCompanyItem(item);
    if (!company) return [];

    const commissions: string[] = [];

    if (company.isHotelCommission) commissions.push(`Hotel ${company.hotelCommissionRate || 0}%`);
    if (company.isTravelCommission) commissions.push(`Travel ${company.travelCommissionRate || 0}%`);
    if (company.isHajjCommission) commissions.push(`Hajj ${company.hajjCommissionRate || 0}%`);
    if (company.isOutCommission) commissions.push(`Outing ${company.outCommissionRate || 0}%`);

    return commissions;
  }

  private extractImageValue(item: any): string | null {
    if (!item) return null;

    const image = item.images?.[0];
    return item.logoUrl || item.imageUrl || image?.imageUrl || (typeof image === 'string' ? image : null);
  }

  private toImageUrl(imageValue: string): string {
    if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
      return imageValue;
    }

    return `${this.baseImageUrl.replace(/\/$/, '')}/${imageValue.replace(/^\//, '')}`;
  }
}
