declare namespace Express {
    export interface Response {
        // Basado en respuestas HTTP

        // 2XX
        sendSuccess(payload: object, msg?: string): void;                 // 200
        sendCreated(payload: object, msg?: string): void;                 // 201
        sendAccepted(payload: object, msg?: string): void;                // 202
        sendNoContent(msg?: object): void;                                // 204

        // 4XX
        sendBadRequest(reason?: string, field?: string): void;            // 400
        sendUnauthorized(reason?: string): void;                          // 401  ===> The server DOES NOT know who the user is, so they would have to login.
        sendForbidden(reason?: string): void;                             // 403  ===> The server DOES know who the user is, BUT they DO NOT have permission to access the resource.
        sendNotFound(reason?: string): void;                              // 404
        sendTooManyRequests(reason?: string): void;                       // 429
        
        // 5XX
        sendInternalServerError(reason?: string): void;                   // 500
    }
}