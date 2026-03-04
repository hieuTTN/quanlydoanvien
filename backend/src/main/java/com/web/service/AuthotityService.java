package com.web.service;

import com.web.entity.Authority;
import com.web.entity.Organization;
import com.web.entity.User;
import com.web.repository.AuthorityRepository;
import com.web.repository.UserAuthorityRepository;
import com.web.utils.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.OptionalInt;
import java.util.stream.Collectors;

@Component
public class AuthotityService {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private UserAuthorityRepository userAuthorityRepository;

    @Autowired
    private UserUtils userUtils;

    public List<Authority> findAll(){
        return authorityRepository.findAll();
    }

    public List<Authority> findByUser(){
        User user = userUtils.getUserWithAuthority();

        List<Authority> list = userAuthorityRepository.findAuthorityByUser(user.getId());

        int minLevel = list.stream()
                .filter(a -> a.getOrganizationType() != null)
                .mapToInt(a -> a.getOrganizationType().getLevel())
                .min()
                .orElse(Integer.MAX_VALUE);

        List<Authority> all = authorityRepository.findAll();

        List<Authority> resultList = all.stream()
                .filter(a -> a.getOrganizationType() != null)
                .filter(a -> a.getOrganizationType().getLevel() > minLevel)
                .sorted(Comparator.comparingInt(
                        a -> a.getOrganizationType().getLevel()
                ))
                .toList();
        return resultList;
    }
}
