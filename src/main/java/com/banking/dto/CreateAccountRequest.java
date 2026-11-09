package com.banking.dto;

import com.banking.entity.AccountType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotNull(message = "Account type is required")
        AccountType accountType,

        /** Optional opening balance; defaults to 0. */
        BigDecimal initialDeposit
) {
}
