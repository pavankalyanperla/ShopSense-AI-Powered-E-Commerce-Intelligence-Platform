import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="ss-footer">
      <div class="ss-footer-inner">
        <!-- Brand section -->
        <div class="ss-footer-brand">
          <div class="ss-footer-logo">
            <span class="ss-logo-icon-sm">S</span>
            <span class="font-bold text-white text-lg">ShopSense</span>
          </div>
          <p class="text-sm mt-2 mb-0" style="color: rgba(255, 255, 255, 0.6)">
            AI-Powered E-Commerce Intelligence Platform
          </p>
          <p class="text-xs mt-1 mb-0" style="color: rgba(255, 255, 255, 0.4)">
            Serving Indian customers with smart shopping
          </p>
        </div>

        <!-- Footer columns -->
        <div class="ss-footer-cols">
          <div *ngFor="let col of footerCols">
            <p class="ss-footer-col-title">{{ col.title }}</p>
            <ul class="ss-footer-links">
              <li *ngFor="let link of col.links">
                <a [routerLink]="link.route" class="ss-footer-link">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="ss-footer-bottom">
        <span>© 2026 ShopSense. Built with ❤️ in India</span>
        <div class="ss-payment-icons">
          <span class="ss-pay-badge">UPI</span>
          <span class="ss-pay-badge">COD</span>
          <span class="ss-pay-badge">Cards</span>
          <span class="ss-pay-badge">NetBanking</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .ss-footer {
        background: var(--ss-brand-blue);
        margin-top: 3rem;
      }

      .ss-footer-inner {
        display: flex;
        gap: 3rem;
        padding: 2.5rem 1.5rem;
        max-width: 1280px;
        margin: 0 auto;
        flex-wrap: wrap;
      }

      .ss-footer-brand {
        min-width: 200px;
      }

      .ss-logo-icon-sm {
        display: inline-flex;
        width: 28px;
        height: 28px;
        background: #fff;
        border-radius: 6px;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: var(--ss-brand-blue);
        font-size: 0.9rem;
        margin-right: 0.4rem;
      }

      .ss-footer-cols {
        flex: 1;
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .ss-footer-col-title {
        color: #fff;
        font-weight: 600;
        font-size: 0.875rem;
        margin: 0 0 0.75rem;
      }

      .ss-footer-links {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .ss-footer-link {
        color: rgba(255, 255, 255, 0.65);
        text-decoration: none;
        font-size: 0.8rem;
        line-height: 2;
        display: block;
      }

      .ss-footer-link:hover {
        color: #fff;
      }

      .ss-footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.75rem;
        max-width: 1280px;
        margin: 0 auto;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .ss-payment-icons {
        display: flex;
        gap: 0.5rem;
      }

      .ss-pay-badge {
        background: rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.8);
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 500;
      }
    `
  ]
})
export class FooterComponent {
  footerCols = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', route: '/customer/products' },
        { label: 'Electronics', route: '/customer/products' },
        { label: 'Fashion', route: '/customer/products' },
        { label: 'Books', route: '/customer/products' }
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'My Orders', route: '/customer/orders' },
        { label: 'Wishlist', route: '/customer/wishlist' },
        { label: 'My Reviews', route: '/customer/reviews' },
        { label: 'Profile', route: '/customer/profile' }
      ]
    },
    {
      title: 'Sell',
      links: [
        { label: 'Become a Seller', route: '/seller/dashboard' },
        { label: 'KYC Verification', route: '/seller/kyc' },
        { label: 'AI Listing Coach', route: '/seller/listing-coach' },
        { label: 'Seller Dashboard', route: '/seller/dashboard' }
      ]
    },
    {
      title: 'Help',
      links: [
        { label: 'Returns & Refunds', route: '/home' },
        { label: 'Shipping Policy', route: '/home' },
        { label: 'Privacy Policy', route: '/home' },
        { label: 'Terms of Service', route: '/home' }
      ]
    }
  ];
}
