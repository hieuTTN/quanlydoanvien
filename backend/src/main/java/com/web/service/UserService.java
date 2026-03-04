package com.web.service;


import com.web.dto.*;
import com.web.entity.*;
import com.web.enums.LogLevel;
import com.web.exception.MessageException;
import com.web.jwt.JwtTokenProvider;
import com.web.mapper.UserMapper;
import com.web.repository.*;
import com.web.utils.CloudinaryService;
import com.web.utils.MailService;
import com.web.utils.ReCaptchaUtil;
import com.web.utils.UserUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Predicate;
import javax.transaction.Transactional;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Autowired
    private UserUtils userUtils;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserAuthorityRepository userAuthorityRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private WardsRepository wardsRepository;

    @Autowired
    private AuditLogService auditLogService;




    @Autowired
    private ReCaptchaUtil reCaptchaUtil;

    public TokenDto login(String email, String password, String recaptchaResponse) throws Exception {
        if(recaptchaResponse == null){
            throw new MessageException("Hãy xác thực người dùng");
        }
        if(reCaptchaUtil.verifire(recaptchaResponse) == false){
            throw new MessageException("capcha require");
        }
        Optional<User> users = userRepository.findByEmail(email);
        System.out.println("tìm thấy user");
        // check infor user
        checkUser(users);
        if(passwordEncoder.matches(password, users.get().getPassword())){
            CustomUserDetails customUserDetails = new CustomUserDetails(users.get());
            String token = jwtTokenProvider.generateToken(customUserDetails);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setUser(users.get());
            return tokenDto;
        }
        else{
            throw new MessageException("Mật khẩu không chính xác", 400);
        }
    }

    public TokenDto loginNotCapcha(String email, String password) throws Exception {
        Optional<User> users = userRepository.findByEmail(email);
        // check infor user
        checkUser(users);
        if(passwordEncoder.matches(password, users.get().getPassword())){
            CustomUserDetails customUserDetails = new CustomUserDetails(users.get());
            String token = jwtTokenProvider.generateToken(customUserDetails);
            TokenDto tokenDto = new TokenDto();
            tokenDto.setToken(token);
            tokenDto.setUser(users.get());
            auditLogService.saveByEmail("Đăng nhập thành công",LogLevel.INFO,email);
            return tokenDto;
        }
        else{
            auditLogService.saveByEmail("Đăng nhập thất bại",LogLevel.WARNING,email);
            throw new MessageException("Mật khẩu không chính xác", 400);
        }
    }


    public User create(UserRequest userRequest) {
        User user = userMapper.requestToUser(userRequest);
        user.setId(null);
        user.setActived(true);
        for(Authority a : userRequest.getAuthorities()){
            if(authorityRepository.findById(a.getName()).isEmpty()){
                throw new MessageException("Không tìm thấy role: "+a.getName());
            }
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Optional<User> ex = userRepository.findByEmail(user.getEmail());
        if(ex.isPresent()){
            throw new MessageException("Email đã được sử dụng");
        }
        user.setCreatedDate(new Date(System.currentTimeMillis()));
        User result = userRepository.save(user);
        for(Authority a : userRequest.getAuthorities()){
            UserAuthority userAuthority = new UserAuthority();
            userAuthority.setUser(result);
            userAuthority.setAuthority(a);
            userAuthorityRepository.save(userAuthority);
        }
        return result;
    }


    public User update(UserRequest userRequest, Long id) {
        User user = userMapper.requestToUser(userRequest);
        user.setId(id);
        for(Authority a : userRequest.getAuthorities()){
            if(authorityRepository.findById(a.getName()).isEmpty()){
                throw new MessageException("Không tìm thấy role: "+a.getName());
            }
        }
        Optional<User> exist = userRepository.findByEmailAndId(user.getEmail(), id);
        if(exist.isPresent()){
            throw new MessageException("Email đã được sử dụng");
        }
        Optional<User> ex = userRepository.findById(id);
        if(ex.isEmpty()){
            throw new MessageException("KhÔng tìm thấy tài khoản");
        }
        user.setCreatedDate(ex.get().getCreatedDate());
        user.setPassword(ex.get().getPassword());
        user.setActived(ex.get().getActived());
        user.setCode(com.web.utils.StringUtils.lpad(id.toString(),6,'0'));
        user.setCode("BM"+user.getCode());
        User result = userRepository.save(user);

        userAuthorityRepository.deleteByUser(result.getId());
        for(Authority a : userRequest.getAuthorities()){
            UserAuthority userAuthority = new UserAuthority();
            userAuthority.setUser(result);
            userAuthority.setAuthority(a);
            userAuthorityRepository.save(userAuthority);
        }
        return result;
    }

    @Transactional
    public void delete(Long categoryId) {
        try {
            User u = userRepository.findById(categoryId).orElse(null);
            userRepository.deleteById(categoryId);
            auditLogService.save("Xóa tài khoản, id: "+categoryId+" - Email: "+u.getEmail(), LogLevel.WARNING);
        }catch (Exception e){
            throw new MessageException("User này không thể xóa do có nhiều liên kết");
        }
    }

    public void guiYeuCauQuenMatKhau(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        checkUser(user);
        String random = userUtils.randomKey();
        user.get().setRememberKey(random);
        userRepository.save(user.get());
        mailService.sendEmail(email, "Đặt lại mật khẩu",
                "Chúng tôi đã tạo một mật khẩu mới từ yêu cầu của bạn<br>" +
                "Hãy lick vào bên dưới để đặt lại mật khẩu mới của bạn<br><br>" +
                "<a href='http://127.0.0.1:5500/datlaimatkhau.html?email="+email+"&key="+random+"' style=\"background-color: #2f5fad; padding: 10px; color: #fff; font-size: 18px; font-weight: bold;\">Đặt lại mật khẩu</a>",false, true);
        auditLogService.saveByEmail("Gửi yêu cầu quên mật khẩu",LogLevel.WARNING,email);
    }

    public void xacNhanDatLaiMatKhau(String email, String password, String key) {
        Optional<User> user = userRepository.findByEmail(email);
        checkUser(user);
        if(user.get().getRememberKey().equals(key)){
            user.get().setPassword(passwordEncoder.encode(password));
            userRepository.save(user.get());
            auditLogService.saveByEmail("Đặt lại mật khẩu mới",LogLevel.INFO,email);
        }
        else{
            throw new MessageException("Mã xác thực không chính xác");
        }
    }


    public Boolean checkUser(Optional<User> users){
        if(users.isPresent() == false){
            throw new MessageException("Không tìm thấy tài khoản", 404);
        }
        else if(users.get().getActived() == false){
            throw new MessageException("Tài khoản đã bị khóa", 500);
        }
        return true;
    }

    public void saveByFile(MultipartFile multipartFile, String role, Long departmentId) throws IOException, ParseException {
        File files = cloudinaryService.convertMultiPartToFile(multipartFile);
        Optional<Authority> authority = authorityRepository.findById(role);
        if(authority.isEmpty()){
            throw new MessageException("Không tìm thấy quyền");
        }

        List<User> list = new ArrayList<>();
        FileInputStream file = new FileInputStream(files);
        XSSFWorkbook workbook = new XSSFWorkbook(file);
        XSSFSheet sheet = workbook.getSheetAt(0);
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd/MM/yyyy");
        Iterator<Row> rowIterator = sheet.iterator();

        while (rowIterator.hasNext()) {
            User user = new User();
            user.setPassword(passwordEncoder.encode("12345"));
            user.setCreatedDate(new Date(System.currentTimeMillis()));
            user.setActived(true);

            Row row = rowIterator.next();
            Iterator<Cell> cellIterator = row.cellIterator();
            if(row.getRowNum() > 0 && checkIfRowIsEmpty(row) == false) {
                while (cellIterator.hasNext()) {
                    Cell cell = cellIterator.next();
                    if (cell.getColumnIndex() == 0) {
                        user.setEmail(cell.getStringCellValue());
                    }
                    if (cell.getColumnIndex() == 1) {
                        user.setFullName(cell.getStringCellValue());
                    }
                    if (cell.getColumnIndex() == 2) {
                        String ngs = cell.getStringCellValue();
                        java.util.Date date = simpleDateFormat.parse(ngs);
                        user.setDob(new Date(date.getTime()));
                    }
                    if (cell.getColumnIndex() == 3) {
                        user.setIdc(cell.getStringCellValue());
                    }
                    if (cell.getColumnIndex() == 4) {
                        user.setPhone(cell.getStringCellValue());
                    }
                    if (cell.getColumnIndex() == 5) {
                        user.setAddress(cell.getStringCellValue());
                    }
                }
                list.add(user);
            }
        }
        for(User u : list){
            Optional<User> user = userRepository.findByEmail(u.getEmail());
            if(user.isPresent()){
                throw new MessageException("Email: "+u.getEmail()+" đã được sử dụng");
            }
        }
        for(User u : list){
            User result = userRepository.save(u);
            UserAuthority userAuthority = new UserAuthority();
            userAuthority.setAuthority(authority.get());
            userAuthority.setUser(result);
            userAuthorityRepository.save(userAuthority);
        }
        file.close();
        workbook.close();

    }

    private boolean checkIfRowIsEmpty(Row row) {
        if (row == null) {
            return true;
        }
        if (row.getLastCellNum() <= 0) {
            return true;
        }
        for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK && StringUtils
                    .isNotBlank(cell.toString())) {
                return false;
            }
        }
        return true;
    }

    public void changePass(String oldPass, String newPass) {
        User user = userUtils.getUserWithAuthority();
        if(passwordEncoder.matches(oldPass, user.getPassword())){
            user.setPassword(passwordEncoder.encode(newPass));
            userRepository.save(user);
            auditLogService.saveByEmail("Thay đổi mật khẩu mới",LogLevel.INFO, user.getEmail());
        }
        else{
            auditLogService.saveByEmail("Thay đổi mật khẩu mới thất bại",LogLevel.ERROR, user.getEmail());
            throw new MessageException("Mật khẩu cũ không chính xác", 500);
        }
    }

    @Transactional
    public User save(UserDTO dto) {
        User user;
        if (dto.getId() == null) {

            // CREATE
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new MessageException("Email đã tồn tại");
            }

            if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
                throw new MessageException("Password không được để trống");
            }

            user = new User();

            user.setCreatedDate(new Date(System.currentTimeMillis()));

            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            auditLogService.save("Tạo tài khoản mới, Email: "+dto.getEmail(), LogLevel.INFO);
        }
        else {

            // UPDATE
            user = userRepository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

            // email duplicate check
            if(userRepository.findByEmailAndId(dto.getEmail(), dto.getId()).isPresent()){
                throw new MessageException("Email đã được sử dụng cho tài khoản khác");
            }

            // PASSWORD LOGIC CHUẨN
            if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {

                user.setPassword(passwordEncoder.encode(dto.getPassword()));

            }
            // nếu null hoặc empty -> giữ nguyên password cũ
            auditLogService.save("Cập nhật thông tin tài khoản, Email: "+dto.getEmail(), LogLevel.INFO);

        }

        // set common fields

        user.setEmail(dto.getEmail());
        user.setActived(dto.getActived());
        user.setAvatar(dto.getAvatar());
        user.setFullName(dto.getFullName());
        user.setRememberKey(dto.getRememberKey());
        user.setGender(dto.getGender());
        user.setDob(dto.getDob());
        user.setIdc(dto.getIdc());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setIdc(dto.getIdc());

        if (dto.getWardCode() != null) {

            Wards wards = wardsRepository.findById(dto.getWardCode())
                    .orElse(null);

            user.setWards(wards);
        }

        user = userRepository.save(user);


        // SAVE AUTHORITY
        if (dto.getAuthorities() != null) {

            userAuthorityRepository.deleteByUserId(user.getId());

            List<UserAuthority> list = new ArrayList<>();

            for (UserAuthorityDTO a : dto.getAuthorities()) {

                UserAuthority ua = new UserAuthority();

                ua.setUser(user);

                Authority authority = authorityRepository
                        .findById(a.getAuthorityName())
                        .orElseThrow(() -> new MessageException("Authority không tồn tại"));

                ua.setAuthority(authority);

                Organization org = null;
                if(a.getOrganizationId() != null){
                    org = organizationRepository
                            .findById(a.getOrganizationId())
                            .orElse(null);
                }

                ua.setOrganization(org);

                ua.setIsHead(a.getIsHead());

                ua.setIsDefault(a.getIsDefault());

                list.add(ua);
            }

            userAuthorityRepository.saveAll(list);
        }

        return user;
    }


    public User findById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
    }

    public Page<User> searchUsers(
            String keyword,
            String authorityName,
            Long organizationId,
            Boolean actived,
            Pageable pageable
    ) {

        return userRepository.findAll((root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // tránh duplicate do join many
            query.distinct(true);

        /*
         keyword search
         */
            if (keyword != null && !keyword.trim().isEmpty()) {

                String pattern = "%" + keyword.toLowerCase().trim() + "%";

                predicates.add(cb.or(

                        cb.like(cb.lower(root.get("email")), pattern),

                        cb.like(cb.lower(root.get("fullName")), pattern),

                        cb.like(cb.lower(root.get("phone")), pattern),

                        cb.like(cb.lower(root.get("idc")), pattern)
                ));
            }


        /*
         filter actived
         */
            if (actived != null) {

                predicates.add(cb.equal(root.get("actived"), actived));

            }


        /*
         join UserAuthority
         */
            if (authorityName != null || organizationId != null) {

                Join<User, UserAuthority> uaJoin =
                        root.join("userAuthorities", JoinType.INNER);


            /*
             filter authority
             */
                if (authorityName != null && !authorityName.isEmpty()) {

                    predicates.add(
                            cb.equal(
                                    uaJoin.get("authority").get("name"),
                                    authorityName
                            )
                    );
                }


            /*
             filter organization
             */
                if (organizationId != null) {

                    predicates.add(
                            cb.equal(
                                    uaJoin.get("organization").get("id"),
                                    organizationId
                            )
                    );
                }

            }

            return cb.and(predicates.toArray(new Predicate[0]));

        }, pageable);

    }

    public User updateMyInfor(UserUpdate userUpdate) {
        User user = userUtils.getUserWithAuthority();
        user.setGender(userUpdate.getGender());
        user.setPhone(userUpdate.getPhone());
        user.setAvatar(userUpdate.getAvatar());
        user.setFullName(userUpdate.getFullName());
        user.setDob(userUpdate.getDob());
        user.setWards(userUpdate.getWards());
        user.setAddress(userUpdate.getAddress());
        return userRepository.save(user);
    }
}
