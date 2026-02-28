package com.web.repository;

import com.web.entity.UserAuthority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface UserAuthorityRepository extends JpaRepository<UserAuthority, Long> {

    @Modifying
    @Transactional
    @Query("delete from UserAuthority u where u.user.id = ?1")
    int deleteByUser(Long userId);

    List<UserAuthority> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("delete from UserAuthority u where u.user.id = ?1")
    void deleteByUserId(Long userId);
}
