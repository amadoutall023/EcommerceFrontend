import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <footer class="bg-brand-blue text-white py-16 border-t border-white/10 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="col-span-1 md:col-span-2">
            <img src="/TATREND1.PNG" alt="TATREND Logo" class="h-16 w-auto mb-6 opacity-90">
            <p class="text-gray-300 max-w-sm mb-8 italic">
              Votre destination mode premium. Qualité exceptionnelle, designs intemporels et service client dédié.
            </p>
            <div class="flex space-x-6">
              <!-- Instagram Business -->
              <a href="https://instagram.com/pape_amdou_tall03" target="_blank" class="text-brand-beige hover:text-white transition-all transform hover:scale-110" title="Instagram Business">
                <lucide-angular name="instagram" class="w-6 h-6"></lucide-angular>
              </a>
              <!-- Instagram Personal -->
              <a href="https://instagram.com/el_hadj_amdou_tall" target="_blank" class="text-brand-beige hover:text-white transition-all transform hover:scale-110" title="Instagram Personnel">
                <lucide-angular name="user" class="w-6 h-6"></lucide-angular>
              </a>
              <!-- Snapchat -->
              <a href="https://www.snapchat.com/add/papatall5" target="_blank" class="text-brand-beige hover:text-white transition-all transform hover:scale-110" title="Snapchat">
                <lucide-angular name="ghost" class="w-6 h-6"></lucide-angular>
              </a>
              <!-- WhatsApp -->
              <a href="https://wa.me/221784541151" target="_blank" class="text-brand-beige hover:text-white transition-all transform hover:scale-110" title="WhatsApp">
                <lucide-angular name="message-circle" class="w-6 h-6"></lucide-angular>
              </a>
              <!-- TikTok -->
              <a href="https://tiktok.com/@tatrend023" target="_blank" class="text-brand-beige hover:text-white transition-all transform hover:scale-110" title="TikTok">
                <lucide-angular name="music" class="w-6 h-6"></lucide-angular>
              </a>
            </div>
          </div>
          <div>
            <h4 class="text-lg font-bold mb-6 text-brand-beige uppercase tracking-widest">Aide</h4>
            <ul class="space-y-3 text-gray-300 font-medium">
              <li><a href="#" class="hover:text-white transition-colors">Livraison</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Retours</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-bold mb-6 text-brand-beige uppercase tracking-widest">Légal</h4>
            <ul class="space-y-3 text-gray-300 font-medium">
              <li><a href="#" class="hover:text-white transition-colors">Confidentialité</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Conditions</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-white/10 mt-16 pt-8 text-center">
          <p class="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
            &copy; {{ currentYear }} TATREND. TOUS DROITS RÉSERVÉS.
          </p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
