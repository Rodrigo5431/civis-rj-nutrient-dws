package com.civisanalytics.audit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@Service
public class SerpApiService {

    @Value("${serpapi.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String searchCompanyReputation(String companyName) {
        String searchQuery = companyName + " (atraso OR fraude OR TCU OR investigação OR paralisação)";
        
        String url = String.format(
            "https://serpapi.com/search.json?engine=google_news&q=%s&gl=br&hl=pt&api_key=%s", 
            searchQuery, apiKey
        );

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "{\"error\": \"Falha ao buscar dados na SerpApi. O sistema continua operante.\"}";
        }
    }
}