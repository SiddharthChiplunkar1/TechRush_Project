package com.passwordlessauth.banking_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
@Configuration
@ConfigurationProperties(prefix="app.banking")
@Getter 
@Setter
public class BankingProperties {
	private BigDecimal stepUpThreshold=new BigDecimal("1000.00");
}
