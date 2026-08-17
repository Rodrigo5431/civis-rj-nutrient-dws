package com.civisanalytics.audit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class DoctavianService {

    @Value("${doctavian.api-key:CHAVE_AQUI}")
    private String apiKey;

    @Value("${doctavian.api-url:https://api.doctavian.com/v1}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateAuditReport(String idObra, String companyName, String aiVerdict) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        
        requestBody.put("template_id", "tpl_notificacao_civis"); 
        
        Map<String, Object> documentData = new HashMap<>();
        documentData.put("municipio", "Prefeitura Municipal de Petrópolis");
        documentData.put("id_obra", idObra);
        documentData.put("empresa_auditada", companyName);
        documentData.put("parecer_ia", aiVerdict);
        documentData.put("data_emissao", java.time.LocalDate.now().toString());

        requestBody.put("data", documentData);
        requestBody.put("require_signature", true); 

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl + "/documents/generate", 
                    requestEntity, 
                    Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Falha ao gerar documento Doctavian.");
            }

            Map<String, Object> responseBody = response.getBody();
            return responseBody.getOrDefault("document_url", "URL_NÃO_RETORNADA").toString();

        } catch (Exception e) {
            throw new RuntimeException("Erro de comunicação com a Doctavian API: " + e.getMessage());
        }
    }
}