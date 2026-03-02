package com.web.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Event_update_by")
@Getter
@Setter
@EntityListeners(AuditingEntityListener.class)
public class EventUpdateBy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JsonBackReference
    private Event event;

    @CreatedDate
    @Column(updatable = false)
    @JsonFormat(pattern = "HH:mm dd/MM/yyyy")
    private LocalDateTime createdDate;
}
