export default class AuthError extends Error {
    msg = 'No autorizado para realizar esta acción.';

    constructor(msg?: string){
        super(msg);
        this.name = 'AuthError';
    }
}