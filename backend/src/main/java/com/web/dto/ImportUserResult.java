package com.web.dto;

import lombok.Data;
import java.util.List;

@Data
public class ImportUserResult {

    private int total;

    private int inserted;

    private int skipped;

    private List<String> skippedEmails;

    private String message;

}