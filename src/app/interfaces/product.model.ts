//Importamos la interfaz de ingredientes
import { Ingredient } from "./ingredient.model";
//Definimos la interfaz de producto y declaramos los ingredientes del tipo Ingredient que es nuestra interfaz que importamos.
export interface Product {
  idproducts: string;
  name: string;
  price: number;
  description: string;
  category_idcategory: string;
  name_category:string;
  ingredients: Ingredient[]
}
