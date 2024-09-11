//Definimos una interfaz para los ingredientes de acuerdo a nuestro modelo de BD
export interface Ingredient {
  idingredients: string;
  name: string;
  extra: number;
  cost: number;
  stock: number;
  required: number;
}
/*Estas interfaces son útiles para tipar los datos. Al definir estas interfaces, se asegura que los objetos que representan ingredientes y productos tengan la estructura adecuada, lo que ayuda a prevenir errores de tipo y facilita el desarrollo y mantenimiento del código.*/
