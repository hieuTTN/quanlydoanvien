package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "users_authority")
@Getter
@Setter
public class UserAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ManyToOne
    @JoinColumn(name = "authority_name")
    private Authority authority;

    private Boolean isHead = false;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    @JsonIgnoreProperties(value = {"parent","children"})
    private Organization organization;

    @Column(name = "is_default")
    private Boolean isDefault = false; // Đánh dấu vai trò mặc định khi đăng nhập
}
