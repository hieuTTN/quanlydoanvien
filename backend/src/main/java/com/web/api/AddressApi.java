package com.web.api;

import com.web.entity.Province;
import com.web.entity.Wards;
import com.web.repository.ProvinceRepository;
import com.web.repository.WardsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/address")
@CrossOrigin
public class AddressApi {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private WardsRepository wardsRepository;

    @GetMapping("/public/province")
    public List<Province> findAllProvince(){
        return provinceRepository.findAll();
    }

    @GetMapping("/public/wards-by-id")
    public Wards getWardsById(@RequestParam("id") String id){
        return wardsRepository.findById(id).get();
    }

    @GetMapping("/public/wards-by-province")
    public List<Wards> findByProvince(@RequestParam("id") String province){
        return wardsRepository.findByProvince(province);
    }
}
