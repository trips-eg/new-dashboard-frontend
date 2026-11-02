import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, Subscription, debounceTime, switchMap, catchError, of, tap } from 'rxjs';
import { ErrorComponent, TsFormatPipe } from './kit';

/** _Stepper of the app: − value + with a label. */
@Component({
  selector: 'ts-stepper',
  standalone: true,
  imports: [TsFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-stepper">
      <span class="ts-stepper__label">{{ label }}</span>
      <button type="button" class="ts-stepper__btn" [disabled]="value <= min" (click)="set(value - 1)" aria-label="−"><i class="ti ti-minus"></i></button>
      <strong class="ts-num">{{ value | ts }}</strong>
      <button type="button" class="ts-stepper__btn" [disabled]="value >= max" (click)="set(value + 1)" aria-label="+"><i class="ti ti-plus"></i></button>
    </div>
  `
})
export class StepperComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 50;
  @Output() valueChange = new EventEmitter<number>();
  set(v: number): void {
    this.value = v;
    this.valueChange.emit(v);
  }
}

/** PillSwitch: two or three choices in a light rounded track. */
@Component({
  selector: 'ts-pill-switch',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-pills" [class.ts-pills--dark]="dark" role="group">
      <button type="button" *ngFor="let i of items" [class.is-selected]="i.key === selected" [attr.aria-pressed]="i.key === selected" (click)="selectedChange.emit(i.key)">
        {{ i.label }}
      </button>
    </div>
  `
})
export class PillSwitchComponent {
  @Input() items: { key: string; label: string }[] = [];
  @Input() selected = '';
  @Input() dark = false;
  @Output() selectedChange = new EventEmitter<string>();
}

/** _PickBox: a field-like box that opens a picker. */
@Component({
  selector: 'ts-pick-box',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="ts-pick-box" (click)="pick.emit()">
      <span class="ts-pick-box__text">
        <strong *ngIf="text; else hintTpl">{{ text }}</strong>
        <ng-template #hintTpl><span class="ts-pick-box__hint">{{ hint }}</span></ng-template>
        <small *ngIf="sub">{{ sub }}</small>
      </span>
      <i class="ti ti-chevron-down" aria-hidden="true"></i>
    </button>
  `
})
export class PickBoxComponent {
  @Input() text?: string | null;
  @Input() hint = '';
  @Input() sub?: string | null;
  @Output() pick = new EventEmitter<void>();
}

/** _SearchPicker: a search box over results from an API (customers, products, vendors). */
@Component({
  selector: 'ts-search-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ErrorComponent],
  template: `
    <label class="ts-search">
      <i class="ti ti-search" aria-hidden="true"></i>
      <input type="search" [placeholder]="'APP.search' | translate" (input)="q$.next($any($event.target).value)" autofocus />
    </label>
    <div class="ts-progress-line" *ngIf="loading"><span></span></div>
    <ts-error *ngIf="error" [error]="error" (retry)="q$.next('')"></ts-error>
    <div class="ts-picker-list">
      <button type="button" class="ts-picker-row" *ngFor="let r of rows" (click)="picked.emit(r)">
        <strong>{{ title(r) }}</strong>
        <small *ngIf="subtitle(r)">{{ subtitle(r) }}</small>
      </button>
    </div>
  `
})
export class SearchPickerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) search!: (q: string) => Observable<any[]>;
  @Input() title: (r: any) => string = (r) => r?.name ?? '';
  @Input() subtitle: (r: any) => string = () => '';
  @Output() picked = new EventEmitter<any>();
  rows: any[] = [];
  loading = false;
  error: unknown = null;
  readonly q$ = new Subject<string>();
  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.q$
      .pipe(
        debounceTime(350),
        tap(() => (this.loading = true)),
        switchMap((q) =>
          this.search(q).pipe(
            catchError((e) => {
              this.error = e;
              return of(null);
            })
          )
        )
      )
      .subscribe((r) => {
        this.loading = false;
        if (r) {
          this.rows = r;
          this.error = null;
        }
      });
    setTimeout(() => this.q$.next(''));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

/** SwitchRow: a switch with a title and subtitle. */
@Component({
  selector: 'ts-switch-row',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ts-switch-line">
      <span>
        <strong>{{ title }}</strong>
        <small *ngIf="subtitle">{{ subtitle }}</small>
      </span>
      <input type="checkbox" role="switch" class="form-check-input" [checked]="value" [disabled]="disabled" (change)="valueChange.emit($any($event.target).checked)" />
    </label>
  `
})
export class SwitchRowComponent {
  @Input() title = '';
  @Input() subtitle?: string | null;
  @Input() value = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<boolean>();
}

export const CONTROLS = [StepperComponent, PillSwitchComponent, PickBoxComponent, SearchPickerComponent, SwitchRowComponent] as const;
