package com.web.repository;

import com.web.entity.Wards;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface WardsRepository extends JpaRepository<Wards,String> {

    @Query("select w from Wards w where w.provinceCode = ?1")
    List<Wards> findByProvince(String province);
}
