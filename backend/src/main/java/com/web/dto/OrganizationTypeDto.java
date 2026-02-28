package com.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrganizationTypeDto {

    private String code;

    private String displayName;

    private int level;

    private String icon;

}