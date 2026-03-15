import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MobSideBarService, MobSideBarItem, SideBarItemType } from 'src/app/shared/services/mob-side-bar.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterMap, FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';

interface SectorState {
  items: any[];
  totalRecords: number;
  loading: boolean;
  filter: FilterMap;
}

@Component({
  selector: 'app-mob-side-bar-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ReactiveFormsModule],
  templateUrl: './mob-side-bar-form.component.html',
  styleUrl: './mob-side-bar-form.component.scss'
})
export class MobSideBarFormComponent implements OnInit {
  isEditMode = false;
  sideBarForm: FormGroup;
  sideBarId: number;

  // Enums for Template
  SideBarItemType = SideBarItemType;

  // State Management for each Sector
  sectorStates: { [key: number]: SectorState } = {
    [SideBarItemType.Room]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Outing]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Hajj]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Trip]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } }
  };

  selectedItems: MobSideBarItem[] = [];
  selectedType: SideBarItemType = SideBarItemType.Room; // Default to match first tab
  saving = false;

  constructor(
    private fb: FormBuilder,
    private mobSideBarService: MobSideBarService,
    private outingService: OutingService,
    private hajjService: HajjUmmrahService,
    private tripService: TravelTripsService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.sideBarId = +params['id'];
        this.loadSideBarData();
      }
    });
    // Load initial available items for the default tab (Room)
    this.loadAvailableItems(SideBarItemType.Room);
  }

  initializeForm() {
    this.sideBarForm = this.fb.group({
      title: ['', Validators.required],
      color: ['#e3cccd', Validators.required],
      squence: [0, Validators.required],
      isActive: [true]
    });
  }

  loadSideBarData() {
    this.mobSideBarService.getMobileSideBarById(this.sideBarId).subscribe((res) => {
      const data = res.data || [];
      if (data) {
        this.sideBarForm.patchValue({
          title: data.title,
          color: data.color,
          squence: data.squence,
          isActive: data.isActive
        });
        // Map selected items and populate _displayItem from nested objects
        this.selectedItems = (data.sideBarItems || []).map((item: any) => {
          const displayItem = item.outing || item.room || item.trip || item.hajj || null;
          if (displayItem) {
            item._displayItem = displayItem;
          }
          return item;
        });
        this.removedItems = []; // Reset removed items on load
      }
    });
  }

  onTabChange(event: any) {
    let newType: SideBarItemType;
    switch (event.index) {
      case 0:
        newType = SideBarItemType.Room;
        break;
      case 1:
        newType = SideBarItemType.Outing;
        break;
      case 2:
        newType = SideBarItemType.Hajj;
        break;
      case 3:
        newType = SideBarItemType.Trip;
        break;
      default:
        newType = SideBarItemType.Room;
    }

    this.selectedType = newType;
    // Load data if empty (or always refresh if preferred? Let's load if empty to act as cache)
    if (this.sectorStates[newType].items.length === 0) {
      this.loadAvailableItems(newType);
    }
  }

  onSearch(event: any, type: SideBarItemType) {
    this.sectorStates[type].filter.Search = event.target.value;
    this.sectorStates[type].filter.pageIndex = 1;
    this.loadAvailableItems(type);
  }

  onPageChange(event: any, type: SideBarItemType) {
    this.sectorStates[type].filter.pageIndex = event.page + 1;
    this.loadAvailableItems(type);
  }

  loadAvailableItems(type: SideBarItemType) {
    const state = this.sectorStates[type];
    state.loading = true;

    const onSuccess = (res: any) => {
      state.items = res.data?.data || res.data || res.items || [];
      // Updated to include multiple checks for total count, prioritizing itemsCount as requested
      state.totalRecords = res.data?.itemsCount || res.itemsCount || res.data?.totalCount || res.totalCount || res.count || 0;
      state.loading = false;
      this.cdr.detectChanges();
    };

    const onError = () => {
      state.loading = false;
      this.cdr.detectChanges();
    };

    switch (type) {
      case SideBarItemType.Outing:
        this.outingService.getAllOutings(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Hajj:
        this.hajjService.getAllManasik(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Trip:
        const tripFilter: FilterTravelMap = { ...state.filter };
        this.tripService.getAllTravels(tripFilter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Room:
        this.roomService.getAllRooms(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
    }
  }

  getVendorName(item: any): string {
    return item.vendor?.name || item.companyDto?.name || '';
  }

  getItemPrice(item: any): string {
    // Direct price field (Room, Trip)
    const price = item.price ?? item.priceBefore ?? null;
    if (price !== null && price !== undefined && price > 0) {
      return price.toLocaleString();
    }
    // Outing tickets — show the lowest ticket price
    if (item.tickets?.length > 0) {
      const prices = item.tickets.filter((t: any) => t.price > 0).map((t: any) => t.price);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        return 'From ' + min.toLocaleString();
      }
    }
    return 'N/A';
  }

  addItem(item: any) {
    // Check if checks already exists
    const exists = this.selectedItems.some(
      (existing) =>
        (existing.outingId === item.id && this.selectedType === SideBarItemType.Outing) ||
        (existing.hajjId === item.id && this.selectedType === SideBarItemType.Hajj) ||
        (existing.tripId === item.id && this.selectedType === SideBarItemType.Trip) ||
        (existing.roomId === item.id && this.selectedType === SideBarItemType.Room)
    );

    if (exists) {
      this.toaster.warning('Item already added', 'Warning');
      return;
    }

    const newItem: MobSideBarItem = {
      squence: this.selectedItems.length + 1,
      sideBarItemType: this.selectedType,
      outingId: this.selectedType === SideBarItemType.Outing ? item.id : 0,
      hajjId: this.selectedType === SideBarItemType.Hajj ? item.id : 0,
      tripId: this.selectedType === SideBarItemType.Trip ? item.id : 0,
      roomId: this.selectedType === SideBarItemType.Room ? item.id : 0
    };

    // Store a reference to the original item for display purposes (name, etc)
    // We'll attach it as a dynamic property _displayItem
    (newItem as any)._displayItem = item;

    this.selectedItems.push(newItem);
  }

  removedItems: number[] = [];

  removeItem(index: number) {
    const item = this.selectedItems[index];
    if (item.id) {
      this.removedItems.push(item.id);
    }
    this.selectedItems.splice(index, 1);
    // Reorder sequences
    this.selectedItems.forEach((item, idx) => (item.squence = idx + 1));
  }

  // Helper to get display name from selected item
  getItemName(item: MobSideBarItem): string {
    // First check _displayItem (set when adding or from loadSideBarData mapping)
    if ((item as any)._displayItem) {
      return (item as any)._displayItem.name || (item as any)._displayItem.title || 'Unknown';
    }
    // Fallback: check nested objects directly on the item
    const nested = (item as any).outing || (item as any).room || (item as any).trip || (item as any).hajj;
    if (nested) {
      return nested.name || nested.title || 'Unknown';
    }
    return `Item #${item.id}`;
  }

  onSave() {
    console.log('onSave called');
    if (this.sideBarForm.invalid) {
      console.error('Form is invalid', this.sideBarForm.errors);
      Object.keys(this.sideBarForm.controls).forEach((key) => {
        const control = this.sideBarForm.get(key);
        if (control?.invalid) {
          console.error(`Control ${key} is invalid`, control.errors);
        }
      });
      return;
    }

    this.saving = true;
    const formValue = this.sideBarForm.value;

    // Construct payload
    const payload: any = {
      ...formValue,
      removedItemId: this.removedItems || [],
      sideBarItems: this.selectedItems.map((item) => {
        const itemPayload: any = {
          squence: item.squence,
          sideBarItemType: item.sideBarItemType
        };

        // Conditionally add the relevant ID based on type
        switch (item.sideBarItemType) {
          case SideBarItemType.Outing:
            itemPayload.outingId = item.outingId;
            break;
          case SideBarItemType.Hajj:
            itemPayload.hajjId = item.hajjId;
            break;
          case SideBarItemType.Trip:
            itemPayload.tripId = item.tripId;
            break;
          case SideBarItemType.Room:
            itemPayload.roomId = item.roomId;
            break;
        }

        // Only include ID if it exists (for edit mode updates of existing items)
        if (item.id) {
          itemPayload.id = item.id;
        }
        return itemPayload;
      })
    };

    if (this.isEditMode) {
      payload.id = this.sideBarId;
    }

    console.log('Payload:', payload);

    if (this.isEditMode) {
      this.mobSideBarService.updateMobileSideBar(this.sideBarId, payload).subscribe({
        next: () => {
          console.log('Update success');
          this.saving = false;
          this.toaster.success('Sidebar updated successfully', 'Success');
          this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
        },

        error: (err) => {
          console.error('Update error', err);
          this.saving = false;
          this.toaster.error('Failed to update sidebar', 'Error');
        }
      });
    } else {
      this.mobSideBarService.addMobileSideBar(payload).subscribe({
        next: () => {
          console.log('Add success');
          this.saving = false;
          this.toaster.success('Sidebar created successfully', 'Success');
          this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
        },
        error: (err) => {
          console.error('Add error', err);
          this.saving = false;
          this.toaster.error('Failed to create sidebar', 'Error');
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
  }
}
