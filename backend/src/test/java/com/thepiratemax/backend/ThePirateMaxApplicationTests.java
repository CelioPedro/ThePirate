package com.thepiratemax.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.config.RedisQueueProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ThePirateMaxApplicationTests {

    @Autowired
    private MercadoPagoProperties mercadoPagoProperties;

    @Autowired
    private RedisQueueProperties redisQueueProperties;

    @Test
    void contextLoads() {
        assertThat(mercadoPagoProperties.accessToken()).isEqualTo("test-token");
        assertThat(redisQueueProperties.credentialsDeliveryQueue()).isEqualTo("credentials.delivery");
    }
}
