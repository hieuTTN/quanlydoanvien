package com.web.mapper;
import com.web.dto.UserRequest;
import com.web.entity.User;
import com.web.exception.MessageException;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserMapper {

    @Autowired
    private ModelMapper mapper;


    public User requestToUser(UserRequest userRequest){
        User user = mapper.map(userRequest, User.class);
        return user;
    }

}
