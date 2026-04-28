package com.thepiratemax.backend;

import com.thepiratemax.backend.config.DevUserProperties;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.config.RedisQueueProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan(basePackageClasses = {
        MercadoPagoProperties.class,
        RedisQueueProperties.class,
        DevUserProperties.class
})
public class ThePirateMaxApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThePirateMaxApplication.class, args);
    }
}
