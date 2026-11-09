package com.banking.dto;

import com.banking.entity.Transaction;
import com.banking.entity.TransactionStatus;
import com.banking.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String transactionReference,
        Long accountId,
        String accountNumber,
        TransactionType transactionType,
        BigDecimal amount,
        BigDecimal balanceAfter,
        String description,
        TransactionStatus status,
        LocalDateTime transactionDate
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(t.getId(), t.getTransactionReference(), t.getAccount().getId(),
                t.getAccount().getAccountNumber(), t.getTransactionType(), t.getAmount(), t.getBalanceAfter(),
                t.getDescription(), t.getStatus(), t.getTransactionDate());
    }
}
