package com.web.repository;

import com.web.entity.Organization;
import com.web.enums.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Arrays;
import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long>, JpaSpecificationExecutor<Organization> {

    Page<Organization> findByPathStartingWith(String path, Pageable pageable);

    // Kiểm tra tồn tại con để chặn xóa
    boolean existsByParentId(Long parentId);

    List<Organization> findByPathStartingWith(String path);

    @Query("select o from Organization o where o.type = ?1")
    List<Organization> findByType(OrganizationType type);
}
