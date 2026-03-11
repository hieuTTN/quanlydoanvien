package com.web.repository;

import com.web.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long>, JpaSpecificationExecutor<User> {

    @Query(value = "select u from User u where u.email = ?1")
    Optional<User> findByEmail(String email);

    @Query(value = "select u from User u where u.email = ?1 and u.id <> ?2")
    Optional<User> findByEmailAndId(String email, Long id);

    @Query(value = "select u.* from users u where u.id = ?1", nativeQuery = true)
    Optional<User> findById(Long id);

    @Query(value = "select count(u.id) from users u INNER JOIN users_authority ua on ua.user_id = u.id\n" +
            "WHERE ua.authority_name = ?1", nativeQuery = true)
    Long tongUserByRole(String role);

    @Query(value = "select u.* from users u INNER JOIN users_authority ua on ua.user_id = u.id\n" +
            "WHERE ua.authority_name = ?1", nativeQuery = true)
    List<User> findByRole(String role);

    boolean existsByEmail(String email);

    @Query("select u.user from UserAuthority u where u.organization.id = ?1")
    List<User> findByOrganizationId(Long organizationId);
}
