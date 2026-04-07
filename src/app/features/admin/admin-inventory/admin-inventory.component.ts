import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, BackButtonComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
      <app-back-button fallbackUrl="/admin" label="Retour dashboard" class="mb-6 block"></app-back-button>
      <div class="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-brown sm:text-xs">Stock & Produits</p>
          <h1 class="text-3xl font-black italic tracking-tighter uppercase sm:text-5xl lg:text-6xl">Inventaire</h1>
        </div>
        <button 
          (click)="showModal.set(true); resetForm()"
          class="w-full bg-brand-blue px-6 py-4 text-center text-base font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-brand-brown sm:w-auto sm:px-8 sm:text-xl"
        >
          Nouveau Produit +
        </button>
      </div>

      <div class="mb-6 border border-brand-blue/10 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="w-full lg:max-w-xl">
            <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-brand-brown">Recherche Produits</label>
            <input
              type="text"
              [ngModel]="productSearch()"
              (ngModelChange)="updateProductSearch($event)"
              placeholder="Nom, slug ou categorie"
              class="w-full border border-brand-blue/10 bg-brand-beige/20 px-4 py-3 font-bold text-brand-blue outline-none transition-colors focus:border-brand-blue"
            >
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
            {{ filteredProducts().length }} produit(s) • page {{ productPage() }} / {{ totalProductPages() }}
          </p>
        </div>
      </div>

      <div class="space-y-4 lg:hidden">
        <div *ngFor="let p of paginatedProducts()" class="border border-brand-blue/10 bg-white p-4 shadow-sm">
          <div class="flex items-start gap-4">
            <div class="h-20 w-20 flex-shrink-0 overflow-hidden border border-brand-blue/10 bg-gray-100">
              <img *ngIf="p.image_url" [src]="p.image_url" class="h-full w-full object-cover">
              <lucide-angular *ngIf="!p.image_url" name="shopping-bag" class="m-auto h-5 w-5 text-gray-300"></lucide-angular>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-lg font-black italic tracking-tighter">{{ p.name }}</p>
              <p class="mt-1 text-[10px] uppercase tracking-[0.24em] text-gray-400">{{ p.slug }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="bg-brand-beige px-2 py-1 text-[10px] font-bold uppercase tracking-widest">{{ p.category_name }}</span>
                <span class="bg-brand-blue/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">Stock: {{ p.stock }}</span>
              </div>
              <p class="mt-3 text-base font-black italic text-brand-blue">{{ p.price | currency:'XOF' }}</p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <button (click)="editProduct(p)" class="border border-brand-blue px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white">
              Modifier
            </button>
            <button (click)="deleteProduct(p.id)" class="border border-red-300 px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-red-500 transition-colors hover:bg-red-500 hover:text-white">
              Supprimer
            </button>
          </div>
        </div>

        <div *ngIf="filteredProducts().length === 0" class="border border-dashed border-brand-blue/20 bg-white px-6 py-12 text-center">
          <p class="text-lg font-black italic tracking-tighter uppercase text-brand-blue/30">Aucun produit trouve</p>
        </div>
      </div>

      <div class="hidden overflow-hidden border border-brand-blue/5 bg-white lg:block">
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
            <tr *ngFor="let p of paginatedProducts()" class="hover:bg-brand-beige/20 transition-colors group">
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

        <div *ngIf="filteredProducts().length === 0" class="px-6 py-16 text-center">
          <p class="text-2xl font-black italic tracking-tighter uppercase text-brand-blue/20">Aucun produit trouve</p>
        </div>
      </div>

      <div *ngIf="filteredProducts().length > 0" class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
          Affichage {{ productRangeStart() }}-{{ productRangeEnd() }} sur {{ filteredProducts().length }} produits
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="changeProductPage(-1)"
            [disabled]="productPage() === 1"
            class="border border-brand-blue/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Precedent
          </button>
          <span class="px-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-blue">
            {{ productPage() }} / {{ totalProductPages() }}
          </span>
          <button
            type="button"
            (click)="changeProductPage(1)"
            [disabled]="productPage() === totalProductPages()"
            class="border border-brand-blue/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
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
      <div class="mb-24 mt-16 sm:mt-24">
        <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-4xl font-black italic tracking-tighter uppercase mb-2">CATÉGORIES</h2>
            <p class="text-brand-brown font-bold text-[10px] tracking-widest uppercase">Structure du catalogue</p>
          </div>
          <button 
            (click)="showCatModal.set(true); resetCatForm()"
            class="w-full bg-brand-brown px-6 py-3 text-center text-sm font-black italic uppercase tracking-tighter text-white transition-colors hover:bg-brand-blue sm:w-auto"
          >
            Nouvelle Catégorie +
          </button>
        </div>

        <div class="mb-6 border border-brand-blue/10 bg-white p-4 sm:p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="w-full lg:max-w-xl">
              <label class="mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-brand-brown">Recherche Categories</label>
              <input
                type="text"
                [ngModel]="categorySearch()"
                (ngModelChange)="updateCategorySearch($event)"
                placeholder="Nom ou slug"
                class="w-full border border-brand-blue/10 bg-brand-beige/20 px-4 py-3 font-bold text-brand-blue outline-none transition-colors focus:border-brand-blue"
              >
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
              {{ filteredCategories().length }} categorie(s) • page {{ categoryPage() }} / {{ totalCategoryPages() }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div *ngFor="let cat of paginatedCategories()" class="group overflow-hidden border border-brand-blue/10 bg-white">
            <div class="flex items-center justify-between gap-3 p-3">
              <div class="flex min-w-0 items-center gap-4">
                <div class="h-16 w-16 flex-shrink-0 bg-gray-100">
                  <img *ngIf="cat.image_url" [src]="cat.image_url" class="w-full h-full object-cover">
                  <lucide-angular *ngIf="!cat.image_url" name="image" class="m-auto h-5 w-5 text-gray-300"></lucide-angular>
                </div>
                <div class="min-w-0">
                  <p class="font-black italic tracking-tighter uppercase leading-none">{{ cat.name }}</p>
                  <p class="mt-1 text-[9px] text-gray-400 uppercase tracking-widest">{{ cat.slug }}</p>
                </div>
              </div>
              <div class="flex flex-col gap-2 sm:flex-row sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <button (click)="editCategory(cat)" class="border border-brand-blue/20 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-brand-blue hover:border-brand-blue hover:bg-brand-blue hover:text-white">
                  Editer
                </button>
                <button (click)="deleteCategory(cat.id)" class="border border-red-200 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-500 hover:bg-red-500 hover:text-white">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredCategories().length === 0" class="border border-dashed border-brand-blue/20 bg-white px-6 py-12 text-center">
          <p class="text-lg font-black italic tracking-tighter uppercase text-brand-blue/30">Aucune categorie trouvee</p>
        </div>

        <div *ngIf="filteredCategories().length > 0" class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
            Affichage {{ categoryRangeStart() }}-{{ categoryRangeEnd() }} sur {{ filteredCategories().length }} categories
          </p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="changeCategoryPage(-1)"
              [disabled]="categoryPage() === 1"
              class="border border-brand-blue/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Precedent
            </button>
            <span class="px-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-blue">
              {{ categoryPage() }} / {{ totalCategoryPages() }}
            </span>
            <button
              type="button"
              (click)="changeCategoryPage(1)"
              [disabled]="categoryPage() === totalCategoryPages()"
              class="border border-brand-blue/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue transition-colors hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Category Modal -->
      <div *ngIf="showCatModal()" class="fixed inset-0 bg-brand-blue/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div class="bg-white max-w-md w-full p-8 sm:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button (click)="showCatModal.set(false)" class="absolute top-8 right-8 text-brand-blue hover:rotate-90 transition-transform">
             <lucide-angular name="x" class="w-8 h-8"></lucide-angular>
          </button>

          <h2 class="text-4xl font-black italic tracking-tighter mb-8 uppercase">
            {{ editingCatId() ? 'Modifier' : 'Nouvelle' }} Catégorie
          </h2>

          <form (ngSubmit)="saveCategory()" class="space-y-6">
            <div class="mb-6">
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Image de la catégorie</label>
              <label for="category-image-input" class="block w-full aspect-video bg-brand-beige/30 border-2 border-dashed border-brand-blue/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors relative overflow-hidden">
                <img *ngIf="catImagePreview()" [src]="catImagePreview()" class="absolute inset-0 w-full h-full object-cover">
                <div *ngIf="!catImagePreview()" class="text-center">
                  <lucide-angular name="image" class="w-8 h-8 mx-auto mb-2 text-brand-blue/40"></lucide-angular>
                  <p class="text-[10px] font-black uppercase tracking-widest text-brand-blue/60">Cliquer pour uploader</p>
                </div>
              </label>
              <input id="category-image-input" #catFileInput type="file" (change)="onCatFileSelected($event)" class="sr-only" accept="image/*">
              <p *ngIf="selectedCatFile" class="mt-2 text-[10px] font-bold uppercase tracking-widest text-brand-blue/60">
                {{ selectedCatFile.name }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-black uppercase tracking-widest mb-2">Nom de la catégorie</label>
              <input type="text" [(ngModel)]="catFormData.name" name="cat_name" required class="w-full bg-brand-beige/30 border-2 border-transparent focus:border-brand-blue outline-none px-4 py-3 font-bold">
            </div>

            <button type="submit" [disabled]="isSavingCategory()" class="w-full bg-brand-brown text-white py-5 font-black text-xl italic tracking-tighter hover:bg-brand-blue transition-colors uppercase disabled:cursor-not-allowed disabled:opacity-60">
              {{ isSavingCategory() ? 'Enregistrement...' : 'Enregistrer' }}
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
  productSearch = signal('');
  categorySearch = signal('');
  productPage = signal(1);
  categoryPage = signal(1);
  readonly productPageSize = 8;
  readonly categoryPageSize = 8;
  showModal = signal(false);
  editingId = signal<number | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  catImagePreview = signal<string | null>(null);
  selectedCatFile: File | null = null;
  isSavingCategory = signal(false);

  filteredProducts = computed(() => {
    const query = this.productSearch().trim().toLowerCase();
    if (!query) {
      return this.products();
    }

    return this.products().filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query) ||
      product.category_name.toLowerCase().includes(query)
    );
  });

  totalProductPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.productPageSize)));

  paginatedProducts = computed(() => {
    const start = (this.productPage() - 1) * this.productPageSize;
    return this.filteredProducts().slice(start, start + this.productPageSize);
  });

  filteredCategories = computed(() => {
    const query = this.categorySearch().trim().toLowerCase();
    if (!query) {
      return this.categories();
    }

    return this.categories().filter(category =>
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  totalCategoryPages = computed(() => Math.max(1, Math.ceil(this.filteredCategories().length / this.categoryPageSize)));

  paginatedCategories = computed(() => {
    const start = (this.categoryPage() - 1) * this.categoryPageSize;
    return this.filteredCategories().slice(start, start + this.categoryPageSize);
  });

  formData = {
    name: '',
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
      this.productPage.set(1);
      this.categoryPage.set(1);
    });
  }

  updateProductSearch(value: string) {
    this.productSearch.set(value);
    this.productPage.set(1);
  }

  updateCategorySearch(value: string) {
    this.categorySearch.set(value);
    this.categoryPage.set(1);
  }

  changeProductPage(direction: number) {
    const nextPage = this.productPage() + direction;
    this.productPage.set(Math.min(Math.max(1, nextPage), this.totalProductPages()));
  }

  changeCategoryPage(direction: number) {
    const nextPage = this.categoryPage() + direction;
    this.categoryPage.set(Math.min(Math.max(1, nextPage), this.totalCategoryPages()));
  }

  productRangeStart() {
    if (this.filteredProducts().length === 0) {
      return 0;
    }

    return (this.productPage() - 1) * this.productPageSize + 1;
  }

  productRangeEnd() {
    return Math.min(this.productPage() * this.productPageSize, this.filteredProducts().length);
  }

  categoryRangeStart() {
    if (this.filteredCategories().length === 0) {
      return 0;
    }

    return (this.categoryPage() - 1) * this.categoryPageSize + 1;
  }

  categoryRangeEnd() {
    return Math.min(this.categoryPage() * this.categoryPageSize, this.filteredCategories().length);
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
  catFormData = { name: '' };

  resetCatForm() {
    this.editingCatId.set(null);
    this.catImagePreview.set(null);
    this.selectedCatFile = null;
    this.catFormData = { name: '' };
  }

  editCategory(cat: Category) {
    this.editingCatId.set(cat.id);
    this.catImagePreview.set(cat.image_url || null);
    this.selectedCatFile = null;
    this.catFormData = { name: cat.name };
    this.showCatModal.set(true);
  }

  saveCategory() {
    if (!this.editingCatId() && !this.selectedCatFile) {
      this.notification.warning('Ajoute une image pour la nouvelle catégorie.');
      return;
    }

    const data = new FormData();
    data.append('name', this.catFormData.name);
    if (this.selectedCatFile) {
      data.append('image', this.selectedCatFile);
    }

    this.isSavingCategory.set(true);

    const obs = this.editingCatId()
      ? this.adminService.updateCategory(this.editingCatId()!, data)
      : this.adminService.createCategory(data);

    obs.subscribe({
      next: () => {
        this.showCatModal.set(false);
        this.resetCatForm();
        this.loadData();
        this.notification.success('Catégorie enregistrée avec succès');
      },
      error: (err) => {
        const details = err.error?.details
          ? Object.values(err.error.details).flat().join(' ')
          : '';
        const message = details || err.error?.message || 'Erreur lors de l\'enregistrement de la catégorie';
        this.notification.error(message, 'Erreur catégorie');
        this.isSavingCategory.set(false);
      },
      complete: () => {
        this.isSavingCategory.set(false);
      }
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
