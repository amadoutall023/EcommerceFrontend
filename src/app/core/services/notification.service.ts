import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    success(message: string, title: string = 'Succès') {
        this.toast.fire({
            icon: 'success',
            title: title,
            text: message
        });
    }

    error(message: string, title: string = 'Erreur') {
        this.toast.fire({
            icon: 'error',
            title: title,
            text: message
        });
    }

    warning(message: string, title: string = 'Attention') {
        this.toast.fire({
            icon: 'warning',
            title: title,
            text: message
        });
    }

    info(message: string, title: string = 'Information') {
        this.toast.fire({
            icon: 'info',
            title: title,
            text: message
        });
    }

    confirm(message: string, title: string = 'Êtes-vous sûr ?') {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0A1D2D', // brand-blue
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler'
        });
    }
}
