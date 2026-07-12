package com.example.demo.controller;

import com.example.demo.dto.CreateMessageRequest;
import com.example.demo.dto.MessageResponse;
import com.example.demo.entity.MessageContact;
import com.example.demo.repository.MessageContactRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageContactController {

    private final MessageContactRepository repo;

    public MessageContactController(MessageContactRepository repo) {
        this.repo = repo;
    }

    // ✅ ContactPage => envoie un message
    @PostMapping
    public ResponseEntity<MessageResponse> create(@Valid @RequestBody CreateMessageRequest req) {
        MessageContact m = new MessageContact();
        m.setNom(req.getNom());
        m.setEmail(req.getEmail());
        m.setSujet(req.getSujet());
        m.setMessage(req.getMessage());

        MessageContact saved = repo.save(m);

        return ResponseEntity.ok(
                new MessageResponse(
                        saved.getId(),
                        saved.getNom(),
                        saved.getEmail(),
                        saved.getSujet(),
                        saved.getMessage(),
                        saved.getCreatedAt()));
    }

    // ✅ Admin => lire tous les messages (tri desc)
    @GetMapping
    public ResponseEntity<List<MessageResponse>> list() {
        List<MessageResponse> out = repo.findAll()
                .stream()
                .sorted(Comparator.comparing(MessageContact::getCreatedAt).reversed())
                .map(m -> new MessageResponse(
                        m.getId(),
                        m.getNom(),
                        m.getEmail(),
                        m.getSujet(),
                        m.getMessage(),
                        m.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(out);
    }

    // ✅ Admin => supprimer un message (optionnel)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
