package com.web.dto;

import com.web.entity.Authority;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class UserRequest {

    private String email;

    private String password;

    private String avatar;

    private String fullName;

    private Long departmentId;

    private String phone;

    private String address;

    private Boolean isDean;

    private Date dob;

    private String idc;

    private List<Authority> authorities = new ArrayList<>();
}
