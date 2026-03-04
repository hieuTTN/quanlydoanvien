package com.web.repository;

import com.web.entity.Authority;
import com.web.entity.Organization;
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

    @Query("select count(u.id) from UserAuthority u where u.authority.name = ?1")
    Long thongKeByRole(String roleName);

    @Query("select count(u.id) from UserAuthority u where u.authority.name = ?1 and month(u.user.createdDate) = ?2 and year(u.user.createdDate) = ?3 ")
    Long countByMonthAndYear(String roleName, int i, Integer year);

    @Query("select u.organization from UserAuthority u where u.user.id = ?1")
    List<Organization> findByUser(Long userId);

    @Query("select distinct u.authority from UserAuthority u where u.user.id = ?1")
    List<Authority> findAuthorityByUser(Long userId);
}
