// import { Request, Response, NextFunction } from 'express';

// const authMiddleware = (policies: Array<String>) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         if (policies.includes('PUBLIC')) return next();

//         try {
//             //Obtener token
//             const token = req.cookies.token;
//             if (!token) return res.sendUnauthorized('Token no recibido');

//             //Verificar token
//             const verifiedToken = authService.verifyToken(token);
//             if (policies.includes('AUTHORIZED')) {
//                 const queryEid = parseInt(req.query.eid as string);
//                 const tknEid = verifiedToken.id;

//                 const isEidDifferent = queryEid != tknEid;

//                 if (!Number.isNaN(queryEid) && isEidDifferent && verifiedToken.role != 'ADMIN') return res.sendUnauthorized('No tienes permiso para realizar esta acción');

//                 return next();
//             }

//             //Verificar rol del empleado
//             const employeeRole = verifiedToken.role;
//             if (!policies.includes(employeeRole)) return res.sendUnauthorized('No tienes permiso para realizar esta acción');

//             return next();

//         } catch (error: any) {
//             console.error(error.message);
//             res.clearCookie;
//             if (!hasViewPolicy) return res.sendUnauthorized('Token invalido');
//             else return res.redirect('/login');
//         }
//     }
// };

// export default authMiddleware;