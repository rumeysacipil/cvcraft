package com.cvcraft.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.itextpdf.kernel.pdf.canvas.parser.listener.LocationTextExtractionStrategy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import com.cvcraft.exception.ApiException;
import org.springframework.http.HttpStatus;

import java.io.InputStream;

@Service
@Slf4j
public class PdfParseService {

    public String extractTextFromPdf(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("Yüklenen dosya boş", HttpStatus.BAD_REQUEST);
        }
        try (InputStream is = file.getInputStream();
             PdfDocument pdfDoc = new PdfDocument(new PdfReader(is))) {

            StringBuilder sb = new StringBuilder();
            int pages = pdfDoc.getNumberOfPages();
            for (int i = 1; i <= pages; i++) {
                String text = PdfTextExtractor.getTextFromPage(pdfDoc.getPage(i), new LocationTextExtractionStrategy());
                sb.append(text).append("\n");
            }
            return sb.toString();

        } catch (Exception e) {
            log.error("PDF okuma hatası", e);
            throw new ApiException("PDF okunamadı, format desteklenmiyor olabilir.", HttpStatus.BAD_REQUEST);
        }
    }
}
