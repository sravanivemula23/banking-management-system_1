package com.banking.exception;

/** Business rule violation: inactive account, same-account transfer, invalid amount, etc. */
public class InvalidOperationException extends RuntimeException {
    public InvalidOperationException(String message) {
        super(message);
    }
}
