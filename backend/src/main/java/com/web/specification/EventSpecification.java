package com.web.specification;

import com.web.dto.EventFilterRequest;
import com.web.entity.Event;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EventSpecification {

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