package com.web.service;

import com.web.dto.EventFilterRequest;
import com.web.dto.EventRequest;
import com.web.entity.Event;
import com.web.entity.EventUpdateBy;
import com.web.entity.Organization;
import com.web.enums.EventStatus;
import com.web.exception.MessageException;
import com.web.repository.EventRepository;
import com.web.repository.EventUpdateByRepository;
import com.web.repository.OrganizationRepository;
import com.web.specification.EventSpecification;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private EventUpdateByRepository eventUpdateByRepository;

    @Autowired
    private UserUtils userUtils;

    /*
       CREATE
    */
    @Transactional
    public Event create(EventRequest req) {

        validate(req);

        Organization org = null;
        if(req.getOrganizerId() != null){
            org = organizationRepository.findById(req.getOrganizerId()).orElse(null);
        }

        Event event = new Event();

        map(req, event);

        event.setOrganizer(org);

        event.setCreatedBy(userUtils.getUserWithAuthority());

//        event.setStatus(determineStatus(req.getRegistrationDeadline()));
        event.setStatus(req.getStatus());

        return eventRepository.save(event);
    }

    /*
        UPDATE
     */
    @Transactional
    public Event update(Long id, EventRequest req) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new MessageException("Event not found"));

        validate(req);

        Organization org = null;
        if(req.getOrganizerId() != null){
            org = organizationRepository.findById(req.getOrganizerId()).orElse(null);
        }

        map(req, event);
        event.setOrganizer(org);

//        event.setStatus(determineStatus(req.getRegistrationDeadline()));
        event.setStatus(req.getStatus());
        EventUpdateBy eventUpdateBy = new EventUpdateBy();
        eventUpdateBy.setEvent(event);
        eventUpdateBy.setUser(userUtils.getUserWithAuthority());
        eventUpdateBy.setCreatedDate(LocalDateTime.now());
        eventUpdateByRepository.save(eventUpdateBy);
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
                .orElseThrow(() -> new MessageException("Event not found"));
    }

    /*
        SEARCH + PAGINATION
     */
    public Page<Event> search(EventFilterRequest filter, Pageable pageable) {
        EventSpecification eventSpecification = new EventSpecification(filter);
        return eventRepository.findAll(
                eventSpecification,
                pageable
        );
    }

    /*
        VALIDATE
     */
    private void validate(EventRequest req) {

        if (!req.getStartTime().isBefore(req.getEndTime())) {

            throw new MessageException("ngày bắt đâ phải trước ngày kết thúc");
        }

        if (req.getRegistrationDeadline().isBefore(req.getStartTime())) {
            throw new MessageException("Ngày kết thúc đăng ký phải sau ngày bắt đầu");
        }
        if (req.getRegistrationDeadline().isAfter(req.getEndTime())) {
            throw new MessageException("Ngày kết thúc đăng ký phải trước ngày kết thúc");
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
        e.setWards(req.getWards());
        e.setAddressDetail(req.getAddressDetail());
        e.setAttachmentUrl(req.getAttachmentUrl());
        e.setBannerUrl(req.getBannerUrl());
        e.setTargetAudience(req.getTargetAudience());

    }
}
