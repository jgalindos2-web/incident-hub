package com.incidenthub.exception;

/**
 * Exception thrown when a request has invalid arguments or state transitions.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
