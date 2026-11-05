import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { NavigationItem } from './theme/layout/admin/navigation/navigation';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { SharedModule } from './theme/shared/shared.module';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpInterceptorInterceptor } from './shared/interceptors/http.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';
import { DialogHostComponent } from './staff/ui/dialogs';

const I18N_STAMP = Date.now().toString(36);

export function HttpLoaderFactory(http: HttpClient) {
  // IIS serves assets with max-age=1 year, so a fixed URL kept old texts after a deploy (new keys showed raw):
  // a value per app start makes the browser fetch the current file (about 25 KB gzipped, once per start)
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${I18N_STAMP}`);
}
@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavItemComponent,
    NavCollapseComponent,
    ConfigurationComponent,
    UpdateBannerComponent
  ],
  imports: [BrowserModule,  NgxSpinnerModule,AppRoutingModule, DialogHostComponent, ToastrModule.forRoot({
    timeOut: 4000,
    positionClass: 'toast-top-right',

    preventDuplicates: true,
  }),SharedModule,HttpClientModule ,BrowserAnimationsModule,TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  }), ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000'
})],
  providers: [NavigationItem,MessageService,ToastrService ,DialogService,{provide:HTTP_INTERCEPTORS , useClass:HttpInterceptorInterceptor , multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule {}
