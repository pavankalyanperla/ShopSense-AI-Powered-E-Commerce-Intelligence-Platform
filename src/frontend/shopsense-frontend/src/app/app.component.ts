import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main style="min-height: calc(100vh - 180px)">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class AppComponent {}
