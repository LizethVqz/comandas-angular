import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ContentObserver } from '@angular/cdk/observers';
import { ProviderService } from '../../services/provider.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { WebSocketsService } from '../../services/web-sockets.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { LocalstorageService } from '../../services/localstorage.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-view',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatFormFieldModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './order-view.component.html',
  styleUrl: './order-view.component.scss',
})
export class OrderViewComponent {
  // Inyección de servicios necesarios en el componente
private _provider: ProviderService = inject(ProviderService); // Servicio para manejar solicitudes a la API
private _router: Router = inject(Router); // Servicio para manejar la navegación
public _order: OrderService = inject(OrderService); // Servicio para manejar el pedido actual
private _wsService: WebSocketsService = inject(WebSocketsService); // Servicio para comunicaciones en tiempo real
private _snackBar: MatSnackBar = inject(MatSnackBar); // Servicio para mostrar mensajes emergentes (snackbars)
private _localStorage: LocalstorageService = inject(LocalstorageService); // Servicio para manejar el almacenamiento local

// Método asíncrono que se ejecuta cuando el componente se inicializa
async ngOnInit() {
  // Inicializar detalles del formulario
  // this.formDetails = this._order.formOrder.value;
}

// Filtra los ingredientes extra de un producto según el tipo (0 o 1)
filterExtras(item: any, type: 0 | 1) {
  return item.not_ingredient.filter(
    (ingredient: any) => ingredient.type == type
  );
}

// Calcula el total de los productos en el pedido
totalProducts() {
  return this.eachProduct()
    .value.map((product: any) => product.unit_price) // Extrae el precio unitario de cada producto
    .reduce((previous: number, current: number) => previous + current, 0); // Suma todos los precios
}

// Calcula el total de los ingredientes extra en el pedido
totalExtras() {
  return this.eachProduct()
    .value.map((product: any) =>
      product.not_ingredient
        .map((ingredient: any) => ingredient.price) // Extrae el precio de cada ingrediente extra
        .reduce((previous: number, current: number) => previous + current, 0) // Suma los precios de los ingredientes extra
    )
    .reduce((previous: number, current: number) => previous + current, 0); // Suma todos los totales de los ingredientes extra
}

// Calcula el total del pedido y actualiza el formulario con el nuevo total
totalOrder() {
  this._order.formOrder.controls['total'].patchValue(this.totalProducts() + this.totalExtras()); // Actualiza el total en el formulario
  return this.totalProducts() + this.totalExtras(); // Retorna el total del pedido
}

// Retorna el grupo de controles del formulario de la orden
radioForm() {
  return this._order.formOrder.controls['order_details'] as FormGroup;
}

// Retorna el arreglo de detalles del pedido del formulario
eachProduct() {
  return this._order.formOrder.controls['order_details'] as FormArray;
}

// Actualiza el tipo de pedido en todos los productos del formulario según el valor seleccionado en el radio button
selected(event: MatRadioChange) {
  this.eachProduct().controls.forEach((product: AbstractControl) => {
    const productAux: FormGroup = product as FormGroup;
    productAux.controls['order_type'].patchValue(event.value);
  });
}

// Método asíncrono para realizar el pedido
async placeOrder() {
  console.log(this._order.formOrder.value); // Muestra el valor del formulario en la consola
  
  // Establece el ID del usuario en el formulario de la orden
  this._order.formOrder.controls['users_idusers'].patchValue(this._localStorage.getItem('user').idusers);

  // Verifica si el formulario es válido y si la conexión WebSocket está activa
  if (this._order.formOrder.valid && this._wsService.socketStatus) {
    var data = await this._provider.request('POST', 'order/createOrder', this._order.formOrder.value); // Envía la solicitud para crear la orden
    
    if (data) {
      // Envía los datos del pedido a través de WebSockets para notificar a otros sistemas en tiempo real
      await this._wsService.request('comandas', data);
      
      // Muestra un mensaje emergente confirmando que la orden se realizó con éxito
      this._snackBar.open("Orden realizada", "", { duration: 3000, verticalPosition: 'top' });
      
      // Navega a la vista de órdenes
      this._router.navigate(['private/orders-view']);
      
      // Restablece el formulario y elimina los detalles del pedido
      this._order.formOrder.reset();
      while (this.orderDetailsArray().length !== 0) {
        this.orderDetailsArray().removeAt(0);
      }
    } else {
      // Muestra un mensaje emergente indicando que la orden no se realizó
      this._snackBar.open("No se realizó la orden", "", { duration: 3000, verticalPosition: 'top' });
    }
  } else {
    // Muestra un mensaje emergente indicando que no es posible realizar la orden
    this._snackBar.open("No es posible realizar la orden", "", { duration: 3000, verticalPosition: 'top' });
    
    // Añade una clase 'invalid' a los elementos de formulario no válidos para resaltar errores
    document.querySelectorAll('.ng-invalid, .mat-mdc-radio-group.unselect').forEach((element: Element) => element.classList.add('invalid'));
  }
}

// Retorna el arreglo de detalles del pedido desde el formulario
orderDetailsArray() {
  return this._order.formOrder.controls['order_details'] as FormArray;
}

// Elimina un producto del formulario basado en su índice
deleteProduct(index: number) {
  this.eachProduct().removeAt(index);
}

}
