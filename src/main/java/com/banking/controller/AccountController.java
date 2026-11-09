package com.banking.controller;

import com.banking.dto.AccountResponse;
import com.banking.dto.BalanceResponse;
import com.banking.dto.CreateAccountRequest;
import com.banking.security.UserPrincipal;
import com.banking.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(principal, request));
    }

    // Declared before "/{id}" for readability; Spring prefers the literal path anyway.
    @GetMapping("/my-accounts")
    public ResponseEntity<List<AccountResponse>> myAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(accountService.getMyAccounts(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> get(@PathVariable Long id,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(accountService.getAccount(id, principal));
    }

    @GetMapping("/{id}/balance")
    public ResponseEntity<BalanceResponse> balance(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(accountService.getBalance(id, principal));
    }
}
