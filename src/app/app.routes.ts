import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'auth',
        loadChildren: () => [
            { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
            { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) }
        ]
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart-page/cart-page.component').then(m => m.CartPageComponent)
    },
    {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('./features/orders/order-history/order-history.component').then(m => m.OrderHistoryComponent)
    },
    {
        path: 'admin',
        canActivate: [authGuard],
        canActivateChild: [() => import('./core/guards/admin.guard').then(m => m.adminGuard)],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/admin/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./features/admin/admin-inventory/admin-inventory.component').then(m => m.AdminInventoryComponent)
            },
            {
                path: 'subscribers',
                loadComponent: () => import('./features/admin/admin-subscribers/admin-subscribers.component').then(m => m.AdminSubscribersComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
