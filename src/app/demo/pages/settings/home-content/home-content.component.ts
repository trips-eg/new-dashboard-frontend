import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ColorPickerModule } from 'primeng/colorpicker';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastrService } from 'ngx-toastr';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import {
  HomeAutoValues,
  HomeContentAdmin,
  HomeContentService,
  HomeIconSlot,
  HomeTrust,
  HomeTrustBadge,
  HomeTrustStat
} from 'src/app/shared/services/home-content.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

// Same rules as the backend's HomeTrustValidator, so most mistakes are caught before saving.
export const HOME_CONTENT_EDIT_PERMISSION = 'Permissions.HomeContent.Edit';
export const MIN_STATS = 1;
export const MAX_STATS = 4;
export const MAX_BADGES = 3;
export const MAX_TEXT = 60;
export const AUTO_STAT_KEYS = ['companies', 'customers', 'products'];
export const MAX_ICON_BYTES = 200 * 1024;
const COLOR = /^#[0-9A-Fa-f]{6}$/;
const STAT_KEY = /^[a-z][a-zA-Z0-9_]{0,29}$/;
const ICON_KEY = /^[a-zA-Z0-9_.-]{1,40}$/;
const ICON_TYPES = ['image/svg+xml', 'image/png', 'image/webp'];
const ICON_EXTENSIONS = /\.(svg|png|webp)$/i;

/** The icons the app has built in for stats and badges (iconKey), with the dashboard icon used in the preview. */
export const BUILT_IN_ICONS: { key: string; label: string; fa: string }[] = [
  { key: 'building', label: 'مبنى', fa: 'fa-solid fa-building' },
  { key: 'download', label: 'تحميل', fa: 'fa-solid fa-download' },
  { key: 'users', label: 'ناس', fa: 'fa-solid fa-users' },
  { key: 'lock', label: 'قفل', fa: 'fa-solid fa-lock' },
  { key: 'refresh', label: 'استرجاع', fa: 'fa-solid fa-rotate' },
  { key: 'chat', label: 'محادثة', fa: 'fa-solid fa-comments' }
];

const GROUPS: { key: string; title: string }[] = [
  { key: 'sections', title: 'الأقسام الرئيسية' },
  { key: 'home', title: 'أقسام الرئيسية' },
  { key: 'trust', title: 'قسم الثقة' },
  { key: 'nav', title: 'الشريط السفلي' },
  { key: 'topBar', title: 'الشريط العلوي' }
];

/** The fallback icon each of the 3 main sections shows in the preview when no icon was uploaded. */
const SECTION_FALLBACK: Record<string, string> = {
  'service.travel': 'fa-solid fa-plane-departure',
  'service.outing': 'fa-solid fa-umbrella-beach',
  'service.hajj': 'fa-solid fa-kaaba'
};

function textError(value: string | null | undefined, field: string, required: boolean, errors: string[]) {
  const text = (value ?? '').trim();
  if (!text) {
    if (required) errors.push(`${field} مطلوب`);
    return;
  }
  if (text.length > MAX_TEXT) errors.push(`${field} أطول من ${MAX_TEXT} حرف`);
}

function colorError(value: string | null | undefined, field: string, required: boolean, errors: string[]) {
  const text = (value ?? '').trim();
  if (!text) {
    if (required) errors.push(`${field} مطلوب`);
    return;
  }
  if (!COLOR.test(text)) errors.push(`${field} لازم يكون بالشكل #RRGGBB`);
}

function iconKeyError(value: string | null | undefined, field: string, errors: string[]) {
  const text = (value ?? '').trim();
  if (text && !ICON_KEY.test(text)) errors.push(`${field} مش صحيحة`);
}

