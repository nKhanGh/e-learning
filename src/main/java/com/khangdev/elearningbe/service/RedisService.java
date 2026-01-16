package com.khangdev.elearningbe.service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

public interface RedisService {
     void setValue(String key, String value, long duration, TimeUnit timeUnit);
     String getValue(String key);
     void deleteKey(String key);
     boolean hasKey(String key);
     Long increment(String key, long delta);
     void setValueNoExpire(String key, String value);
     void setExpire(String key, long timeout, TimeUnit unit);
     Set<String> getKeys(String key);
}
