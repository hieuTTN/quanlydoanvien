package com.web.dto;

import java.time.LocalDateTime;

public interface EventStatistic {

    Long getId();
    String getName();
    String getDescription();
    LocalDateTime getStartTime();
    LocalDateTime getEndTime();
    LocalDateTime getRegistrationDeadline();
    String getLocation();
    Integer getMaxParticipants();
    Integer getCurrentPeople();
    Double getFee();
    String getAttachmentUrl();
    String getBannerUrl();
    String getTargetAudience();
    String getAddressDetail();
    Integer getNumView();

    Long getTotalRegistrations();
    Long getPendingRegistrations();
}