/** Returns the problems with the trust block, in Arabic; an empty list means it can be saved. */
export function validateTrust(trust: HomeTrust | null | undefined): string[] {
  const errors: string[] = [];
  if (!trust) return ['البيانات مش موجودة'];

  textError(trust.kicker, 'الجملة الصغيرة فوق العنوان', false, errors);
  textError(trust.title, 'العنوان', true, errors);
  colorError(trust.backgroundColor, 'لون الخلفية', true, errors);
  colorError(trust.textColor, 'لون الكلام', true, errors);
  colorError(trust.accentColor, 'اللون المميز', true, errors);

  const stats = trust.stats ?? [];
  if (stats.length < MIN_STATS || stats.length > MAX_STATS) errors.push(`عدد الأرقام لازم يكون من ${MIN_STATS} لـ ${MAX_STATS}`);
  const seen = new Set<string>();
  stats.forEach((s, i) => {
    const n = i + 1;
    const key = (s.key ?? '').trim();
    if (!STAT_KEY.test(key)) errors.push(`مفتاح الرقم ${n} لازم يكون حروف إنجليزي صغيرة وأرقام (زي companies)`);
    else if (seen.has(key)) errors.push(`المفتاح «${key}» متكرر`);
    seen.add(key);
    if (s.mode !== 'auto' && s.mode !== 'manual') errors.push(`طريقة الرقم ${n} لازم تكون auto أو manual`);
    else if (s.mode === 'auto' && !AUTO_STAT_KEYS.includes(key))
      errors.push(`الرقم ${n} مينفعش يتحسب أوتوماتيك؛ المتاح: companies و customers و products`);
    textError(s.label, `اسم الرقم ${n}`, true, errors);
    textError(s.value, `قيمة الرقم ${n}`, s.mode === 'manual', errors);
    iconKeyError(s.iconKey, `أيقونة الرقم ${n}`, errors);
    colorError(s.color, `لون الرقم ${n}`, false, errors);
    colorError(s.tint, `لون خلفية الرقم ${n}`, false, errors);
  });

  const badges = trust.badges ?? [];
  if (badges.length > MAX_BADGES) errors.push(`أقصى عدد مميزات ${MAX_BADGES}`);
  badges.forEach((b, i) => {
    textError(b.text, `الميزة ${i + 1}`, true, errors);
    iconKeyError(b.iconKey, `أيقونة الميزة ${i + 1}`, errors);
  });
  return errors;
}

/** The body of PUT staff/home-content/trust: trimmed texts, upper-case colors, no icon URLs (icons go through their slots). */
export function buildTrustPayload(trust: HomeTrust): HomeTrust {
  const text = (v: string | null | undefined) => {
    const t = (v ?? '').trim();
    return t ? t : null;
  };
  const color = (v: string | null | undefined) => {
    const t = (v ?? '').trim();
    return t ? t.toUpperCase() : null;
  };
  return {
    isVisible: !!trust.isVisible,
    kicker: text(trust.kicker),
    title: text(trust.title) ?? '',
    backgroundColor: color(trust.backgroundColor) ?? '',
    textColor: color(trust.textColor) ?? '',
    accentColor: color(trust.accentColor) ?? '',
    stats: (trust.stats ?? []).map((s) => ({
      key: (s.key ?? '').trim(),
      label: text(s.label) ?? '',
      value: text(s.value),
      mode: s.mode,
      iconKey: text(s.iconKey),
      color: color(s.color),
      tint: color(s.tint)
    })),
    badges: (trust.badges ?? []).map((b) => ({ text: text(b.text) ?? '', iconKey: text(b.iconKey) }))
  };
}

/** The server's "+134" / "+1.5K" / "+50K" format (rounded down). */
export function formatCount(count: number | null | undefined): string {
  const c = Math.floor(count ?? 0);
  if (c <= 0) return '0';
  if (c < 1000) return `+${c}`;
  const short = (v: number) => (v < 10 ? String(Math.floor(v * 10) / 10) : String(Math.floor(v)));
  return c < 1_000_000 ? `+${short(c / 1000)}K` : `+${short(c / 1_000_000)}M`;
}

type TrustColorField = 'backgroundColor' | 'textColor' | 'accentColor';

interface SlotGroup {
  key: string;
  title: string;
  slots: HomeIconSlot[];
}

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ColorPickerModule, InputSwitchModule, SubHeaderComponent],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.scss'
})
export class HomeContentComponent implements OnInit {
  readonly maxStats = MAX_STATS;
  readonly minStats = MIN_STATS;
  readonly maxBadges = MAX_BADGES;
  readonly maxText = MAX_TEXT;
  readonly autoKeys = AUTO_STAT_KEYS;
  readonly builtInIcons = BUILT_IN_ICONS;
  readonly colorFields: { field: TrustColorField; label: string }[] = [
    { field: 'backgroundColor', label: 'لون الخلفية' },
    { field: 'textColor', label: 'لون الكلام' },
    { field: 'accentColor', label: 'اللون المميز' }
  ];

  loading = false;
  loadError: string | null = null;
  saving = false;
  conflict = false;
  errors: string[] = [];
  busySlot: string | null = null;

