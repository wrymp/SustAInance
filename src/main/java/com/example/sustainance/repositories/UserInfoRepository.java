package com.example.sustainance.repositories;

import com.example.sustainance.models.entities.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, UUID> {

    Optional<UserInfo> findByUsername(String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}