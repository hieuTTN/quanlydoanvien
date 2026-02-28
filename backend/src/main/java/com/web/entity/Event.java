package com.web.entity;

import com.web.enums.EventStatus;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event")
@Getter
@Setter
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime registrationDeadline;

    private String location; // Link Google Maps hoặc địa chỉ
    private Integer maxParticipants;
    private Double fee; // Optional
    private String attachmentUrl; // Link tới file kế hoạch/form
    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    private EventStatus status; // DRAFT, OPEN, CLOSED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private Organization organizer; // Đơn vị tổ chức

    // Đối tượng tham gia (Lưu dưới dạng String hoặc bảng riêng để query)
    // Ví dụ: "ALL", "HUYNH_TRUONG_LIEN_DOAN", "DOAN_SINH_CHAU"...
    private String targetAudience;
}
