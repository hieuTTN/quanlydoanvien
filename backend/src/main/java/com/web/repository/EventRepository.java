package com.web.repository;

import com.web.dto.EventStatistic;
import com.web.entity.Event;
import com.web.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long>,JpaSpecificationExecutor<Event> {

    @Query(value = "select e.* from event e ORDER by e.id desc limit 5", nativeQuery = true)
    List<Event> suKienMoiNhat();

    @Query("select count(e.id) from Event e where month(e.startTime) = ?1 and year(e.startTime) = ?2")
    Long countByMonthAndYear(int i, Integer year);

    @Query("select e from Event e where e.name like ?1 and (e.status = 'OPEN' or e.status = 'CLOSED') ")
    Page<Event> filterByParam(String search, Pageable pageable);

    @Query("""
        SELECT e 
        FROM Event e 
            WHERE (:search IS NULL OR e.name LIKE CONCAT('%',:search,'%'))
            AND e.organizer.id = :organizer
            AND (:status IS NULL OR e.status = :status)
    """)
    Page<Event> filterByParamAndOrganizer(
            @Param("search") String search,
            @Param("organizer") Long organizer,
            @Param("status") EventStatus status,
            Pageable pageable
    );

    @Query(value = """
        SELECT 
            e.id as id,
            e.name as name,
            e.description as description,
            e.start_time as startTime,
            e.end_time as endTime,
            e.location as location,
            e.max_participants as maxParticipants,
            e.current_people as currentPeople,
            e.fee as fee,
            e.banner_url as bannerUrl,
            e.num_view as numView,

            COUNT(er.id) as totalRegistrations,
            SUM(CASE WHEN er.status = 'PENDING' THEN 1 ELSE 0 END) as pendingRegistrations

        FROM event e
        LEFT JOIN event_registrations er ON er.event_id = e.id

        WHERE e.organizer_id = :organizerId
        AND (:name IS NULL OR e.name LIKE CONCAT('%',:name,'%'))
        AND (:status IS NULL OR e.status = :status)

        GROUP BY e.id
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM event e
        WHERE e.organizer_id = :organizerId
        AND (:name IS NULL OR e.name LIKE CONCAT('%',:name,'%'))
        AND (:status IS NULL OR e.status = :status)
        """,
            nativeQuery = true)
    Page<EventStatistic> searchEventStatistic(
            @Param("organizerId") Long organizerId,
            @Param("name") String name,
            @Param("status") String status,
            Pageable pageable
    );
}
