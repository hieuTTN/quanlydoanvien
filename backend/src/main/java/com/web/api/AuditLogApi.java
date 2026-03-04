package com.web.api;

import com.web.entity.AuditLog;
import com.web.enums.LogLevel;
import com.web.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class AuditLogApi {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/admin/find-all")
    public ResponseEntity<Page<AuditLog>> getLogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LogLevel logLevel,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to, Pageable pageable) {

        return ResponseEntity.ok(auditLogService.getLogs(keyword, logLevel, from, to, pageable));
    }

    @GetMapping("/all/find-all")
    public ResponseEntity<Page<AuditLog>> getLogsByUser(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to, Pageable pageable) {

        return ResponseEntity.ok(auditLogService.getLogsByUser(from, to, pageable));
    }


}
