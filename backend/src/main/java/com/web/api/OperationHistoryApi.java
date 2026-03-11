package com.web.api;

import com.web.dto.OrganizationCreateRequest;
import com.web.dto.OrganizationDto;
import com.web.entity.OperationHistory;
import com.web.repository.OperationHistoryRepository;
import com.web.service.OperationHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/OperationHistory")
public class OperationHistoryApi {

    @Autowired
    private OperationHistoryService operationHistoryService;

    @Autowired
    private OperationHistoryRepository repository;

    // CREATE
    @PostMapping("/all/create")
    public OperationHistory create(@Valid @RequestBody OperationHistory request) {
        return operationHistoryService.save(request);
    }

    @GetMapping("/all/find-by-user")
    public List<OperationHistory> findAllByUser(@RequestParam Long userID){
        return operationHistoryService.findByUserId(userID);
    }

    @DeleteMapping("/all/delete")
    public void delete(@RequestParam Long id) {
        repository.deleteById(id);
    }
}
