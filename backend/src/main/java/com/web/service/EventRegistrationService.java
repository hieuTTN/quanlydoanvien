package com.web.service;

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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

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
}
