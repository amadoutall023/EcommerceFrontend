import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LucideAngularModule, ShoppingBag, ShoppingCart, User, LogOut, Menu, X, ChevronRight, ChevronDown, ChevronUp, History, Heart, Eye, Star, ArrowRight, ArrowUp, ArrowLeft, Quote, Instagram, MessageCircle, Music, Ghost, Image, Loader2, Truck, Pin, Clock, Phone } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(LucideAngularModule.pick({ ShoppingBag, ShoppingCart, User, LogOut, Menu, X, ChevronRight, ChevronDown, ChevronUp, History, Heart, Eye, Star, ArrowRight, ArrowUp, ArrowLeft, Quote, Instagram, MessageCircle, Music, Ghost, Image, Loader2, Truck, Pin, Clock, Phone }))
  ]
};
