package com.web.api;

import com.web.dto.EventFilterRequest;
import com.web.dto.EventRequest;
import com.web.dto.EventStatusDto;
import com.web.entity.Event;
import com.web.enums.EventStatus;
import com.web.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventApi {

    private final EventService eventService;

    @PostMapping("/admin/create")
    public Event create(@RequestBody EventRequest req) {
        return eventService.create(req);
    }

    @PostMapping("/admin/update/{id}")
    public Event update(@PathVariable Long id,@RequestBody EventRequest req) {
        return eventService.update(id, req);
    }

    @DeleteMapping("/admin/delete")
    public void delete(@RequestParam Long id) {
        eventService.delete(id);
    }

    @GetMapping("/all/find-by-id")
    public Event get(@RequestParam Long id) {
        return eventService.get(id);
    }

    @PostMapping("/all/search")
    public Page<Event> search(@RequestBody(required = false) EventFilterRequest filter, Pageable pageable) {
        return eventService.search(filter, pageable );
    }

    @GetMapping("/all/get-by-param")
    public Page<Event> search(@RequestParam(required = false) String search, Pageable pageable) {
        return eventService.filterByParam(search == null?"%%":"%"+search+"%", pageable );
    }

    @GetMapping("/all/statuses")
    public List<EventStatusDto> getStatuses() {
        return Arrays.stream(EventStatus.values())
                .map(status -> new EventStatusDto(
                        status.name(),
                        status.getDisplayName(),
                        status.getColor()
                ))
                .toList();
    }

}