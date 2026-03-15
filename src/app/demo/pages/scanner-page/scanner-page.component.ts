import { Component, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { OutingService } from 'src/app/shared/services/outing.service';

@Component({
  selector: 'app-scanner-page',
  standalone: true,
  imports: [
    CommonModule,
    NgxScannerQrcodeComponent,
    SharedModule,
    DialogModule,
    TableModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    SubHeaderComponent
  ],
  templateUrl: './scanner-page.component.html',
  styleUrl: './scanner-page.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ScannerPageComponent implements OnInit, AfterViewInit {
  @ViewChild('scanner', { static: false }) scanner!: NgxScannerQrcodeComponent;
  @ViewChild('bookingInput') bookingInput!: ElementRef;

  scannedCodes: { code: string; timestamp: Date; ticketData?: any }[] = [];
  visible: boolean = false;
  isScanning: boolean = false;
  isLoading: boolean = false;
  selectedTicket: any = null;
  showTicketDialog: boolean = false;
  currentBookingId: number | null = null;

  constructor(
    private messageService: MessageService,
    private outingService: OutingService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.checkSecureContext();
  }

  ngAfterViewInit() {
    if (this.bookingInput) {
      setTimeout(() => {
        this.bookingInput.nativeElement.focus();
      }, 500);
    }
  }

  private checkSecureContext() {
    const isSecureContext = window.isSecureContext;
    // window.isSecureContext is the standard way to check.
    // However, older browsers might not have it.
    // The fallback check is protocol https or localhost.
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    // We can rely on isSecureContext if available, otherwise manual check
    const safe = isSecureContext !== undefined ? isSecureContext : isHttps || isLocalhost;

    if (!safe) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Insecure Connection',
        detail:
          'Camera access requires a secure HTTPS connection. The scanner may not work on this server unless you configure SSL (HTTPS).',
        life: 10000,
        sticky: true
      });
    }
  }

  manualBookingId: string = '';

  onScanSuccess(event: any) {
    const value = event?.[0]?.value;
    if (value) {
      console.log('QR Code:', value);

      // Close scanner dialog first
      this.closeDialog();

      // Parse the ID from the QR code (assuming value is the ID)
      const bookingId = parseInt(value, 10);

      if (isNaN(bookingId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid QR Code',
          detail: 'The scanned code does not contain a valid booking ID'
        });
        return;
      }

      this.processBookingId(bookingId);
    }
  }

  onManualSubmit() {
    if (!this.manualBookingId) {
      return;
    }

    const bookingId = parseInt(this.manualBookingId, 10);

    if (isNaN(bookingId)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid ID',
        detail: 'Please enter a valid numeric Booking ID'
      });
      return;
    }

    this.processBookingId(bookingId);
    this.manualBookingId = ''; // Clear input after successful submission intent
  }

  private processBookingId(bookingId: number) {
    this.currentBookingId = bookingId;
    this.isLoading = true;

    this.outingService.getOutingBookingById(bookingId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.selectedTicket = response.data.tecket;
        console.log('Booking Data:', response);

        // Add to history with ticket data
        this.scannedCodes.unshift({
          code: bookingId.toString(),
          timestamp: new Date(),
          ticketData: response.data.tecket
        });

        // Show ticket details
        this.selectedTicket = response.data.tecket;
        this.showTicketDialog = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket details loaded successfully'
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching booking:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ticket details'
        });
      }
    });
  }

  onScanError(error: any) {
    console.error('Scan Error:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Scan failed' });
  }

  showDialog() {
    this.visible = true;
    // Delay start slightly to ensure dialog is rendered?
    // Usually scanner needs to be visible to start correct?
    // NgxScannerQrcodeComponent handles its own lifecycle often, but let's wait for view init
    setTimeout(() => {
      this.startScanning();
    }, 1);
  }

  closeDialog() {
    this.visible = false;
    this.stopScanning();
  }

  startScanning() {
    this.isScanning = true;
    this.scanner.start();
  }

  stopScanning() {
    this.isScanning = false;
    this.scanner.stop();
  }

  viewTicketDetails(code: any) {
    if (code.ticketData) {
      this.selectedTicket = code.ticketData;
      this.currentBookingId = parseInt(code.code, 10);
      this.showTicketDialog = true;
    }
  }

  closeTicketDialog() {
    this.showTicketDialog = false;
    this.selectedTicket = null;
  }

  getUsedSerialNumbers(ticket: any): string[] {
    if (!ticket?.outingTicketSerialNumbers) return [];
    return ticket.outingTicketSerialNumbers.filter((sn: any) => sn.isUsed).map((sn: any) => sn.serialNumber);
  }

  getUnusedSerialNumbers(ticket: any): string[] {
    if (!ticket?.outingTicketSerialNumbers) return [];
    return ticket.outingTicketSerialNumbers.filter((sn: any) => !sn.isUsed).map((sn: any) => sn.serialNumber);
  }

  markSerialAsUsed(serialNumber: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark serial number "${serialNumber}" as used? This action grants entry and cannot be undone.`,
      header: 'Confirm Entry Grant',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // TODO: Here you will call the API to update the serial number status
        // For now, we'll update it locally
        if (this.selectedTicket?.outingTicketSerialNumbers) {
          const serial = this.selectedTicket.outingTicketSerialNumbers.find((sn: any) => sn.serialNumber === serialNumber);
          if (serial) {
            serial.isUsed = true;

            // Also update in the scanned codes history
            const historyItem = this.scannedCodes.find((item) =>
              item.ticketData?.outingTicketSerialNumbers?.some((sn: any) => sn.serialNumber === serialNumber)
            );
            if (historyItem?.ticketData?.outingTicketSerialNumbers) {
              const historySerial = historyItem.ticketData.outingTicketSerialNumbers.find((sn: any) => sn.serialNumber === serialNumber);
              if (historySerial) {
                historySerial.isUsed = true;
              }
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Entry Granted',
              detail: `Serial number "${serialNumber}" marked as used. Entry granted.`
            });
          }
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled. Serial number remains available.'
        });
      }
    });
  }

  markAllSerialsAsUsed() {
    if (!this.currentBookingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No booking ID available'
      });
      return;
    }

    const availableCount = this.getUnusedSerialNumbers(this.selectedTicket).length;

    if (availableCount === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Available Tickets',
        detail: 'All serial numbers are already marked as used.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to mark ALL ${availableCount} available serial number(s) as used? This will grant entry for all and cannot be undone.`,
      header: 'Confirm Mark All as Used',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        this.outingService.useTicketSerialNumber(this.currentBookingId!).subscribe({
          next: (response) => {
            this.isLoading = false;

            // Update all serial numbers to used in the selected ticket
            if (this.selectedTicket?.outingTicketSerialNumbers) {
              this.selectedTicket.outingTicketSerialNumbers.forEach((sn: any) => {
                sn.isUsed = true;
              });
            }

            // Update in scan history
            const historyItem = this.scannedCodes.find((item) => item.code === this.currentBookingId?.toString());
            if (historyItem?.ticketData?.outingTicketSerialNumbers) {
              historyItem.ticketData.outingTicketSerialNumbers.forEach((sn: any) => {
                sn.isUsed = true;
              });
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `All ${availableCount} serial number(s) marked as used successfully`
            });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error marking all serials as used:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to mark serial numbers as used. Please try again.'
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled. Serial numbers remain unchanged.'
        });
      }
    });
  }
}
