package com.web.dto;

import com.web.entity.Wards;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.ManyToOne;
import java.sql.Date;

@Getter
@Setter
public class UserResponse {

    private Long id;

    private String email;

    private String code;

    private Boolean actived;

    private Date createdDate;

    private String avatar;

    private String fullName;

    private String rememberKey;

    private String gender;

    private Date dob;

    private String idc;

    private String phone;

    private String address;

    @ManyToOne
    private Wards wards;

    private OrganizationDto organizationDto;
}
