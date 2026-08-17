package com.civisanalytics.audit;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
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
	private final SerpApiService serpApiService;

	public AuditController(AuditService auditService, SerpApiService serpApiService) {
		this.auditService = auditService;
		this.serpApiService = serpApiService;
	}

	@PostMapping(value = "/upload", consumes = "multipart/form-data", produces = "application/json")
	public ResponseEntity<?> upload(@RequestParam("id_obra") String idObra, @RequestParam("file") MultipartFile file) throws IOException {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest().body("{\"error\": \"O arquivo está vazio.\"}");
		}
		
		try (java.io.InputStream is = file.getInputStream()) {
			byte[] header = new byte[5];
			is.read(header);
			String headerString = new String(header);
			
			if (!headerString.equals("%PDF-")) {
				return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
						.body("{\"error\": \"Falha de Segurança: O arquivo enviado não é um PDF válido e foi bloqueado.\"}");
			}
		}

		try (PDDocument document = PDDocument.load(file.getInputStream())) {
			PDFTextStripper stripper = new PDFTextStripper();
			stripper.setStartPage(1);
			stripper.setEndPage(2);
			String text = stripper.getText(document).toLowerCase();

			int score = 0;
			
			if (text.contains("contratante")) score++;
			if (text.contains("contratada")) score++;
			if (text.contains("cláusula")) score++;
			if (text.contains("licitação")) score++;
			if (text.contains("termo de referência")) score++;
			if (text.contains("diário oficial")) score++;
			if (text.contains("cnpj")) score++;

			if (score < 2) {
				return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
						.body("{\"error\": \"Conteúdo Inválido: O documento enviado não possui a estrutura jurídica de um contrato ou edital. Por favor, envie o documento correto da obra.\"}");
			}
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("{\"error\": \"Não foi possível processar o texto do PDF para validação.\"}");
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

	@GetMapping("/diligence")
	public ResponseEntity<String> runDueDiligence(@RequestParam("companyName") String companyName) {
		String result = serpApiService.searchCompanyReputation(companyName);
		return ResponseEntity.ok(result);
	}
}