package com.web.dto;
import com.web.enums.OrganizationType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class OrganizationUpdateRequest {

    @NotNull
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private OrganizationType type;

    private Long parentId;
}