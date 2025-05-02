export default class ConnectionTimeoutError extends Error{
    msg = 'La base de datos no ha respondido a tiempo.';

    constructor(msg?: string){
        super(msg);
        this.name = 'TimeoutError';
    }   
}