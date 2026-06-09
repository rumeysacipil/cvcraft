package com.cvcraft.service;

import com.cvcraft.model.entity.Cv;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
public class PdfGeneratorService {

    public static byte[] generatePdf(Cv cv) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(0, 0, 36, 0);

            Map<String, Object> data = cv.getData();
            String theme = cv.getTheme();

            // Tema rengini belirle
            DeviceRgb accentColor = getAccentColor(theme);

            PdfFont regularFont = loadFont("fonts/NotoSans-Regular.ttf");
            PdfFont boldFont = loadFont("fonts/NotoSans-Bold.ttf");
            PdfFont italicFont = regularFont;

            // ─── Header ──────────────────────────────────────────────────────
            Table headerTable = new Table(UnitValue.createPercentArray(new float[] { 100 }))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(accentColor)
                    .setPaddingLeft(40)
                    .setPaddingRight(40)
                    .setPaddingTop(32)
                    .setPaddingBottom(24);

            String name = getString(data, "name", "Ad Soyad");
            String title = getString(data, "title", "");
            String email = getString(data, "email", "");
            String phone = getString(data, "phone", "");
            String location = getString(data, "location", "");

            Cell headerCell = new Cell().setBorder(Border.NO_BORDER).setBackgroundColor(accentColor);
            headerCell.add(new Paragraph(name).setFont(boldFont).setFontSize(26).setFontColor(ColorConstants.WHITE));
            if (!title.isEmpty()) {
                headerCell.add(new Paragraph(title).setFont(regularFont).setFontSize(14)
                        .setFontColor(ColorConstants.WHITE).setOpacity(0.85f));
            }

            // Contact info row
            StringBuilder contact = new StringBuilder();
            if (!email.isEmpty())
                contact.append("✉ ").append(email).append("   ");
            if (!phone.isEmpty())
                contact.append("✆ ").append(phone).append("   ");
            if (!location.isEmpty())
                contact.append("⚲ ").append(location);

            if (!contact.isEmpty()) {
                headerCell.add(new Paragraph(contact.toString())
                        .setFont(regularFont).setFontSize(10)
                        .setFontColor(ColorConstants.WHITE).setOpacity(0.9f).setMarginTop(12));
            }
            headerTable.addCell(headerCell);
            document.add(headerTable);

            // ─── Body ─────────────────────────────────────────────────────────
            Document body = document;
            body.setMargins(24, 40, 40, 40);

            // Summary
            String summary = getString(data, "summary", "");
            if (!summary.isEmpty()) {
                addSection(body, "ÖZET", accentColor, boldFont);
                body.add(new Paragraph(summary).setFont(regularFont).setFontSize(10)
                        .setFontColor(new DeviceRgb(68, 68, 68)).setMultipliedLeading(1.6f));
                body.add(new Paragraph("\n").setFontSize(4));
            }

            // Experience
            List<Map<String, Object>> experience = getList(data, "experience");
            if (!experience.isEmpty()) {
                addSection(body, "İŞ DENEYİMİ", accentColor, boldFont);
                for (Map<String, Object> exp : experience) {
                    Table expTable = new Table(UnitValue.createPercentArray(new float[] { 70, 30 }))
                            .setWidth(UnitValue.createPercentValue(100)).setBorder(Border.NO_BORDER)
                            .setMarginBottom(4);

                    Cell left = new Cell().setBorder(Border.NO_BORDER);
                    left.add(new Paragraph(getString(exp, "role", "")).setFont(boldFont).setFontSize(12));
                    left.add(new Paragraph(getString(exp, "company", "")).setFont(regularFont).setFontSize(10)
                            .setFontColor(accentColor));

                    Cell right = new Cell().setBorder(Border.NO_BORDER)
                            .setTextAlignment(TextAlignment.RIGHT);
                    right.add(new Paragraph(getString(exp, "period", "")).setFont(italicFont).setFontSize(9)
                            .setFontColor(new DeviceRgb(136, 136, 136)));

                    expTable.addCell(left);
                    expTable.addCell(right);
                    body.add(expTable);

                    String desc = getString(exp, "desc", "");
                    if (!desc.isEmpty()) {
                        body.add(new Paragraph(desc).setFont(regularFont).setFontSize(10)
                                .setFontColor(new DeviceRgb(85, 85, 85)).setMultipliedLeading(1.5f)
                                .setMarginBottom(10));
                    }
                }
            }

            // Education
            List<Map<String, Object>> education = getList(data, "education");
            if (!education.isEmpty()) {
                addSection(body, "EĞİTİM", accentColor, boldFont);
                for (Map<String, Object> edu : education) {
                    body.add(new Paragraph(getString(edu, "school", "")).setFont(boldFont).setFontSize(11));
                    body.add(new Paragraph(getString(edu, "degree", "")).setFont(regularFont).setFontSize(10)
                            .setFontColor(new DeviceRgb(85, 85, 85)));
                    body.add(new Paragraph(getString(edu, "period", "")).setFont(italicFont).setFontSize(9)
                            .setFontColor(new DeviceRgb(136, 136, 136)).setMarginBottom(8));
                }
            }

            // Skills
            List<String> skills = getStringList(data, "skills");
            if (!skills.isEmpty()) {
                addSection(body, "BECERİLER", accentColor, boldFont);
                body.add(new Paragraph(String.join("  •  ", skills)).setFont(regularFont).setFontSize(10)
                        .setMultipliedLeading(1.5f));
            }
            ObjectMapper om = new ObjectMapper();
            log.info("CV data pretty:\n{}", om.writerWithDefaultPrettyPrinter().writeValueAsString(cv.getData()));

            document.close();
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("PDF oluşturma hatası", e);
            throw new RuntimeException("PDF oluşturulamadı: " + e.getMessage());
        }
    }

    private static PdfFont loadFont(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        byte[] fontBytes = resource.getInputStream().readAllBytes();

        return PdfFontFactory.createFont(
                FontProgramFactory.createFont(fontBytes),
                PdfEncodings.IDENTITY_H);
    }

    private static void addSection(Document doc, String title, DeviceRgb accentColor, PdfFont boldFont)
            throws IOException {
        doc.add(new Paragraph(title)
                .setFont(boldFont).setFontSize(10)
                .setFontColor(accentColor)
                .setBorderBottom(new SolidBorder(accentColor, 1.5f))
                .setPaddingBottom(4)
                .setMarginTop(16)
                .setMarginBottom(10));
    }

    private static DeviceRgb getAccentColor(String theme) {
        return switch (theme) {
            case "modern" -> new DeviceRgb(0, 102, 255);
            case "executive" -> new DeviceRgb(27, 67, 50);
            case "bold" -> new DeviceRgb(193, 18, 31);
            default -> new DeviceRgb(26, 26, 46); // minimal
        };
    }

    @SuppressWarnings("unchecked")
    private static String getString(Map<String, Object> map, String key, String fallback) {
        Object val = map.get(key);
        return val instanceof String s ? s : fallback;
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> getList(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof List<?> list) {
            return (List<Map<String, Object>>) list;
        }
        return List.of();
    }

    @SuppressWarnings("unchecked")
    private static List<String> getStringList(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof List<?> list) {
            return (List<String>) list;
        }
        return List.of();
    }
}
