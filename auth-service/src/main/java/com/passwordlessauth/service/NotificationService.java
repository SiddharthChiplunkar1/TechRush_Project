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

    public Notification createNotification(Notification n) {
        return notificationRepository.save(n);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setReadFlag(true);
            notificationRepository.save(n);
        });
    }

    public void delete(String id) {
        notificationRepository.deleteById(id);
    }
}
