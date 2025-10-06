package com.sgturnos.malla;

import java.io.File;
import java.util.List;

public interface MallaService {
    File saveMalla(byte[] content, String filename) throws Exception;
    List<File> listMallas();
}
