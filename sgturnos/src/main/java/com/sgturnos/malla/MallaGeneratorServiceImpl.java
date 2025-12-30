package com.sgturnos.malla;

import java.io.File;
import java.io.FileOutputStream;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;

/**
 * ALGORITMO DE GENERACIÓN DE MALLA v3.0
 * 
 * OBJETIVOS PRINCIPALES:
 * 1. PRIORIDAD: Completar 192 horas mensuales usando turnos DÍA (12D) y NOCHE (12N) principalmente
 * 2. COMITÉ PRIMARIO (CMP): 3 horas de capacitación (incluidas en las 192h)
 * 3. APOYO: Solo para completar horas faltantes (NUNCA exceder 192h), siempre en DÍA
 * 4. DINAMISMO: Permitir dupletas (día-día, noche-noche, día-noche)
 * 5. RESTRICCIONES:
 *    - NO tripletas (3+ días seguidos o 3+ noches seguidas)
 *    - NO noche→día (sería 24h continuas)
 *    - Después de NOCHE: mínimo 12h descanso (POSTURNO)
 *    - CMP (3h) + APOYO <= 12 horas en un mismo día
 * 6. ECUACIÓN: Turnos DÍA + Turnos NOCHE + Comité Primario (3h) + APOYO = 192 horas
 * 7. COBERTURA:
 *    - DÍA: 2 médicos, 3 enfermeros, 8-9 auxiliares (1/6 pacientes), 2 terapeutas
 *    - NOCHE: 1 médico, 2 enfermeros, 8-9 auxiliares (1/6 pacientes), 2 terapeutas
 */
@Service
public class MallaGeneratorServiceImpl implements MallaGeneratorService {

    private final UsuarioRepository usuarioRepository;

    @Value("${malla.storage.path:./mallas}")
    private String storagePath;

    private Integer auxCoverageOverride = null;
    private Integer patientLoad = null;

    // Constantes de horas
    private static final int TARGET_HOURS_PER_USER = 192;  // Horas totales mensuales
    private static final int FULL_SHIFT_HOURS = 12;        // Turno completo (día o noche)
    private static final int CMP_HOURS = 3;                 // Comité primario
    private static final int MAX_CONSECUTIVE_SAME = 2;      // Máximo de turnos iguales seguidos (dupletas OK, tripletas NO)

