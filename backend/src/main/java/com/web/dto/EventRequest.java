package com.web.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {

    private String name;

    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationDeadline;

    private String location;

    private Integer maxParticipants;

    private Double fee;

    private String attachmentUrl;

    private String bannerUrl;

    private Long organizerId;

    private String targetAudience;

}