import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="flex justify-between items-end mb-12">
        <div>
          <h1 class="text-6xl font-black italic tracking-tighter uppercase mb-2">INVENTAIRE</h1>
          <p class="text-brand-brown font-bold text-xs tracking-widest uppercase">Stock & Produits</p>
        </div>
        <button 
          (click)="showModal.set(true); resetForm()"
          class="bg-brand-blue text-white px-8 py-4 font-black italic tracking-tighter text-xl hover:bg-brand-brown transition-colors uppercase"
        >
          Nouveau Produit +
        </button>
      </div>

      <div class="bg-white border border-brand-blue/5 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-brand-blue text-white uppercase text-[10px] tracking-[0.2em] font-black">
              <th class="px-6 py-4">Image</th>
              <th class="px-6 py-4">Nom</th>
              <th class="px-6 py-4">Catégorie</th>
              <th class="px-6 py-4">Prix</th>
              <th class="px-6 py-4">Stock</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-brand-blue/5">
            <tr *ngFor="let p of products()" class="hover:bg-brand-beige/20 transition-colors group">
              <td class="px-6 py-4">
                <div class="w-12 h-12 bg-gray-100 flex items-center justify-center overflow-hidden border border-brand-blue/10">
                  <img *ngIf="p.image_url" [src]="p.image_url" class="w-full h-full object-cover">
                  <lucide-angular *ngIf="!p.image_url" name="shopping-bag" class="w-4 h-4 text-gray-300"></lucide-angular>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="font-black italic tracking-tighter">{{ p.name }}</p>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest">{{ p.slug }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="bg-brand-beige px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{{ p.category_name }}</span>
              </td>
              <td class="px-6 py-4 font-bold">{{ p.price | currency:'XOF' }}</td>
              <td class="px-6 py-4">
                <span [class.text-red-600]="p.stock < 10" class="font-black italic">{{ p.stock }}</span>
              </td>
              <td class="px-6 py-4 text-right space-x-4">
                <button (click)="editProduct(p)" class="text-brand-blue hover:text-brand-brown transition-colors">
                  <lucide-angular name="menu" class="w-4 h-4 inline"></lucide-angular>
                </button>
                <button (click)="deleteProduct(p.id)" class="text-red-400 hover:text-red-700 transition-colors">
                  <lucide-angular name="x" class="w-4 h-4 inline"></lucide-angular>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Simple Product Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-brand-blue/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white max-w-xl w-full p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]">
          <button (click)="showModal.set(false)" class="absolute top-8 right-8 text-brand-blue hover:rotate-90 transition-transform">
             <lucide-angular name="x" class="w-8 h-8"></lucide-angular>
          </button>

          <h2 class="text-4xl font-black italic tracking-tighter mb-8 uppercase">
            {{ editingId() ? 'Modifier' : 'Nouveau' }} Produit
          </h2>

          <form (ngSubmit)="saveProduct()" class="space-y-6">
            <div class="mb-6">
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Image du produit</label>
              <div (click)="fileInput.click()" class="w-full aspect-video bg-brand-beige/30 border-2 border-dashed border-brand-blue/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors relative overflow-hidden">
                <img *ngIf="imagePreview()" [src]="imagePreview()" class="absolute inset-0 w-full h-full object-cover">
                <div *ngIf="!imagePreview()" class="text-center">
                  <lucide-angular name="shopping-cart" class="w-8 h-8 mx-auto mb-2 text-brand-blue/40"></lucide-angular>
                  <p class="text-[10px] font-black uppercase tracking-widest text-brand-blue/60">Cliquer pour uploader</p>
                </div>
              </div>
              <input #fileInput type="file" (change)="onFileSelected($event)" class="hidden" accept="image/*">
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Nom</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Slug</label>
                <input type="text" [(ngModel)]="formData.slug" name="slug" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold text-sm">
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Catégorie</label>
                <select [(ngModel)]="formData.category_id" name="category_id" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name | uppercase }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Prix (EUR)</label>
                <input type="number" [(ngModel)]="formData.price" name="price" required step="0.01" class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Prix original (EUR)</label>
                <input type="number" [(ngModel)]="formData.original_price" name="original_price" step="0.01" placeholder="Pour afficher la réduction" class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Stock</label>
                <input type="number" [(ngModel)]="formData.stock" name="stock" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
              <div>
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Tailles (séparées par virgule)</label>
                <input type="text" [(ngModel)]="formData.sizes" name="sizes" placeholder="S, M, L, XL" class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-black uppercase tracking-widest mb-2">Couleurs (séparées par virgule)</label>
                <input type="text" [(ngModel)]="formData.colors" name="colors" placeholder="Noir, Blanc, Bleu" class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
              </div>
            </div>

            <button type="submit" class="w-full bg-brand-blue text-white py-5 font-black text-xl italic tracking-tighter hover:bg-brand-brown transition-colors uppercase">
              Enregistrer
            </button>
          </form>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="mb-24 mt-24">
        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-4xl font-black italic tracking-tighter uppercase mb-2">CATÉGORIES</h2>
            <p class="text-brand-brown font-bold text-[10px] tracking-widest uppercase">Structure du catalogue</p>
          </div>
          <button 
            (click)="showCatModal.set(true); resetCatForm()"
            class="bg-brand-brown text-white px-6 py-3 font-black italic tracking-tighter text-sm hover:bg-brand-blue transition-colors uppercase"
          >
            Nouvelle Catégorie +
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div *ngFor="let cat of categories()" class="bg-white border border-brand-blue/10 p-0 flex justify-between items-center group overflow-hidden">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gray-100 flex-shrink-0">
                <img *ngIf="cat.image_url" [src]="cat.image_url" class="w-full h-full object-cover">
              </div>
              <div>
                <p class="font-black italic tracking-tighter uppercase leading-none">{{ cat.name }}</p>
                <p class="text-[9px] text-gray-400 uppercase tracking-widest">{{ cat.slug }}</p>
              </div>
            </div>
            <div class="flex space-x-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button (click)="editCategory(cat)" class="text-brand-blue hover:text-brand-brown">
                <lucide-angular name="menu" class="w-3 h-3"></lucide-angular>
              </button>
              <button (click)="deleteCategory(cat.id)" class="text-red-400 hover:text-red-700">
                <lucide-angular name="x" class="w-3 h-3"></lucide-angular>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Modal -->
      <div *ngIf="showCatModal()" class="fixed inset-0 bg-brand-blue/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white max-w-md w-full p-12 shadow-2xl relative">
          <button (click)="showCatModal.set(false)" class="absolute top-8 right-8 text-brand-blue hover:rotate-90 transition-transform">
             <lucide-angular name="x" class="w-8 h-8"></lucide-angular>
          </button>

          <h2 class="text-4xl font-black italic tracking-tighter mb-8 uppercase">
            {{ editingCatId() ? 'Modifier' : 'Nouvelle' }} Catégorie
          </h2>

          <form (ngSubmit)="saveCategory()" class="space-y-6">
            <div class="mb-6">
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Image de la catégorie</label>
              <div (click)="catFileInput.click()" class="w-full aspect-video bg-brand-beige/30 border-2 border-dashed border-brand-blue/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors relative overflow-hidden">
                <img *ngIf="catImagePreview()" [src]="catImagePreview()" class="absolute inset-0 w-full h-full object-cover">
                <div *ngIf="!catImagePreview()" class="text-center">
                  <lucide-angular name="image" class="w-8 h-8 mx-auto mb-2 text-brand-blue/40"></lucide-angular>
                  <p class="text-[10px] font-black uppercase tracking-widest text-brand-blue/60">Cliquer pour uploader</p>
                </div>
              </div>
              <input #catFileInput type="file" (change)="onCatFileSelected($event)" class="hidden" accept="image/*">
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Nom de la catégorie</label>
              <input type="text" [(ngModel)]="catFormData.name" name="cat_name" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Slug</label>
              <input type="text" [(ngModel)]="catFormData.slug" name="cat_slug" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold text-sm">
            </div>

            <button type="submit" class="w-full bg-brand-brown text-white py-5 font-black text-xl italic tracking-tighter hover:bg-brand-blue transition-colors uppercase">
              Enregistrer
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AdminInventoryComponent implements OnInit {
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  catImagePreview = signal<string | null>(null);
  selectedCatFile: File | null = null;

  formData = {
    name: '',
    slug: '',
    category_id: 0,
    price: 0,
    original_price: null as number | null,
    stock: 0,
    description: '',
    sizes: '',
    colors: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productService.getCatalog(undefined, undefined, true).subscribe(res => {
      this.products.set(res.products);
      this.categories.set(res.categories);
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onCatFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedCatFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.catImagePreview.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    this.editingId.set(null);
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.formData = {
      name: '',
      slug: '',
      category_id: this.categories()[0]?.id || 0,
      price: 0,
      original_price: null,
      stock: 0,
      description: '',
      sizes: '',
      colors: ''
    };
  }

  editProduct(p: Product) {
    this.editingId.set(p.id);
    this.imagePreview.set(p.image_url);
    this.selectedFile = null;
    this.formData = {
      name: p.name,
      slug: p.slug,
      category_id: p.category_id,
      price: p.price,
      original_price: p.original_price || null,
      stock: p.stock,
      description: p.description || '',
      sizes: p.sizes ? p.sizes.join(', ') : '',
      colors: p.colors ? p.colors.join(', ') : ''
    };
    this.showModal.set(true);
  }

  saveProduct() {
    const data = new FormData();
    Object.entries(this.formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        // Convert sizes/colors strings to JSON arrays
        if (key === 'sizes' || key === 'colors') {
          const arr = value.toString().split(',').map((s: string) => s.trim()).filter((s: string) => s);
          data.append(key, JSON.stringify(arr));
        } else {
          data.append(key, value.toString());
        }
      }
    });

    if (this.selectedFile) {
      data.append('image', this.selectedFile);
    }

    const obs = this.editingId()
      ? this.adminService.updateProduct(this.editingId()!, data)
      : this.adminService.createProduct(data);

    obs.subscribe({
      next: () => {
        this.showModal.set(false);
        this.loadData();
      },
      error: (err) => {
        const message = err.error?.message || 'Erreur lors de l\'enregistrement';
        let details = '';
        if (err.error?.details) {
          details = '<br>' + Object.values(err.error.details).flat().join('<br>');
        }
        this.notification.error(message + details, 'Erreur d\'enregistrement');
      }
    });
  }

  deleteProduct(id: number) {
    this.notification.confirm('Souhaitez-vous vraiment supprimer ce produit ?').then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteProduct(id).subscribe(() => {
          this.loadData();
          this.notification.success('Produit supprimé avec succès');
        });
      }
    });
  }

  // Category Management
  showCatModal = signal(false);
  editingCatId = signal<number | null>(null);
  catFormData = { name: '', slug: '' };

  resetCatForm() {
    this.editingCatId.set(null);
    this.catImagePreview.set(null);
    this.selectedCatFile = null;
    this.catFormData = { name: '', slug: '' };
  }

  editCategory(cat: Category) {
    this.editingCatId.set(cat.id);
    this.catImagePreview.set(cat.image_url || null);
    this.selectedCatFile = null;
    this.catFormData = { name: cat.name, slug: cat.slug };
    this.showCatModal.set(true);
  }

  saveCategory() {
    const data = new FormData();
    data.append('name', this.catFormData.name);
    data.append('slug', this.catFormData.slug);
    if (this.selectedCatFile) {
      data.append('image', this.selectedCatFile);
    }

    const obs = this.editingCatId()
      ? this.adminService.updateCategory(this.editingCatId()!, data)
      : this.adminService.createCategory(data);

    obs.subscribe(() => {
      this.showCatModal.set(false);
      this.loadData();
    });
  }

  deleteCategory(id: number) {
    this.notification.confirm('Supprimer cette catégorie ? Tous les produits associés seront affectés.').then(result => {
      if (result.isConfirmed) {
        this.adminService.deleteCategory(id).subscribe(() => {
          this.loadData();
          this.notification.success('Catégorie supprimée avec succès');
        });
      }
    });
  }
}
