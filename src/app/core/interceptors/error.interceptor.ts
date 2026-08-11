import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ApiError } from '../models/api-error.model';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly messageService: MessageService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError = this.mapError(error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.buildDetail(apiError),
          life: 6000
        });

        return throwError(() => apiError);
      })
    );
  }

  private mapError(error: HttpErrorResponse): ApiError {
    if (error.status === 0) {
      return {
        message: 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
        status: 0
      };
    }

    const body = error.error;

    if (body && typeof body === 'object' && !(body instanceof ProgressEvent)) {
      const message =
        body.message ||
        body.title ||
        body.Message ||
        error.message ||
        'Ocurrió un error inesperado';

      const details = this.extractDetails(body);

      return {
        message,
        details,
        status: error.status
      };
    }

    return {
      message: error.message || 'Ocurrió un error inesperado',
      status: error.status
    };
  }

  private extractDetails(body: Record<string, unknown>): string[] | null {
    if (Array.isArray(body['details'])) {
      return body['details'] as string[];
    }

    if (Array.isArray(body['errors'])) {
      return body['errors'] as string[];
    }

    // ASP.NET Core ValidationProblemDetails
    if (body['errors'] && typeof body['errors'] === 'object') {
      const validationErrors = body['errors'] as Record<string, string[]>;
      return Object.values(validationErrors).flat();
    }

    return null;
  }

  private buildDetail(apiError: ApiError): string {
    if (apiError.details?.length) {
      return `${apiError.message}: ${apiError.details.join(' | ')}`;
    }

    return apiError.message;
  }
}
