import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MobSideBarService, MobSideBar } from 'src/app/shared/services/mob-side-bar.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-mob-side-bar-list',
  standalone: true,
  imports: [SharedModule, SelectButtonModule, DialogModule, ReactiveFormsModule],
  templateUrl: './mob-side-bar-list.component.html',
  styleUrl: './mob-side-bar-list.component.scss',
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class MobSideBarListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  sideBars: MobSideBar[] = [];
  totalRecords: number = 0;
  search: string = '';
  loading: boolean = false;

  // Sidebar type selection
  sidebarType: string = 'sidebar';
  sidebarTypeOptions = [
    { label: 'Sidebar', value: 'sidebar' },
    { label: 'Coupon Sidebar', value: 'couponSidebar' }
  ];

  // Coupon Sidebar Edit Dialog
  couponDialogVisible: boolean = false;
  couponForm: FormGroup;
  editingCouponId: number | null = null;
  savingCoupon: boolean = false;

  constructor(
    private mobSideBarService: MobSideBarService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initCouponForm();
  }

  initCouponForm() {
    this.couponForm = this.fb.group({
      title: ['', Validators.required],
      color: ['#e3cccd'],
      squence: [0],
      isActive: [true]
    });
  }

  ngOnInit(): void {}

  loadSideBars(event: TableLazyLoadEvent) {
    this.loading = true;

    if (this.sidebarType === 'sidebar') {
      const payload = TableRequestBuilder.build(event, this.search);
      this.mobSideBarService.getAllMobileSideBar(payload).subscribe({
        next: (res: any) => {
          this.sideBars = res.data.data;
          this.totalRecords = res.data.itemsCount;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
        }
      });
    } else {
      // Coupon Sidebar (GET / All)
      this.mobSideBarService.getCouponSideBar().subscribe({
        next: (res: any) => {
          // Coupon sidebar returns array directly or single object
          this.sideBars = Array.isArray(res.data) ? res.data : [res.data];
          this.totalRecords = this.sideBars.length;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
        }
      });
    }
  }

  onSidebarTypeChange() {
    this.search = '';
    this.dt.reset();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  add() {
    this.router.navigate(['/settings/mob-side-bar/add']);
  }

  edit(sidebar: MobSideBar) {
    if (this.sidebarType === 'couponSidebar') {
      // Open dialog for coupon sidebar
      this.editingCouponId = sidebar.id!;
      this.couponForm.patchValue({
        title: sidebar.title,
        color: sidebar.color,
        squence: sidebar.squence,
        isActive: sidebar.isActive
      });
      this.couponDialogVisible = true;
    } else {
      // Navigate to form page for regular sidebar
      this.router.navigate([`mobile-sidebar-form/${sidebar.id}`]);
    }
  }

  saveCouponSidebar() {
    if (this.couponForm.invalid || !this.editingCouponId) {
      return;
    }

    this.savingCoupon = true;
    const payload: MobSideBar = {
      ...this.couponForm.value
    };

    this.mobSideBarService.editCouponSideBar(this.editingCouponId, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Coupon sidebar updated successfully' });
        this.savingCoupon = false;
        this.couponDialogVisible = false;
        this.refresh();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update coupon sidebar' });
        this.savingCoupon = false;
      }
    });
  }

  closeCouponDialog() {
    this.couponDialogVisible = false;
    this.editingCouponId = null;
    this.couponForm.reset({
      title: '',
      color: '#e3cccd',
      squence: 0,
      isActive: true
    });
  }

  view(id: number) {
    this.router.navigate([`mobile-sidebar-details/${id}`]);
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this sidebar?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mobSideBarService.deleteMobileSideBar(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sidebar deleted successfully' });
            this.refresh();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete sidebar' });
          }
        });
      }
    });
  }
}
