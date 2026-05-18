package com.lasttable.api.kosis;

public class KosisApiException extends RuntimeException {
    public KosisApiException(String message) {
        super(message);
    }

    public KosisApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
