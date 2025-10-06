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
}
