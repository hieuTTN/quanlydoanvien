package com.web.service;

import com.web.dto.EventRegistrationStatistic;
import com.web.entity.Event;
import com.web.entity.EventRegistration;
import com.web.entity.User;
import com.web.enums.EventStatus;
import com.web.enums.LogLevel;
import com.web.enums.RegistrationStatus;
import com.web.exception.MessageException;
import com.web.repository.AuditLogRepository;
import com.web.repository.EventRegistrationRepository;
import com.web.repository.EventRepository;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EventRegistrationService {

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AuditLogService auditLogService;

    public EventRegistration create(EventRegistration eventRegistration){
        User user = userUtils.getUserWithAuthority();
        EventRegistration event = eventRegistrationRepository.countByUserAndEvent(user.getId(), eventRegistration.getEvent().getId());
        if(event != null) {
            auditLogService.save("Gửi yêu cầu đăng ký sự kiện: "+event.getEvent().getName(), LogLevel.INFO);
            if (event.getStatus().equals(RegistrationStatus.PENDING)) {
                throw new MessageException("Bạn đã gửi đăng ký, xin chờ phản hồi");
            }
            if (event.getStatus().equals(RegistrationStatus.APPROVED)) {
                throw new MessageException("Bạn đã được duyệt đăng ký, vui lòng không gửi yêu cầu lại");
            }
            if (event.getStatus().equals(RegistrationStatus.REJECTED)) {
                throw new MessageException("Bạn đã bị từ chối đăng ký, nguyên nhân: " + event.getRejectReason());
            }
        }
        Event e = eventRepository.findById(eventRegistration.getEvent().getId()).get();
        auditLogService.save("Gửi yêu cầu đăng ký sự kiện: "+e.getName(), LogLevel.INFO);
        if(e.getCurrentPeople() == e.getMaxParticipants()){
            throw new MessageException("Không thể gửi yêu cầu do đã đủ người tham gia");
        }
        if(e.getRegistrationDeadline().isBefore(LocalDateTime.now())){
            throw new MessageException("Không thể gửi yêu cầu do đã quá hạn đăng ký");
        }
        if(!e.getStatus().equals(EventStatus.OPEN)){
            throw new MessageException("Xin lỗi, sự kiên này không còn được mở nữa");
        }
        if(event != null && event.getStatus().equals(RegistrationStatus.CANCEL)){
            event.setStatus(RegistrationStatus.PENDING);
            eventRegistrationRepository.save(event);
            return event;
        }
        eventRegistration.setUser(user);
        eventRegistration.setRegistrationTime(LocalDateTime.now());
        eventRegistration.setStatus(RegistrationStatus.PENDING);
        eventRegistration.setEvent(e);
        EventRegistration ev =  eventRegistrationRepository.save(eventRegistration);
        return ev;
    }

    public Map<String, String> checkRegis(Long id) {

        User user = userUtils.getUserWithAuthority();
        EventRegistration event = eventRegistrationRepository.countByUserAndEvent(user.getId(), id);

        Map<String, String> map = new HashMap<>();

        if (event != null) {

            if (event.getStatus().equals(RegistrationStatus.PENDING)) {
                map.put("message", "Đang chờ phản hồi");
                map.put("color", "#f39c12"); // cam
            }

            else if (event.getStatus().equals(RegistrationStatus.APPROVED)) {
                map.put("message", "Đã được duyệt đăng ký");
                map.put("color", "#28a745"); // xanh lá
            }

            else if (event.getStatus().equals(RegistrationStatus.REJECTED)) {
                map.put("message", "Bị từ chối");
                map.put("color", "#dc3545"); // đỏ
            }

        } else {
            map.put("message", "Chưa đăng ký tham gia");
            map.put("color", "#6c757d"); // xám
        }

        return map;
    }

    public Page<EventRegistration> myRegis(String search, RegistrationStatus status, Pageable pageable) {
        User user = userUtils.getUserWithAuthority();
        return eventRegistrationRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), user.getId()));
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            else if (search != null) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("event").get("name")), pattern));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    public Page<EventRegistration> regisByEvent(String search, RegistrationStatus status, Long eventId, Pageable pageable) {
        return eventRegistrationRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("event").get("id"), eventId));
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            else if (search != null) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("event").get("name")), pattern));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    public EventRegistration cancel(Long id) {
        EventRegistration e = eventRegistrationRepository.findById(id).get();
        if(e.getEvent().getRegistrationDeadline().isBefore(LocalDateTime.now())){
            throw new MessageException("Không thể gửi yêu cầu do đã quá hạn đăng ký và hủy");
        }
        if(!e.getEvent().getStatus().equals(EventStatus.OPEN)){
            throw new MessageException("Xin lỗi, sự kiên này không còn được mở nữa");
        }
        e.setStatus(RegistrationStatus.CANCEL);
        eventRegistrationRepository.save(e);
        auditLogService.save("Hủy đăng ký sự kiện "+e.getEvent().getName(), LogLevel.INFO);
        return e;
    }

    public EventRegistration updateStatus(EventRegistration eventRegistration) {
        EventRegistration ex = eventRegistrationRepository.findById(eventRegistration.getId()).orElseThrow(() -> new MessageException("Không tìm thấy đăng ký"));
        ex.setStatus(eventRegistration.getStatus());
        ex.setRejectReason(eventRegistration.getRejectReason());
        if(!eventRegistration.getStatus().equals(RegistrationStatus.REJECTED)){
            ex.setRejectReason(null);
        }
        return eventRegistrationRepository.save(ex);
    }

    public Map<RegistrationStatus, Long> statisticByEvent(Long eventId){

        List<EventRegistrationStatistic> list = eventRegistrationRepository.statisticByEvent(eventId);

        Map<RegistrationStatus, Long> result = new LinkedHashMap<>();

        // khởi tạo tất cả status = 0
        for (RegistrationStatus status : RegistrationStatus.values()) {
            result.put(status, 0L);
        }

        // cập nhật số lượng thực tế từ DB
        for (EventRegistrationStatistic item : list) {
            result.put(item.getStatus(), item.getTotal());
        }

        return result;
    }

    public EventRegistration confirm(Long id) {
        EventRegistration eventRegistration = eventRegistrationRepository.findById(id).orElseThrow(() -> new MessageException("Không tìm thấy dữ liệu"));
        if(eventRegistration.getAttended() == null || eventRegistration.getAttended() == false){
            eventRegistration.setAttended(true);
        }
        else{
            eventRegistration.setAttended(false);
        }
        return eventRegistrationRepository.save(eventRegistration);
    }

    public EventRegistration rate(EventRegistration eventRegistration) {
        EventRegistration ex = eventRegistrationRepository.findById(eventRegistration.getId()).orElseThrow(() -> new MessageException("Không tìm thấy đăng ký"));
        ex.setRate(eventRegistration.getRate());
        return eventRegistrationRepository.save(ex);
    }
}
