package com.sgturnos.malla;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class MallaServiceImpl implements MallaService {

    @Value("${malla.storage.path:./mallas}")
    private String mallaStoragePath;

    @Override
    public File saveMalla(byte[] content, String filename) throws Exception {
        Path dir = Path.of(mallaStoragePath);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }
        Path filePath = dir.resolve(filename);
        try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
            fos.write(content);
        }
        return filePath.toFile();
    }

    @Override
    public List<File> listMallas() {
        Path dir = Path.of(mallaStoragePath);
        if (!Files.exists(dir)) return List.of();
        File[] files = dir.toFile().listFiles();
        if (files == null) return List.of();
        return new ArrayList<>(Arrays.asList(files));
    }

    @Override
    public void savePublishedInfo(String roleId, String month, String filename, java.util.List<java.util.Map<String, Object>> preview) throws Exception {
        Path dir = Path.of(mallaStoragePath);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        Path published = dir.resolve("published.json");

        java.util.Map<String, Object> root = new java.util.HashMap<>();
        if (Files.exists(published)) {
            String text = Files.readString(published);
            try {
                root.putAll(new com.fasterxml.jackson.databind.ObjectMapper().readValue(text, java.util.Map.class));
            } catch (Exception ex) {
                // ignore and overwrite
            }
        }

        java.util.Map<String, Object> info = new java.util.HashMap<>();
        info.put("file", filename);
        info.put("month", month);
        info.put("roleId", roleId);
        info.put("preview", preview);
        root.put(roleId + "::" + month, info);

        String out = new com.fasterxml.jackson.databind.ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(root);
        Files.writeString(published, out);
    }

    @Override
    public java.util.Map<String, Object> getPublishedInfo(String roleId, String month) throws Exception {
        Path dir = Path.of(mallaStoragePath);
        Path published = dir.resolve("published.json");
        if (!Files.exists(published)) return null;
        String text = Files.readString(published);
        java.util.Map<String, Object> root = new com.fasterxml.jackson.databind.ObjectMapper().readValue(text, java.util.Map.class);
        Object v = root.get(roleId + "::" + month);
        if (v instanceof java.util.Map) return (java.util.Map<String, Object>) v;
        return null;
    }
}
