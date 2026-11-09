package com.banking.controller;

import com.banking.dto.*;
import com.banking.entity.TransactionType;
import com.banking.security.UserPrincipal;
import com.banking.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody DepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.deposit(principal, request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(@AuthenticationPrincipal UserPrincipal principal,
                                                        @Valid @RequestBody WithdrawRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.withdraw(principal, request));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponse> transfer(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transfer(principal, request));
    }

    /** Paginated history. Optional filter by type, sort by date via direction=asc|desc. */
    @GetMapping("/history/{accountId}")
    public ResponseEntity<PageResponse<TransactionResponse>> history(
            @PathVariable Long accountId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.history(accountId, type, page, size, direction, principal));
    }

    /** Search a single transaction by its reference (transaction ID). */
    @GetMapping("/reference/{reference}")
    public ResponseEntity<TransactionResponse> byReference(@PathVariable String reference,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transactionService.getByReference(reference, principal));
    }
}
