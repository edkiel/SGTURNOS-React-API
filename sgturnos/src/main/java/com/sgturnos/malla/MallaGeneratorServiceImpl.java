package com.sgturnos.malla;

import com.sgturnos.model.Usuario;
import com.sgturnos.repository.UsuarioRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.YearMonth;
import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MallaGeneratorServiceImpl implements MallaGeneratorService {

    private final UsuarioRepository usuarioRepository;

    @Value("${malla.storage.path:./mallas}")
    private String storagePath;

    public MallaGeneratorServiceImpl(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public File generateAndSave(String roleId, String month) throws Exception {
        List<Map<String, Object>> preview = preview(roleId, month);
        // build excel
        XSSFWorkbook workbook = new XSSFWorkbook();
        XSSFSheet sheet = workbook.createSheet("Malla");

        if (preview.isEmpty()) {
            // create header only
            Row header = sheet.createRow(0);
            Cell c = header.createCell(0);
            c.setCellValue("No data");
        } else {
            // header row
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Empleado");
            Map<String, Object> first = preview.get(0);
            int days = 0;
            for (String k : first.keySet()) {
                if (k.startsWith("d")) days++;
            }
            for (int d = 1; d <= days; d++) header.createCell(d).setCellValue("d" + d);

            int r = 1;
            for (Map<String, Object> row : preview) {
                Row excelRow = sheet.createRow(r++);
                excelRow.createCell(0).setCellValue(String.valueOf(row.get("name")));
                for (int d = 1; d <= days; d++) {
                    Object v = row.get("d" + d);
                    excelRow.createCell(d).setCellValue(v == null ? "" : v.toString());
                }
            }
        }

        YearMonth ym = YearMonth.parse(month);
        String filename = String.format("malla_%s_%s.xlsx", roleId, month);
        File dir = new File(storagePath);
        if (!dir.exists()) dir.mkdirs();
        File out = new File(dir, filename);
        try (FileOutputStream fos = new FileOutputStream(out)) {
            workbook.write(fos);
        }
        workbook.close();
        return out;
    }

    // allow controller to override storage path when user specifies location
    public void setStoragePath(String path) {
        if (path != null && !path.isBlank()) this.storagePath = path;
    }

    @Override
    public List<Map<String, Object>> preview(String roleId, String month) throws Exception {
        // Normalize and collect users from repository so we include real employees (e.g., Melissa)
        List<Usuario> allRepoUsers = usuarioRepository.findAll();
        if (allRepoUsers == null || allRepoUsers.isEmpty()) return List.of();

        YearMonth ym = YearMonth.parse(month);
        int days = ym.lengthOfMonth();

            // derive coverage requirements from business rules
            // Per day (diurno): 2 médicos, 3 enfermeros (JEF mapped), 8 auxiliares, 2 terapeutas
            Map<String, Integer> coverageDay = new HashMap<>();
            coverageDay.put("MED", 2);
            coverageDay.put("JEF", 3);
            coverageDay.put("AUX", 8);
            coverageDay.put("TER", 2);

            // Per night (nocturno): 1 médico, 2 enfermeros, 8 auxiliares, 2 terapeutas
            Map<String, Integer> coverageNight = new HashMap<>();
            coverageNight.put("MED", 1);
            coverageNight.put("JEF", 2);
            coverageNight.put("AUX", 8);
            coverageNight.put("TER", 2);

        // Map repository users into role codes (MED, JEF, AUX, TER) using role name or id heuristics
        Map<String, List<Usuario>> byCode = new HashMap<>();
        for (Usuario u : allRepoUsers) {
            String code = "AUX"; // default
            if (u.getRol() != null) {
                String idr = u.getRol().getIdRol() != null ? u.getRol().getIdRol().toLowerCase() : "";
                String rname = u.getRol().getRol() != null ? u.getRol().getRol().toLowerCase() : "";
                if (idr.contains("med") || rname.contains("med")) code = "MED";
                else if (idr.contains("jef") || rname.contains("jef") || rname.contains("jefe")) code = "JEF";
                else if (idr.contains("aux") || rname.contains("aux")) code = "AUX";
                else if (idr.contains("ter") || rname.contains("terap") || rname.contains("ter") ) code = "TER";
                else if (rname.contains("enfer") || idr.contains("enf")) {
                    // map enfermero/enfermera into JEF (enfermeras jefe) to match coverage keys
                    code = "JEF";
                }
            }
            byCode.computeIfAbsent(code, k -> new ArrayList<>()).add(u);
        }

        // Determine the target pool based on roleId parameter (accept code, id, or role name)
        String param = roleId == null ? "" : roleId.trim();
        String targetCode = null;
        if (!param.isEmpty()) {
            String p = param.toLowerCase();
            if (p.equals("med") || p.contains("medico") || p.contains("med")) targetCode = "MED";
            else if (p.equals("jef") || p.contains("jefe")) targetCode = "JEF";
            else if (p.equals("aux") || p.contains("auxiliar")) targetCode = "AUX";
            else if (p.equals("ter") || p.contains("terap")) targetCode = "TER";
            else if (p.contains("enf")) targetCode = "ENF";
        }

        // If roleId corresponds to an exact id_rol in the DB, prefer repository query for accuracy
        List<Usuario> targetUsers = new ArrayList<>();
        if (param != null && !param.isBlank()) {
            // Try exact idRol match using repository method
            try {
                List<Usuario> byExact = usuarioRepository.findAllByRol_IdRol(param);
                if (byExact != null && !byExact.isEmpty()) {
                    targetUsers.addAll(byExact);
                }
            } catch (Exception ex) {
                // ignore and fallback to heuristics
            }
        }

        if (targetUsers.isEmpty()) {
            if (targetCode != null) {
                targetUsers.addAll(byCode.getOrDefault(targetCode, List.of()));
            } else {
                // attempt match by idRol or role name containing param
                for (Usuario u : allRepoUsers) {
                    if (u.getRol() != null) {
                        String idr = u.getRol().getIdRol() != null ? u.getRol().getIdRol().toLowerCase() : "";
                        String rname = u.getRol().getRol() != null ? u.getRol().getRol().toLowerCase() : "";
                        if (idr.contains(param.toLowerCase()) || rname.contains(param.toLowerCase())) {
                            targetUsers.add(u);
                        }
                    }
                }
            }
        }

        if (targetUsers.isEmpty()) {
            // fallback: if no specific param, include all users
            targetUsers.addAll(allRepoUsers);
        }

        // Exclude administrador role users explicitly (idRol 'adm05' or rol contains 'admin')
        targetUsers.removeIf(u -> {
            if (u.getRol() == null) return false;
            String idr = u.getRol().getIdRol() == null ? "" : u.getRol().getIdRol().toLowerCase();
            String rname = u.getRol().getRol() == null ? "" : u.getRol().getRol().toLowerCase();
            return idr.equals("adm05") || rname.contains("admin");
        });

        // Create preview rows for all users in the target set
        List<Usuario> allUsers = new ArrayList<>(targetUsers);
        List<Map<String, Object>> rows = new ArrayList<>();
    Map<Long, Integer> nightStreak = new HashMap<>();
    Map<Long, Integer> assignedTurns = new HashMap<>();

    // track weekend rotation start index per role code
    Map<String, Integer> weekendIndex = new HashMap<>();

        for (Usuario u : allUsers) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", u.getIdUsuario());
            row.put("name", u.getPrimerNombre() + " " + (u.getPrimerApellido() == null ? "" : u.getPrimerApellido()));
            for (int d = 1; d <= days; d++) row.put("d" + d, "");
            rows.add(row);
            nightStreak.put(u.getIdUsuario(), 0);
            assignedTurns.put(u.getIdUsuario(), 0);
        }

        // build a set of target user ids (rows contain only users we should schedule)
        Set<Long> targetIds = new HashSet<>();
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid != null) targetIds.add(nid.longValue());
        }

        // Helper: select next available user from list respecting max turns and night streak
        class Selector {
            Usuario select(List<Usuario> pool, boolean night, int dayIndex, String roleCode, boolean isWeekend) {
                // sort pool by currently assigned turns (ascending) but prefer
                // candidates with larger existing consecutive free days (to avoid long free streaks)
                pool.sort((u1, u2) -> {
                    int a = assignedTurns.getOrDefault(u1.getIdUsuario(), 0);
                    int b = assignedTurns.getOrDefault(u2.getIdUsuario(), 0);
                    if (a != b) return Integer.compare(a, b);
                    // tie-breaker: prefer user with larger consecutive free days around dayIndex
                    int cf1 = consecutiveFreeDays(u1.getIdUsuario(), dayIndex, rows);
                    int cf2 = consecutiveFreeDays(u2.getIdUsuario(), dayIndex, rows);
                    return Integer.compare(cf2, cf1); // larger free days first
                });

                int start = weekendIndex.getOrDefault(roleCode, 0);
                int n = Math.max(1, pool.size());

                for (int i = 0; i < n; i++) {
                    Usuario cand = pool.get((start + i) % pool.size());
                    long id = cand.getIdUsuario();
                    if (assignedTurns.getOrDefault(id, 0) >= 16) continue; // limit 16 turnos
                    // Night selection: avoid 3 consecutive nights
                    if (night && nightStreak.getOrDefault(id, 0) >= 2) continue;

                    // Day selection: ensure previous day is not a night (no noche->día)
                    if (!night && dayIndex > 1) {
                        Object prev = rows.stream().filter(r -> ((Number) r.get("id")).longValue() == id).findFirst().map(r -> r.get("d" + (dayIndex - 1))).orElse(null);
                        String prevStr = prev == null ? "" : prev.toString().toLowerCase();
                        if (prevStr.contains("noche")) continue; // do not assign Día after Noche

                        // avoid creating 3 consecutive days: check previous two days
                        boolean prevDay1 = false, prevDay2 = false;
                        Object p1 = rows.stream().filter(r -> ((Number) r.get("id")).longValue() == id).findFirst().map(r -> r.get("d" + (dayIndex - 1))).orElse(null);
                        Object p2 = dayIndex > 2 ? rows.stream().filter(r -> ((Number) r.get("id")).longValue() == id).findFirst().map(r -> r.get("d" + (dayIndex - 2))).orElse(null) : null;
                        String p1s = p1 == null ? "" : p1.toString().toLowerCase();
                        String p2s = p2 == null ? "" : p2.toString().toLowerCase();
                        if (p1s.contains("día")) prevDay1 = true;
                        if (p2s.contains("día")) prevDay2 = true;
                        if (prevDay1 && prevDay2) continue; // would create 3 días seguidos
                    }

                    // Weekend rotation: advance start when used on weekends
                    if (isWeekend) weekendIndex.put(roleCode, (start + 1) % Math.max(1, pool.size()));
                    return cand;
                }
                return null;
            }

            // compute consecutive free days around dayIndex for candidate id
            private int consecutiveFreeDays(long userId, int dayIndex, List<Map<String, Object>> rowsRef) {
                Map<String, Object> row = rowsRef.stream().filter(r -> ((Number) r.get("id")).longValue() == userId).findFirst().orElse(null);
                if (row == null) return 0;
                int daysTotal = 0;
                // count backward free days
                int before = 0;
                for (int d = dayIndex - 1; d >= 1; d--) {
                    Object c = row.get("d" + d);
                    String s = c == null ? "" : c.toString().toLowerCase();
                    if (s.isBlank() || s.equals("libre")) before++; else break;
                }
                // count forward free days
                int after = 0;
                for (int d = dayIndex; d <= 31; d++) { // safe upper bound
                    Object c = row.get("d" + d);
                    if (c == null) { after++; continue; }
                    String s = c.toString().toLowerCase();
                    if (s.isBlank() || s.equals("libre")) after++; else break;
                }
                daysTotal = before + after;
                return daysTotal;
            }
        }

        Selector selector = new Selector();

        // For each day, assign required counts per role
        for (int d = 1; d <= days; d++) {
            // day shift
            for (Map.Entry<String, Integer> e : coverageDay.entrySet()) {
                String rname = e.getKey();
                int need = e.getValue();
                // only consider users that exist in the target rows
                List<Usuario> pool = byCode.getOrDefault(rname, List.of()).stream()
                        .filter(u -> targetIds.contains(u.getIdUsuario()))
                        .collect(Collectors.toList());
                for (int k = 0; k < need; k++) {
                    LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
                    boolean isWeekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
                    Usuario sel = selector.select(pool, false, d, rname, isWeekend);
                    if (sel == null) break;
                    long id = sel.getIdUsuario();
                    Map<String, Object> row = rows.stream().filter(r -> ((Number) r.get("id")).longValue() == id).findFirst().orElse(null);
                    if (row != null) row.put("d" + d, "Día (07-19)");
                    assignedTurns.put(id, assignedTurns.getOrDefault(id, 0) + 1);
                    nightStreak.put(id, 0);
                }
            }

            // night shift
            for (Map.Entry<String, Integer> e : coverageNight.entrySet()) {
                String rname = e.getKey();
                int need = e.getValue();
                // only consider users that exist in the target rows
                List<Usuario> pool = byCode.getOrDefault(rname, List.of()).stream()
                        .filter(u -> targetIds.contains(u.getIdUsuario()))
                        .collect(Collectors.toList());
                for (int k = 0; k < need; k++) {
                    LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
                    boolean isWeekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
                    Usuario sel = selector.select(pool, true, d, rname, isWeekend);
                    if (sel == null) break;
                    long id = sel.getIdUsuario();
                    Map<String, Object> row = rows.stream().filter(r -> ((Number) r.get("id")).longValue() == id).findFirst().orElse(null);
                    if (row != null) row.put("d" + d, "Noche (19-07)");
                    assignedTurns.put(id, assignedTurns.getOrDefault(id, 0) + 1);
                    nightStreak.put(id, nightStreak.getOrDefault(id, 0) + 1);
                }
            }
        }

        // Second pass: ensure daily minima are strictly attempted to be met.
        // Build quick lookup of rows by user id
        Map<Long, Map<Integer, String>> scheduleByUserDay = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null) continue;
            long id = nid.longValue();
            Map<Integer, String> daysMap = new HashMap<>();
            for (int d = 1; d <= days; d++) {
                Object cell = row.get("d" + d);
                daysMap.put(d, cell == null ? "" : cell.toString());
            }
            scheduleByUserDay.put(id, daysMap);
        }

        // For each day and each role, check if assigned < need and try to assign extra users
        for (int d = 1; d <= days; d++) {
            LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
            boolean isWeekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
            for (String roleCode : List.of("MED", "JEF", "AUX", "TER")) {
                int needDay = coverageDay.getOrDefault(roleCode, 0);
                int needNight = coverageNight.getOrDefault(roleCode, 0);

                // count currently assigned day
                int assignedDayCount = 0;
                int assignedNightCount = 0;
                for (Map<String, Object> row : rows) {
                    Number nid = (Number) row.get("id");
                    if (nid == null || nid.longValue() < 1) continue;
                    String cell = (String) row.get("d" + d);
                    if (cell != null && cell.toLowerCase().contains("día")) assignedDayCount++;
                    if (cell != null && cell.toLowerCase().contains("noche")) assignedNightCount++;
                }

        // only consider users that have schedule maps (present in target rows)
        List<Usuario> pool = byCode.getOrDefault(roleCode, List.of()).stream()
            .filter(u -> scheduleByUserDay.containsKey(u.getIdUsuario()))
            .collect(Collectors.toList());

                // fill day shortages
                while (assignedDayCount < needDay) {
                    Usuario candidate = null;
                    for (Usuario u : pool) {
                        long id = u.getIdUsuario();
                        if (assignedTurns.getOrDefault(id, 0) >= 16) continue;
                        String cell = scheduleByUserDay.getOrDefault(id, Map.of()).get(d);
                        if (cell == null || cell.isEmpty()) {
                            candidate = u; break;
                        }
                    }
                    if (candidate == null) break; // cannot fill more
                    long id = candidate.getIdUsuario();
                    Map<String, Object> row = rows.stream().filter(r -> { Number nid=(Number)r.get("id"); return nid!=null && nid.longValue()==id; }).findFirst().orElse(null);
                    if (row!=null) row.put("d"+d, "Día (07-19)");
                    assignedTurns.put(id, assignedTurns.getOrDefault(id, 0)+1);
                    nightStreak.put(id, 0);
                    scheduleByUserDay.get(id).put(d, "Día (07-19)");
                    assignedDayCount++;
                }

                // fill night shortages
                while (assignedNightCount < needNight) {
                    Usuario candidate = null;
                    for (Usuario u : pool) {
                        long id = u.getIdUsuario();
                        if (assignedTurns.getOrDefault(id, 0) >= 16) continue;
                        String cell = scheduleByUserDay.getOrDefault(id, Map.of()).get(d);
                        if (cell == null || cell.isEmpty()) {
                            // ensure we don't create 3rd consecutive night
                            if (nightStreak.getOrDefault(id,0) >= 2) continue;
                            candidate = u; break;
                        }
                    }
                    if (candidate == null) break;
                    long id = candidate.getIdUsuario();
                    Map<String, Object> row = rows.stream().filter(r -> { Number nid=(Number)r.get("id"); return nid!=null && nid.longValue()==id; }).findFirst().orElse(null);
                    if (row!=null) row.put("d"+d, "Noche (19-07)");
                    assignedTurns.put(id, assignedTurns.getOrDefault(id, 0)+1);
                    nightStreak.put(id, nightStreak.getOrDefault(id,0)+1);
                    scheduleByUserDay.get(id).put(d, "Noche (19-07)");
                    assignedNightCount++;
                }
            }
        }

        // After filling shortages, recalc per-user turns/hours
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid==null || nid.longValue()<1) continue;
            long id = nid.longValue();
            int turns = 0;
            for (int d=1; d<=days; d++) {
                Object cell = row.get("d"+d);
                if (cell!=null && !cell.toString().isBlank()) {
                    String s = cell.toString();
                    if (!s.toUpperCase().contains("APOYO")) turns += 1; // count full shifts
                }
            }
            assignedTurns.put(id, turns);
            row.put("turnos", turns);
            row.put("horas", turns * 12);
        }

    // Ensure every user reaches 192 hours by adding APOYO (support) assignments.
    // Prefer adding full 12h apoyo shifts on weekdays; if <12 remaining, append partial apoyo to an existing shift
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            long id = nid.longValue();

            // compute current hours: if 'horas' field exists use it, otherwise compute from assignedTurns
            int hours = 0;
            Object horasObj = row.get("horas");
            if (horasObj instanceof Number) hours = ((Number) horasObj).intValue();
            else hours = assignedTurns.getOrDefault(id, 0) * 12;

            int remaining = 192 - hours;

            // compute current apoyo hours already present in the row (sum numeric values in "Apoyo (...)h")
            int currentApoyoHours = 0;
            for (int d = 1; d <= days; d++) {
                Object cell = row.get("d" + d);
                if (cell == null) continue;
                String s = cell.toString().toLowerCase();
                if (s.contains("apoyo")) {
                    // extract digits (e.g., "apoyo (12h)" or "apoyo (6h)")
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)").matcher(s);
                    if (m.find()) {
                        try { currentApoyoHours += Integer.parseInt(m.group(1)); } catch (Exception ex) { }
                    } else {
                        // default assume 12h if unspecified
                        currentApoyoHours += 12;
                    }
                }
            }
            if (remaining <= 0) {
                // already satisfied
                row.put("horas", Math.max(0, hours));
                continue;
            }

            // Helper: use private method findDayForExtra(...) defined below

            // Add full 12h Apoyo shifts while possible (weekday-only; try to distribute across month)
            // Only allow up to 12h of apoyo per user
            while (remaining >= 12 && currentApoyoHours < 12) {
                int day = findBestWeekdayForApoyo(row, ym, days, rows);
                if (day == -1) break; // no available weekday
                // ensure we don't overwrite existing Día/Noche/Posturno
                Object exist = row.get("d" + day);
                String existStr = exist == null ? "" : exist.toString().toLowerCase();
                if (existStr.contains("día") || existStr.contains("noche") || existStr.contains("posturno")) break;
                int assignHours = Math.min(12 - currentApoyoHours, 12);
                row.put("d" + day, "Apoyo (" + assignHours + "h)");
                hours += assignHours;
                remaining -= assignHours;
                currentApoyoHours += assignHours;
            }

            // If some hours remain (<12), try to append to an existing shift first (prefer weekdays), else put on a free day
            if (remaining > 0 && currentApoyoHours < 12) {
                // Only place partial apoyo on free weekdays (do NOT append to existing Día/Noche/Posturno)
                int toAssign = Math.min(remaining, 12 - currentApoyoHours);
                boolean placed = false;
                for (int d = 1; d <= days && !placed; d++) {
                    LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
                    DayOfWeek dow = date.getDayOfWeek();
                    boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
                    if (isWeekend) continue; // prefer weekdays
                    Object cell = row.get("d" + d);
                    String cellStr = cell == null ? "" : cell.toString();
                    // only place on truly free cells (blank or LIBRE)
                    if (cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE")) {
                        row.put("d" + d, "Apoyo (" + toAssign + "h)");
                        hours += toAssign;
                        remaining -= toAssign;
                        currentApoyoHours += toAssign;
                        placed = true;
                        break;
                    }
                }
                // If couldn't place on weekdays, do not place parcial apoyo on weekends (policy)
            }

            // store updated hours
            row.put("horas", hours);

            // Recompute turnos by counting non-LIBRE/POSTURNO cells (Apoyo(12h) counts as full turno)
            int newTurns = 0;
            for (int d = 1; d <= days; d++) {
                Object cell = row.get("d" + d);
                String s = cell == null ? "" : cell.toString();
                if (s.isBlank()) continue;
                String up = s.toUpperCase();
                if (up.contains("LIBRE") || up.contains("POSTURNO")) continue;
                // count as a turno; if partial hour we still count as part of horas but not full turno
                if (up.contains("APOYO (12H)" ) || !up.contains("APOYO")) {
                    // APOYO(12h) or regular shift -> count as full turno
                    newTurns++;
                } else if (up.contains("APOYO") ) {
                    // partial apoyo doesn't increment full turno count
                }
            }
            row.put("turnos", newTurns);
        }

    // NOTE: horas/turnos are updated above after applying APOYO assignments; do not overwrite here.

        // Post-processing: set empty cells to LIBRE or POSTURNO (if previous day was a night shift for that user)
        for (Map<String, Object> row : rows) {
            Number nid = (Number) row.get("id");
            if (nid == null || nid.longValue() < 1) continue;
            for (int d = 1; d <= days; d++) {
                String key = "d" + d;
                Object cell = row.get(key);
                if (cell == null || cell.toString().isBlank()) {
                    // look at previous day
                    if (d > 1) {
                        Object prev = row.get("d" + (d - 1));
                        if (prev != null && prev.toString().toLowerCase().contains("noche")) {
                            row.put(key, "POSTURNO");
                            continue;
                        }
                    }
                    row.put(key, "LIBRE");
                }
            }
        }

        // (helper moved to class scope)

        // Build summary row with pool sizes and shortages
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", -1);
        summary.put("name", "SUMMARY");
        for (String code : List.of("MED", "JEF", "AUX", "TER")) {
            int pool = byCode.getOrDefault(code, List.of()).size();
            int needDay = coverageDay.getOrDefault(code, 0);
            int needNight = coverageNight.getOrDefault(code, 0);
            summary.put(code + "_pool", pool);
            summary.put(code + "_needDay", needDay);
            summary.put(code + "_needNight", needNight);
            boolean shortage = pool < Math.max(needDay, needNight);
            summary.put(code + "_shortage", shortage);
        }
        // compute simple equity statistics per role: min/max/avg/stddev of assigned turns
        Map<String, Object> equity = new LinkedHashMap<>();
        for (String code : List.of("MED", "JEF", "AUX", "TER")) {
            List<Usuario> pool = byCode.getOrDefault(code, List.of());
            List<Integer> vals = new ArrayList<>();
            for (Usuario u : pool) vals.add(assignedTurns.getOrDefault(u.getIdUsuario(), 0));
            if (vals.isEmpty()) {
                equity.put(code + "_min", 0);
                equity.put(code + "_max", 0);
                equity.put(code + "_avg", 0);
                equity.put(code + "_std", 0);
            } else {
                int min = vals.stream().mapToInt(Integer::intValue).min().orElse(0);
                int max = vals.stream().mapToInt(Integer::intValue).max().orElse(0);
                double avg = vals.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                double variance = vals.stream().mapToDouble(i -> (i - avg) * (i - avg)).sum() / vals.size();
                equity.put(code + "_min", min);
                equity.put(code + "_max", max);
                equity.put(code + "_avg", Math.round(avg * 100.0) / 100.0);
                equity.put(code + "_std", Math.round(Math.sqrt(variance) * 100.0) / 100.0);
            }
        }

        rows.add(0, summary);
        // Add warnings if any shortages per day/night found
        List<String> warnings = new ArrayList<>();
        for (String code : List.of("MED", "JEF", "AUX", "TER")) {
            int pool = byCode.getOrDefault(code, List.of()).size();
            int need = Math.max(coverageDay.getOrDefault(code, 0), coverageNight.getOrDefault(code, 0));
            if (pool < need) warnings.add("Shortage for role " + code + ": pool=" + pool + " need=" + need);
        }
        if (!warnings.isEmpty()) {
            Map<String, Object> warnRow = new LinkedHashMap<>();
            warnRow.put("id", -3);
            warnRow.put("name", "WARNINGS");
            warnRow.put("warnings", warnings);
            rows.add(0, warnRow);
        }
        // attach equity as a metadata map at the front (not a row) by adding a map with id=-2
        Map<String, Object> equityRow = new LinkedHashMap<>();
        equityRow.put("id", -2);
        equityRow.put("name", "EQUITY_STATS");
        equityRow.putAll(equity);
        rows.add(0, equityRow);

        return rows;
    }

    // helper: find a day index where an extra/full 12h can be placed for the given user row
    private int findDayForExtra(Map<String, Object> row, YearMonth ym, int days, boolean requireFree) {
        // First try weekdays
        for (int d = 1; d <= days; d++) {
            LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
            if (isWeekend) continue;
            Object cell = row.get("d" + d);
            String cellStr = cell == null ? "" : cell.toString();
            if (requireFree) {
                if (cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE")) return d;
            } else {
                if (cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE") || cellStr.toUpperCase().contains("POSTURNO")) return d;
            }
        }
        // Then try weekends
        for (int d = 1; d <= days; d++) {
            LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
            if (!isWeekend) continue;
            Object cell = row.get("d" + d);
            String cellStr = cell == null ? "" : cell.toString();
            if (requireFree) {
                if (cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE")) return d;
            } else {
                if (cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE") || cellStr.toUpperCase().contains("POSTURNO")) return d;
            }
        }
        return -1;
    }

    private int findBestWeekdayForApoyo(Map<String, Object> row, YearMonth ym, int days, List<Map<String, Object>> rows) {
        // collect days already used by this user for Apoyo
        List<Integer> myApoyoDays = new ArrayList<>();
        for (int d = 1; d <= days; d++) {
            Object cell = row.get("d" + d);
            if (cell != null && cell.toString().toLowerCase().contains("apoyo")) myApoyoDays.add(d);
        }

        // helper to check if any other row has Apoyo on day d
        java.util.function.Predicate<Integer> dayHasApoyo = (d) -> {
            for (Map<String, Object> r : rows) {
                Object c = r.get("d" + d);
                if (c != null && c.toString().toLowerCase().contains("apoyo")) return true;
            }
            return false;
        };

        int bestDay = -1;
        int bestScore = -1; // larger is better (distance to nearest myApoyoDays)

        for (int d = 1; d <= days; d++) {
            LocalDate date = LocalDate.of(ym.getYear(), ym.getMonthValue(), d);
            DayOfWeek dow = date.getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) continue; // skip weekends

            // skip if other rows already have Apoyo that day
            if (dayHasApoyo.test(d)) continue;

            Object cell = row.get("d" + d);
            String cellStr = cell == null ? "" : cell.toString();
            // prefer empty/LIBRE cells (do NOT use POSTURNO)
            if (!(cellStr.isBlank() || cellStr.equalsIgnoreCase("LIBRE"))) continue;

            // compute distance score: min distance to existing myApoyoDays (if none, prefer central days)
            int score;
            if (myApoyoDays.isEmpty()) {
                score = days/2 - Math.abs(d - (days/2));
            } else {
                int minDist = Integer.MAX_VALUE;
                for (int ad : myApoyoDays) minDist = Math.min(minDist, Math.abs(d - ad));
                score = minDist;
            }

            if (score > bestScore) {
                bestScore = score;
                bestDay = d;
            }
        }

        return bestDay;
    }

}
