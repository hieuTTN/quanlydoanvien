package com.web.specification;

import com.web.dto.EventFilterRequest;
import com.web.entity.Event;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
public class EventSpecification implements Specification<Event>{

    private EventFilterRequest req;

    @Override
    public Predicate toPredicate(Root<Event> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
        Predicate predicate = cb.conjunction();
        query.distinct(true);

        // Nếu có search, chỉ lọc theo search và bỏ các điều kiện khác
        if (req.getKeyword() != null && !req.getKeyword().isEmpty() && !req.getKeyword().isBlank()) {
            String searchPattern = "%" + req.getKeyword().trim() + "%";
            Predicate namePredicate = cb.like(cb.lower(root.get("name")), searchPattern.toLowerCase());
            return cb.or(namePredicate);
        }

        if (req.getStatus() != null) {
            predicate = cb.and(predicate, cb.equal(root.get("status"), req.getStatus()));
        }

        if (req.getOrganizerId() != null) {
            predicate = cb.and(predicate, cb.equal(root.get("organizer").get("id"), req.getOrganizerId()));
        }

        if (req.getStartFrom() != null && req.getStartTo() != null) {
            predicate = cb.and(predicate,
                    cb.between(root.get("registrationDeadline"), req.getStartFrom(), req.getStartTo())
            );
        }
        return predicate;
    }

    public static Specification<Event> filter(EventFilterRequest req) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            LocalDateTime now = LocalDateTime.now();

            /*
             keyword
             */
            if (req.getKeyword() != null && !req.getKeyword().isEmpty()) {

                predicates.add(
                        cb.like(
                                cb.lower(root.get("name")),
                                "%" + req.getKeyword().toLowerCase() + "%"
                        )
                );
            }

            /*
             status
             */
            if (req.getStatus() != null) {

                predicates.add(
                        cb.equal(root.get("status"), req.getStatus())
                );
            }

            /*
             organizer
             */
            if (req.getOrganizerId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("organizer").get("id"),
                                req.getOrganizerId()
                        )
                );
            }

            /*
             startTime range
             */
            if (req.getStartFrom() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("startTime"),
                                req.getStartFrom()
                        )
                );
            }

            if (req.getStartTo() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("startTime"),
                                req.getStartTo()
                        )
                );
            }


            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}