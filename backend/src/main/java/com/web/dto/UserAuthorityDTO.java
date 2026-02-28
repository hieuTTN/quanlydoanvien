package com.web.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAuthorityDTO {

    private Long id;

    private String authorityName;

    private Long organizationId;

    private Boolean isHead;

    private Boolean isDefault;

}