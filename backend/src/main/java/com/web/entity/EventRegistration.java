package com.web.entity;

import com.web.enums.RegistrationStatus;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_registrations")
@Getter
@Setter
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String fullName;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    @JoinColumn(name = "registrant_id")
    private User user; // Người thực hiện thao tác đăng ký

    private LocalDateTime registrationTime;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status; // PENDING, APPROVED, REJECTED, WAITLIST

    private String rejectReason; // Lý do nếu bị từ chối

    private Boolean attended = false; // Đánh dấu đã tham gia thực tế sau sự kiện
}