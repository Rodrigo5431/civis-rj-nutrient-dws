package com.civisanalytics.audit;

import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class NutrientDwsMockService {

    public DwsExtractionResult extractData(String filePath) {
        String dwsDocumentId = "dws-doc-" + UUID.randomUUID();
        String viewerUrl = "https://dws-viewer.mock.civisanalytics.com/documents/" + dwsDocumentId;
        String extractedJson = "{\"valor_contrato\": null, \"data_assinatura\": null}";
        return new DwsExtractionResult(dwsDocumentId, viewerUrl, extractedJson);
    }

    public record DwsExtractionResult(String documentId, String viewerUrl, String extractedDataJson) {}
}