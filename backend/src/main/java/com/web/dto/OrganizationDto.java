package com.web.dto;

import lombok.Data;

@Data
public class OrganizationDto {

    private Long id;

    private String name;

    private String type;

    private String typeDisplayName;

    private int typeLevel;

    private String typeIcon;

    private Long parentId;

    private String parentName;

    private String path;

    private String breadcrumb;
}
