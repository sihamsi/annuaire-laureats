package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // POST /api/notifications/envoyer
    @PostMapping("/envoyer")
    public ResponseEntity<?> envoyer(@RequestBody Map<String, String> request) {
        try {
            Long laureatId = Long.valueOf(request.get("laureatId"));
            String message = request.get("message");
            String type = request.get("type");

            Notification notif = notificationService.envoyer(laureatId, message, type);
            return ResponseEntity.status(HttpStatus.CREATED).body(notif);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Erreur lors de l’envoi de la notification"));
        }
    }

    // GET /api/notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAll(
            @RequestParam(required = false) Long laureatId) {

        if (laureatId != null) {
            return ResponseEntity.ok(notificationService.getByLaureat(laureatId));
        }
        return ResponseEntity.ok(notificationService.getAll());
        
    }
}