    public MallaGeneratorServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public File generateAndSave(String roleId, String month) throws Exception {
        List<Map<String, Object>> preview = preview(roleId, month);
        
        // Build Excel
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Malla");

        // Crear estilos de colores
        CellStyle styleDia = workbook.createCellStyle();
        styleDia.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        styleDia.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle styleNoche = workbook.createCellStyle();
        styleNoche.setFillForegroundColor(IndexedColors.GREY_40_PERCENT.getIndex());
        styleNoche.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle styleApoyo = workbook.createCellStyle();
        styleApoyo.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        styleApoyo.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle styleLibre = workbook.createCellStyle();
        styleLibre.setFillForegroundColor(IndexedColors.WHITE.getIndex());
        styleLibre.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle stylePosturno = workbook.createCellStyle();
        stylePosturno.setFillForegroundColor(IndexedColors.LAVENDER.getIndex());
        stylePosturno.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle styleCMP = workbook.createCellStyle();
        styleCMP.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        styleCMP.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        if (preview.isEmpty()) {
            Row header = sheet.createRow(0);
            Cell c = header.createCell(0);
            c.setCellValue("No data");
        } else {
            // Header row
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Empleado");
            Map<String, Object> first = preview.get(0);
            int days = 0;
            for (String k : first.keySet()) {
                if (k.startsWith("d")) days++;
            }
            for (int d = 1; d <= days; d++) header.createCell(d).setCellValue("d" + d);
            
            // Summary columns
            header.createCell(days + 1).setCellValue("Turnos");
            header.createCell(days + 2).setCellValue("Horas");

            int r = 1;
            for (Map<String, Object> row : preview) {
                Row excelRow = sheet.createRow(r++);
                excelRow.createCell(0).setCellValue(String.valueOf(row.get("name")));
                
                for (int d = 1; d <= days; d++) {
                    Object v = row.get("d" + d);
                    String cellValue = v == null ? "" : v.toString();
                    Cell cell = excelRow.createCell(d);
                    cell.setCellValue(cellValue);
                    
                    // Aplicar colores según el tipo de turno
                    if (cellValue.equals("TD")) {
                        cell.setCellStyle(styleDia);
                    } else if (cellValue.equals("TN")) {
                        cell.setCellStyle(styleNoche);
                    } else if (cellValue.startsWith("AP") || cellValue.equals("AP")) {
                        cell.setCellStyle(styleApoyo);
                    } else if (cellValue.equals("PT")) {
                        cell.setCellStyle(stylePosturno);
                    } else if (cellValue.equals("CP")) {
                        cell.setCellStyle(styleCMP);
                    } else if (cellValue.contains("CP") && cellValue.contains("AP") && cellValue.contains("+")) {
                        // Combinación CP+AP - usar estilo mixto (CMP como base)
                        cell.setCellStyle(styleCMP);
                    } else {
                        cell.setCellStyle(styleLibre);
                    }
                }
                
                Object turnos = row.get("turnos");
                Object horas = row.get("horas");
                excelRow.createCell(days + 1).setCellValue(turnos == null ? "" : turnos.toString());
                excelRow.createCell(days + 2).setCellValue(horas == null ? "" : horas.toString());
            }
        }

        String filename = String.format("malla_%s_%s.xlsx", roleId, YearMonth.parse(month));
        File dir = new File(storagePath);
        if (!dir.exists()) dir.mkdirs();
        File out = new File(dir, filename);
        try (FileOutputStream fos = new FileOutputStream(out)) {
            workbook.write(fos);
        }
        workbook.close();
        return out;
    }

    public void setStoragePath(String path) {
        if (path != null && !path.isBlank()) this.storagePath = path;
    }

