package com.banking.service;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.TransferRepository;
import com.banking.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransferRepository transferRepository;

    @Transactional
    public TransactionResponse deposit(UserPrincipal principal, DepositRequest request) {
        Account account = lockOwnedActiveAccount(request.accountId(), principal);
        BigDecimal amount = normalize(request.amount());

        account.setBalance(account.getBalance().add(amount));
        Transaction txn = record(account, TransactionType.DEPOSIT, amount, request.description(),
                newReference(), "Deposit");
        return TransactionResponse.from(txn);
    }

    @Transactional
    public TransactionResponse withdraw(UserPrincipal principal, WithdrawRequest request) {
        Account account = lockOwnedActiveAccount(request.accountId(), principal);
        BigDecimal amount = normalize(request.amount());

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }
        account.setBalance(account.getBalance().subtract(amount));
        Transaction txn = record(account, TransactionType.WITHDRAWAL, amount, request.description(),
                newReference(), "Withdrawal");
        return TransactionResponse.from(txn);
    }

    /**
     * Atomic: either both the debit and the credit are committed, or neither (any exception rolls back).
     * Both rows are locked in ascending-id order so two opposite transfers (A->B and B->A) cannot deadlock.
     */
    @Transactional
    public TransferResponse transfer(UserPrincipal principal, TransferRequest request) {
        // Idempotency: a retried request with the same key returns the original result.
        String key = blankToNull(request.idempotencyKey());
        if (key != null) {
            Optional<Transfer> existing = transferRepository.findByIdempotencyKey(key);
            if (existing.isPresent()) {
                Transfer t = existing.get();
                if (!t.getSenderAccount().getUser().getId().equals(principal.getId())) {
                    throw new InvalidOperationException("Idempotency key is already in use");
                }
                return TransferResponse.from(t);
            }
        }

        if (request.fromAccountId().equals(request.toAccountId())) {
            throw new InvalidOperationException("Sender and receiver accounts must be different");
        }
        BigDecimal amount = normalize(request.amount());

        Long first = Math.min(request.fromAccountId(), request.toAccountId());
        Long second = Math.max(request.fromAccountId(), request.toAccountId());
        Account a1 = lock(first);
        Account a2 = lock(second);
        Account sender = a1.getId().equals(request.fromAccountId()) ? a1 : a2;
        Account receiver = sender == a1 ? a2 : a1;

        // Only the sender's owner may move the money.
        if (!sender.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("Not the owner of the sender account");
        }
        requireActive(sender, "Sender");
        requireActive(receiver, "Receiver");
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        Transfer transfer = transferRepository.save(Transfer.builder()
                .senderAccount(sender)
                .receiverAccount(receiver)
                .amount(amount)
                .status(TransferStatus.COMPLETED)
                .idempotencyKey(key)
                .build());

        String base = newReference();
        record(sender, TransactionType.TRANSFER_DEBIT, amount, request.description(), base + "-D",
                "Transfer to " + receiver.getAccountNumber());
        record(receiver, TransactionType.TRANSFER_CREDIT, amount, request.description(), base + "-C",
                "Transfer from " + sender.getAccountNumber());

        return TransferResponse.from(transfer);
    }

    // ----- History / search -----

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> history(Long accountId, TransactionType type, int page, int size,
                                                     String direction, UserPrincipal principal) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountId));
        AccountService.assertOwnerOrAdmin(account, principal);

        Pageable pageable = pageable(page, size, direction);
        Page<Transaction> result = type == null
                ? transactionRepository.findByAccountId(accountId, pageable)
                : transactionRepository.findByAccountIdAndTransactionType(accountId, type, pageable);
        return PageResponse.from(result.map(TransactionResponse::from));
    }

    @Transactional(readOnly = true)
    public TransactionResponse getByReference(String reference, UserPrincipal principal) {
        Transaction txn = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + reference));
        AccountService.assertOwnerOrAdmin(txn.getAccount(), principal);
        return TransactionResponse.from(txn);
    }

    // ----- Admin -----

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> allTransactions(TransactionType type, int page, int size,
                                                             String direction) {
        Pageable pageable = pageable(page, size, direction);
        Page<Transaction> result = type == null
                ? transactionRepository.findAll(pageable)
                : transactionRepository.findByTransactionType(type, pageable);
        return PageResponse.from(result.map(TransactionResponse::from));
    }

    // ----- Helpers -----

    private Account lock(Long id) {
        return accountRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + id));
    }

    private Account lockOwnedActiveAccount(Long id, UserPrincipal principal) {
        Account account = lock(id);
        if (!account.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedException("Not the owner of this account");
        }
        requireActive(account, "Account");
        return account;
    }

    private void requireActive(Account account, String label) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InvalidOperationException(label + " account is not active");
        }
    }

    private Transaction record(Account account, TransactionType type, BigDecimal amount, String userDescription,
                               String reference, String defaultDescription) {
        String description = (userDescription == null || userDescription.isBlank())
                ? defaultDescription
                : userDescription.trim();
        return transactionRepository.save(Transaction.builder()
                .transactionReference(reference)
                .account(account)
                .transactionType(type)
                .amount(amount)
                .balanceAfter(account.getBalance())
                .description(description)
                .status(TransactionStatus.SUCCESS)
                .build());
    }

    private static BigDecimal normalize(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new InvalidOperationException("Amount must be greater than zero");
        }
        if (amount.scale() > 2) {
            throw new InvalidOperationException("Amount can have at most 2 decimal places");
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY);
    }

    private static String newReference() {
        return "TXN" + UUID.randomUUID().toString().replace("-", "");
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static Pageable pageable(int page, int size, String direction) {
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(Math.max(0, page), AccountService.clampSize(size),
                Sort.by(dir, "transactionDate").and(Sort.by(dir, "id")));
    }
}
