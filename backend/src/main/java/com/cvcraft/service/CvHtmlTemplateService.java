package com.cvcraft.service;

import com.cvcraft.model.entity.Cv;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CvHtmlTemplateService {

    public String generateHtml(Cv cv) {
        String theme = cv.getTheme() == null ? "minimal" : cv.getTheme();
        Map<String, Object> d = cv.getData();

        return switch (theme) {
            case "premium_two_col" -> premiumTwoColumn(d);
            case "premium_elegant" -> premiumElegant(d);
            default -> minimal(d);
        };
    }

    private String minimal(Map<String, Object> d) {
        String name = s(d, "name");
        String title = s(d, "title");
        String summary = s(d, "summary");

        return """
                <!doctype html>
                <html>
                <head>
                  <meta charset="utf-8"/>
                  <style>
                    body{font-family:Arial, sans-serif; padding:32px; color:#111}
                    h1{margin:0; font-size:26px}
                    .muted{color:#555}
                    .sec{margin-top:18px}
                  </style>
                </head>
                <body>
                  <h1>%s</h1>
                  <div class="muted">%s</div>
                  <div class="sec">%s</div>
                </body>
                </html>
                """.formatted(esc(name), esc(title), esc(summary));
    }

    private String premiumTwoColumn(Map<String, Object> d) {
        String name = s(d, "name");
        String title = s(d, "title");
        String email = s(d, "email");
        String phone = s(d, "phone");

        List<String> skills = listStr(d, "skills");

        return """
                <!doctype html>
                <html>
                <head>
                  <meta charset="utf-8"/>
                  <style>
                    body{margin:0; font-family:Arial, sans-serif;}
                    .wrap{display:flex; min-height:1123px}
                    .left{width:30%%; background:#0f172a; color:#fff; padding:28px}
                    .right{width:70%%; padding:28px}
                    h1{margin:0; font-size:24px}
                    .muted{opacity:.85}
                    .sec{margin-top:18px}
                    .chip{display:inline-block; padding:6px 10px; border:1px solid rgba(255,255,255,.25); border-radius:999px; margin:6px 6px 0 0; font-size:12px}
                  </style>
                </head>
                <body>
                  <div class="wrap">
                    <div class="left">
                      <h1>%s</h1>
                      <div class="muted">%s</div>

                      <div class="sec">
                        <div class="muted">Contact</div>
                        <div>%s</div>
                        <div>%s</div>
                      </div>

                      <div class="sec">
                        <div class="muted">Skills</div>
                        %s
                      </div>
                    </div>

                    <div class="right">
                      <div class="sec"><b>Summary</b><div class="muted">%s</div></div>
                      <!-- Experience/Education burada genişletilecek -->
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                esc(name),
                esc(title),
                esc(email),
                esc(phone),
                skills.stream().map(x -> "<span class='chip'>" + esc(x) + "</span>").reduce("", String::concat),
                esc(s(d, "summary"))
        );
    }

    private String premiumElegant(Map<String, Object> d) {
        // Şimdilik minimalin şık versiyonu (sonra geliştirebiliriz)
        String name = s(d, "name");
        String title = s(d, "title");
        String summary = s(d, "summary");

        return """
                <!doctype html>
                <html>
                <head>
                  <meta charset="utf-8"/>
                  <style>
                    body{font-family:Georgia, serif; padding:40px; color:#111}
                    .top{border-bottom:2px solid #111; padding-bottom:12px}
                    h1{margin:0; font-size:28px}
                    .muted{color:#444; margin-top:6px}
                    .sec{margin-top:20px; line-height:1.6}
                  </style>
                </head>
                <body>
                  <div class="top">
                    <h1>%s</h1>
                    <div class="muted">%s</div>
                  </div>
                  <div class="sec">%s</div>
                </body>
                </html>
                """.formatted(esc(name), esc(title), esc(summary));
    }

    private String s(Map<String, Object> d, String key) {
        Object v = d == null ? null : d.get(key);
        return v == null ? "" : String.valueOf(v);
    }

    private List<String> listStr(Map<String, Object> d, String key) {
        Object v = d == null ? null : d.get(key);
        if (v instanceof List<?> l) {
            return l.stream().map(String::valueOf).toList();
        }
        return List.of();
    }

    // Basit HTML escape (script çalışmasın diye)
    private String esc(String x) {
        if (x == null) return "";
        return x.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}