    @Override
    public List<Map<String, Object>> preview(String roleId, String month) throws Exception {
        List<Usuario> allRepoUsers = usuarioRepository.findAll();
        if (allRepoUsers == null || allRepoUsers.isEmpty()) return List.of();

        YearMonth ym = YearMonth.parse(month);
        int days = ym.lengthOfMonth();

        // Calcular auxiliares necesarios
        int auxNeeded = 8;
        if (patientLoad != null && patientLoad > 0) {
            auxNeeded = (int) Math.ceil(patientLoad / 6.0);
            System.out.println("[MALLA] Auxiliares calculados: " + patientLoad + " pacientes / 6 = " + auxNeeded + " auxiliares");
        } else if (auxCoverageOverride != null && auxCoverageOverride > 0) {
            auxNeeded = auxCoverageOverride;
            System.out.println("[MALLA] Auxiliares override: " + auxNeeded);
        }

        // Requerimientos de cobertura
        Map<String, Integer> coverageDay = Map.of("MED", 2, "JEF", 3, "AUX", auxNeeded, "TER", 2);
        Map<String, Integer> coverageNight = Map.of("MED", 1, "JEF", 2, "AUX", auxNeeded, "TER", 2);
        
        System.out.println("[MALLA] COBERTURA REQUERIDA - Día: " + coverageDay + ", Noche: " + coverageNight);

        // Clasificar usuarios por rol
        Map<String, List<Usuario>> byCode = classifyUsersByRole(allRepoUsers);
        System.out.println("[MALLA] Pools - MED: " + byCode.getOrDefault("MED", List.of()).size() + 
                          ", JEF: " + byCode.getOrDefault("JEF", List.of()).size() +
                          ", AUX: " + byCode.getOrDefault("AUX", List.of()).size() +
                          ", TER: " + byCode.getOrDefault("TER", List.of()).size());

        // Obtener usuarios objetivo
        List<Usuario> targetUsers = getTargetUsers(allRepoUsers, byCode, roleId);
        System.out.println("[MALLA] Usuarios objetivo: " + targetUsers.size());

        // Inicializar malla (filas)
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<Long, Integer> hoursByUser = new HashMap<>();
        Map<Long, Integer> turnsByUser = new HashMap<>();
        Map<Long, Integer> consecutiveDays = new HashMap<>();
        Map<Long, Integer> consecutiveNights = new HashMap<>();
        Map<Long, Boolean> hasCMP = new HashMap<>();

        for (Usuario u : targetUsers) {
            long id = u.getIdUsuario();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", id);
            row.put("name", u.getPrimerNombre() + " " + (u.getPrimerApellido() == null ? "" : u.getPrimerApellido()));
            for (int d = 1; d <= days; d++) {
                row.put("d" + d, "");
            }
            rows.add(row);

            hoursByUser.put(id, 0);
            turnsByUser.put(id, 0);
            consecutiveDays.put(id, 0);
            consecutiveNights.put(id, 0);
            hasCMP.put(id, false);
        }

        // ========== FASE 1: ASIGNAR TURNOS DE 12H PRIORIZANDO COBERTURA Y EQUIDAD ==========
        System.out.println("[MALLA] FASE 1: Asignando turnos de 12h priorizando cobertura completa...");
        
        // ESTRATEGIA: Primero garantizar cobertura completa cada día, 
        // luego seguir asignando turnos hasta que la mayoría tenga ~16 turnos (192h)
        int maxIterations = 200; // Aumentar iteraciones para garantizar distribución completa
        
        for (int iteration = 0; iteration < maxIterations; iteration++) {
            boolean anyAssigned = false;
            
            for (int d = 1; d <= days; d++) {
                // Asignar turnos DÍA
                for (String roleCode : List.of("MED", "JEF", "AUX", "TER")) {
                    int needDay = coverageDay.getOrDefault(roleCode, 0);
                    int assignedDay = countAssignedForDay(rows, d, "Día", roleCode, byCode);
                    
                    while (assignedDay < needDay) {
                        Usuario candidate = selectBestCandidateV3(targetUsers, byCode, roleCode, d, false, 
                                                                 rows, hoursByUser, consecutiveDays, 
                                                                 consecutiveNights);
                        if (candidate == null) break;
                        
                        assignShiftV3(candidate.getIdUsuario(), d, "TD", rows, hoursByUser, 
                                     turnsByUser, consecutiveDays, consecutiveNights, FULL_SHIFT_HOURS, false);
                        assignedDay++;
                        anyAssigned = true;
                    }
                }

                // Asignar turnos NOCHE
                for (String roleCode : List.of("MED", "JEF", "AUX", "TER")) {
                    int needNight = coverageNight.getOrDefault(roleCode, 0);
                    int assignedNight = countAssignedForDay(rows, d, "Noche", roleCode, byCode);
                    
                    while (assignedNight < needNight) {
                        Usuario candidate = selectBestCandidateV3(targetUsers, byCode, roleCode, d, true, 
                                                                 rows, hoursByUser, consecutiveDays, 
                                                                 consecutiveNights);
                        if (candidate == null) break;
                        
                        assignShiftV3(candidate.getIdUsuario(), d, "TN", rows, hoursByUser, 
                                     turnsByUser, consecutiveDays, consecutiveNights, FULL_SHIFT_HOURS, true);
                        assignedNight++;
                        anyAssigned = true;
                    }
                }
            }
            
            // Verificar progreso: contar cuántos usuarios están cerca de completar 192h con solo turnos de 12h
            int usersCompleted = 0;
            int usersNearTarget = 0;
            for (Map<String, Object> row : rows) {
                Number nid = (Number) row.get("id");
                if (nid != null) {
                    int hours = hoursByUser.getOrDefault(nid.longValue(), 0);
                    if (hours >= TARGET_HOURS_PER_USER) usersCompleted++;
                    if (hours >= (TARGET_HOURS_PER_USER - 24)) usersNearTarget++; // Dentro de 2 turnos
                }
            }
            
            System.out.println("[MALLA] Iteración " + (iteration + 1) + 
                             ": " + usersCompleted + " usuarios ≥192h, " + 
                             usersNearTarget + " usuarios cerca del objetivo");
            
            // Detener si la mayoría de usuarios está completa o no se pueden asignar más turnos
            if (!anyAssigned || usersNearTarget >= (targetUsers.size() * 0.8)) {
                System.out.println("[MALLA] Distribución de turnos completada (cobertura garantizada)");
                break;
            }
        }

        System.out.println("[MALLA] FASE 1 completada");

        // ========== FASE 2: ASIGNAR POSTURNO DESPUÉS DE NOCHES ==========
        System.out.println("[MALLA] FASE 2: Asignando POSTURNO después de noches...");
        
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            
            for (int d = 1; d <= days; d++) {
                String key = "d" + d;
                Object cell = row.get(key);
                String cellStr = cell == null ? "" : cell.toString();

                if (cellStr.isEmpty() || cellStr.isBlank()) {
                    if (d > 1) {
                        Object prev = row.get("d" + (d - 1));
                        String prevStr = prev == null ? "" : prev.toString();
                        if (prevStr.equals("TN")) {
                            row.put(key, "PT");
                        } else {
                            row.put(key, "LB");
                        }
                    } else {
                        row.put(key, "LB");
                    }
                }
            }
        }

