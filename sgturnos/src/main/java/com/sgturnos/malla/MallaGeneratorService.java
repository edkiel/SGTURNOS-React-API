package com.sgturnos.malla;

import java.io.File;
import java.util.List;
import java.util.Map;

public interface MallaGeneratorService {
    /**
     * Generate schedule for given role and month (YYYY-MM).
     * Returns a preview list of rows (map day->turno) and saves an Excel file to disk.
     */
    File generateAndSave(String roleId, String month) throws Exception;

    List<Map<String, Object>> preview(String roleId, String month) throws Exception;

    // allow setting a custom storage path before generation
    default void setStoragePath(String path) {
        // optional -- implementation may override
    }
}
