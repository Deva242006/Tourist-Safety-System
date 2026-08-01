package com.example.TouristSafety;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TouristSafetyApplication {
	public static void main(String[] args) {
		SpringApplication.run(TouristSafetyApplication.class, args);
	}
}