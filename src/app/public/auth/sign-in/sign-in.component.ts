import { Component, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProviderService } from '../../../services/provider.service';
import { LocalstorageService } from '../../../services/localstorage.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailComponent } from '../../../private/order-detail/order-detail.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  // Inyección de dependencias utilizando el método 'inject'
  private _form_builder: FormBuilder = inject(FormBuilder);  // Inyección del servicio FormBuilder para crear formularios
  private _http: HttpClient = inject(HttpClient);  // Inyección del servicio HttpClient para realizar solicitudes HTTP
  private _router: Router = inject(Router);  // Inyección del servicio Router para la navegación
  private _provider: ProviderService = inject(ProviderService);  // Inyección del servicio ProviderService para manejar solicitudes a la API
  private _localstorage: LocalstorageService = inject(LocalstorageService);  // Inyección del servicio LocalstorageService para manejar el almacenamiento local
  private dialog: MatDialog = inject(MatDialog);  // Inyección del servicio MatDialog para abrir cuadros de diálogo
  private _snackBar: MatSnackBar = inject(MatSnackBar);  // Inyección del servicio MatSnackBar para mostrar notificaciones de tipo "snackbar"
  req: any;  // Variable para almacenar la respuesta de la solicitud de inicio de sesión

  // Creación de un grupo de formulario para el inicio de sesión utilizando FormBuilder
  form_signin: FormGroup = this._form_builder.group({
    name: [null, Validators.required],  // Campo 'name' con una validación que lo hace requerido
    password: [null, Validators.required]  // Campo 'password' con una validación que lo hace requerido
  })

  // Método asíncrono para manejar el proceso de inicio de sesión
  async signin() {
    // Verifica si el formulario es válido antes de proceder
    if (this.form_signin.valid) {
      // Hace una solicitud de inicio de sesión al servidor utilizando el servicio ProviderService
      this.req = await this._provider.request('POST', 'auth/signin', this.form_signin.value);
      console.log(this.req);
      
      // Guarda el objeto de usuario en el almacenamiento local
      this._localstorage.setItem('user', this.req);
      // Obtiene el rol del usuario desde el almacenamiento local
      const rol = this._localstorage.getItem('user').rol;
      
      // Redirige al usuario a la vista correspondiente según su rol
      switch (rol) {
        case 0:
          this._router.navigate(['private/menu']);  // Navega al menú privado
          break;
        case 1:
          this._router.navigate(['private/orders-view']);  // Navega a la vista de órdenes
          break;
        case 2:
          this._router.navigate(['private/chef-order-view']);  // Navega a la vista del chef
          this.actualOrder();  // Llama al método para abrir el pedido actual
          break;
        case 3:
          this._router.navigate(['private/menu']);  // Navega al menú privado
          break;
      }
    }
  }

  // Método asíncrono para manejar el pedido actual del usuario
  async actualOrder() {
    // Obtiene el pedido actual del usuario desde el almacenamiento local
    const orderExist = this._localstorage.getItem('user').actual_order;
    console.log(orderExist);
    
    // Si existe un pedido actual, abre el cuadro de diálogo con los detalles del pedido
    if (orderExist) {
      this.dialog.open(OrderDetailComponent, { data: { idorder: orderExist } });
    }
  }
}
