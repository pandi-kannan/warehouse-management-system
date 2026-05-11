package com.example.warehouse.service;

import com.example.warehouse.entity.Bin;
import com.example.warehouse.repository.BinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BinService {

    private final BinRepository binRepository;

    public Bin addBin(Bin bin) {
        return binRepository.save(bin);
    }

    public List<Bin> getAllBins() {
        return binRepository.findAll();
    }
}