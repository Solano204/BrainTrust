package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.TextExtractionProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Component("MockTextExtractionProvider")

public class MockTextExtractionProvider implements TextExtractionProvider {

    private static final Logger log = LoggerFactory.getLogger(MockTextExtractionProvider.class);
    private final Random random = new Random();

    private final List<String> mockExtractedTexts = Arrays.asList(
            "This research paper examines the impact of artificial intelligence on modern educational systems. " +
                    "The study conducted a comprehensive analysis of AI-assisted learning tools across multiple institutions. " +
                    "Results indicate a significant improvement in student engagement metrics when appropriate AI tools are implemented. " +
                    "However, concerns regarding over-reliance on automated systems were also identified among educators. " +
                    "Future work should focus on developing balanced approaches that leverage AI while maintaining human oversight.",

            "Quarterly Performance Report: The company demonstrated strong growth in Q3 with a 15% increase in revenue. " +
                    "Key performance indicators show improvement across all major departments. " +
                    "Marketing initiatives resulted in a 25% increase in customer acquisition. " +
                    "Operational efficiency improved by 12% through process automation. " +
                    "The outlook for Q4 remains positive with projected growth of 10-12%.",

            "The old house at the end of the street had stood empty for years, its windows like vacant eyes staring out at the world. " +
                    "Children whispered stories about ghosts and hidden treasures, but no one dared to venture inside. " +
                    "That is, until the summer of 1998, when the Johnson family decided to make it their home. " +
                    "Little did they know that the house held secrets that would change their lives forever.",

            "This document contains important information regarding the subject matter. " +
                    "Multiple aspects have been considered in the preparation of this material. " +
                    "The content has been reviewed for accuracy and completeness. " +
                    "Readers should consider the context and applicability to their specific situation. " +
                    "Additional resources may be available for further clarification if needed.",

            "In recent years, the development of neural networks has revolutionized the field of computer vision. " +
                    "Convolutional neural networks in particular have shown remarkable performance in image classification tasks. " +
                    "The architecture typically consists of multiple layers including convolutional layers, pooling layers, and fully connected layers. " +
                    "Training these models requires large datasets and significant computational resources.",

            "The principles of sustainable development emphasize the need to balance economic growth with environmental protection. " +
                    "Renewable energy sources such as solar and wind power are becoming increasingly cost-competitive with traditional fossil fuels. " +
                    "Urban planning strategies that prioritize public transportation and green spaces can significantly reduce carbon emissions. " +
                    "Corporate social responsibility initiatives are now seen as essential components of modern business strategy.",

            "Machine learning algorithms can be broadly categorized into supervised, unsupervised, and reinforcement learning. " +
                    "Supervised learning requires labeled training data while unsupervised learning discovers patterns in unlabeled data. " +
                    "Reinforcement learning involves agents learning through trial and error by receiving rewards or penalties. " +
                    "The choice of algorithm depends on the specific problem and available data.",

            "Blockchain technology has the potential to transform various industries beyond cryptocurrency. " +
                    "Its decentralized and immutable ledger system offers enhanced security and transparency for transactions. " +
                    "Smart contracts enable automated execution of agreements without intermediaries. " +
                    "Supply chain management can benefit from blockchain's ability to track goods from origin to consumer."
    );

    private final Map<String, String> fileTypeTexts = new HashMap<>();

    public MockTextExtractionProvider() {
        // Initialize file type specific texts
        fileTypeTexts.put("academic", mockExtractedTexts.get(0));
        fileTypeTexts.put("research", mockExtractedTexts.get(0));
        fileTypeTexts.put("paper", mockExtractedTexts.get(0));
        fileTypeTexts.put("business", mockExtractedTexts.get(1));
        fileTypeTexts.put("report", mockExtractedTexts.get(1));
        fileTypeTexts.put("creative", mockExtractedTexts.get(2));
        fileTypeTexts.put("story", mockExtractedTexts.get(2));
        fileTypeTexts.put("technical", mockExtractedTexts.get(4));
        fileTypeTexts.put("ml", mockExtractedTexts.get(5));
        fileTypeTexts.put("sustainability", mockExtractedTexts.get(6));
        fileTypeTexts.put("blockchain", mockExtractedTexts.get(7));

        log.info("✅ MockTextExtractionProvider initialized for testing");
    }

