package com.banking.service;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.InvalidOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import com.banking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public AccountResponse createAccount(UserPrincipal principal, CreateAccountRequest request) {
        User owner = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BigDecimal opening = request.initialDeposit() == null
                ? BigDecimal.ZERO
                : request.initialDeposit();
        if (opening.signum() < 0) {
            throw new InvalidOperationException("Initial deposit cannot be negative");
        }
        if (opening.scale() > 2) {
            throw new InvalidOperationException("Initial deposit can have at most 2 decimal places");
        }
        opening = opening.setScale(2, RoundingMode.UNNECESSARY);

        Account account = accountRepository.save(Account.builder()
                .accountNumber(generateUniqueAccountNumber())
                .user(owner)
                .accountType(request.accountType())
                .balance(opening)
                .status(AccountStatus.ACTIVE)
                .build());

        if (opening.signum() > 0) {
            transactionRepository.save(Transaction.builder()
                    .transactionReference("TXN" + UUID.randomUUID().toString().replace("-", ""))
                    .account(account)
                    .transactionType(TransactionType.DEPOSIT)
                    .amount(opening)
                    .balanceAfter(opening)
                    .description("Opening deposit")
                    .status(TransactionStatus.SUCCESS)
                    .build());
        }
        return AccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccount(Long id, UserPrincipal principal) {
        return AccountResponse.from(getAuthorizedAccount(id, principal));
    }

    @Transactional(readOnly = true)
    public BalanceResponse getBalance(Long id, UserPrincipal principal) {
        Account a = getAuthorizedAccount(id, principal);
        return new BalanceResponse(a.getId(), a.getAccountNumber(), a.getBalance());
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getMyAccounts(UserPrincipal principal) {
        return accountRepository.findByUserId(principal.getId()).stream()
                .map(AccountResponse::from)
                .toList();
    }

    // ----- Admin -----

    @Transactional(readOnly = true)
    public PageResponse<AccountResponse> getAllAccounts(int page, int size) {
        Page<Account> result = accountRepository.findAll(
                PageRequest.of(page, clampSize(size), Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.from(result.map(AccountResponse::from));
    }

    @Transactional
    public AccountResponse updateStatus(Long id, AccountStatus status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + id));
        account.setStatus(status);
        return AccountResponse.from(account);
    }

    // ----- Helpers -----

    /** Loads an account and enforces that customers can only see their own; admins can see any. */
    Account getAuthorizedAccount(Long id, UserPrincipal principal) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + id));
        assertOwnerOrAdmin(account, principal);
        return account;
    }

    static void assertOwnerOrAdmin(Account account, UserPrincipal principal) {
        if (!principal.isAdmin() && !account.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("Not the owner of this account");
        }
    }

    static int clampSize(int size) {
        return Math.max(1, Math.min(size, 100));
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            // 12 digits, first digit non-zero
            number = String.valueOf(1 + RANDOM.nextInt(9)) + String.format("%011d", (long) (RANDOM.nextDouble() * 1e11));
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }
}
