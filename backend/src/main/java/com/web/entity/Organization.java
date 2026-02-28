package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.web.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organization")
@Getter
@Setter
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String breadcrumb;

    @Enumerated(EnumType.STRING)
    private OrganizationType type; // CHAU, DAO, LIEN_DOAN, DOAN

    private String path; // Ví dụ: "/1/5/12/" (idChau/idDao/idLienDoan)

    // Thay vì dùng Long parentId, ta dùng chính đối tượng Organization
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference // Ngăn không cho render ngược lại Cha khi đang ở Con
    private Organization parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonManagedReference // Cho phép render danh sách Con từ Cha
    private List<Organization> children = new ArrayList<>();
}
