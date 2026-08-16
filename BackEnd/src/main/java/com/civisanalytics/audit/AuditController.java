package com.civisanalytics.audit;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.civisanalytics.audit.dto.AuditUploadResponse;

@RestController
@RequestMapping("/api/audits")
public class AuditController {

	private final AuditService auditService;

	public AuditController(AuditService auditService) {
		this.auditService = auditService;
	}

	@PostMapping(value = "/upload", consumes = "multipart/form-data")
	public ResponseEntity<AuditUploadResponse> upload(@RequestParam("id_obra") String idObra,
			@RequestParam("file") MultipartFile file) throws IOException {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}
		AuditUploadResponse response = auditService.uploadAndProcess(idObra, file);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/obra/{idObra}")
	public ResponseEntity<List<ContractAudit>> listByObra(@PathVariable String idObra) {
		return ResponseEntity.ok(auditService.listByObra(idObra));
	}

	@PatchMapping("/{id}/approve")
	public ResponseEntity<ContractAudit> approve(@PathVariable UUID id) {
		return ResponseEntity.ok(auditService.approve(id));
	}
}