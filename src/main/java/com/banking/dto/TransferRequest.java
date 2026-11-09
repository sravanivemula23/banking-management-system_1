package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TransferRequest(
        @NotNull(message = "Sender account id is required")
        Long fromAccountId,

        @NotNull(message = "Receiver account id is required")
        Long toAccountId,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be at least 0.01")
        @Digits(integer = 15, fraction = 2, message = "Amount must have at most 2 decimal places")
        BigDecimal amount,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        /** Optional but recommended: a unique key (e.g. UUID) so retries never double-transfer. */
        @Size(max = 64, message = "Idempotency key must be at most 64 characters")
        String idempotencyKey
) {
}
