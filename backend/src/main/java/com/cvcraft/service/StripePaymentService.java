package com.cvcraft.service;

import com.cvcraft.exception.ApiException;
import com.cvcraft.model.entity.User;
import com.cvcraft.model.enums.SubscriptionPlan;
import com.cvcraft.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    // Replay attack koruması: işlenmiş session ID'leri takip et
    private final ConcurrentHashMap<String, Boolean> processedSessions = new ConcurrentHashMap<>();

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.stripe.price.monthly}")
    private String monthlyPriceId;

    @Value("${app.stripe.price.one-time}")
    private String oneTimePriceId;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    // ─── Checkout Session ────────────────────────────────────────────────────

    public String createSubscriptionCheckout(User user) {
        try {
            String customerId = getOrCreateStripeCustomer(user);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(monthlyPriceId)
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/pricing")
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("type", "MONTHLY_SUBSCRIPTION")
                    .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (StripeException e) {
            log.error("Stripe checkout oluşturma hatası", e);
            throw new ApiException("Ödeme sayfası oluşturulamadı", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public String createOneTimePdfCheckout(User user) {
        try {
            String customerId = getOrCreateStripeCustomer(user);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomer(customerId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(oneTimePriceId)
                            .setQuantity(1L)
                            .build())
                    .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/pricing")
                    .putMetadata("userId", user.getId().toString())
                    .putMetadata("type", "ONE_TIME_PDF")
                    .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (StripeException e) {
            log.error("Stripe one-time checkout hatası", e);
            throw new ApiException("Ödeme sayfası oluşturulamadı", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─── Webhook Handler ─────────────────────────────────────────────────────

    @Transactional
    public void handleWebhook(String payload, String sigHeader) throws EventDataObjectDeserializationException {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            throw new ApiException("Geçersiz Stripe webhook imzası", HttpStatus.BAD_REQUEST);
        }

        log.info("Stripe webhook alındı: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "customer.subscription.updated" -> handleSubscriptionUpdated(event);
            case "customer.subscription.deleted" -> handleSubscriptionCancelled(event);
            case "invoice.payment_failed" -> handlePaymentFailed(event);
            default -> log.debug("İşlenmeyen webhook tipi: {}", event.getType());
        }
    }

    private void handleCheckoutCompleted(Event event) throws EventDataObjectDeserializationException {

        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

        StripeObject stripeObject;

        if (deserializer.getObject().isPresent()) {
            stripeObject = deserializer.getObject().get();
        } else {
            stripeObject = deserializer.deserializeUnsafe();
        }

        Session session = (Session) stripeObject;

        processCheckoutSession(session);
    }

    private void processCheckoutSession(Session session) {

        String userId = session.getMetadata() != null ? session.getMetadata().get("userId") : null;
        String type = session.getMetadata() != null ? session.getMetadata().get("type") : null;

        if (userId == null || type == null) {
            log.warn("Session metadata eksik. sessionId={}, metadata={}",
                    session.getId(), session.getMetadata());
            return;
        }

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı", HttpStatus.NOT_FOUND));

        if ("ONE_TIME_PDF".equals(type)) {
            user.setPdfCredits(user.getPdfCredits() + 1);
            log.info("PDF kredisi eklendi: userId={}", userId);
        }

        if ("MONTHLY_SUBSCRIPTION".equals(type)) {
            user.setPlan(SubscriptionPlan.PREMIUM);
            user.setStripeSubscriptionId(session.getSubscription());
            user.setSubscriptionExpiresAt(LocalDateTime.now().plusMonths(1));
            log.info("Premium aktive edildi: userId={}", userId);
        }

        userRepository.save(user);
    }

    @Transactional
    public void verifySession(String sessionId, User user) {
        // Input validation
        if (sessionId == null || sessionId.isBlank()) {
            throw new ApiException("Session ID gereklidir", HttpStatus.BAD_REQUEST);
        }

        // Replay attack koruması: aynı session sadece 1 kez işlenebilir
        if (processedSessions.putIfAbsent(sessionId, Boolean.TRUE) != null) {
            log.warn("Tekrarlanan session doğrulama denemesi engellendi: sessionId={}, userId={}", sessionId, user.getId());
            return;
        }

        try {
            Session session = Session.retrieve(sessionId);
            if ("complete".equals(session.getStatus()) && user.getStripeCustomerId() != null) {
                // Ensure the session strictly belongs to the authenticated user
                if (user.getStripeCustomerId().equals(session.getCustomer())) {
                    if ("subscription".equals(session.getMode()) && user.getPlan() != SubscriptionPlan.PREMIUM) {
                        user.setPlan(SubscriptionPlan.PREMIUM);
                        user.setStripeSubscriptionId(session.getSubscription());
                        user.setSubscriptionExpiresAt(LocalDateTime.now().plusMonths(1));
                        userRepository.save(user);
                        log.info("Premium aktive edildi (verifySession): userId={}", user.getId());
                    } else if ("payment".equals(session.getMode())) {
                        user.setPdfCredits(user.getPdfCredits() + 1);
                        userRepository.save(user);
                        log.info("PDF kredisi eklendi (verifySession): userId={}", user.getId());
                    }
                } else {
                    log.warn("Session customer mismatch: sessionCustomer={}, userCustomer={}", session.getCustomer(), user.getStripeCustomerId());
                }
            }
        } catch (StripeException e) {
            log.error("Session doğrulama hatası", e);
            // Başarısız olursa cache'den kaldır ki tekrar denenebilsin
            processedSessions.remove(sessionId);
        }
    }



    private void handleSubscriptionUpdated(Event event) throws EventDataObjectDeserializationException {

        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();

        StripeObject stripeObject;

        if (deserializer.getObject().isPresent()) {
            stripeObject = deserializer.getObject().get();
        } else {
            stripeObject = deserializer.deserializeUnsafe();
        }

        Subscription subscription = (Subscription) stripeObject;

        userRepository.findByStripeSubscriptionId(subscription.getId())
                .ifPresent(user -> {

                    if ("active".equals(subscription.getStatus()) || "trialing".equals(subscription.getStatus())) {
                        user.setPlan(SubscriptionPlan.PREMIUM);
                        user.setSubscriptionExpiresAt(
                                LocalDateTime.ofInstant(
                                        Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()),
                                        ZoneId.systemDefault()
                                )
                        );
                        userRepository.save(user);
                        log.info("Abonelik aktif/güncellendi: userId={}", user.getId());
                    } else {
                        user.setPlan(SubscriptionPlan.FREE);
                        userRepository.save(user);
                        log.warn("Abonelik pasif duruma düştü, yetkiler alındı: userId={}, statü={}", user.getId(), subscription.getStatus());
                    }
                });
    }





    private void handleSubscriptionCancelled(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject().orElseThrow();

        userRepository.findByStripeSubscriptionId(subscription.getId()).ifPresent(user -> {
            user.setPlan(SubscriptionPlan.FREE);
            user.setStripeSubscriptionId(null);
            user.setSubscriptionExpiresAt(null);
            userRepository.save(user);
            log.info("Abonelik iptal edildi: userId={}", user.getId());
            log.info("tekrardan abone olunuz",user.getId());
        });
    }

    private void handlePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                .getObject().orElseThrow();

        log.warn("Ödeme başarısız: customerId={}", invoice.getCustomer());
        // Buraya e-posta bildirimi eklenebilir
    }

    // ─── Cancel Subscription ──────────────────────────────────────────────────

    @Transactional
    public void cancelSubscription(User user) {
        String subId = user.getStripeSubscriptionId();
        if (subId == null || subId.isBlank()) {
            throw new ApiException("Aktif abonelik bulunamadı", HttpStatus.BAD_REQUEST);
        }
        try {
            Subscription subscription = Subscription.retrieve(subId);
            com.stripe.param.SubscriptionUpdateParams params = com.stripe.param.SubscriptionUpdateParams.builder()
                    .setCancelAtPeriodEnd(true)
                    .build();
            subscription.update(params);
            log.info("Abonelik dönem sonunda iptal edilecek: userId={}, subId={}", user.getId(), subId);
        } catch (StripeException e) {
            log.error("Abonelik iptal hatası", e);
            throw new ApiException("Abonelik iptal edilemedi", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─── Yardımcı ─────────────────────────────────────────────────────────────

    private String getOrCreateStripeCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getName())
                .putMetadata("userId", user.getId().toString())
                .build();

        Customer customer = Customer.create(params);
        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);

        return customer.getId();
    }
}