  trust: HomeTrust | null = null;
  icons: Record<string, string | null> = {};
  iconSlots: HomeIconSlot[] = [];
  slotGroups: SlotGroup[] = [];
  autoValues: HomeAutoValues = { companies: 0, customers: 0, products: 0 };
  version = 0;
  canEdit = false;
  private savedJson = '';

  constructor(
    private homeContentService: HomeContentService,
    private configService: ConfigureService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.canEdit = (this.configService.userPermissions() || []).includes(HOME_CONTENT_EDIT_PERMISSION);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.homeContentService.getContent().subscribe({
      next: (content) => {
        this.apply(content);
        this.conflict = false;
        this.errors = [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.loadError = HomeContentService.parseError(err).messages[0];
      }
    });
  }

  private apply(content: HomeContentAdmin): void {
    this.icons = { ...(content.icons || {}) };
    this.iconSlots = content.iconSlots || [];
    this.autoValues = content.autoValues || { companies: 0, customers: 0, products: 0 };
    this.version = content.version ?? 0;
    this.trust = JSON.parse(JSON.stringify(content.trust));
    this.trust.stats = this.trust.stats || [];
    this.trust.badges = this.trust.badges || [];
    this.savedJson = JSON.stringify(buildTrustPayload(this.trust));
    this.slotGroups = this.groupSlots(this.iconSlots);
  }

  private groupSlots(slots: HomeIconSlot[]): SlotGroup[] {
    const known = GROUPS.map((g) => ({ ...g, slots: slots.filter((s) => s.group === g.key) }));
    const others = slots.filter((s) => !GROUPS.some((g) => g.key === s.group));
    if (others.length) known.push({ key: 'other', title: 'أخرى', slots: others });
    return known.filter((g) => g.slots.length);
  }

  get isDirty(): boolean {
    return !!this.trust && JSON.stringify(buildTrustPayload(this.trust)) !== this.savedJson;
  }

  get canSave(): boolean {
    return this.canEdit && !!this.trust && !this.saving && !this.conflict;
  }

  // ---------- Trust editing ----------

  addStat(): void {
    if (!this.trust || this.trust.stats.length >= MAX_STATS) return;
    const used = new Set(this.trust.stats.map((s) => s.key));
    const key = ['companies', 'customers', 'products', 'downloads'].find((k) => !used.has(k)) ?? `stat${this.trust.stats.length + 1}`;
    const mode = AUTO_STAT_KEYS.includes(key) ? 'auto' : 'manual';
    this.trust.stats.push({ key, label: '', value: '', mode, iconKey: null, color: null, tint: null });
  }

  removeStat(index: number): void {
    if (!this.trust || this.trust.stats.length <= MIN_STATS) return;
    this.trust.stats.splice(index, 1);
  }

  moveStat(index: number, delta: number): void {
    if (!this.trust) return;
    const to = index + delta;
    if (to < 0 || to >= this.trust.stats.length) return;
    const [stat] = this.trust.stats.splice(index, 1);
    this.trust.stats.splice(to, 0, stat);
  }

  onStatKeyChange(stat: HomeTrustStat): void {
    if (stat.mode === 'auto' && !AUTO_STAT_KEYS.includes((stat.key ?? '').trim())) stat.mode = 'manual';
  }

  canBeAuto(stat: HomeTrustStat): boolean {
    return AUTO_STAT_KEYS.includes((stat.key ?? '').trim());
  }

  addBadge(): void {
    if (!this.trust || this.trust.badges.length >= MAX_BADGES) return;
    this.trust.badges.push({ text: '', iconKey: null });
  }

  removeBadge(index: number): void {
    this.trust?.badges.splice(index, 1);
  }

  /** The color picker only gets valid colors; the hex box next to it can hold a half-typed value. */
  pickerValue(value: string | null | undefined, fallback = '#000000'): string {
    return value && COLOR.test(value) ? value : fallback;
  }

  trustColor(field: TrustColorField): string {
    return this.trust ? this.trust[field] : '';
  }

  setTrustColor(field: TrustColorField, value: string): void {
    if (this.trust) this.trust[field] = value;
  }

  isBuiltIn(iconKey: string | null | undefined): boolean {
    return BUILT_IN_ICONS.some((i) => i.key === iconKey);
  }

  isColor(value: string | null | undefined): boolean {
    return !!value && COLOR.test(value);
  }

  // ---------- Save ----------

  save(): void {
    if (!this.canSave || !this.trust) return;
    this.errors = validateTrust(this.trust);
    if (this.errors.length) {
      this.toaster.error(this.errors[0], 'راجع البيانات');
      return;
    }
    this.saving = true;
    this.homeContentService.saveTrust(buildTrustPayload(this.trust)).subscribe({
      next: (content) => {
        this.saving = false;
        this.apply(content);
        this.toaster.success('اتحفظ قسم الثقة', 'تم');
      },
      error: (err) => {
        this.saving = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    const problem = HomeContentService.parseError(err);
    if (problem.kind === 'conflict') {
      this.conflict = true;
      this.toaster.warning(problem.messages[0], 'حد تاني عدّل');
      return;
    }
    if (problem.kind === 'validation') this.errors = problem.messages;
    this.toaster.error(problem.messages[0], 'محصلش حفظ');
  }

  // ---------- Icons ----------

  slotExists(slot: string): boolean {
    return this.iconSlots.some((s) => s.key === slot);
  }

  statSlot(stat: HomeTrustStat): string {
    return `trust.stat.${(stat.key ?? '').trim()}`;
  }

  badgeSlot(index: number): string {
    return `trust.badge.${index + 1}`;
  }

  slotLabel(slot: string): string {
    return this.iconSlots.find((s) => s.key === slot)?.labelAr ?? slot;
  }

  iconUrl(slot: string): string | null {
    return HomeContentService.imageUrl(this.icons[slot]);
  }

  builtInIcon(iconKey: string | null | undefined): string {
    return BUILT_IN_ICONS.find((i) => i.key === iconKey)?.fa ?? 'fa-solid fa-circle';
  }

  sectionFallback(slot: string): string {
    return SECTION_FALLBACK[slot] ?? 'fa-solid fa-image';
  }

  /** Returns the problem with the chosen file, or null when it can be uploaded. */
  checkIconFile(file: File | null | undefined): string | null {
    if (!file) return 'اختار ملف';
    if (!ICON_TYPES.includes(file.type) && !ICON_EXTENSIONS.test(file.name)) return 'الأيقونة لازم تكون SVG أو PNG أو WebP';
    if (file.size > MAX_ICON_BYTES) return 'حجم الأيقونة لازم يكون 200 KB أو أقل';
    return null;
  }

  onIconSelected(slot: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (input) input.value = '';
    this.uploadIcon(slot, file);
  }

  uploadIcon(slot: string, file: File | null | undefined): void {
    if (!this.canEdit || this.busySlot) return;
    const problem = this.checkIconFile(file);
    if (problem) {
      this.toaster.error(problem, 'الأيقونة مترفعتش');
      return;
    }
    this.busySlot = slot;
    this.homeContentService.uploadIcon(slot, file!).subscribe({
      next: (res) => {
        this.busySlot = null;
        this.setIcon(res.slot || slot, res.url, res.version);
        this.toaster.success(`اتغيّرت أيقونة «${this.slotLabel(slot)}»`, 'تم');
      },
      error: (err) => {
        this.busySlot = null;
        this.handleError(err);
      }
    });
  }

  resetIcon(slot: string): void {
    if (!this.canEdit || this.busySlot || !this.icons[slot]) return;
    this.busySlot = slot;
    this.homeContentService.resetIcon(slot).subscribe({
      next: (res) => {
        this.busySlot = null;
        this.setIcon(res.slot || slot, null, res.version);
        this.toaster.success(`رجعت الأيقونة الأصلية لـ «${this.slotLabel(slot)}»`, 'تم');
      },
      error: (err) => {
        this.busySlot = null;
        this.handleError(err);
      }
    });
  }

  private setIcon(slot: string, url: string | null, version: number): void {
    this.icons = { ...this.icons, [slot]: url };
    if (typeof version === 'number') this.version = version;
  }

  // ---------- Preview ----------

  statValue(stat: HomeTrustStat): string {
    if (stat.mode === 'auto' && this.canBeAuto(stat)) {
      return formatCount((this.autoValues as any)[(stat.key ?? '').trim()]);
    }
    return stat.value || '—';
  }

  get sectionSlots(): HomeIconSlot[] {
    const fromServer = this.iconSlots.filter((s) => s.group === 'sections');
    if (fromServer.length) return fromServer;
    return [
      { key: 'service.travel', labelAr: 'الرحلات', group: 'sections' },
      { key: 'service.outing', labelAr: 'الخروجات', group: 'sections' },
      { key: 'service.hajj', labelAr: 'الحج والعمرة', group: 'sections' }
    ];
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackBySlot(_: number, slot: HomeIconSlot): string {
    return slot.key;
  }

  trackBadge(index: number, _: HomeTrustBadge): number {
    return index;
  }
}
