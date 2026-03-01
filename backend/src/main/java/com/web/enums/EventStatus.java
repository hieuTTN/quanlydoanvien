package com.web.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum EventStatus {

    DRAFT("Bản nháp", "#6C757D"),
    OPEN("Đang mở đăng ký", "#28A745"),
    CLOSED("Đã đóng đăng ký", "#FFC107"),
    CANCELLED("Đã hủy", "#DC3545");

    private final String displayName;

    private final String color;
}
