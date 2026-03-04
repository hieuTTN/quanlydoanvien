package com.web.repository;

import com.web.entity.AuditLog;
import com.web.entity.Event;
import com.web.entity.EventRegistration;
import com.web.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long>, JpaSpecificationExecutor<EventRegistration> {

    @Query(value = "select e.* from event_registrations e ORDER by e.id desc limit 20", nativeQuery = true)
    List<EventRegistration> dkSuKienMoiNhat();

    Long countEventRegistrationByStatus(RegistrationStatus status);

    @Query("select e from EventRegistration e where e.user.id = ?1 and e.event.id = ?2")
    EventRegistration countByUserAndEvent(Long userId, Long eventId);
}
