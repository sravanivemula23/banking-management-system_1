package com.banking.dto;

import com.banking.entity.Transfer;
import com.banking.entity.TransferStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransferResponse(
        Long transferId,
        Long fromAccountId,
        Long toAccountId,
        BigDecimal amount,
        TransferStatus status,
        LocalDateTime createdAt
) {
    public static TransferResponse from(Transfer t) {
        return new TransferResponse(t.getId(), t.getSenderAccount().getId(), t.getReceiverAccount().getId(),
                t.getAmount(), t.getStatus(), t.getCreatedAt());
    }
}
