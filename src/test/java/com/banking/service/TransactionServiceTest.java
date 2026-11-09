package com.banking.service;

import com.banking.dto.TransferRequest;
import com.banking.dto.TransferResponse;
import com.banking.dto.WithdrawRequest;
import com.banking.entity.*;
import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidOperationException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.TransferRepository;
import com.banking.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock AccountRepository accountRepository;
    @Mock TransactionRepository transactionRepository;
    @Mock TransferRepository transferRepository;
    @InjectMocks TransactionService service;

    private User owner;
    private User stranger;
    private Account sender;
    private Account receiver;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).email("a@x.com").password("h").role(Role.CUSTOMER).name("A").build();
        stranger = User.builder().id(2L).email("b@x.com").password("h").role(Role.CUSTOMER).name("B").build();
        sender = account(10L, owner, "100.00", AccountStatus.ACTIVE);
        receiver = account(20L, stranger, "50.00", AccountStatus.ACTIVE);
        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(transferRepository.save(any(Transfer.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void transfer_movesMoneyBetweenAccounts() {
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));
        when(accountRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(receiver));

        TransferResponse res = service.transfer(principal(owner),
                new TransferRequest(10L, 20L, new BigDecimal("30.00"), null, null));

        assertEquals(TransferStatus.COMPLETED, res.status());
        assertEquals(new BigDecimal("70.00"), sender.getBalance());
        assertEquals(new BigDecimal("80.00"), receiver.getBalance());
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }

    @Test
    void transfer_failsWhenInsufficientFunds_andBalancesUnchanged() {
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));
        when(accountRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(receiver));

        assertThrows(InsufficientFundsException.class, () -> service.transfer(principal(owner),
                new TransferRequest(10L, 20L, new BigDecimal("500.00"), null, null)));

        assertEquals(new BigDecimal("100.00"), sender.getBalance());
        assertEquals(new BigDecimal("50.00"), receiver.getBalance());
        verify(transferRepository, never()).save(any());
    }

    @Test
    void transfer_toSameAccount_isRejected() {
        assertThrows(InvalidOperationException.class, () -> service.transfer(principal(owner),
                new TransferRequest(10L, 10L, new BigDecimal("1.00"), null, null)));
    }

    @Test
    void transfer_fromSomeoneElsesAccount_isForbidden() {
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));
        when(accountRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(receiver));

        assertThrows(AccessDeniedException.class, () -> service.transfer(principal(stranger),
                new TransferRequest(10L, 20L, new BigDecimal("1.00"), null, null)));
        assertEquals(new BigDecimal("100.00"), sender.getBalance());
    }

    @Test
    void transfer_toInactiveAccount_isRejected() {
        receiver.setStatus(AccountStatus.INACTIVE);
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));
        when(accountRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(receiver));

        assertThrows(InvalidOperationException.class, () -> service.transfer(principal(owner),
                new TransferRequest(10L, 20L, new BigDecimal("1.00"), null, null)));
    }

    @Test
    void transfer_withRepeatedIdempotencyKey_returnsOriginalWithoutMovingMoney() {
        Transfer existing = Transfer.builder().id(99L).senderAccount(sender).receiverAccount(receiver)
                .amount(new BigDecimal("30.00")).status(TransferStatus.COMPLETED).idempotencyKey("k1").build();
        when(transferRepository.findByIdempotencyKey("k1")).thenReturn(Optional.of(existing));

        TransferResponse res = service.transfer(principal(owner),
                new TransferRequest(10L, 20L, new BigDecimal("30.00"), null, "k1"));

        assertEquals(99L, res.transferId());
        assertEquals(new BigDecimal("100.00"), sender.getBalance());
        verify(accountRepository, never()).findByIdForUpdate(any());
    }

    @Test
    void withdraw_cannotMakeBalanceNegative() {
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));

        assertThrows(InsufficientFundsException.class, () -> service.withdraw(principal(owner),
                new WithdrawRequest(10L, new BigDecimal("100.01"), null)));
        assertEquals(new BigDecimal("100.00"), sender.getBalance());
    }

    @Test
    void withdraw_exactBalance_leavesZero() {
        when(accountRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sender));

        service.withdraw(principal(owner), new WithdrawRequest(10L, new BigDecimal("100.00"), null));

        assertEquals(0, sender.getBalance().compareTo(BigDecimal.ZERO));
    }

    private static Account account(Long id, User user, String balance, AccountStatus status) {
        return Account.builder().id(id).accountNumber("ACC" + id).user(user)
                .accountType(AccountType.SAVINGS).balance(new BigDecimal(balance)).status(status).build();
    }

    private static UserPrincipal principal(User u) {
        return new UserPrincipal(u);
    }
}
