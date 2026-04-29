package com.thepiratemax.backend;

import com.thepiratemax.backend.config.AuthProperties;
import com.thepiratemax.backend.config.DevUserProperties;
import com.thepiratemax.backend.config.JwtProperties;
import com.thepiratemax.backend.config.MercadoPagoProperties;
import com.thepiratemax.backend.config.RedisQueueProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
@ConfigurationPropertiesScan(basePackageClasses = {
        MercadoPagoProperties.class,
        RedisQueueProperties.class,
        DevUserProperties.class,
        AuthProperties.class,
        JwtProperties.class
})
public class ThePirateMaxApplication {

    public static void main(String[] args) {
        SpringApplication.run(ThePirateMaxApplication.class, args);
    }
}
