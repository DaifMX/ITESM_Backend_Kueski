// Para errores de programación de otros desarrolladores, 
// de esta manera los bugs se pueden encontrar con mayor facilidad.

export default class InternalError extends Error {
    msg = 'Error interno. Contacte un administrador.';

    constructor(msg?: string){
        super(msg);
        this.name = 'InternalError';
    }   
}