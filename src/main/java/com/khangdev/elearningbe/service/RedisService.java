package com.khangdev.elearningbe.service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

public interface RedisService {
    public void setValue(String key, String value, long duration, TimeUnit timeUnit);
    public String getValue(String key);
    public void deleteKey(String key);
    public boolean hasKey(String key);
    public Long increment(String key, long delta);
    public void setValueNoExpire(String key, String value);
    public void setExpire(String key, long timeout, TimeUnit unit);
    public Set<String> getKeys(String key);
}
