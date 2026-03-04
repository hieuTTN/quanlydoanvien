package com.web.api;

import com.web.dto.OrganizationCreateRequest;
import com.web.dto.OrganizationDto;
import com.web.dto.OrganizationTypeDto;
import com.web.dto.OrganizationUpdateRequest;
import com.web.entity.Organization;
import com.web.entity.Province;
import com.web.enums.OrganizationType;
import com.web.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationApi {

    private final OrganizationService service;

    @GetMapping("/all/find-all")
    public Page<OrganizationDto> findAll(@RequestParam(required = false) String name, Pageable pageable){
        return service.getAll(name, pageable);
    }

    @GetMapping("/all/find-all-list")
    public List<OrganizationDto> findAllList(){
        return service.getAllList();
    }

    @GetMapping("/all/find-by-type")
    public List<OrganizationDto> findByTpe(@RequestParam OrganizationType organizationType){
        return service.findByType(organizationType);
    }

    @GetMapping("/all/find-by-user")
    public List<OrganizationDto> findAllByUser(){
        return service.findOrganizationByUser();
    }

    @GetMapping("/all/types")
    public List<OrganizationTypeDto> allType(){
        return service.getOrganizationTypes();
    }

    // CREATE
    @PostMapping("/admin/create")
    public OrganizationDto create(@Valid @RequestBody OrganizationCreateRequest request) {
        return service.create(request);
    }

    // UPDATE
    @PostMapping("/admin/update")
    public OrganizationDto update(@Valid @RequestBody OrganizationUpdateRequest request) {
        return service.update(request);
    }

    // DELETE
    @DeleteMapping("/admin/delete")
    public void delete(@RequestParam Long id) {
        service.delete(id);
    }

    // GET
    @GetMapping("/all/find-by-id")
    public OrganizationDto get(@RequestParam Long id) {
        return service.getById(id);
    }

}
