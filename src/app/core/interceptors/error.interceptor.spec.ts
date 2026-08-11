import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show toast with message and details on API error', () => {
    http.get('/api/patients').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toBe('Documento duplicado');
        expect(error.details).toEqual(['documentNumber ya existe']);
      }
    });

    const req = httpMock.expectOne('/api/patients');
    req.flush(
      {
        success: false,
        message: 'Documento duplicado',
        details: ['documentNumber ya existe']
      },
      { status: 409, statusText: 'Conflict' }
    );

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Documento duplicado: documentNumber ya existe'
      })
    );
  });

  it('should show connection error when status is 0', () => {
    http.get('/api/patients').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(0);
        expect(error.message).toContain('No se pudo conectar');
      }
    });

    const req = httpMock.expectOne('/api/patients');
    req.error(new ProgressEvent('error'), { status: 0, statusText: '' });

    expect(messageServiceSpy.add).toHaveBeenCalled();
  });
});
