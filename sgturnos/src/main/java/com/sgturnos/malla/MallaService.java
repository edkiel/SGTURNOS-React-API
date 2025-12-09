package com.sgturnos.malla;

import java.io.File;
import java.util.List;

public interface MallaService {
    File saveMalla(byte[] content, String filename) throws Exception;
    List<File> listMallas();
    void savePublishedInfo(String roleId, String month, String filename, java.util.List<java.util.Map<String, Object>> preview) throws Exception;
    java.util.Map<String, Object> getPublishedInfo(String roleId, String month) throws Exception;
}
