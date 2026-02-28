package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "wards")
@Getter
@Setter
@JsonIgnoreProperties(value = {"wards"})
public class Wards {

    @Id
    private String code;

    private String name;

    private String administrativeLevel;

    private String provinceCode;

    private String provinceName;

}
