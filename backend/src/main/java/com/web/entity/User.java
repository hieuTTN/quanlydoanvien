package com.web.entity;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import java.sql.Date;
import java.sql.Time;
import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String email;

    private String code;

    private String password;

    private Boolean actived;

    private Date createdDate;

    private String avatar;

    private String fullName;

    private String rememberKey;

    private String gender;

//    @JsonFormat(pattern = "dd/MM/yyyy")
    private Date dob;

    private String idc;

    private String phone;

    private String address;

    @ManyToOne
    private Wards wards;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @JsonManagedReference
    private List<UserAuthority> userAuthorities;
}

