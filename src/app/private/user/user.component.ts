import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProviderService } from '../../services/provider.service';
import { PrivateComponent } from '../private.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebSocketsService } from '../../services/web-sockets.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  // Inyección de servicios necesarios en el componente
private _formbuilder: FormBuilder = inject(FormBuilder); // Servicio para construir formularios reactivos
private _provider: ProviderService = inject(ProviderService); // Servicio para manejar solicitudes a la API
private _snackBar: MatSnackBar = inject(MatSnackBar); // Servicio para mostrar mensajes emergentes
private _wsService: WebSocketsService = inject(WebSocketsService); // Servicio para comunicaciones en tiempo real
private _router: Router = inject(Router); // Servicio para la navegación entre rutas
private _activedRouter: ActivatedRoute = inject(ActivatedRoute); // Servicio para acceder a parámetros de la ruta activa

// Propiedad para almacenar el ID del usuario (se usa en ediciones y eliminaciones)
id: string = '';

// Opciones de roles para el usuario
roles = [
  { name: 'admin', value: 0 },
  { name: 'cajero', value: 1 },
  { name: 'cocinero', value: 2 },
  { name: 'cliente', value: 3 },
];

// Definición del formulario reactivo
formulario = this._formbuilder.group({
  idusers: [null],
  name: [null, [Validators.required]], // Nombre del usuario (campo obligatorio)
  password: [null, [Validators.required]], // Contraseña del usuario (campo obligatorio)
  phone: [null], // Teléfono del usuario (opcional)
  rol: [null, Validators.required], // Rol del usuario (campo obligatorio)
});

// Método asíncrono que se ejecuta al inicializar el componente
async ngOnInit() {
  // Si la URL contiene 'edit', se trata de una edición de usuario
  if (this._router.url.includes('edit')) {
    this._activedRouter.params.subscribe(async (params: Params) => {
      this.id = params['id']; // Obtiene el ID del parámetro de la URL
      console.log(this.id);
      
      // Obtiene los datos del usuario desde el servidor
      var user: any = (await this._provider.request('GET', 'user/viewUser', {idusers: this.id}) as any)[0];
      console.log(user);
      
      // Llenado del formulario con los datos del usuario
      this.formulario.patchValue(user);
    });
  }
}

// Método asíncrono para guardar o actualizar un usuario
async save() {
  console.log(this.formulario.value);

  // Si la URL contiene 'edit', se trata de una actualización de usuario
  if (this._router.url.includes('edit')) {
    if (this.formulario.valid && this._wsService.socketStatus) {
      var data = await this._provider.request('PUT', 'user/updateUser', this.formulario.value);
      
      if (data) {
        await this._wsService.request('usuarios', data);
        this._snackBar.open('Usuario Actualizado', '', {duration: 3000, verticalPosition: 'top'});
        this._router.navigate(['private/user-view']); // Navega a la vista de usuarios
        this.formulario.reset(); // Reinicia el formulario
      } else {
        this._snackBar.open('No es posible actualizar el usuario', '', {duration: 3000, verticalPosition: 'top'});
      }
    } else {
      this._snackBar.open('No es posible actualizar el usuario', '', {duration: 3000, verticalPosition: 'top'});
      document.querySelectorAll('.ng-invalid, .mat-mdc-radio-group.unselect').forEach((element: Element) => element.classList.add('invalid'));
    }
  } else { // Si la URL no contiene 'edit', se trata de una creación de usuario
    if (this.formulario.valid && this._wsService.socketStatus) {
      var data = await this._provider.request('POST', 'auth/signup', this.formulario.value);
      
      if (data) {
        await this._wsService.request('usuarios', data);
        this._snackBar.open('Usuario Creado', '', {duration: 3000, verticalPosition: 'top'});
        this._router.navigate(['private/user-view']); // Navega a la vista de usuarios
        this.formulario.reset(); // Reinicia el formulario
      } else {
        this._snackBar.open('No es posible crear el usuario', '', {duration: 3000, verticalPosition: 'top'});
      }
    } else {
      this._snackBar.open('No es posible crear el usuario', '', {duration: 3000, verticalPosition: 'top'});
      document.querySelectorAll('.ng-invalid, .mat-mdc-radio-group.unselect').forEach((element: Element) => element.classList.add('invalid'));
    }
  }
}

// Método asíncrono para eliminar un usuario
async deleteUser() {
  if (this._wsService.socketStatus) {
    var data = await this._provider.request('DELETE', 'user/deleteUser', {idusers: this.id});
    
    if (data) {
      await this._wsService.request('usuarios', data);
      this._snackBar.open('Usuario Eliminado', '', {duration: 3000, verticalPosition: 'top'});
      this._router.navigate(['private/user-view']); // Navega a la vista de usuarios
      this.formulario.reset(); // Reinicia el formulario
    } else {
      this._snackBar.open('No es posible eliminar el usuario', '', {duration: 3000, verticalPosition: 'top'});
    }
  } else {
    this._snackBar.open('No es posible eliminar el usuario', '', {duration: 3000, verticalPosition: 'top'});
    document.querySelectorAll('.ng-invalid, .mat-mdc-radio-group.unselect').forEach((element: Element) => element.classList.add('invalid'));
  }
}

}