        System.out.println("[MALLA] FASE 2 completada");

        // ========== FASE 3: ASIGNAR COMITÉ PRIMARIO (CMP) - 3 HORAS ==========
        System.out.println("[MALLA] FASE 3: Asignando Comité Primario (CMP - 3h)...");
        
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            long id = nid.longValue();

            // Buscar un día LB para asignar CP
            for (int d = 1; d <= days; d++) {
                String key = "d" + d;
                Object cell = row.get(key);
                String cellStr = cell == null ? "" : cell.toString();

                if (cellStr.equals("LB")) {
                    // Marcar que tiene CP pero no asignar aún, se combinará con AP si es necesario
                    row.put(key, "CP");
                    hoursByUser.put(id, hoursByUser.getOrDefault(id, 0) + CMP_HOURS);
                    hasCMP.put(id, true);
                    break;
                }
            }
        }

        System.out.println("[MALLA] FASE 3 completada");

        // ========== FASE 4: ASIGNAR APOYO SOLO SI ES NECESARIO PARA COMPLETAR 192H ==========
        System.out.println("[MALLA] FASE 4: Asignando APOYO MÍNIMO para completar exactamente 192 horas...");
        
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            long id = nid.longValue();

            int currentHours = hoursByUser.getOrDefault(id, 0);
            int remaining = TARGET_HOURS_PER_USER - currentHours;

            if (remaining <= 0) {
                System.out.println("[MALLA] Usuario " + row.get("name") + ": " + currentHours + 
                                 "h - Ya completó sus horas");
                continue;
            }

            System.out.println("[MALLA] Usuario " + row.get("name") + ": " + currentHours + 
                             "h, faltan " + remaining + "h para 192h");

            // Estrategia: Primero intentar combinar con CP si existe, luego buscar LB
            boolean apoyoAsignado = false;
            
            // 1. Buscar día con CP y agregar AP en el mismo día (RESTRICCIÓN: CP + AP <= 12h)
            for (int d = 1; d <= days && remaining > 0; d++) {
                String key = "d" + d;
                Object cell = row.get(key);
                String cellStr = cell == null ? "" : cell.toString();

                if (cellStr.equals("CP")) {
                    // CP = 3h, entonces AP máximo = 9h para no exceder 12h por día
                    int maxApoyoThisDay = Math.min(remaining, 12 - CMP_HOURS); // máximo 9h
                    
                    if (maxApoyoThisDay > 0) {
                        String combinado = "CP" + CMP_HOURS + "h+AP" + maxApoyoThisDay + "h";
                        row.put(key, combinado);
                        hoursByUser.put(id, hoursByUser.getOrDefault(id, 0) + maxApoyoThisDay);
                        remaining -= maxApoyoThisDay;
                        
                        System.out.println("[MALLA] Usuario " + row.get("name") + 
                                         " - Combinado: " + combinado + " (total día: " + (CMP_HOURS + maxApoyoThisDay) + "h, quedan " + remaining + "h)");
                        
                        if (remaining == 0) {
                            apoyoAsignado = true;
                        }
                    }
                }
            }
            
            // 2. Si aún faltan horas, buscar días LB para asignar AP (máximo 12h por día)
            for (int d = 1; d <= days && remaining > 0; d++) {
                String key = "d" + d;
                Object cell = row.get(key);
                String cellStr = cell == null ? "" : cell.toString();

                if (cellStr.equals("LB")) {
                    // En un día solo LB, podemos asignar hasta 12h de APOYO
                    int apoyoThisDay = Math.min(remaining, 12);
                    
                    row.put(key, "AP" + apoyoThisDay + "h");
                    hoursByUser.put(id, hoursByUser.getOrDefault(id, 0) + apoyoThisDay);
                    remaining -= apoyoThisDay;
                    
                    System.out.println("[MALLA] Usuario " + row.get("name") + 
                                     " - APOYO asignado: AP" + apoyoThisDay + "h (quedan " + remaining + "h)");
                    
                    if (remaining == 0) {
                        apoyoAsignado = true;
                    }
                }
            }

            if (!apoyoAsignado && remaining > 0) {
                System.out.println("[MALLA] WARNING: Usuario " + row.get("name") + 
                                 " no pudo completar 192h, faltan " + remaining + "h (sin días LB disponibles o límite de 12h/día alcanzado)");
            }
        }

        System.out.println("[MALLA] FASE 4 completada");

        // ========== CALCULAR ESTADÍSTICAS FINALES ==========
        System.out.println("[MALLA] Calculando estadísticas finales...");
        
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            long id = nid.longValue();

            int horas = hoursByUser.getOrDefault(id, 0);
            int turnos = 0;
            for (int d = 1; d <= days; d++) {
                Object cell = row.get("d" + d);
                String s = cell == null ? "" : cell.toString();
                // Contar turnos: TD, TN, AP (con o sin horas), CP+AP
                if (s.equals("TD") || s.equals("TN") || s.equals("AP") || s.startsWith("AP") || 
                    (s.contains("CP") && s.contains("AP"))) {
                    turnos++;
                }
            }

            row.put("horas", horas);
            row.put("turnos", turnos);

            System.out.println("[MALLA] " + row.get("name") + ": " + turnos + " turnos, " + 
                             horas + " horas" + (hasCMP.get(id) ? " (incluye CMP)" : ""));
        }

        return rows;
    }

    // ========== MÉTODOS AUXILIARES ==========

    private Map<String, List<Usuario>> classifyUsersByRole(List<Usuario> users) {
        Map<String, List<Usuario>> byCode = new HashMap<>();
        for (Usuario u : users) {
            String code = "AUX";
            if (u.getRol() != null) {
                String idr = u.getRol().getIdRol() != null ? u.getRol().getIdRol().toLowerCase() : "";
                String rname = u.getRol().getRol() != null ? u.getRol().getRol().toLowerCase() : "";
                
                if (idr.contains("med") || rname.contains("med")) code = "MED";
                else if (idr.contains("jef") || rname.contains("jef") || rname.contains("jefe")) code = "JEF";
                else if (idr.contains("aux") || rname.contains("aux")) code = "AUX";
                else if (idr.contains("ter") || rname.contains("terap") || rname.contains("ter")) code = "TER";
                else if (rname.contains("enfer") || idr.contains("enf")) code = "JEF";
            }
            byCode.computeIfAbsent(code, k -> new ArrayList<>()).add(u);
        }
        return byCode;
    }

    private List<Usuario> getTargetUsers(List<Usuario> allUsers, Map<String, List<Usuario>> byCode, String roleId) {
        List<Usuario> targetUsers = new ArrayList<>();
        String param = roleId == null ? "" : roleId.trim();

        if (!param.isEmpty()) {
            try {
                List<Usuario> byExact = usuarioRepository.findAllByRol_IdRol(param);
                if (byExact != null && !byExact.isEmpty()) {
                    targetUsers.addAll(byExact);
                }
            } catch (Exception ex) {
                // Fallback
            }
        }

        if (targetUsers.isEmpty()) {
            String p = param.toLowerCase();
            if (p.equals("med") || p.contains("medico")) {
                targetUsers.addAll(byCode.getOrDefault("MED", List.of()));
            } else if (p.equals("jef") || p.contains("jefe")) {
                targetUsers.addAll(byCode.getOrDefault("JEF", List.of()));
            } else if (p.equals("aux") || p.contains("auxiliar")) {
                targetUsers.addAll(byCode.getOrDefault("AUX", List.of()));
            } else if (p.equals("ter") || p.contains("terap")) {
                targetUsers.addAll(byCode.getOrDefault("TER", List.of()));
            } else if (!p.isEmpty()) {
                for (Usuario u : allUsers) {
                    if (u.getRol() != null) {
                        String idr = u.getRol().getIdRol() != null ? u.getRol().getIdRol().toLowerCase() : "";
                        String rname = u.getRol().getRol() != null ? u.getRol().getRol().toLowerCase() : "";
                        if (idr.contains(p) || rname.contains(p)) {
                            targetUsers.add(u);
                        }
                    }
                }
            } else {
                targetUsers.addAll(allUsers);
            }
        }

        targetUsers.removeIf(u -> {
            if (u.getRol() == null) return false;
            String idr = u.getRol().getIdRol() == null ? "" : u.getRol().getIdRol().toLowerCase();
            String rname = u.getRol().getRol() == null ? "" : u.getRol().getRol().toLowerCase();
            return idr.equals("adm05") || rname.contains("admin");
        });

        return targetUsers;
    }

    private int countAssignedForDay(List<Map<String, Object>> rows, int day, String shiftType, 
                                    String roleCode, Map<String, List<Usuario>> byCode) {
        Set<Long> assignedIds = new HashSet<>();

        for (Map<String, Object> row : rows) {
            Object cell = row.get("d" + day);
            String cellStr = cell == null ? "" : cell.toString();
            
            if (shiftType.equals("Día") && cellStr.equals("TD")) {
                Number id = (Number) row.get("id");
                if (id != null && belongsToRole(id.longValue(), roleCode, byCode)) {
                    assignedIds.add(id.longValue());
                }
            } else if (shiftType.equals("Noche") && cellStr.equals("TN")) {
                Number id = (Number) row.get("id");
                if (id != null && belongsToRole(id.longValue(), roleCode, byCode)) {
                    assignedIds.add(id.longValue());
                }
            }
        }

        return assignedIds.size();
    }

    private boolean belongsToRole(long userId, String roleCode, Map<String, List<Usuario>> byCode) {
        List<Usuario> pool = byCode.getOrDefault(roleCode, List.of());
        return pool.stream().anyMatch(u -> u.getIdUsuario() == userId);
    }

    private Usuario selectBestCandidateV3(List<Usuario> targetUsers, Map<String, List<Usuario>> byCode,
                                         String roleCode, int day, boolean isNight, 
                                         List<Map<String, Object>> rows,
                                         Map<Long, Integer> hoursByUser, 
                                         Map<Long, Integer> consecutiveDays,
                                         Map<Long, Integer> consecutiveNights) {
        List<Usuario> pool = byCode.getOrDefault(roleCode, List.of()).stream()
            .filter(u -> targetUsers.contains(u))
            .collect(Collectors.toList());

        if (pool.isEmpty()) return null;

        // Ordenar por:
        // 1. Menos horas acumuladas (equidad)
        // 2. No violar restricciones
        pool.sort((u1, u2) -> {
            long id1 = u1.getIdUsuario();
            long id2 = u2.getIdUsuario();
            int h1 = hoursByUser.getOrDefault(id1, 0);
            int h2 = hoursByUser.getOrDefault(id2, 0);
            
            // Priorizar quien tiene menos horas
            return Integer.compare(h1, h2);
        });

        for (Usuario u : pool) {
            long id = u.getIdUsuario();
            Map<String, Object> row = rows.stream()
                .filter(r -> ((Number) r.get("id")).longValue() == id)
                .findFirst().orElse(null);

            if (row == null) continue;

            Object cell = row.get("d" + day);
            String cellStr = cell == null ? "" : cell.toString();

            // Ya tiene turno asignado
            if (!cellStr.isEmpty() && !cellStr.isBlank()) continue;

            // VALIDACIÓN 1: NO noche → día (sería 24h continuas)
            if (!isNight && day > 1) {
                Object prev = row.get("d" + (day - 1));
                String prevStr = prev == null ? "" : prev.toString();
                if (prevStr.equals("TN")) continue; // Skip: no puede ser día después de noche
            }

            // VALIDACIÓN 2: NO tripletas de días (máximo 2 días seguidos)
            if (!isNight) {
                int consecut = consecutiveDays.getOrDefault(id, 0);
                if (consecut >= MAX_CONSECUTIVE_SAME) continue; // Ya tiene 2 días seguidos
            }

            // VALIDACIÓN 3: NO tripletas de noches (máximo 2 noches seguidas)
            if (isNight) {
                int consecut = consecutiveNights.getOrDefault(id, 0);
                if (consecut >= MAX_CONSECUTIVE_SAME) continue; // Ya tiene 2 noches seguidas
            }

            // VALIDACIÓN 4: No exceder 189 horas (dejar espacio para CMP de 3h)
            int currentHours = hoursByUser.getOrDefault(id, 0);
            if (currentHours + FULL_SHIFT_HOURS > 189) continue;

            // Candidato válido
            return u;
        }

        return null;
    }

    private void assignShiftV3(long userId, int day, String shiftCode, List<Map<String, Object>> rows,
                              Map<Long, Integer> hoursByUser, Map<Long, Integer> turnsByUser,
                              Map<Long, Integer> consecutiveDays, Map<Long, Integer> consecutiveNights,
                              int hours, boolean isNight) {
        Map<String, Object> row = rows.stream()
            .filter(r -> ((Number) r.get("id")).longValue() == userId)
            .findFirst().orElse(null);

        if (row == null) return;

        row.put("d" + day, shiftCode);
        hoursByUser.put(userId, hoursByUser.getOrDefault(userId, 0) + hours);
        turnsByUser.put(userId, turnsByUser.getOrDefault(userId, 0) + 1);

        // Actualizar racha de días/noches consecutivas
        if (isNight) {
            consecutiveNights.put(userId, consecutiveNights.getOrDefault(userId, 0) + 1);
            consecutiveDays.put(userId, 0); // Reset días
        } else {
            consecutiveDays.put(userId, consecutiveDays.getOrDefault(userId, 0) + 1);
            consecutiveNights.put(userId, 0); // Reset noches
        }
    }

    @Override
    public void setAuxCoverageOverride(Integer auxiliaries) {
        this.auxCoverageOverride = auxiliaries;
    }

    @Override
    public void setPatientLoad(Integer patients) {
        this.patientLoad = patients;
    }
}
