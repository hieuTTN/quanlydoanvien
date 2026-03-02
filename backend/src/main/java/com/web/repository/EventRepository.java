package com.web.repository;

import com.web.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long>,JpaSpecificationExecutor<Event> {

    @Query(value = "select e.* from event e ORDER by e.id desc limit 5", nativeQuery = true)
    List<Event> suKienMoiNhat();

    @Query("select count(e.id) from Event e where month(e.startTime) = ?1 and year(e.startTime) = ?2")
    Long countByMonthAndYear(int i, Integer year);
}
