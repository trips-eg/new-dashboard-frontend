import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import {
  HomeContentComponent,
  buildTrustPayload,
  formatCount,
  validateTrust
} from './home-content.component';
import { HomeContentAdmin, HomeContentService, HomeTrust } from 'src/app/shared/services/home-content.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

function defaultTrust(): HomeTrust {
  return {
    isVisible: true,
    kicker: 'احجز وانت مطمّن',
    title: 'آلاف المسافرين بيثقوا في Trips',
    backgroundColor: '#1E4FA3',
    textColor: '#FFFFFF',
    accentColor: '#FFC24B',
    stats: [
      { key: 'companies', label: 'شركة موثّقة', value: '+134', mode: 'auto', iconKey: 'building', iconUrl: null, color: '#157A47', tint: '#E8F5EE' },
      { key: 'downloads', label: 'تحميل', value: '+100K', mode: 'manual', iconKey: 'download', iconUrl: null, color: '#1E4FA3', tint: '#EAF1FB' },
      { key: 'customers', label: 'عميل سافر معانا', value: '+50K', mode: 'auto', iconKey: 'users', iconUrl: '/images/HomeContent/u.svg', color: '#C2410C', tint: '#FFF3EA' }
    ],
    badges: [
      { text: 'دفع آمن', iconKey: 'lock', iconUrl: null },
      { text: 'سياسة إلغاء واضحة', iconKey: 'refresh', iconUrl: null },
      { text: 'دعم كل يوم', iconKey: 'chat', iconUrl: null }
    ]
  };
}

function content(version = 7): HomeContentAdmin {
  return {
    trust: defaultTrust(),
    icons: { 'service.travel': null, 'service.outing': '/images/HomeContent/ab12.svg', 'service.hajj': null, 'trust.stat.companies': null, 'nav.home': null },
    iconSlots: [
      { key: 'service.travel', labelAr: 'الرحلات', group: 'sections' },
      { key: 'service.outing', labelAr: 'الخروجات', group: 'sections' },
      { key: 'service.hajj', labelAr: 'الحج والعمرة', group: 'sections' },
      { key: 'trust.stat.companies', labelAr: 'رقم الشركات', group: 'trust' },
      { key: 'trust.badge.1', labelAr: 'الميزة الأولى', group: 'trust' },
      { key: 'nav.home', labelAr: 'الرئيسية', group: 'nav' },
      { key: 'menu', labelAr: 'القائمة', group: 'topBar' }
    ],
    autoValues: { companies: 134, customers: 51234, products: 900 },
    version
  };
}

describe('Home content validation helpers', () => {
  it('accepts the defaults', () => {
    expect(validateTrust(defaultTrust())).toEqual([]);
  });

  it('rejects bad colors, missing title and long texts', () => {
    const t = defaultTrust();
    t.backgroundColor = '1E4FA3';
    t.textColor = '#FFF';
    t.title = '  ';
    t.kicker = 'x'.repeat(61);
    t.stats[0].tint = 'red';
    const errors = validateTrust(t);
    expect(errors).toContain('لون الخلفية لازم يكون بالشكل #RRGGBB');
    expect(errors).toContain('لون الكلام لازم يكون بالشكل #RRGGBB');
    expect(errors).toContain('العنوان مطلوب');
    expect(errors).toContain('الجملة الصغيرة فوق العنوان أطول من 60 حرف');
    expect(errors).toContain('لون خلفية الرقم 1 لازم يكون بالشكل #RRGGBB');
  });

  it('needs 1 to 4 stats and at most 3 badges', () => {
    const none = defaultTrust();
    none.stats = [];
    expect(validateTrust(none)).toContain('عدد الأرقام لازم يكون من 1 لـ 4');

    const many = defaultTrust();
    many.stats.push({ ...many.stats[1], key: 'a' }, { ...many.stats[1], key: 'b' });
    expect(validateTrust(many)).toContain('عدد الأرقام لازم يكون من 1 لـ 4');

    const badges = defaultTrust();
    badges.badges.push({ text: 'رابعة', iconKey: null });
    expect(validateTrust(badges)).toContain('أقصى عدد مميزات 3');
  });

  it('allows auto only for companies, customers and products, and needs a value for manual stats', () => {
    const t = defaultTrust();
    t.stats[1].mode = 'auto';
    expect(validateTrust(t)).toContain('الرقم 2 مينفعش يتحسب أوتوماتيك؛ المتاح: companies و customers و products');

    const m = defaultTrust();
    m.stats[1].value = '';
    expect(validateTrust(m)).toContain('قيمة الرقم 2 مطلوب');

    const auto = defaultTrust();
    auto.stats[0].value = '';
    expect(validateTrust(auto)).toEqual([]);
  });

  it('rejects duplicate and badly formed stat keys', () => {
    const t = defaultTrust();
    t.stats[1].key = 'companies';
    t.stats[1].mode = 'manual';
    t.stats[2].key = 'Bad Key';
    const errors = validateTrust(t);
    expect(errors).toContain('المفتاح «companies» متكرر');
    expect(errors).toContain('مفتاح الرقم 3 لازم يكون حروف إنجليزي صغيرة وأرقام (زي companies)');
  });

  it('builds the payload: trimmed, upper-case colors, no icon URLs', () => {
    const t = defaultTrust();
    t.title = '  عنوان  ';
    t.backgroundColor = '#1e4fa3';
    t.kicker = '   ';
    const payload = buildTrustPayload(t);
    expect(payload.title).toBe('عنوان');
    expect(payload.kicker).toBeNull();
    expect(payload.backgroundColor).toBe('#1E4FA3');
    expect(payload.stats.every((s) => !('iconUrl' in s))).toBeTrue();
    expect(payload.badges.every((b) => !('iconUrl' in b))).toBeTrue();
    expect(payload.stats.map((s) => s.key)).toEqual(['companies', 'downloads', 'customers']);
  });

  it('formats counts like the server', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(134)).toBe('+134');
    expect(formatCount(1580)).toBe('+1.5K');
    expect(formatCount(51234)).toBe('+51K');
    expect(formatCount(2_345_678)).toBe('+2.3M');
  });
});

