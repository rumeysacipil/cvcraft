package com.cvcraft.service;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HtmlToPdfService {

    public byte[] renderA4Pdf(String html) {
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions()
                            .setHeadless(true)
                            .setArgs(List.of("--no-sandbox", "--disable-dev-shm-usage")));

            // Fix 3: Use a tall viewport so Playwright captures all content
            // 794px = 210mm @96dpi for A4 width, 10000px height = unlimited pages
            Page page = browser.newPage(new Browser.NewPageOptions()
                    .setViewportSize(794, 10000)
                    .setJavaScriptEnabled(false));

            page.route("**/*", route -> {
                String url = route.request().url();
                if ("document".equals(route.request().resourceType()) || url.startsWith("data:")) {
                    route.resume();
                } else {
                    route.abort();
                }
            });

            String injectedHtml = injectA4Styles(html);

            page.setContent(injectedHtml);
            page.waitForLoadState(LoadState.DOMCONTENTLOADED);

            // Fix 3: Use preferCSSPageSize=false so Playwright controls pagination
            // and content overflowing A4 automatically goes to page 2
            Page.PdfOptions options = new Page.PdfOptions()
                    .setFormat("A4")
                    .setPrintBackground(true)
                    .setPreferCSSPageSize(false);

            byte[] pdf = page.pdf(options);

            browser.close();
            return pdf;
        }
    }

    /**
     * HTML string'e A4 tam doldurma stilleri ekler.
     * Fix 3: overflow:hidden ve height:297mm kaldırıldı — içerik 2. sayfaya
     * taşabilir.
     */
    private String injectA4Styles(String html) {
        String a4Styles = """
                <style>
                    @page {
                        size: A4;
                        margin: 12mm 0;
                    }
                    @page :first {
                        margin-top: 0;
                    }

                    html, body {
                        width: 210mm;
                        margin: 0 !important;
                        padding: 0 !important;
                        /* overflow:hidden REMOVED — allows content to flow to page 2 */
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color-adjust: exact;
                    }

                    /* cv-print div'ini A4 genişliğine yay, yüksekliği kısıtlama */
                    #cv-print {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        /* height:297mm REMOVED — content beyond page 1 flows to page 2 */
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        /* overflow:hidden REMOVED */
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        transform: none !important;
                    }

                    /* İçerideki flex/grid layoutlar da tam genişlik kullansın */
                    #cv-print > div {
                        width: 100% !important;
                        min-height: 297mm !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        box-sizing: border-box;
                    }

                    /* Pagination rules to prevent sections from splitting awkwardly */
                    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; break-after: avoid; }
                    #cv-print * { page-break-inside: avoid; break-inside: avoid; }
                    #cv-print, #cv-print > div, #cv-print > div > div, #cv-print > div > div > div { page-break-inside: auto !important; break-inside: auto !important; }
                </style>
                """;

        // <head> varsa içine ekle, yoksa başa ekle
        if (html.contains("</head>")) {
            return html.replace("</head>", a4Styles + "</head>");
        } else {
            return a4Styles + html;
        }
    }
}
