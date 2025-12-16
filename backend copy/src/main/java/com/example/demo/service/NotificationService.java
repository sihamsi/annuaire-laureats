package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Notification;
import com.example.demo.model.NotificationRequest;

@Service
public class NotificationService {

    private List<Notification> notifications = new ArrayList<>();
    private Long nextId = 1L;

    // Envoyer une notification
    public Notification envoyerNotification(NotificationRequest request) {
        Notification notif = new Notification(
                nextId++,
                request.getLaureatId(),
                request.getMessage(),
                LocalDateTime.now()
        );

        notifications.add(notif);
        return notif;
    }

    // Retourner l'historique
    public List<Notification> getNotifications() {
        return notifications;
    }
}
