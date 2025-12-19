package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // POST /api/notifications/envoyer
    public Notification envoyer(Long laureatId, String message, String type) {
        if (laureatId == null || message == null || message.isBlank()) {
            throw new IllegalArgumentException("Données de notification invalides");
        }

        Notification notification = new Notification();
        notification.setLaureatId(laureatId);
        notification.setMessage(message);
        notification.setType(type != null ? type : "INFO");

        return notificationRepository.save(notification);
    }

    // GET /api/notifications
    @Transactional(readOnly = true)
    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    // GET /api/notifications?laureatId=1
    @Transactional(readOnly = true)
    public List<Notification> getByLaureat(Long laureatId) {
        return notificationRepository.findByLaureatIdOrderBySentAtDesc(laureatId);
    }
}
