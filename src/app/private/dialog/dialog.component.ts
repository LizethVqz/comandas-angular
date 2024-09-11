import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { ProviderService } from '../../services/provider.service';
import { WebSocketsService } from '../../services/web-sockets.service';
import { LocalstorageService } from '../../services/localstorage.service';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  // Inyección de dependencias usando el método 'inject'
private dialog: MatDialog = inject(MatDialog);  // Servicio para manejar diálogos (modales)
private _data = inject(MAT_DIALOG_DATA);  // Inyecta los datos pasados al diálogo
private _provider: ProviderService = inject(ProviderService);  // Servicio para manejar solicitudes a la API
private _wsService: WebSocketsService = inject(WebSocketsService);  // Servicio para manejar WebSockets en tiempo real
private _localStorage: LocalstorageService = inject(LocalstorageService);  // Servicio para manejar el almacenamiento local
private _snackBar: MatSnackBar = inject(MatSnackBar);  // Servicio para mostrar notificaciones (snack bars)

// Método asíncrono para abrir el detalle de un pedido
async openOrderDetails() {
  // Suscribe un evento que actualiza el estado del pedido después de que se cierra cualquier diálogo abierto
  this.dialog.afterAllClosed.subscribe(
    await this._provider.request('PUT', 'order/updateStatus', {
      "status": 1,  // Cambia el estado del pedido a "en proceso"
      "idorder": this._data.idorder,  // ID del pedido actual
      "users_idusers": this._localStorage.getItem('user').idusers  // ID del usuario que está actualizando el pedido
    })
  );

  // Muestra una notificación indicando que el pedido ha sido actualizado a "en proceso"
  this._snackBar.open("Pedido actualizado a en proceso", "", {duration: 3000, verticalPosition: 'top'});

  // Abre un nuevo diálogo que muestra los detalles del pedido
  this.dialog.open(OrderDetailComponent, {data: this._data});

  // Crea un objeto con el nuevo estado del pedido
  let nStatus: object = {
    "idorder": this._data.idorder,  // ID del pedido
    "client": this._data.client,  // Cliente que hizo el pedido
    "total": this._data.total,  // Total del pedido
    "mes": this._data.mes,  // Mes del pedido
    "comments": this._data.comments,  // Comentarios sobre el pedido
    "status": 1,  // Estado actualizado a "en proceso"
    "users_idusers": this._localStorage.getItem('user').idusers  // ID del usuario que actualiza el estado
  };
  console.error(nStatus);
  

  // Envía el nuevo estado del pedido a través de WebSockets
  await this._wsService.request('comandas', nStatus);
}

  
}
