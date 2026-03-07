package com.web.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum RegistrationStatus {
    PENDING("PENDING","Chờ duyệt", "bg-warning text-dark", "fas fa-clock"),
    APPROVED("APPROVED","Đã duyệt", "bg-success", "fas fa-check-circle"),
    REJECTED("REJECTED","Từ chối", "bg-danger", "fas fa-times-circle"),
    WAITLIST("WAITLIST","Danh sách chờ", "bg-secondary", "fas fa-pause-circle"),
    CANCEL("CANCEL","Đã hủy", "bg-dark", "fas fa-ban");

    private final String name;
    private final String displayName;
    private final String colorClass; // Class màu của Bootstrap (badge)
    private final String icon;       // Class icon của FontAwesome
}