package com.banking.repository;

import com.banking.entity.Transaction;
import com.banking.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    Page<Transaction> findByAccountIdAndTransactionType(Long accountId, TransactionType type, Pageable pageable);

    Optional<Transaction> findByTransactionReferenceAndAccountId(String reference, Long accountId);

    Optional<Transaction> findByTransactionReference(String reference);

    Page<Transaction> findByTransactionType(TransactionType type, Pageable pageable);
}
