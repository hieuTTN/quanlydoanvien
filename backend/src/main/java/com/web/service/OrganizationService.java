package com.web.service;

import com.web.dto.OrganizationCreateRequest;
import com.web.dto.OrganizationDto;
import com.web.dto.OrganizationTypeDto;
import com.web.dto.OrganizationUpdateRequest;
import com.web.entity.Organization;
import com.web.enums.LogLevel;
import com.web.enums.OrganizationType;
import com.web.exception.MessageException;
import com.web.repository.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<OrganizationTypeDto> getOrganizationTypes() {
        List<OrganizationTypeDto> list = new ArrayList<>();
        for (OrganizationType type : OrganizationType.values()) {

            list.add(new OrganizationTypeDto(
                    type.name(),
                    type.getDisplayName(),
                    type.getLevel(),
                    type.getIcon()
            ));
        }
        return list;
    }

    private void validateParentType(Organization parent, OrganizationType childType) {

        if (parent.getType().getLevel() >= childType.getLevel()) {

            throw new MessageException(
                    "Cấp cha phải cao hơn cấp con. Parent="
                            + parent.getType().getDisplayName()
                            + ", Child="
                            + childType.getDisplayName()
            );
        }
    }

    public Page<OrganizationDto> getAll(String name, Pageable pageable) {
        Specification<Organization> spec = (root, query, cb) -> {
            if (name == null || name.isEmpty()) return cb.conjunction();
            return cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
        Page<Organization> orgPage = organizationRepository.findAll(spec, pageable);

        // Chuyển đổi sang Page<OrganizationDto> bằng .map()
        // Hàm toDto sẽ được gọi cho từng phần tử trong Page
        return orgPage.map(this::toDto);
    }

    public List<OrganizationDto> getAllList() {
        return organizationRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<OrganizationDto> findByType(OrganizationType type) {
        return organizationRepository.findByType(type).stream()
                .map(this::toDto)
                .toList();
    }

    public OrganizationDto create(OrganizationCreateRequest request) {

        validateCreateRequest(request);

        Organization parent = null;

        if (request.getParentId() != null) {

            parent = organizationRepository.findById(request.getParentId())
                    .orElseThrow(() -> new MessageException("Không tìm thấy tổ chức cha"));

            validateParentChildRelation(parent.getType(), request.getType());
        }

        Organization org = new Organization();

        org.setName(request.getName().trim());

        org.setType(request.getType());

        org.setParent(parent);

        organizationRepository.save(org);

        // build path sau khi có id
        org.setPath(buildPath(parent, org.getId()));
        org.setBreadcrumb(buildBreadcrumbFromPath(org.getPath()));

        organizationRepository.save(org);
        auditLogService.save("Thêm tổ chức mới", LogLevel.INFO);
        return toDto(org);
    }

    public OrganizationDto update(OrganizationUpdateRequest request) {

        validateUpdateRequest(request);

        Organization org = organizationRepository.findById(request.getId())
                .orElseThrow(() -> new MessageException("Không tìm thấy tổ chức"));

        Organization parent = null;

        if (request.getParentId() != null) {

            parent = organizationRepository.findById(request.getParentId())
                    .orElseThrow(() -> new MessageException("Không tìm thấy tổ chức cha"));

            // check không cho chọn chính nó làm cha
            if (parent.getId().equals(org.getId())) {

                throw new MessageException("Không thể chọn chính nó làm cha");
            }

            // check loop
            validateNoLoop(org, parent);

            // check level
            validateParentChildRelation(parent.getType(), request.getType());
        }

        boolean parentChanged =
                (org.getParent() == null && parent != null)
                        || (org.getParent() != null && parent == null)
                        || (org.getParent() != null && parent != null
                        && !org.getParent().getId().equals(parent.getId()));

        org.setName(request.getName().trim());

        org.setType(request.getType());

        org.setParent(parent);

        // update path nếu parent đổi
        if (parentChanged) {

            String oldPath = org.getPath();

            String newPath = buildPath(parent, org.getId());

            org.setPath(newPath);

            String be = buildBreadcrumbFromPath(newPath);
            org.setBreadcrumb(be);

            organizationRepository.save(org);

            updateChildrenPath(oldPath, newPath);
        }
        else {
            String be = buildBreadcrumbFromPath(org.getPath());
            org.setBreadcrumb(be);
            organizationRepository.save(org);
        }
        auditLogService.save("Cập nhật tổ chức, id: "+org.getId(), LogLevel.INFO);

        return toDto(org);
    }

    public void delete(Long id) {

        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy tổ chức"));

        if (!org.getChildren().isEmpty()) {

            throw new MessageException("Không thể xóa tổ chức đang có cấp con");
        }

        organizationRepository.delete(org);
        auditLogService.save("Xóa tổ chức, id tổ chức: "+id, LogLevel.WARNING);

    }

    public OrganizationDto getById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new MessageException("Không tìm thấy tổ chức"));

        return toDto(org);
    }


    // ================= HELPER =================

    private void validateCreateRequest(OrganizationCreateRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {

            throw new MessageException("Tên không được để trống");
        }

        if (request.getType() == null) {

            throw new MessageException("Type không được để trống");
        }
    }

    private void validateUpdateRequest(OrganizationUpdateRequest request) {

        if (request.getId() == null) {

            throw new MessageException("Id không được null");
        }

        validateCreateRequest(
                new OrganizationCreateRequest() {{
                    setName(request.getName());
                    setType(request.getType());
                }}
        );
    }

    // validate cấp bậc

    private void validateParentChildRelation(
            OrganizationType parentType,
            OrganizationType childType
    ) {

        if (parentType.getLevel() >= childType.getLevel()) {

            throw new MessageException(
                    "Cấp cha phải cao hơn cấp con. Parent="
                            + parentType.getDisplayName()
                            + ", Child="
                            + childType.getDisplayName()
            );
        }
    }


    private String buildPath(Organization parent, Long id) {

        if (parent == null)
            return "/" + id + "/";

        return parent.getPath() + id + "/";
    }

    private String buildBreadcrumbFromPath(String path) {

        String[] parts = path.split("/");

        List<Long> ids = new ArrayList<>();

        for (String p : parts) {
            if (!p.isBlank()) {
                ids.add(Long.parseLong(p));
            }
        }

        List<Organization> orgs = organizationRepository.findAllById(ids);

        Map<Long, Organization> map =
                orgs.stream().collect(Collectors.toMap(
                        Organization::getId,
                        o -> o
                ));

        StringBuilder breadcrumb = new StringBuilder();

        for (Long id : ids) {

            Organization org = map.get(id);

            if (breadcrumb.length() > 0)
                breadcrumb.append(" / ");

            breadcrumb.append("<a data-id=\"")
                    .append(org.getId())
                    .append("\">")
                    .append(org.getName())
                    .append("</a>");
        }

        return breadcrumb.toString();
    }

    // update toàn bộ children khi đổi parent

    private void updateChildrenPath(String oldPath, String newPath) {

        List<Organization> children =
                organizationRepository.findByPathStartingWith(oldPath);

        for (Organization child : children) {

            if (!child.getPath().equals(oldPath)) {

                child.setPath(
                        child.getPath().replaceFirst(oldPath, newPath)
                );

                organizationRepository.save(child);
            }
        }
    }


    private OrganizationDto toDto(Organization org) {

        OrganizationDto dto = new OrganizationDto();

        dto.setId(org.getId());

        dto.setName(org.getName());

        dto.setType(org.getType().name());

        dto.setTypeDisplayName(org.getType().getDisplayName());

        dto.setTypeLevel(org.getType().getLevel());

        dto.setTypeIcon(org.getType().getIcon());

        dto.setPath(org.getPath());

        dto.setBreadcrumb(org.getBreadcrumb());

        if (org.getParent() != null) {

            dto.setParentId(org.getParent().getId());

            dto.setParentName(org.getParent().getName());
        }

        return dto;
    }

    private void validateNoLoop(Organization org, Organization parent) {

        Organization temp = parent;

        while (temp != null) {

            if (temp.getId().equals(org.getId())) {

                throw new MessageException("Không thể chọn cấp con làm cha (loop detected)");
            }

            temp = temp.getParent();
        }
    }
}
