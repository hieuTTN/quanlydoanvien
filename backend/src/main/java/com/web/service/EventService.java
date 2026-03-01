package com.web.service;

import com.web.dto.EventFilterRequest;
import com.web.dto.EventRequest;
import com.web.entity.Event;
import com.web.entity.Organization;
import com.web.enums.EventStatus;
import com.web.repository.EventRepository;
import com.web.repository.OrganizationRepository;
import com.web.specification.EventSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    /*
       CREATE
    */
    public Event create(EventRequest req) {

        validate(req);

        Organization org = organizationRepository.findById(req.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        Event event = new Event();

        map(req, event);

        event.setOrganizer(org);

        event.setStatus(determineStatus(req.getRegistrationDeadline()));

        return eventRepository.save(event);
    }

    /*
        UPDATE
     */
    public Event update(Long id, EventRequest req) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        validate(req);

        Organization org = organizationRepository.findById(req.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        map(req, event);

        event.setOrganizer(org);

        event.setStatus(determineStatus(req.getRegistrationDeadline()));

        return eventRepository.save(event);
    }

    /*
        DELETE
     */
    public void delete(Long id) {

        eventRepository.deleteById(id);
    }

    /*
        GET ONE
     */
    public Event get(Long id) {

        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    /*
        SEARCH + PAGINATION
     */
    public Page<Event> search(
            EventFilterRequest filter,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending()
                :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return eventRepository.findAll(
                EventSpecification.filter(filter),
                pageable
        );
    }

    /*
        VALIDATE
     */
    private void validate(EventRequest req) {

        if (!req.getStartTime().isBefore(req.getEndTime())) {

            throw new RuntimeException("startTime must be before endTime");
        }

        if (!req.getRegistrationDeadline().isBefore(req.getStartTime())) {

            throw new RuntimeException("registrationDeadline must be before startTime");
        }
    }

    /*
        STATUS
     */
    private EventStatus determineStatus(LocalDateTime deadline) {

        return deadline.isAfter(LocalDateTime.now())
                ? EventStatus.OPEN
                : EventStatus.CLOSED;
    }

    private void map(com.web.dto.EventRequest req, Event e) {

        e.setName(req.getName());
        e.setDescription(req.getDescription());
        e.setStartTime(req.getStartTime());
        e.setEndTime(req.getEndTime());
        e.setRegistrationDeadline(req.getRegistrationDeadline());
        e.setLocation(req.getLocation());
        e.setMaxParticipants(req.getMaxParticipants());
        e.setFee(req.getFee());
        e.setAttachmentUrl(req.getAttachmentUrl());
        e.setBannerUrl(req.getBannerUrl());
        e.setTargetAudience(req.getTargetAudience());

    }
}
