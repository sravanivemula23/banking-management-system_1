package com.banking.service;

import com.banking.dto.PageResponse;
import com.banking.dto.UserResponse;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        return PageResponse.from(userRepository
                .findAll(PageRequest.of(Math.max(0, page), AccountService.clampSize(size),
                        Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(UserResponse::from));
    }
}
