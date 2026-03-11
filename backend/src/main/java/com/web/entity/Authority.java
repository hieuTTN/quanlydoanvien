package com.web.entity;

import com.web.enums.OrganizationType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;

@Entity
@Table(name = "authority")
@Getter
@Setter
public class Authority {

    @Id
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private OrganizationType organizationType;

    private Integer level;

}
