import { Component, ViewChild, inject, viewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProviderService } from '../../services/provider.service';
import { Product } from '../../interfaces/product.model';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { CurrencyPipe, KeyValuePipe, NgClass, NgStyle } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Ingredient } from '../../interfaces/ingredient.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrderService } from '../../services/order.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    KeyValuePipe,
    MatSelectModule,
    MatCheckboxModule,
    NgStyle,
    CurrencyPipe,
    NgClass,
    RouterLink,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  // Inyección de dependencias usando el método 'inject'
  private _provider: ProviderService = inject(ProviderService); // Servicio para manejar solicitudes a la API
  private _form_builder: FormBuilder = inject(FormBuilder); // Servicio para construir formularios reactivos
  public _order: OrderService = inject(OrderService); // Servicio para manejar órdenes de pedido

  // Decorador para obtener una referencia al componente MatDrawer (barra lateral de comentarios)
  @ViewChild('barraComentarios') barraComentarios!: MatDrawer;

  // Array para almacenar el menú de productos
  menu: Product[] = [];

  // Método asíncrono que se ejecuta cuando el componente se inicializa
  async ngOnInit() {
    // Solicita el menú de ingredientes desde la API y lo almacena en la variable 'menu'
    this.menu = await this._provider.request('GET', 'menu/viewIngredients');
    console.log(this.menu);

    // Escucha los cambios en el campo 'order_details' del formulario de la orden. Si no hay detalles, cierra la barra de comentarios.
    this._order.formOrder.controls['order_details'].valueChanges.subscribe(
      (value: any) => {
        if (!value.length) this.barraComentarios.close();
      }
    );

    console.log(this.orderDetailsArray().value);

    // Si hay detalles en la orden y la orden no está vacía, abre la barra de comentarios.
    if (this.orderDetailsArray().value.length && !this.orderEmpty()) {
      this.barraComentarios.open();
    }
  }

  // Filtra productos por categoría
  filterByCategory(id_category: string): Product[] {
    // Filtra el menú para obtener los productos que pertenecen a la categoría especificada
    return this.menu.filter(
      (product: Product) => product.category_idcategory == id_category
    );
  }

  // Filtra un producto por su ID
  filterByProduct(id_product: string): Product {
    // Busca un producto en el menú por su ID. Si no lo encuentra, devuelve un objeto vacío.
    return (
      this.menu.find((product: Product) => product.idproducts == id_product) ||
      ({} as Product)
    );
  }

  // Filtra ingredientes según tipo (requeridos o extra) y cantidad de productos seleccionados
  filterByIngredient(
    key: 'required' | 'extra',
    value: 0 | 1,
    ingredients: Ingredient[] | undefined,
    idproduct: string,
    amount: number
  ): Ingredient[] | undefined {
    const type = value == 0 ? 1 : 0;
    // Filtra los ingredientes que coinciden con los criterios especificados, excluyendo aquellos que no deben ser considerados.
    return ingredients?.filter(
      (ingredient: Ingredient) =>
        ingredient[key] == value &&
        !this.filterExtraExceptions(idproduct, amount, type).includes(
          ingredient.idingredients
        )
    );
  }

  // Agrega un producto a la orden y abre la barra de comentarios
  addProduct(
    products_idproducts: string,
    price: number,
    name: string,
    name_category: string
  ) {
    this.barraComentarios.open();
    // Agrega un nuevo producto al array de detalles de la orden en el formulario
    (this._order.formOrder.controls['order_details'] as FormArray).push(
      this._order.orderDetails(products_idproducts, price, name, name_category)
    );
    console.log(this._order.formOrder.value);
  }

  // Elimina un producto de la orden
  removeProduct(idproduct: string) {
    console.log(idproduct);
    // Encuentra el índice del producto en el array de detalles de la orden y lo elimina
    const index = this._order.formOrder.controls[
      'order_details'
    ].value.findIndex(
      (product: any) => product.products_idproducts == idproduct
    );
    if (index != -1)
      (this._order.formOrder.controls['order_details'] as FormArray).removeAt(
        index
      );
    console.log(this._order.formOrder.value);
  }

  // Agrega o elimina un ingrediente de un producto en la orden
  addIngredient(
    idproduct: string,
    idingredient: string,
    type: 0 | 1,
    event: any,
    amount: number,
    name: string,
    price: number
  ) {
    // Encuentra el índice del producto en los detalles de la orden
    const index = this._order.formOrder.controls[
      'order_details'
    ].value.findIndex(
      (product: any) =>
        product.products_idproducts == idproduct && product.amount == amount
    );
    if (event) {
      // Agrega el ingrediente a la lista de ingredientes no incluidos (not_ingredient)
      (
        (
          (this._order.formOrder.controls['order_details'] as FormArray).at(
            index
          ) as FormGroup
        ).controls['not_ingredient'] as FormArray
      ).push(this._order.notIngredients(idingredient, type, name, price));
    } else {
      // Elimina el ingrediente de la lista de ingredientes no incluidos
      const indexIngredient = (
        (this._order.formOrder.controls['order_details'] as FormArray).at(
          index
        ) as FormGroup
      ).controls['not_ingredient'].value.findIndex(
        (ingredient: any) =>
          ingredient.ingredients_idingredients == idingredient
      );
      if (indexIngredient != -1)
        (
          (
            (this._order.formOrder.controls['order_details'] as FormArray).at(
              index
            ) as FormGroup
          ).controls['not_ingredient'] as FormArray
        ).removeAt(indexIngredient);
    }
  }

  // Filtra los ingredientes que no deben ser incluidos en un producto específico
  filterExtraExceptions(
    idproduct: string,
    amount: number,
    type: 0 | 1
  ): string[] {
    const index = this._order.formOrder.controls[
      'order_details'
    ].value.findIndex(
      (product: any) =>
        product.products_idproducts == idproduct && product.amount == amount
    );
    // Retorna una lista de IDs de ingredientes que coinciden con el tipo especificado y no deben ser incluidos
    return (
      (
        (this._order.formOrder.controls['order_details'] as FormArray).at(
          index
        ) as FormGroup
      ).controls['not_ingredient'] as FormArray
    ).value
      .filter((ingredient: any) => ingredient.type == type)
      .map((ingredient: any) => ingredient.ingredients_idingredients);
  }

  // Devuelve la cantidad de productos seleccionados con un ID específico
  amount(id: string): number {
    return this._order.formOrder.controls['order_details'].value.filter(
      (product: any) => product.products_idproducts == id
    ).length;
  }

  // Devuelve el array de detalles de la orden en el formulario
  orderDetailsArray() {
    return this._order.formOrder.controls['order_details'] as FormArray;
  }

  // Verifica si un ingrediente ya ha sido seleccionado para un producto específico
  ingredientsSelected(index: number, type: 0 | 1, name: string) {
    return (
      (this.orderDetailsArray().at(index) as FormGroup)?.controls[
        'not_ingredient'
      ] as FormArray
    )?.value
      ?.map((ingredientSelected: any) => {
        if (ingredientSelected.type == type) return ingredientSelected.name;
        return;
      })
      .filter((id: any) => id != undefined)
      .includes(name);
  }

  // Verifica si la orden está vacía
  orderEmpty() {
    return this.orderDetailsArray()
      .value.map((order: any) => Object.values(order))
      .flat()
      .filter((item: any) => !Array.isArray(item))
      .every((item: any) => item == null);
  }
}
