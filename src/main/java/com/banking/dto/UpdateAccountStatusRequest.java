package com.banking.dto;

import com.banking.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAccountStatusRequest(
        @NotNull(message = "Status is required")
        AccountStatus status
) {
}
