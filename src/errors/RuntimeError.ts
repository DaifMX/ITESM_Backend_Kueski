export default class RuntimeError extends Error{
    msg = 'Error en tiempo de ejecución.';

    constructor(msg?: string){
        super(msg);
        this.name = 'RuntimeError';
    }   
}