import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MessageService } from 'primeng/api';
import { ChipsModule } from 'primeng/chips';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';

import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';

@Component({
  selector: 'app-notifications-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ChipsModule,
    InputTextareaModule,
    ImgUploaderComponent,
    DropdownModule,
    MultiSelectModule,
    RadioButtonModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './notifications-form.component.html',
  styleUrl: './notifications-form.component.scss'
})
export class NotificationsFormComponent {
  mode: string = 'Add';
  displayFile: any;
  form: FormGroup;
  loading: boolean = false;
  users: any[] = [];
  selectedFile: File | null = null;

  // Lazy loading properties
  usersLoading: boolean = false;
  totalUsers: number = 0;
  pageSize: number = 20;
  currentPage: number = 1;
  searchTerm: string = '';
  hasMoreUsers: boolean = true;

  // The item the notification opens in the app (phase 5)
  private trips = inject(TravelTripsService);
  private outings = inject(OutingService);
  private hajj = inject(HajjUmmrahService);
  itemTypes = [
    { label: 'بدون (يفتح الأبلكيشن بس)', value: null },
    { label: 'رحلة', value: 'trip' },
    { label: 'خروجة', value: 'picnic' },
    { label: 'حج / عمرة', value: 'religion' }
  ];
  itemOptions$: Observable<{ label: string; value: number }[]> = of([]);

  // Title and body ideas (AI on the server when it has a key, else templates)
  suggestions: { title: string; body: string; source: string }[] = [];
  suggesting = false;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private notificationsService: NotificationsService,
    private messageService: MessageService,
    private customerService: CustomerService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      LoginUser: [true],
      Anonymous: [false],
      usersId: [[]],
      itemType: [null],
      itemId: [null],
      image: [null]
    });

    this.loadUsers();
  }

  onItemTypeChange(type: string | null) {
    this.form.patchValue({ itemId: null });
    const opts = (res: any) => (res?.data?.data ?? []).map((x: any) => ({ label: x.name, value: x.id }));
    const all = { pageIndex: 1, pageSize: 1000, isPagingEnabled: false };
    this.itemOptions$ =
      type === 'trip' ? this.trips.getAllTravels(all).pipe(map(opts))
      : type === 'picnic' ? this.outings.getAllOutings(all).pipe(map(opts))
      : type === 'religion' ? this.hajj.getAllManasik(all).pipe(map(opts))
      : of([]);
  }

  suggest() {
    this.suggesting = true;
    const v = this.form.getRawValue();
    this.notificationsService.suggest({ itemType: v.itemType, itemId: v.itemId, idea: v.title || null }).subscribe({
      next: (res: any) => {
        this.suggestions = res?.data ?? [];
        this.suggesting = false;
      },
      error: () => {
        this.suggesting = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'مقدرناش نجيب اقتراحات، جرّب تاني' });
      }
    });
  }

  useSuggestion(s: { title: string; body: string }) {
    this.form.patchValue({ title: s.title, body: s.body });
  }

  loadUsers(page: number = 1, search: string = '', append: boolean = false) {
    this.usersLoading = true;
    const filterMap = new FilterMap();
    filterMap.pageIndex = page;
    filterMap.pageSize = this.pageSize;
    if (search) {
      filterMap.search = search;
    }

    this.customerService.getAllCustomers(filterMap).subscribe({
      next: (res: any) => {
        const newUsers = res.data.data || [];
        this.totalUsers = res.data.itemCount || 0;

        if (append) {
          this.users = [...this.users, ...newUsers];
        } else {
          this.users = newUsers;
        }

        this.currentPage = page;
        this.usersLoading = false;

        // Check if there are more users to load
        this.hasMoreUsers = this.users.length < this.totalUsers;

        if (this.config.data) {
          this.mode = 'Edit';
          this.form.patchValue({
            title: this.config.data.title,
            body: this.config.data.body
          });

          if (this.config.data.userId) {
            const exists = this.users.find((u) => u.id === this.config.data.userId);
            if (!exists && this.config.data.user) {
              this.users = [...this.users, { id: this.config.data.userId, name: this.config.data.user.name }];
            }

            this.form.patchValue({ usersId: this.config.data.userId });
            this.form.get('usersId')?.disable();
          }

          if (this.config.data.imageUrl) {
            this.displayFile = this.config.data.imageUrl;
          }
        }
      },
      error: () => {
        this.usersLoading = false;
      }
    });
  }



  onScrollToEnd() {
    // Called when user scrolls to the end of the dropdown
    if (this.hasMoreUsers && !this.usersLoading) {
      const nextPage = this.currentPage + 1;
      this.loadUsers(nextPage, this.searchTerm, true);
    }
  }

  onFilterUsers(event: any) {
    const filter = event.filter || '';
    this.searchTerm = filter;
    this.currentPage = 1;
    this.hasMoreUsers = true; // Reset when filtering
    this.loadUsers(1, filter, false);
  }

  onFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    } else {
      this.selectedFile = null;
    }
  }

  onUserTypeChange(isLoginUser: boolean) {
    this.form.patchValue({
      LoginUser: isLoginUser,
      Anonymous: !isLoginUser
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value);
    formData.append('body', this.form.get('body')?.value);

    // Send LoginUser and Anonymous flags
    const loginUser = this.form.get('LoginUser')?.value;
    const anonymous = this.form.get('Anonymous')?.value;
    formData.append('LoginUser', loginUser ? 'true' : 'false');
    formData.append('Anonymous', anonymous ? 'true' : 'false');

    // Append Image
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const usersIdValue = this.form.get('usersId')?.value;

    if (this.mode === 'Edit' && this.config.data?.id) {
      // Edit mode: Send Id only, no UserId
      formData.append('Id', this.config.data.id);

      this.notificationsService.updateNotification(formData).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification updated successfully' });
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update notification' });
          this.loading = false;
        }
      });
    } else {
      // the item it opens in the app
      const itemType = this.form.get('itemType')?.value;
      const itemId = this.form.get('itemId')?.value;
      if (itemType && itemId) {
        formData.append('ItemType', itemType);
        formData.append('ItemId', String(itemId));
      }

      // Add mode: Only send UsersId if LoginUser is true
      if (loginUser && Array.isArray(usersIdValue)) {
        usersIdValue.forEach((id: number) => {
          formData.append('UsersId', id.toString());
        });
      }

      this.notificationsService.addNotification(formData).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification sent successfully' });
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send notification' });
          this.loading = false;
        }
      });
    }
  }

  close() {
    this.ref.close();
  }
}
