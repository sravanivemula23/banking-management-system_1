package com.banking.controller;

import com.banking.dto.*;
import com.banking.entity.TransactionType;
import com.banking.service.AccountService;
import com.banking.service.AdminService;
import com.banking.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Access restricted to ROLE_ADMIN in SecurityConfig (/api/admin/**). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final AccountService accountService;
    private final TransactionService transactionService;

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> users(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getAllUsers(page, size));
    }

    @GetMapping("/accounts")
    public ResponseEntity<PageResponse<AccountResponse>> accounts(@RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(accountService.getAllAccounts(page, size));
    }

    @PutMapping("/accounts/{id}/status")
    public ResponseEntity<AccountResponse> updateStatus(@PathVariable Long id,
                                                        @Valid @RequestBody UpdateAccountStatusRequest request) {
        return ResponseEntity.ok(accountService.updateStatus(id, request.status()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<PageResponse<TransactionResponse>> transactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(transactionService.allTransactions(type, page, size, direction));
    }
}