    @Override
    public String extractTextFromPdf(MultipartFile pdfFile) {
        if (pdfFile == null || pdfFile.isEmpty()) {
            log.warn("🧪 MOCK: Empty PDF file provided for extraction");
            return "";
        }

        String fileName = pdfFile.getOriginalFilename() != null ?
                pdfFile.getOriginalFilename().toLowerCase() : "unknown.pdf";
        long fileSize = pdfFile.getSize();

        log.info("🧪 MOCK: Extracting text from PDF: {} (size: {} bytes)", fileName, fileSize);

        simulateProcessingDelay(800, 2500);

        try {
            String extractedText = generateMockPdfText(fileName, fileSize);
            int wordCount = extractedText.split("\\s+").length;
            int charCount = extractedText.length();

            String extractionInfo = String.format(
                    "\n\n[Extracted from: %s | File size: %d bytes | Words: %d | Characters: %d | Method: mock-ocr]",
                    fileName, fileSize, wordCount, charCount
            );

            String fullText = extractedText + extractionInfo;

            log.info("🧪 MOCK: Text extraction completed. Words: {}, Characters: {}",
                    wordCount, charCount);

            return fullText;

        } catch (Exception e) {
            log.error("🧪 MOCK: Error in mock text extraction", e);
            return "[Error extracting text from PDF: " + fileName + "]";
        }
    }

    @Override
    public List<String> extractTextFromPdfs(List<MultipartFile> pdfFiles) {
        long startTime = System.currentTimeMillis();
        log.info("🧪 MOCK: Starting batch text extraction for {} PDF files", pdfFiles.size());

        if (pdfFiles == null || pdfFiles.isEmpty()) {
            log.warn("🧪 MOCK: Empty file list provided for batch extraction");
            return List.of();
        }

        try {
            ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

            List<CompletableFuture<String>> futures = pdfFiles.stream()
                    .filter(pdfFile -> pdfFile != null && !pdfFile.isEmpty())
                    .map(pdfFile -> CompletableFuture.supplyAsync(() -> {
                        try {
                            return extractTextFromPdf(pdfFile);
                        } catch (Exception e) {
                            log.error("🧪 MOCK: Failed to extract text from: {}",
                                    pdfFile.getOriginalFilename(), e);
                            return "[Extraction failed: " + pdfFile.getOriginalFilename() + "]";
                        }
                    }, virtualExecutor))
                    .collect(Collectors.toList());

            List<String> results = futures.stream()
                    .map(future -> {
                        try {
                            return future.get();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            log.error("🧪 MOCK: Batch extraction interrupted", e);
                            return "[Extraction interrupted]";
                        } catch (ExecutionException e) {
                            log.error("🧪 MOCK: Batch extraction failed", e.getCause());
                            return "[Extraction failed]";
                        }
                    })
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("🧪 MOCK: Batch extraction completed in {}ms. Processed {} of {} files",
                    duration, results.size(), pdfFiles.size());

            virtualExecutor.shutdown();
            return results;

        } catch (Exception e) {
            log.error("🧪 MOCK: Parallel PDF extraction failed", e);

            List<String> results = new ArrayList<>();
            for (MultipartFile pdfFile : pdfFiles) {
                if (pdfFile != null && !pdfFile.isEmpty()) {
                    try {
                        results.add(extractTextFromPdf(pdfFile));
                    } catch (Exception ex) {
                        results.add("[Extraction failed: " + pdfFile.getOriginalFilename() + "]");
                    }
                }
            }
            return results;
        }
    }

    @Override
    public boolean isServiceAvailable() {
        boolean available = random.nextDouble() > 0.05;

        log.trace("🧪 MOCK: Text extraction service availability: {}", available);
        return available;
    }

    @Override
    public Double getServiceHealth() {
        boolean available = isServiceAvailable();
        double health = available ?
                0.85 + random.nextDouble() * 0.15 :
                0.1 + random.nextDouble() * 0.3;

        log.debug("🧪 MOCK: Text extraction service health: {:.2f}", health);
        return health;
    }

    private void simulateProcessingDelay(int minMs, int maxMs) {
        try {
            int delay = minMs + random.nextInt(maxMs - minMs);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("🧪 MOCK: Processing delay interrupted");
        }
    }

    private String generateMockPdfText(String fileName, long fileSize) {
        StringBuilder text = new StringBuilder();

        String baseText = determineBaseText(fileName);
        text.append(baseText);

        int targetWords = calculateTargetWords(fileSize);
        int currentWords = countWords(text.toString());

        while (currentWords < targetWords && targetWords < 2000) {
            text.append("\n\n");
            text.append(generateAdditionalParagraph());
            currentWords = countWords(text.toString());
        }

        String formattedText = formatWithOcrArtifacts(text.toString());

        return formattedText;
    }

