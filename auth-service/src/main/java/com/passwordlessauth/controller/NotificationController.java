package com.passwordlessauth.controller;

import com.passwordlessauth.dto.requests.InternalNotificationRequest;
import com.passwordlessauth.entity.Notification;
import com.passwordlessauth.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.passwordlessauth.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody InternalNotificationRequest request) {
        notificationService.createNotification(request.getUserId(), request.getType(), request.getMessage());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(principal.getUserId()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markRead(id, principal.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.delete(id, principal.getUserId());
        return ResponseEntity.ok().build();
    }
}
