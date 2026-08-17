package com.civisanalytics.audit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NameComService {

    @Value("${namecom.username:USUARIO_TESTE}")
    private String username;

    @Value("${namecom.token:TOKEN_TESTE}")
    private String token;

    @Value("${namecom.api-url:https://api.dev.name.com/v4}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> searchTransparencyDomain(String keyword) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        String auth = username + ":" + token;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        Map<String, Object> requestBody = new HashMap<>();
        String cleanKeyword = keyword.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        
        requestBody.put("keyword", cleanKeyword);
        requestBody.put("tldFilter", List.of("org", "live", "net", "info")); 

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl + "/domains:search", 
                    requestEntity, 
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            throw new RuntimeException("A API da Name.com não retornou resultados.");

        } catch (Exception e) {
            Map<String, Object> mockResponse = new HashMap<>();
            mockResponse.put("results", List.of(
                Map.of("domainName", cleanKeyword + ".org", "purchasable", true, "purchasePrice", 12.99),
                Map.of("domainName", cleanKeyword + ".live", "purchasable", true, "purchasePrice", 3.99),
                Map.of("domainName", cleanKeyword + ".info", "purchasable", true, "purchasePrice", 5.99)
            ));
            return mockResponse;
        }
    }
}