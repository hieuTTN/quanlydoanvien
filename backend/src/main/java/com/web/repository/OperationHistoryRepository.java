package com.web.repository;

import com.web.entity.OperationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface OperationHistoryRepository extends JpaRepository<OperationHistory, Long> {

    @Query("select o from OperationHistory o where o.user.id = ?1")
    List<OperationHistory> findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("delete from OperationHistory p where p.eventRegistrationId = ?1")
    int deleteByEventRegistrationId(Long eventRegistrationId);

    @Query("select o from OperationHistory o where o.user.id = ?1 and o.eventRegistrationId = ?2")
    OperationHistory checkByUser(Long id, Long id1);
}
