package com.thepiratemax.backend.api;

import com.thepiratemax.backend.service.exception.AccessDeniedException;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(exception.code(), exception.getMessage()));
    }

    @ExceptionHandler({InvalidRequestException.class, AccessDeniedException.class})
    public ResponseEntity<ApiError> handleInvalidRequest(RuntimeException exception) {
        if (exception instanceof InvalidRequestException invalidRequestException) {
            return ResponseEntity.badRequest()
                    .body(ApiError.of(invalidRequestException.code(), invalidRequestException.getMessage()));
        }

        AccessDeniedException accessDeniedException = (AccessDeniedException) exception;
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.of(accessDeniedException.code(), accessDeniedException.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiError> handleConflict(ConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(exception.code(), exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Invalid request");

        return ResponseEntity.badRequest().body(ApiError.of("INVALID_REQUEST", message));
    }
}
