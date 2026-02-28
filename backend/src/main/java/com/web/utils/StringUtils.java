package com.web.utils;

public class StringUtils {

    public static String lpad(String originalString, int length, char padChar) {
        StringBuilder paddedString = new StringBuilder(originalString);

        while (paddedString.length() < length) {
            paddedString.insert(0, padChar);
        }

        return paddedString.toString();
    }
}
