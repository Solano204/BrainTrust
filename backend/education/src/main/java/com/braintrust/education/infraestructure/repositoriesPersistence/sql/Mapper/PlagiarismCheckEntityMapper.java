package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.PlagiarismCheck;
import com.braintrust.education.domain.model.PlagiarismStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.PlagiarismCheckJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SimilarParagraphJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PlagiarismCheckEntityMapper {

    public PlagiarismCheckJpaEntity toEntity(PlagiarismCheck check) {
        PlagiarismCheckJpaEntity entity = new PlagiarismCheckJpaEntity();
        entity.setId(check.getId().getValue());
        entity.setSourceSubmissionId(check.getSourceSubmissionId().getValue());
        entity.setComparedSubmissionId(check.getComparedSubmissionId().getValue());
        entity.setComparedStudentId(check.getComparedStudentId().getValue());
        entity.setAssignmentId(check.getAssignmentId().getValue());
        entity.setOverallSimilarity(check.getOverallSimilarity());
        entity.setStatus(check.getStatus().name());
        entity.setErrorMessage(check.getErrorMessage());
        entity.setCheckedAt(check.getCheckedAt());

        List<SimilarParagraphJpaEntity> paragraphEntities = check.getSimilarParagraphs().stream()
                .map(p -> {
                    SimilarParagraphJpaEntity pe = new SimilarParagraphJpaEntity();
                    pe.setPlagiarismCheck(entity);
                    pe.setParagraphIndex(p.getParagraphIndex());
                    pe.setOriginalText(p.getOriginalText());
                    pe.setMatchedText(p.getMatchedText());
                    pe.setSimilarity(p.getSimilarity());
                    return pe;
                })
                .collect(Collectors.toList());

        entity.setSimilarParagraphs(paragraphEntities);
        return entity;
    }

    public PlagiarismCheck toDomain(PlagiarismCheckJpaEntity entity) {
        List<SimilarParagraph> paragraphs = new ArrayList<>();
        if (entity.getSimilarParagraphs() != null) {
            paragraphs = entity.getSimilarParagraphs().stream()
                    .map(pe -> new SimilarParagraph(
                            pe.getParagraphIndex(),
                            pe.getOriginalText(),
                            pe.getMatchedText(),
                            pe.getSimilarity()
                    ))
                    .collect(Collectors.toList());
        }

        return PlagiarismCheck.reconstitute(
                PlagiarismCheckId.fromString(entity.getId()),
                SubmissionId.fromString(entity.getSourceSubmissionId()),
                SubmissionId.fromString(entity.getComparedSubmissionId()),
                UserId.fromString(entity.getComparedStudentId()),
                AssignmentId.fromString(entity.getAssignmentId()),
                entity.getOverallSimilarity(),
                paragraphs,
                PlagiarismStatus.valueOf(entity.getStatus()),
                entity.getErrorMessage(),
                entity.getCheckedAt()
        );
    }
}
