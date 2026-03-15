import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})




export class AppComponent {

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
    this.translate.use(currentLang);

    const activeLang = this.translate.currentLang;
    const dir = activeLang === 'ar' ? 'rtl' : 'ltr';

    this.document.documentElement.lang = activeLang;
    this.document.documentElement.dir = dir;
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    const token = localStorage.getItem('token');
    const currentUrl = this.router.url;

    // Prevent back to login if already authenticated
    if (currentUrl === '/default') {
      this.router.navigate(['/default'], { replaceUrl: true });
    }
  }
}

// export class AppComponent {

//   constructor(private translate: TranslateService ,@Inject(DOCUMENT) private document: Document) {
//     const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
//     this.translate.use(currentLang);
//     let activeLang= this.translate.currentLang
//         // Update the direction
//         const dir = activeLang === 'ar' ? 'rtl' : 'ltr';
//         this.document.documentElement.lang = activeLang;
//         this.document.documentElement.dir = dir;


//   }

// }
