// import { Request, RequestHandler, Response, Router, NextFunction } from 'express';

// import authMiddleware from '../middlewares/auth-middleware';

// import { isArrayString } from '../utility/type-validation';

// import InternalError from '../errors/InternalError';

// // ***************************************
// // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// //         Clase Base de Ruteos 
// // TODAS LOS ROUTERS TIENE QUE HEREDERAR 
// // DE ESTA CLASE PARA ESTANDARIZAR TODAS 
// // LAS RESPUESTAS DE LA API
// // ***************************************
// // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// export default abstract class BaseRouter {
//     private router;

//     constructor() {
//         this.router = Router();
//         this.init();
//     };

//     init() { };

//     public getRouter(): Router {
//         return this.router;
//     };

//     //=========================//
//     //     ROUTER METHODS      //
//     //=========================//
//     public get(path: string, policies: Array<string>, ...callbacks: RequestHandler[]): void {
//         if (this.validatePolicies(policies, path)) this.router.get(path, this.generateCustomResponses, authMiddleware(policies), callbacks);
//     };

//     public patch(path: string, policies: Array<string>, ...callbacks: RequestHandler[]): void {
//         if (this.validatePolicies(policies, path)) this.router.patch(path, this.generateCustomResponses, authMiddleware(policies), callbacks);
//     };

//     public post(path: string, policies: Array<string>, ...callbacks: RequestHandler[]): void {
//         if (this.validatePolicies(policies, path)) this.router.post(path, this.generateCustomResponses, authMiddleware(policies), callbacks);
//     };

//     public put(path: string, policies: Array<string>, ...callbacks: RequestHandler[]): void {
//         if (this.validatePolicies(policies, path)) this.router.put(path, this.generateCustomResponses, authMiddleware(policies), callbacks);
//     };

//     public delete(path: string, policies: Array<string>, ...callbacks: RequestHandler[]): void {
//         if (this.validatePolicies(policies, path)) this.router.delete(path, this.generateCustomResponses, authMiddleware(policies), callbacks);
//     };

//     //=========================//
//     //    INTERNAL METHODS     //
//     //=========================//

//     // Verficar que los politicas puestas en los arrays sean validas
//     private validatePolicies = (policies: Array<string>, path: string): boolean => {
//         // Validar que el endpoint este definido correctamente
//         if (!policies || !isArrayString(policies)) throw new InternalError(`Policies not implemented. Endpoint: ${path}.`);

//         if (policies.includes('PUBLIC') || policies.includes('AUTHORIZED')) return true;

//         // Condición para evaluar si la poltiica ingresada es el nombre de algun departamento para poder limitar las endpoints dependiendo del rol del empleado.
//         const isPolicyValid = policies.some(depName => ['ADMIN', 'USER'].includes(depName.toUpperCaseFirstLetterOnly()));

//         // // Validar si el endpoint no incluye la politica PUBLIC, si no la tiene, entonces que dentro de las politicas incluya el nombre de uno o varios de los departamentos existentes
//         if (!isPolicyValid) throw new InternalError(`Policies ${path}invalid. Verify syntax.`);

//         return true;
//     }

//     private generateCustomResponses(_req: Request, res: Response, next: NextFunction) {
//         //2XX
//         res.sendSuccess = (payload: Object, msg?: string) => res.status(200).json({ status: 'success', payload, msg });
//         res.sendCreated = (payload: Object, msg?: string) => res.status(201).json({ status: 'success', payload, msg });
//         res.sendAccepted = (payload: Object, msg?: string) => res.status(202).json({ status: 'success', payload, msg });

//         // 4XX
//         res.sendBadRequest = (reason?: string, field?: string) => res.status(400).json({
//             status: 'error',
//             error: 'Bad request',
//             reason: reason ? reason : 'Unknown reason.',
//             field,
//         });

//         res.sendUnauthorized = (reason?: string) => res.status(401).json({
//             status: 'error',
//             error: 'Unauthorized',
//             reason: reason ? reason : 'Invalid credentials for this action.',
//         });

//         res.sendForbidden = (reason?: string) => res.status(403).json({
//             status: 'error',
//             error: 'Forbidden',
//             reason: reason ? reason : 'Insufficient permissions to perform this action.',
//         });

//         res.sendNotFound = (reason?: string) => res.status(404).json({
//             status: 'error',
//             error: 'Not Found',
//             reason: reason ? reason : 'The requested resource could not be found.',
//         });

//         res.sendTooManyRequests = (reason?: string) => res.status(429).json({
//             status: 'error',
//             error: 'Too Many Requests',
//             reason: reason ? reason : 'Too many requests. Please try again later.',
//         });

//         // 5XX
//         res.sendInternalServerError = (reason?: string) => res.status(500).json({
//             status: 'error',
//             error: 'Internal Server Error',
//             reason: reason ? reason : 'An unexpected error occurred on the server.',
//         });

//         next();
//     };
// }