package com.khangdev.elearningbe.service;

import com.khangdev.elearningbe.service.common.RedisService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@SpringBootTest
public class RedisServiceTest {

    @Autowired
    private RedisService redisService;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @Test
    void setValue_success() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = (ValueOperations<String, String>) Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        redisService.setValue("key", "value", 1, TimeUnit.MINUTES);

        Mockito.verify(ops).set("key", "value", 1, TimeUnit.MINUTES);
    }

    @Test
    void getValue_success() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = (ValueOperations<String, String>) Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);
        Mockito.when(ops.get("key")).thenReturn("value");

        String result = redisService.getValue("key");

        org.assertj.core.api.Assertions.assertThat(result).isEqualTo("value");
    }

    @Test
    void deleteKey_success() {
        redisService.deleteKey("key");

        Mockito.verify(redisTemplate).delete("key");
    }

    @Test
    void hasKey_success() {
        Mockito.when(redisTemplate.hasKey("key")).thenReturn(true);

        boolean result = redisService.hasKey("key");

        org.assertj.core.api.Assertions.assertThat(result).isTrue();
    }

    @Test
    void increment_success() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = (ValueOperations<String, String>) Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);
        Mockito.when(ops.increment("key", 1L)).thenReturn(2L);

        Long result = redisService.increment("key", 1L);

        org.assertj.core.api.Assertions.assertThat(result).isEqualTo(2L);
    }

    @Test
    void setValueNoExpire_success() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> ops = (ValueOperations<String, String>) Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(ops);

        redisService.setValueNoExpire("key", "value");

        Mockito.verify(ops).set("key", "value");
    }

    @Test
    void setExpire_success() {
        redisService.setExpire("key", 1, TimeUnit.MINUTES);

        Mockito.verify(redisTemplate).expire("key", 1, TimeUnit.MINUTES);
    }

    @Test
    void getKeys_success() {
        Set<String> keys = Set.of("key1", "key2");
        Mockito.when(redisTemplate.keys("key*"))
                .thenReturn(keys);

        Set<String> result = redisService.getKeys("key*");

        org.assertj.core.api.Assertions.assertThat(result).containsExactlyInAnyOrder("key1", "key2");
    }
}
