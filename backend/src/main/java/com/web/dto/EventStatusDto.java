package com.web.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EventStatusDto {
    private String name;

    private String displayName;

    private String color;
}
