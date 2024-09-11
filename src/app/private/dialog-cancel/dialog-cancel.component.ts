import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { WebSocketsService } from '../../services/web-sockets.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { LocalstorageService } from '../../services/localstorage.service';


@Component({
  selector: 'app-dialog-cancel',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './dialog-cancel.component.html',
  styleUrl: './dialog-cancel.component.scss'
})
export class DialogCancelComponent {
  // Inyección de dependencias usando el método 'inject'
private dialog: MatDialog = inject(MatDialog);  // Servicio para manejar diálogos (modales)
private _data = inject(MAT_DIALOG_DATA);  // Inyecta los datos pasados al diálogo
private _provider: ProviderService = inject(ProviderService);  // Servicio para manejar solicitudes a la API
private _wsService: WebSocketsService = inject(WebSocketsService);  // Servicio para manejar WebSockets en tiempo real
private _snackBar: MatSnackBar = inject(MatSnackBar);  // Servicio para mostrar notificaciones (snack bars)
private _localStorage: LocalstorageService = inject(LocalstorageService);  // Servicio para manejar el almacenamiento local

// Método asíncrono que se ejecuta al inicializar el componente
async ngOnInit() {

  console.log(this._data);
}

// Método asíncrono para actualizar el estado de un pedido
async updateStatus() {
  // Verifica si la conexión WebSocket está activa
  if (this._wsService.socketStatus) {
    // Suscribe un evento que actualiza el estado del pedido después de que se cierra cualquier diálogo abierto
    this.dialog.afterAllClosed.subscribe(
      await this._provider.request('PUT', 'order/updateStatus', {
        "status": 4,  // Cambia el estado del pedido a "cancelado"
        "idorder": this._data.idorder,  // ID del pedido actual
        "users_idusers": this._localStorage.getItem('user').idusers  // ID del usuario que está actualizando el pedido
      })
    );

    // Muestra una notificación indicando que el pedido ha sido actualizado a "cancelado"
    this._snackBar.open("Pedido actualizado a cancelada", "", {duration: 3000, verticalPosition: 'top'});

    // Crea un objeto con el nuevo estado del pedido
    let nStatus: object = {
      "idorder": this._data.idorder,  // ID del pedido
      "client": this._data.client,  // Cliente que hizo el pedido
      "total": this._data.total,  // Total del pedido
      "mes": this._data.mes,  // Mes del pedido
      "comments": this._data.comments,  // Comentarios sobre el pedido
      "status": 4,  // Estado actualizado a "cancelado"
      "users_idusers": this._localStorage.getItem('user').iduser  // ID del usuario que actualiza el estado
    };

    console.log(nStatus);

    // Envía el nuevo estado del pedido a través de WebSockets
    this._wsService.request('comandas', nStatus);
  }
}

}
