package com.example.warehouse.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class BarcodeService {

    public byte[] generateBarcode(String text) {

        try {
            BitMatrix matrix = new MultiFormatWriter()
                    .encode(text, BarcodeFormat.CODE_128, 300, 100);

            ByteArrayOutputStream out = new ByteArrayOutputStream();

            MatrixToImageWriter.writeToStream(matrix, "png", out);

            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating barcode", e);
        }
    }
}