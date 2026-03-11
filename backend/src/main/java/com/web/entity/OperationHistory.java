package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.sql.Date;
import java.time.LocalDateTime;

@Entity
@Table(name = "operation_history")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class OperationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    private String title;

    private String content;

    private Date startDate;

    private Date endDate;

    private Long eventRegistrationId;

    @CreatedDate
    @Column(updatable = false)
    @JsonFormat(pattern = "HH:mm dd/MM/yyyy")
    private LocalDateTime createdDate;

    @ManyToOne
    @JsonBackReference
    private User user;
}
