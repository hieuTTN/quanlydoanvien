package com.web.utils;

import java.sql.Timestamp;
import java.time.*;

public class TimeUtil {

    public static LocalDateTime getTime(){
//        Timestamp timestamp = new Timestamp(System.currentTimeMillis());
//        ZonedDateTime zonedDateTime = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
//
//        Instant instant = zonedDateTime.toInstant();
//
//        return new Timestamp(System.currentTimeMillis()).toLocalDateTime();
        return LocalDateTime.now();
    }
}
