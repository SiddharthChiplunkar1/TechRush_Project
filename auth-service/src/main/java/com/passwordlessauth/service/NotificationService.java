package com.passwordlessauth.service;

import com.passwordlessauth.entity.Notification;
import com.passwordlessauth.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(String userId, String type, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markRead(String id, String userId) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (!userId.equals(n.getUserId())) return;
            n.setReadFlag(true);
            notificationRepository.save(n);
        });
    }

    public void delete(String id, String userId) {
        notificationRepository.findById(id).filter(n -> userId.equals(n.getUserId()))
                .ifPresent(notificationRepository::delete);
    }
}
