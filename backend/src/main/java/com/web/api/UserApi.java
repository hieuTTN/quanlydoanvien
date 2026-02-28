package com.web.api;

import com.web.dto.*;
import com.web.entity.User;
import com.web.jwt.JwtTokenProvider;
import com.web.repository.UserRepository;
import com.web.service.UserImportService;
import com.web.service.UserService;
import com.web.utils.MailService;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserApi {

    private final UserRepository userRepository;

    private final JwtTokenProvider jwtTokenProvider;

    private final UserUtils userUtils;

    private final MailService mailService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserImportService importService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserApi(UserRepository userRepository, JwtTokenProvider jwtTokenProvider, UserUtils userUtils, MailService mailService) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userUtils = userUtils;
        this.mailService = mailService;
    }

    @PostMapping("/public/login")
    public TokenDto authenticate(@RequestBody LoginDto loginDto) throws Exception {
        TokenDto tokenDto = userService.login(loginDto.getUsername(), loginDto.getPassword(), loginDto.getRecaptchaResponse());
        return tokenDto;
    }

    @PostMapping("/public/login-not-capcha")
    public TokenDto authenticateNotCapCha(@RequestBody LoginDto loginDto) throws Exception {
        TokenDto tokenDto = userService.loginNotCapcha(loginDto.getUsername(), loginDto.getPassword());
        return tokenDto;
    }

    @PostMapping("/admin/create-user")
    public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest){
        User user = userService.create(userRequest);
        return new ResponseEntity<>(user,HttpStatus.CREATED);
    }

    @PostMapping("/admin/update-user")
    public ResponseEntity<?> updateUser(@RequestBody UserRequest userRequest, @RequestParam Long id) {

        User user = userService.update(userRequest, id);
        return new ResponseEntity<>(user,HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/delete")
    public ResponseEntity<?> delete(@RequestParam("id") Long id){
        userService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/public/quen-mat-khau")
    public ResponseEntity<?> quenMatKhau(@RequestParam String email) throws URISyntaxException {
        userService.guiYeuCauQuenMatKhau(email);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/public/dat-lai-mat-khau")
    public ResponseEntity<?> datLaiMatKhau(@RequestParam String email, @RequestParam String key,
                                           @RequestParam String password) throws URISyntaxException {
        userService.xacNhanDatLaiMatKhau(email, password, key);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/admin/lockOrUnlockUser")
    public void activeOrUnactiveUser(@RequestParam("id") Long id){
        User user = userRepository.findById(id).get();
        if(user.getActived() == true){
            user.setActived(false);
            userRepository.save(user);
            return;
        }
        else{
            user.setActived(true);
            userRepository.save(user);
        }
    }

    @GetMapping("/admin/get-user-by-role")
    public ResponseEntity<?> getUserByRole(@RequestParam(value = "role", required = false) String role){
        List<User> list = null;
        if(role == null){
            list = userRepository.findAll();
        }
        else{
            list = userRepository.findByRole(role);
        }
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @GetMapping("/admin/find-by-id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") Long id){
        User user = userRepository.findById(id).get();
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/admin/save-by-file")
    public ResponseEntity<?> saveUserByFile(@RequestParam("file") MultipartFile file, @RequestParam String role, @RequestParam Long departmentId) throws IOException, ParseException {
        userService.saveByFile(file, role, departmentId);
        return new ResponseEntity<>("Upload Success", HttpStatus.CREATED);
    }

    @PostMapping("/all/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordDto passwordDto){
        userService.changePass(passwordDto.getOldPass(), passwordDto.getNewPass());
        return new ResponseEntity<>("Success", HttpStatus.OK);
    }

    @PostMapping("/admin/create-update")
    public User createOrUpdate(@RequestBody UserDTO dto) {
        return userService.save(dto);
    }

    @GetMapping("/admin/search")
    public Page<User> searchUsers(@RequestParam(required = false) String keyword, @RequestParam(required = false) String authority,
            @RequestParam(required = false) Long organizationId, @RequestParam(required = false) Boolean actived,Pageable pageable) {
        return userService.searchUsers(keyword,authority,organizationId,actived,pageable);
    }

    @GetMapping("/admin/{id}")
    public User getById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping("/admin/import")
    public ImportUserResult importUsers(

            @RequestParam MultipartFile file,

            @RequestParam Long organizationId

    ) throws Exception {

        return importService.importExcel(file, organizationId);

    }


    @GetMapping("/admin/check-role-admin")
    public void checkRoleAdmin(){
        System.out.println("admin");
    }

    @GetMapping("/employee/check-role-employee")
    public void checkRoleEmployee(){
        System.out.println("employee");
    }

    @GetMapping("/user/check-role-user")
    public void checkRoleUser(){
        System.out.println("user");
    }


}
