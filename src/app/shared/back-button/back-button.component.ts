import { CommonModule, Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-3 border border-brand-blue/15 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-brand-blue shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-blue hover:bg-brand-blue hover:text-white"
      (click)="goBack()"
    >
      <lucide-angular name="arrow-left" class="h-4 w-4"></lucide-angular>
      <span>{{ label() }}</span>
    </button>
  `
})
export class BackButtonComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly fallbackUrl = input<string>('/');
  readonly label = input('Retour');

  protected goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigateByUrl(this.fallbackUrl());
  }
}
