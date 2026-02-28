package com.web.utils;

import com.web.dto.RecaptchaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;


@Component
public class ReCaptchaUtil {


    public Boolean verifire(String recapchaResponse){
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.google.com/recaptcha/api/siteverify";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> map= new LinkedMultiValueMap<String, String>();
        map.add("secret", "6LdYA_4pAAAAAEM1L74YQdjRh4dILgJqnLi27JDy");
        map.add("response", recapchaResponse);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<MultiValueMap<String, String>>(map, headers);

        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
//        for (String key : response.keySet()) {
//            System.out.println("Key: " + key + ", Value: " + response.get(key).toString());
//        }
        boolean success = (boolean) response.get("success");
        return success;
    }
}