package com.web.service;

import com.web.dto.ImportUserResult;
import com.web.entity.*;
import com.web.enums.LogLevel;
import com.web.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.InputStream;
import java.sql.Date;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserImportService {

    private final UserRepository userRepository;

    private final AuthorityRepository authorityRepository;

    private final OrganizationRepository organizationRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserAuthorityRepository userAuthorityRepository;

    private final AuditLogService auditLogService;

    @Transactional
    public ImportUserResult importExcel(MultipartFile file, Long organizationId)
            throws Exception {

        ImportUserResult result = new ImportUserResult();

        List<String> skippedEmails = new ArrayList<>();

        int inserted = 0;
        int total = 0;


        Authority role =
                authorityRepository
                        .findById("ROLE_DOAN_SINH")
                        .orElseThrow();


        Organization org =
                organizationRepository
                        .findById(organizationId)
                        .orElse(null);


        InputStream is = file.getInputStream();

        Workbook workbook = WorkbookFactory.create(is);

        Sheet sheet = workbook.getSheetAt(0);


        for (int i = 1; i <= sheet.getLastRowNum(); i++) {

            Row row = sheet.getRow(i);

            if (row == null) continue;

            total++;

            String email = getCell(row, 0);

            if (email == null || email.isEmpty()) continue;


            /*
             check email exists
             */
            if (userRepository.existsByEmail(email)) {

                skippedEmails.add(email);

                continue;
            }


            /*
             create user
             */
            User user = new User();

            user.setEmail(email);

            user.setFullName(getCell(row, 1));

            user.setPhone(getCell(row, 2));

            user.setIdc(getCell(row, 4));

            user.setAddress(getCell(row, 3));

            user.setActived(true);

            Cell cell = row.getCell(7);
            System.out.println("=== date cell: "+cell.getStringCellValue());
            user.setDob(Date.valueOf(cell.getStringCellValue()));

            user.setGender(getCell(row,8));

            user.setCreatedDate(new java.sql.Date(System.currentTimeMillis()));

            user.setPassword(
                    passwordEncoder.encode("123456")
            );


            userRepository.save(user);


            /*
             add role
             */
            UserAuthority ua = new UserAuthority();

            ua.setUser(user);

            ua.setAuthority(role);

            ua.setOrganization(org);

            ua.setIsDefault(true);

            userAuthorityRepository.save(ua);
//            user.getUserAuthorities().add(ua);
//
//            userRepository.save(user);

            inserted++;
        }


        result.setTotal(total);

        result.setInserted(inserted);

        result.setSkipped(skippedEmails.size());

        result.setSkippedEmails(skippedEmails);


        if (skippedEmails.isEmpty()) {

            result.setMessage("Import thành công toàn bộ");

        } else {

            result.setMessage(
                    "Import thành công " + inserted +
                            ", bỏ qua " + skippedEmails.size()
            );
        }
        auditLogService.save("Tạo tài khoản mới bằng file excel<br>Thành công: "+result.getInserted()+"<>Thất bại: "+result.getSkipped(), LogLevel.INFO);
        return result;
    }


    private String getCell(Row row, int index) {

        Cell cell = row.getCell(index);

        if (cell == null) return null;

        return cell.toString().trim();
    }

}