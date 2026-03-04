package com.web.api;

import com.web.dto.EventRequest;
import com.web.entity.Event;
import com.web.entity.EventRegistration;
import com.web.enums.RegistrationStatus;
import com.web.service.EventRegistrationService;
import com.web.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/event-registration")
public class EventRegistrationApi {

    @Autowired
    private EventRegistrationService eventRegistrationService;

    @PostMapping("/all/create")
    public EventRegistration create(@RequestBody EventRegistration eventRegistration) {
        return eventRegistrationService.create(eventRegistration);
    }

    @GetMapping("/all/my-regis")
    public Page<EventRegistration> myRegis(@RequestParam(required = false) String search,
                                           @RequestParam(required = false) RegistrationStatus status, Pageable pageable) {
        return eventRegistrationService.myRegis(search, status, pageable);
    }

    @GetMapping("/all/check-regis")
    public ResponseEntity<?> checkRegis(@RequestParam Long id) {
        Map<String, String> check = eventRegistrationService.checkRegis(id);
        return new ResponseEntity<>(check, HttpStatus.OK);
    }

    @PostMapping("/all/cancel")
    public ResponseEntity<?> cancel(@RequestParam Long id) {
        EventRegistration e = eventRegistrationService.cancel(id);
        return new ResponseEntity<>(e,HttpStatus.OK);
    }


}
