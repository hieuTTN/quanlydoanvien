package com.web.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum OrganizationType {
    CHAU("Cấp Châu", 1, "fas fa-globe-asia"),
    DAO("Cấp Đạo", 2, "fas fa-khanda"),
    LIEN_DOAN("Cấp Liên Đoàn", 3, "fas fa-users"),
    DOAN("Cấp Đoàn", 4, "fas fa-user-friends");

    private final String displayName;
    private final int level; // Dùng để check logic chống vòng lặp (level thấp không thể là cha level cao)
    private final String icon;
}
