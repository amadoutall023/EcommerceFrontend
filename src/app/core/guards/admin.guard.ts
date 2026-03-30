import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateChildFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        sessionStorage.setItem('redirectAfterLogin', state.url);
        return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
    }

    if (authService.isAdmin()) {
        return true;
    }

    return authService.ensureCurrentUserLoaded().pipe(
        map(user => user?.role === 'admin' ? true : router.createUrlTree(['/']))
    );
};
