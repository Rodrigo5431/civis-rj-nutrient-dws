package com.civisanalytics.audit.dto;

import com.civisanalytics.audit.AuditStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AuditUploadResponse(UUID id, String idObra, AuditStatus status, String fileName, String dwsDocumentId,
		String dwsViewerUrl, OffsetDateTime uploadedAt) {
}