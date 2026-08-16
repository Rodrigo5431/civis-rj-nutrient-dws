package com.civisanalytics.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContractAuditRepository extends JpaRepository<ContractAudit, UUID> {
	List<ContractAudit> findByIdObra(String idObra);
}