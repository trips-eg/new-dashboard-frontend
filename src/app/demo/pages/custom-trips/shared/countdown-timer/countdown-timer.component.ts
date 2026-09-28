import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span
      class="ct-timer"
      [class.ct-timer--expired]="expired"
      [class.ct-timer--urgent]="!expired && isUrgent"
      [class.ct-timer--active]="!expired && !isUrgent"
    >
      <i class="pi" [ngClass]="expired ? 'pi-lock' : isUrgent ? 'pi-bolt' : 'pi-clock'"></i>
      <span>{{ expired ? ('Expired' | translate) : display }}</span>
      <span class="pulse-dot" *ngIf="!expired && isUrgent"></span>
    </span>
  `,
  styles: [
    `
      .ct-timer {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        font-size: 0.825rem;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        white-space: nowrap;
        transition: all 0.2s ease-in-out;
      }
      .ct-timer--active {
        color: #0369a1;
        background: #e0f2fe;
        border: 1px solid #bae6fd;
      }
      .ct-timer--urgent {
        color: #b91c1c;
        background: #fee2e2;
        border: 1px solid #fecaca;
        animation: pulseBorder 2s infinite;
      }
      .ct-timer--expired {
        color: #6b7280;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }
      .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #ef4444;
        display: inline-block;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
      @keyframes ping {
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      @keyframes pulseBorder {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
        }
        50% {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }
      }
    `
  ]
})
export class CountdownTimerComponent implements OnInit, OnChanges, OnDestroy {
  // Vendor endpoints give an absolute deadline; admin endpoint gives remaining seconds.
  @Input() expiresAt?: string;
  @Input() remainingSeconds?: number;
  @Input() accepting = true;
  @Output() onExpired = new EventEmitter<void>();

  display = '';
  expired = false;

  get isUrgent(): boolean {
    return !this.expired && this.remaining > 0 && this.remaining < 86400;
  }

  private remaining = 0;
  private timer: any;

  ngOnInit(): void {
    this.start();
  }

  ngOnChanges(): void {
    this.start();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private hasValidDate(): boolean {
    if (this.expiresAt && !this.expiresAt.startsWith('0001-01-01') && !this.expiresAt.startsWith('1970-01-01')) {
      return true;
    }
    if (this.remainingSeconds !== undefined && this.remainingSeconds !== null && this.remainingSeconds > 0) {
      return true;
    }
    return false;
  }

  private parseExpiresAt(dateStr?: string): number {
    if (!dateStr) return 0;
    // Normalize .NET 7-digit microsecond format "2026-10-17T14:58:40.2660402" -> 3-digit ms
    let clean = dateStr.replace(/(\.\d{3})\d+/, '$1');
    // If no timezone specified, backend DateTime is UTC
    if (!clean.endsWith('Z') && !clean.includes('+')) {
      clean += 'Z';
    }
    const parsed = new Date(clean).getTime();
    if (!isNaN(parsed)) return parsed;

    const fallback = new Date(dateStr).getTime();
    return isNaN(fallback) ? 0 : fallback;
  }

  private start(): void {
    clearInterval(this.timer);
    if (!this.hasValidDate()) {
      this.remaining = 0;
      this.expired = !this.accepting;
      this.display = this.accepting ? '—' : '';
      return;
    }

    if (this.expiresAt && !this.expiresAt.startsWith('0001-01-01') && !this.expiresAt.startsWith('1970-01-01')) {
      const targetTime = this.parseExpiresAt(this.expiresAt);
      if (targetTime > 0) {
        this.remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      } else if (this.remainingSeconds !== undefined && this.remainingSeconds !== null && this.remainingSeconds > 0) {
        this.remaining = Math.max(0, Math.floor(this.remainingSeconds));
      } else {
        this.remaining = 0;
      }
    } else if (this.remainingSeconds !== undefined && this.remainingSeconds !== null && this.remainingSeconds > 0) {
      this.remaining = Math.max(0, Math.floor(this.remainingSeconds));
    } else {
      this.remaining = 0;
    }

    this.render();
    this.timer = setInterval(() => {
      if (this.remaining > 0) {
        this.remaining--;
      }
      this.render();
    }, 1000);
  }

  private render(): void {
    const wasExpired = this.expired;
    this.expired = !this.accepting || this.remaining <= 0;
    this.display = this.format(this.remaining);
    if (this.expired && !wasExpired) {
      this.onExpired.emit();
    }
  }

  private format(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    const hms = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    return days > 0 ? `${days}d ${hms}` : hms;
  }
}
