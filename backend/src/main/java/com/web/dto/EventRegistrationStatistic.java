package com.web.dto;

import com.web.enums.RegistrationStatus;

public class EventRegistrationStatistic {

    private RegistrationStatus status;
    private Long total;

    public EventRegistrationStatistic(RegistrationStatus status, Long total) {
        this.status = status;
        this.total = total;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public Long getTotal() {
        return total;
    }
}
