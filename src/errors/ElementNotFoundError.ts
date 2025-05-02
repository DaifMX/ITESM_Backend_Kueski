export default class ElementNotFoundError extends Error{
    msg = 'Elemento no encontrado dentro de la base de datos.';

    constructor(msg?: string){
        super(msg);
        this.name = 'ElementNotFoundError';
    }   
}