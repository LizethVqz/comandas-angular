import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { Router } from '@angular/router';
import { WebSocketsService } from '../../services/web-sockets.service';
import { LocalstorageService } from '../../services/localstorage.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent {
  // Inyección de dependencias usando el método 'inject'
private _data = inject(MAT_DIALOG_DATA); // Datos inyectados en el diálogo de Material Angular
private _provider: ProviderService = inject(ProviderService); // Servicio para manejar solicitudes a la API
public _router: Router = inject(Router); // Servicio para manejar la navegación
private _wsService: WebSocketsService = inject(WebSocketsService); // Servicio de WebSockets para comunicaciones en tiempo real
private _localStorage: LocalstorageService = inject(LocalstorageService); // Servicio para manejar datos en el almacenamiento local
private _snackBar: MatSnackBar = inject(MatSnackBar); // Servicio para mostrar mensajes emergentes (snackbars)

// Variable para almacenar los detalles de la orden
orderDetails: any = [];

// Método asíncrono que se ejecuta cuando el componente se inicializa
async ngOnInit() {
  console.log(this._data); 

  // Solicita los detalles de la orden desde la API y los almacena en la variable 'orderDetails'
  this.orderDetails = await this._provider.request('GET', 'order/viewOrder', { idorder: this._data.idorder });
  console.log(this.orderDetails); // Muestra los detalles de la orden en la consola
}

// Método asíncrono para actualizar el estado de la orden
async updateStatus() {
  // Actualiza el estado de la orden a "orden lista" (status 2) en la API
  await this._provider.request('PUT', 'order/updateStatus', { "status": 2, "idorder": this._data.idorder, "users_idusers": this._localStorage.getItem('user').idusers });

  // Muestra un mensaje emergente confirmando que la orden se actualizó
  this._snackBar.open("Pedido actualizado a orden lista", "", { duration: 3000, verticalPosition: 'top' });

  console.log(this._data); 

  // Crea un objeto con el nuevo estado de la orden y otra información relevante
  let nStatus: object = {
    "idorder": this._data.idorder,
    "client": this._data.client,
    "total": this._data.total,
    "mes": this.orderDetails[0].mes,
    "comments": this._data.comments,
    "status": 2,
    "users_idusers": this._localStorage.getItem('user').idusers
  };
  console.log(nStatus); 

  // Envía el nuevo estado de la orden a través de WebSockets para notificar a otros sistemas en tiempo real
  await this._wsService.request('comandas', nStatus);
}

}