    private String determineBaseText(String fileName) {
        for (Map.Entry<String, String> entry : fileTypeTexts.entrySet()) {
            if (fileName.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        return mockExtractedTexts.get(random.nextInt(mockExtractedTexts.size()));
    }

    private int calculateTargetWords(long fileSize) {

        int baseWords = 100;
        int sizeBasedWords = (int) (fileSize / 1024) * 80; // 80 words per KB

        int variation = random.nextInt(200) - 100; // -100 to +100

        return Math.max(50, baseWords + sizeBasedWords + variation);
    }

    private String generateAdditionalParagraph() {
        String[] paragraphTemplates = {
                "Furthermore, it is important to consider the broader implications of these findings. " +
                        "Additional research may be necessary to validate the conclusions across different contexts. " +
                        "Practical applications of this work could include improved methodologies for future studies.",

                "The methodology employed in this analysis follows established industry standards. " +
                        "Data collection procedures were designed to ensure reliability and validity of results. " +
                        "Statistical methods were applied appropriately to draw meaningful conclusions.",

                "Limitations of the current approach should be acknowledged in any comprehensive evaluation. " +
                        "Future improvements could address these constraints through enhanced methodologies. " +
                        "Collaboration with domain experts would strengthen the analysis considerably.",

                "Comparative analysis reveals interesting patterns when examining similar cases. " +
                        "Historical context provides valuable insights into the evolution of this field. " +
                        "Emerging trends suggest potential directions for future development efforts.",

                "Implementation details vary depending on specific requirements and constraints. " +
                        "Best practices recommend thorough testing before deployment in production environments. " +
                        "Documentation should be comprehensive to facilitate maintenance and updates."
        };

        return paragraphTemplates[random.nextInt(paragraphTemplates.length)];
    }

    private String formatWithOcrArtifacts(String text) {

        if (random.nextDouble() > 0.95) {
            log.debug("🧪 MOCK: Simulating OCR artifacts in extracted text");

            String[] replacements = {
                    "the", "t he",
                    "and", "an d",
                    "for", "f or",
                    "with", "wi th",
                    "this", "thi s",
                    "that", "tha t",
                    "from", "fr om"
            };

            String result = text;
            for (int i = 0; i < replacements.length; i += 2) {
                if (random.nextDouble() > 0.7) {
                    result = result.replace(replacements[i], replacements[i + 1]);
                }
            }

            if (random.nextDouble() > 0.8) {
                result = result + "\n\n[Note: Some text may contain OCR recognition errors]";
            }

            return result;
        }

        return text;
    }

    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.split("\\s+").length;
    }

    public Map<String, Object> getExtractionQualityMetrics(MultipartFile pdfFile) {
        String extractedText = extractTextFromPdf(pdfFile);
        int wordCount = countWords(extractedText);
        int charCount = extractedText.length();

        double confidence = 0.7 + random.nextDouble() * 0.25; // 0.7-0.95
        double completeness = 0.8 + random.nextDouble() * 0.15; // 0.8-0.95
        double accuracy = 0.85 + random.nextDouble() * 0.1; // 0.85-0.95

        return Map.of(
                "file_name", pdfFile.getOriginalFilename(),
                "file_size_bytes", pdfFile.getSize(),
                "extracted_words", wordCount,
                "extracted_characters", charCount,
                "confidence_score", String.format("%.2f", confidence),
                "completeness_score", String.format("%.2f", completeness),
                "accuracy_score", String.format("%.2f", accuracy),
                "extraction_method", "mock-ocr-simulation",
                "has_ocr_artifacts", random.nextDouble() > 0.95,
                "processing_time_ms", 500 + random.nextInt(2000)
        );
    }


    public Map<String, Object> getBatchExtractionMetrics(List<MultipartFile> pdfFiles) {
        List<String> extractedTexts = extractTextFromPdfs(pdfFiles);

        int totalWords = extractedTexts.stream()
                .mapToInt(this::countWords)
                .sum();

        int totalChars = extractedTexts.stream()
                .mapToInt(String::length)
                .sum();

        int successful = (int) extractedTexts.stream()
                .filter(text -> !text.contains("[Extraction failed") &&
                        !text.contains("[Extraction interrupted]"))
                .count();

        int failed = pdfFiles.size() - successful;

        return Map.of(
                "total_files", pdfFiles.size(),
                "successful_extractions", successful,
                "failed_extractions", failed,
                "total_words_extracted", totalWords,
                "total_characters_extracted", totalChars,
                "average_words_per_file", totalWords / Math.max(1, successful),
                "success_rate", String.format("%.1f%%", (successful * 100.0) / pdfFiles.size()),
                "batch_processing_time_ms", 1000 + random.nextInt(3000)
        );
    }
}