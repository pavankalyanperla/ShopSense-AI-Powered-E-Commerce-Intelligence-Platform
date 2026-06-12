import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent],
  template: `
    @if (!isAdminRoute) {
      <app-header></app-header>
    }
    <main [style.min-height]="isAdminRoute ? '100vh' : 'calc(100vh - 180px)'">
      <router-outlet></router-outlet>
    </main>
    @if (!isAdminRoute) {
      <app-footer></app-footer>
    }
  `
})
export class AppComponent {
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute = e.url.startsWith('/admin');
      });
  }
}
