package com.web.api;

import com.web.dto.StatisticResponse;
import com.web.entity.Organization;
import com.web.enums.RegistrationStatus;
import com.web.repository.*;
import com.web.utils.Contains;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/statistic")
public class StatisticApi {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserAuthorityRepository userAuthorityRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @GetMapping("/admin/thongke")
    public ResponseEntity<?> thongKe(){
        StatisticResponse stt = new StatisticResponse();
        stt.setTongDoanVien(userAuthorityRepository.thongKeByRole(Contains.ROLE_DOAN_SINH));
        stt.setTongDonVi(organizationRepository.count());
        stt.setTongDangKy(eventRegistrationRepository.count());
        stt.setTongSuKien(eventRepository.count());

        stt.setSuKienMoiNhat(eventRepository.suKienMoiNhat());
        stt.setDangKySuKienMoiNhat(eventRegistrationRepository.dkSuKienMoiNhat());

        StatisticResponse.EventRegistrationCount eventRegistrationCount = new StatisticResponse.EventRegistrationCount(
                eventRegistrationRepository.countEventRegistrationByStatus(RegistrationStatus.PENDING),
                eventRegistrationRepository.countEventRegistrationByStatus(RegistrationStatus.APPROVED),
                eventRegistrationRepository.countEventRegistrationByStatus(RegistrationStatus.REJECTED)
        );
        stt.setEventRegistrationCount(eventRegistrationCount);

        return new ResponseEntity<>(stt, HttpStatus.OK);
    }

    @GetMapping("/admin/su-kien-thang")
    public List<StatisticResponse.MonthChart> thongKeSuKienThang(@RequestParam("year") Integer year){
        List<StatisticResponse.MonthChart> list = new ArrayList<>();
        for(int i=1; i< 13; i++){
            Long sum = eventRepository.countByMonthAndYear(i, year);
            if(sum == null){
                sum = 0L;
            }
            StatisticResponse.MonthChart monthChart = new StatisticResponse.MonthChart("Tháng "+i, sum);
            list.add(monthChart);
        }
        return list;
    }

    @GetMapping("/admin/doan-vien-moi")
    public List<StatisticResponse.MonthChart> thongKeDoanVienMoi(@RequestParam("year") Integer year){
        List<StatisticResponse.MonthChart> list = new ArrayList<>();
        for(int i=1; i< 13; i++){
            Long sum = userAuthorityRepository.countByMonthAndYear(Contains.ROLE_DOAN_SINH,i, year);
            if(sum == null){
                sum = 0L;
            }
            StatisticResponse.MonthChart monthChart = new StatisticResponse.MonthChart("Tháng "+i, sum);
            list.add(monthChart);
        }
        return list;
    }

}