describe('HomeContentComponent', () => {
  let fixture: ComponentFixture<HomeContentComponent>;
  let component: HomeContentComponent;
  let service: jasmine.SpyObj<HomeContentService>;
  let toaster: jasmine.SpyObj<ToastrService>;
  let permissions: string[];

  async function create(perms: string[]) {
    permissions = perms;
    service = jasmine.createSpyObj<HomeContentService>('HomeContentService', ['getContent', 'saveTrust', 'uploadIcon', 'resetIcon']);
    service.getContent.and.returnValue(of(content()));
    toaster = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error', 'warning', 'info']);

    await TestBed.configureTestingModule({
      imports: [HomeContentComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: HomeContentService, useValue: service },
        { provide: ToastrService, useValue: toaster },
        { provide: ConfigureService, useValue: { userPermissions: () => permissions } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function saveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.hc-save');
  }

  describe('with edit permission', () => {
    beforeEach(async () => create(['Permissions.HomeContent.View', 'Permissions.HomeContent.Edit']));

    it('loads the content and groups the icon slots', () => {
      expect(service.getContent).toHaveBeenCalledTimes(1);
      expect(component.version).toBe(7);
      expect(component.slotGroups.map((g) => g.key)).toEqual(['sections', 'trust', 'nav', 'topBar']);
      expect(component.slotGroups[0].slots.length).toBe(3);
      expect(saveButton().disabled).toBeFalse();
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('الافتراضي');
      expect(text).toContain('آلاف المسافرين بيثقوا في Trips');
    });

    it('shows uploaded icons from the image host', () => {
      expect(component.iconUrl('service.outing')).toMatch(/^https?:\/\/.+\/images\/HomeContent\/ab12\.svg$/);
      expect(component.iconUrl('service.travel')).toBeNull();
      const imgs: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('img'));
      expect(imgs.some((i) => i.src.endsWith('/images/HomeContent/ab12.svg'))).toBeTrue();
    });

    it('does not call the server when the trust block is invalid', () => {
      component.trust!.backgroundColor = 'blue';
      component.trust!.badges[0].text = '';
      component.save();
      expect(service.saveTrust).not.toHaveBeenCalled();
      expect(component.errors).toContain('لون الخلفية لازم يكون بالشكل #RRGGBB');
      expect(component.errors).toContain('الميزة 1 مطلوب');
      expect(toaster.error).toHaveBeenCalled();
    });

    it('saves the cleaned trust block and applies the answer', () => {
      const saved = content(8);
      saved.trust.title = 'عنوان جديد';
      service.saveTrust.and.returnValue(of(saved));
      component.trust!.title = ' عنوان جديد ';
      component.trust!.accentColor = '#ffc24b';
      component.save();

      expect(service.saveTrust).toHaveBeenCalledTimes(1);
      const body = service.saveTrust.calls.mostRecent().args[0];
      expect(body.title).toBe('عنوان جديد');
      expect(body.accentColor).toBe('#FFC24B');
      expect(body.stats.length).toBe(3);
      expect((body.stats[2] as any).iconUrl).toBeUndefined();
      expect(body.badges.length).toBe(3);
      expect(component.version).toBe(8);
      expect(component.isDirty).toBeFalse();
      expect(toaster.success).toHaveBeenCalled();
    });

    it('shows the server validation errors', () => {
      service.saveTrust.and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { success: false, message: 'x', errorCode: 'VALIDATION_FAILED', data: { errors: ['العنوان مطلوب', 'لون الكلام مطلوب'] } }
            })
        )
      );
      component.save();
      expect(component.errors).toEqual(['العنوان مطلوب', 'لون الكلام مطلوب']);
      expect(component.saving).toBeFalse();
      expect(component.conflict).toBeFalse();
    });

    it('on 409 asks to reload, blocks saving, and reload brings the newest version', () => {
      service.saveTrust.and.returnValue(
        throwError(() => new HttpErrorResponse({ status: 409, error: { success: false, errorCode: 'CONFLICT', message: 'حد تاني حفظ' } }))
      );
      component.save();
      fixture.detectChanges();

      expect(component.conflict).toBeTrue();
      expect(component.canSave).toBeFalse();
      expect(saveButton().disabled).toBeTrue();
      expect(fixture.nativeElement.querySelector('.hc-conflict')).not.toBeNull();
      expect(toaster.warning).toHaveBeenCalled();

      service.getContent.and.returnValue(of(content(9)));
      component.load();
      fixture.detectChanges();
      expect(service.getContent).toHaveBeenCalledTimes(2);
      expect(component.conflict).toBeFalse();
      expect(component.version).toBe(9);
      expect(saveButton().disabled).toBeFalse();
    });

    it('keeps 1 to 4 stats and up to 3 badges in the editor', () => {
      component.addStat();
      expect(component.trust!.stats.length).toBe(4);
      expect(component.trust!.stats[3].key).toBe('products');
      expect(component.trust!.stats[3].mode).toBe('auto');
      component.addStat();
      expect(component.trust!.stats.length).toBe(4);

      component.addBadge();
      expect(component.trust!.badges.length).toBe(3);

      component.trust!.stats.splice(1);
      component.removeStat(0);
      expect(component.trust!.stats.length).toBe(1);
    });

    it('switches a stat to manual when its key cannot be counted', () => {
      const stat = component.trust!.stats[0];
      stat.key = 'happy';
      component.onStatKeyChange(stat);
      expect(stat.mode).toBe('manual');
    });

    it('previews auto stats with the live count', () => {
      expect(component.statValue(component.trust!.stats[2])).toBe('+51K');
      expect(component.statValue(component.trust!.stats[1])).toBe('+100K');
    });

    it('uploads an icon and shows it', () => {
      service.uploadIcon.and.returnValue(of({ slot: 'nav.home', url: '/images/HomeContent/n.png', version: 8 }));
      const file = new File([new Uint8Array(10)], 'home.png', { type: 'image/png' });
      component.uploadIcon('nav.home', file);
      expect(service.uploadIcon).toHaveBeenCalledWith('nav.home', file);
      expect(component.icons['nav.home']).toBe('/images/HomeContent/n.png');
      expect(component.version).toBe(8);
      expect(component.busySlot).toBeNull();
    });

    it('refuses big or wrong icon files before uploading', () => {
      component.uploadIcon('nav.home', new File([new Uint8Array(200 * 1024 + 1)], 'big.png', { type: 'image/png' }));
      component.uploadIcon('nav.home', new File(['x'], 'icon.gif', { type: 'image/gif' }));
      expect(service.uploadIcon).not.toHaveBeenCalled();
      expect(toaster.error).toHaveBeenCalledTimes(2);
    });

    it('resets an uploaded icon to the default', () => {
      service.resetIcon.and.returnValue(of({ slot: 'service.outing', url: null, version: 8 }));
      component.resetIcon('service.outing');
      expect(service.resetIcon).toHaveBeenCalledWith('service.outing');
      expect(component.icons['service.outing']).toBeNull();
    });
  });

  describe('without edit permission', () => {
    beforeEach(async () => create(['Permissions.HomeContent.View']));

    it('disables saving and does not call the server', () => {
      expect(component.canEdit).toBeFalse();
      expect(saveButton().disabled).toBeTrue();
      component.save();
      component.uploadIcon('nav.home', new File(['x'], 'a.svg', { type: 'image/svg+xml' }));
      expect(service.saveTrust).not.toHaveBeenCalled();
      expect(service.uploadIcon).not.toHaveBeenCalled();
    });
  });
});
