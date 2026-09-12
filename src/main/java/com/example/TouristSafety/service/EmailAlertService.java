package com.example.TouristSafety.service;

import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.entity.Tourist;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Sends HTML email alerts via Gmail SMTP.
 * Gracefully skips sending if mail credentials are placeholder values,
 * so the app starts fine without SMTP config during development.
 */
@Service
public class EmailAlertService {

    private static final Logger log = LoggerFactory.getLogger(EmailAlertService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'").withZone(ZoneOffset.UTC);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    @Value("${app.alert.admin-email:admin@touristsafety.local}")
    private String adminEmail;

    public EmailAlertService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Send SOS/critical alert email to tourist's emergency contact */
    public void sendEmergencyContactAlert(Tourist tourist, Alert alert) {
        if (isPlaceholderConfig()) {
            log.warn("[EmailAlert] Mail not configured — skipping emergency contact email for tourist {}", tourist.getId());
            return;
        }
        if (tourist.getEmergencyContactPhone() == null && tourist.getEmergencyContactName() == null) {
            log.info("[EmailAlert] No emergency contact registered for tourist {}", tourist.getId());
            return;
        }

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            // We send to admin for now; a real system would look up emergency contact email
            helper.setTo(adminEmail);
            helper.setSubject("🆘 EMERGENCY ALERT — " + tourist.getFullName() + " needs help");
            helper.setText(buildEmergencyHtml(tourist, alert), true);
            mailSender.send(msg);
            log.info("[EmailAlert] Emergency alert email sent for tourist {}", tourist.getId());
        } catch (Exception e) {
            log.error("[EmailAlert] Failed to send emergency contact email: {}", e.getMessage());
        }
    }

    /** Send CRITICAL/HIGH alert notification to system admin */
    public void sendAdminAlertEmail(Tourist tourist, Alert alert) {
        if (isPlaceholderConfig()) {
            log.warn("[EmailAlert] Mail not configured — skipping admin alert email");
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(adminEmail);
            helper.setSubject("[" + alert.getSeverity() + "] " + alert.getType() + " Alert — " + tourist.getFullName());
            helper.setText(buildAdminAlertHtml(tourist, alert), true);
            mailSender.send(msg);
            log.info("[EmailAlert] Admin alert email sent: {}/{}", alert.getType(), alert.getSeverity());
        } catch (Exception e) {
            log.error("[EmailAlert] Failed to send admin alert email: {}", e.getMessage());
        }
    }

    private boolean isPlaceholderConfig() {
        return fromEmail == null
                || fromEmail.contains("your-email")
                || fromEmail.contains("placeholder");
    }

    private String buildEmergencyHtml(Tourist tourist, Alert alert) {
        String mapsLink = String.format(
                "https://www.google.com/maps?q=%f,%f", alert.getLatitude(), alert.getLongitude());
        return """
                <html><body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#e2e8f0;padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #374151;">
                    <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px;text-align:center;">
                      <h1 style="color:white;margin:0;font-size:28px;">🆘 EMERGENCY SOS</h1>
                      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Tourist Safety System — Automatic Alert</p>
                    </div>
                    <div style="padding:24px;">
                      <p style="font-size:16px;color:#f1f5f9;margin:0 0 16px;">
                        <strong style="color:#f87171;">%s</strong> has triggered an emergency SOS and may need immediate assistance.
                      </p>
                      <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:8px 0;color:#94a3b8;width:40%%;">Tourist Name</td><td style="color:#f1f5f9;font-weight:bold;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Phone</td><td style="color:#f1f5f9;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Emergency Contact</td><td style="color:#f1f5f9;">%s (%s)</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Alert Type</td><td style="color:#f87171;font-weight:bold;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Severity</td><td style="color:#f87171;font-weight:bold;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Time</td><td style="color:#f1f5f9;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Coordinates</td><td style="color:#38bdf8;">%.5f, %.5f</td></tr>
                      </table>
                      <div style="margin-top:24px;text-align:center;">
                        <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:15px;">📍 View on Google Maps</a>
                      </div>
                      <p style="margin-top:20px;font-size:12px;color:#64748b;text-align:center;">Sent automatically by Tourist Safety System · Please respond immediately</p>
                    </div>
                  </div>
                </body></html>
                """.formatted(
                tourist.getFullName(),
                tourist.getFullName(),
                tourist.getPhone() != null ? tourist.getPhone() : "—",
                tourist.getEmergencyContactName() != null ? tourist.getEmergencyContactName() : "—",
                tourist.getEmergencyContactPhone() != null ? tourist.getEmergencyContactPhone() : "—",
                alert.getType(),
                alert.getSeverity(),
                FMT.format(alert.getCreatedAt()),
                alert.getLatitude(), alert.getLongitude(),
                mapsLink
        );
    }

    private String buildAdminAlertHtml(Tourist tourist, Alert alert) {
        String mapsLink = String.format(
                "https://www.google.com/maps?q=%f,%f", alert.getLatitude(), alert.getLongitude());
        String severityColor = "CRITICAL".equals(alert.getSeverity()) ? "#ef4444" : "#f97316";
        return """
                <html><body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#e2e8f0;padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #374151;">
                    <div style="background:linear-gradient(135deg,%s,%s);padding:20px;text-align:center;">
                      <h1 style="color:white;margin:0;font-size:22px;">⚠️ %s Alert — %s</h1>
                    </div>
                    <div style="padding:24px;">
                      <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:8px 0;color:#94a3b8;width:40%%;">Tourist</td><td style="color:#f1f5f9;font-weight:bold;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Alert Type</td><td style="color:#f1f5f9;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Message</td><td style="color:#f1f5f9;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Time</td><td style="color:#f1f5f9;">%s</td></tr>
                        <tr><td style="padding:8px 0;color:#94a3b8;">Coordinates</td><td style="color:#38bdf8;">%.5f, %.5f</td></tr>
                      </table>
                      <div style="margin-top:20px;text-align:center;">
                        <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;">📍 View Location</a>
                      </div>
                    </div>
                  </div>
                </body></html>
                """.formatted(
                severityColor, "CRITICAL".equals(alert.getSeverity()) ? "#b91c1c" : "#ea580c",
                alert.getSeverity(), alert.getType(),
                tourist.getFullName(),
                alert.getType(),
                alert.getMessage(),
                FMT.format(alert.getCreatedAt()),
                alert.getLatitude(), alert.getLongitude(),
                mapsLink
        );
    }
}
