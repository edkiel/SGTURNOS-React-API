package com.sgturnos.malla;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mallas")
public class MallaController {

    @Autowired
    private MallaService mallaService;

    @Autowired
    private com.sgturnos.malla.MallaGeneratorService mallaGeneratorService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMalla(@RequestParam("file") MultipartFile file) {
        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File saved = mallaService.saveMalla(file.getBytes(), filename);
            return ResponseEntity.ok().body("/mallas/" + saved.getName());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateMalla(@RequestParam("roleId") String roleId, @RequestParam("month") String month, @RequestParam(value = "path", required = false) String path) {
        try {
            // Only administrators may generate mallas. Disallow medicos, auxiliares, enfermeras, terapeutas.
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().stream().noneMatch(a -> {
                String at = a.getAuthority() == null ? "" : a.getAuthority().toLowerCase();
                return at.contains("admin") || at.contains("adm");
            })) {
                return ResponseEntity.status(403).body("Forbidden: only administrators can generate mallas");
            }

            if (path != null && !path.isBlank()) {
                // allow controller to set a custom storage path temporarily
                mallaGeneratorService.setStoragePath(path);
            }
            File saved = mallaGeneratorService.generateAndSave(roleId, month);
            java.util.List<java.util.Map<String, Object>> preview = mallaGeneratorService.preview(roleId, month);
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("file", saved.getName());
            resp.put("preview", preview);
            resp.put("path", saved.getAbsolutePath());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/publish")
    public ResponseEntity<?> publishMalla(@RequestParam("roleId") String roleId, @RequestParam("month") String month) {
        try {
            // only admin users can publish
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().toLowerCase().contains("adm"))) {
                return ResponseEntity.status(403).body("Forbidden: only administrators can publish mallas");
            }
            // generate and save file
            File saved = mallaGeneratorService.generateAndSave(roleId, month);
            java.util.List<java.util.Map<String, Object>> preview = mallaGeneratorService.preview(roleId, month);
            // persist published metadata
            mallaService.savePublishedInfo(roleId, month, saved.getName(), preview);
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("file", saved.getName());
            resp.put("preview", preview);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/published")
    public ResponseEntity<?> getPublished(@RequestParam("roleId") String roleId, @RequestParam("month") String month) {
        try {
            java.util.Map<String, Object> info = mallaService.getPublishedInfo(roleId, month);
            // Si no hay malla publicada, devolver 200 con null en lugar de 404
            // Esto evita que el frontend lance errores cuando no hay datos
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping
    public List<String> listMallas() {
        List<File> files = mallaService.listMallas();
        return files.stream().map(File::getName).collect(Collectors.toList());
    }

    @GetMapping("/download/{name}")
    public ResponseEntity<byte[]> downloadMalla(@PathVariable String name) {
        try {
            List<File> files = mallaService.listMallas();
            for (File f : files) {
                if (f.getName().equals(name)) {
                    byte[] data = Files.readAllBytes(f.toPath());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + f.getName() + "\"")
                            .contentType(MediaType.APPLICATION_OCTET_STREAM)
                            .body(data);
                }
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
