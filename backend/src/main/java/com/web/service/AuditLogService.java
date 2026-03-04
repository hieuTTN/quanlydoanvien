package com.web.service;

import com.web.entity.AuditLog;
import com.web.entity.User;
import com.web.enums.LogLevel;
import com.web.repository.AuditLogRepository;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository repository;

    @Autowired
    private UserUtils userUtils;

    public void save(String content, LogLevel logLevel){
        User user = userUtils.getUserWithAuthority();
        AuditLog auditLog = new AuditLog();
        auditLog.setActionContent(content);
        auditLog.setCreatedDate(LocalDateTime.now());
        auditLog.setAvatar(user.getAvatar());
        auditLog.setUsername(user.getEmail());
        auditLog.setFullName(user.getFullName());
        auditLog.setLogLevel(logLevel);
        repository.save(auditLog);
    }

    public void saveByEmail(String content, LogLevel logLevel, String email){
        AuditLog auditLog = new AuditLog();
        auditLog.setActionContent(content);
        auditLog.setCreatedDate(LocalDateTime.now());
        auditLog.setUsername(email);
        auditLog.setLogLevel(logLevel);
        repository.save(auditLog);
    }



    public Page<AuditLog> getLogs(String keyword, LogLevel level, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return repository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                String pattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("actionContent")), pattern),
                        cb.like(cb.lower(root.get("username")), pattern)
                ));
            }

            if (level != null) {
                predicates.add(cb.equal(root.get("logLevel"), level));
            }

            if (from != null && to != null) {
                predicates.add(cb.between(root.get("createdDate"), from, to));
            } else if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdDate"), from));
            } else if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdDate"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    public Page<AuditLog> getLogsByUser(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        User user = userUtils.getUserWithAuthority();
        return repository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("username"), user.getEmail()));
            if (from != null && to != null) {
                predicates.add(cb.between(root.get("createdDate"), from, to));
            }
            else if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdDate"), from));
            }
            else if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdDate"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }
}
