package com.web.dto;

import com.web.entity.Wards;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.ManyToOne;
import java.sql.Date;

@Getter
@Setter
public class UserUpdate {

    private String avatar;

    private String fullName;

    private String gender;

    private Date dob;

    private String job;

    private String religion;

    private String phone;

    private String address;

    private Wards wards;
}
