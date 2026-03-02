package com.web.dto;

import com.web.entity.Event;
import com.web.entity.EventRegistration;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatisticResponse {

    private Long tongDoanVien;

    private Long tongDonVi;

    private Long tongSuKien;

    private Long tongDangKy;

    private List<Event> suKienMoiNhat = new ArrayList<>();

    private List<EventRegistration> dangKySuKienMoiNhat = new ArrayList<>();

    private EventRegistrationCount eventRegistrationCount;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventRegistrationCount {
        public Long dangCho;
        public Long daDuyet;
        public Long tuChoi;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthChart {
        public String month;
        public Long value;
    }

}
