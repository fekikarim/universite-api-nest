import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
          
    // 1️⃣ Déterminer le statut HTTP
    let status: number;
    let message: string;
  
    if (exception instanceof HttpException) {
      status = exception.getStatus();  // exemple: 404, 400, 500
      const res = exception.getResponse(); 
              
      // 2️⃣ Récupérer le message de l'exception
      if (typeof res === 'string') {
        message = res;  // si c'est juste un texte simple
      } else if (res && typeof res === 'object') {
        // si c'est un objet (ValidationPipe retourne souvent { message: [...] })
        message = (res as any).message || exception.message;
      } else {
        message = exception.message;
      }
    } else {
      // 3️⃣ Cas erreur inattendue
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = (exception instanceof Error) ? exception.message : 'Internal server error';
    }
  
    // 4️⃣ Envoyer la réponse JSON complète
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
