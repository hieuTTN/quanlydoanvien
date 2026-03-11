package com.web.service;

import com.web.entity.EventRegistration;
import com.web.entity.OperationHistory;
import com.web.exception.MessageException;
import com.web.repository.OperationHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class OperationHistoryService {

    @Autowired
    private OperationHistoryRepository operationHistoryRepository;

    public OperationHistory save(OperationHistory operationHistory){
        if(operationHistory.getStartDate() != null && operationHistory.getEndDate() != null){
            if(operationHistory.getEndDate().before(operationHistory.getStartDate())){
                throw new MessageException("Ngày bắt đầu phải trươc ngày kết thúc");
            }
        }
        if(operationHistory.getId() != null){
            OperationHistory o = operationHistoryRepository.findById(operationHistory.getId()).get();
            operationHistory.setEventRegistrationId(o.getEventRegistrationId());
        }
        operationHistoryRepository.save(operationHistory);
        return operationHistory;
    }

    public List<OperationHistory> findByUserId(Long userId){
        return operationHistoryRepository.findByUserId(userId);
    }

    public OperationHistory saveByRegis(EventRegistration eventRegistration){
        if(operationHistoryRepository.checkByUser(eventRegistration.getUser().getId(), eventRegistration.getId()) != null){
            return null;
        }
        OperationHistory operationHistory = new OperationHistory();
        operationHistory.setTitle("Tham gia sự kiện "+eventRegistration.getEvent().getName());
        operationHistory.setUser(eventRegistration.getUser());
        operationHistory.setEventRegistrationId(eventRegistration.getId());
        operationHistory.setStartDate(java.sql.Date.valueOf(eventRegistration.getEvent().getStartTime().toLocalDate()));
        operationHistory.setEndDate(java.sql.Date.valueOf(eventRegistration.getEvent().getEndTime().toLocalDate()));
        operationHistoryRepository.save(operationHistory);
        return operationHistory;
    }

}
