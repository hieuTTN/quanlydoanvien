package com.web.dto;

import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.util.List;

@Getter
@Setter
public class UserDTO {

    private Long id;

    private String email;

    private String password; // để trống -> giữ nguyên password cũ

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

    private String wardCode;

    // authority
    private List<UserAuthorityDTO> authorities;

}