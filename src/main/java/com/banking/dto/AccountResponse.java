package com.banking.dto;

import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        Long userId,
        String ownerName,
        AccountType accountType,
        BigDecimal balance,
        AccountStatus status,
        LocalDateTime createdAt
) {
    public static AccountResponse from(Account a) {
        return new AccountResponse(a.getId(), a.getAccountNumber(), a.getUser().getId(), a.getUser().getName(),
                a.getAccountType(), a.getBalance(), a.getStatus(), a.getCreatedAt());
    }
}
