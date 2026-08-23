package com.example.demo.dto.request;

import com.example.demo.enums.product.SuggestionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionStatusUpdateRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private SuggestionStatus status;

    private String adminNote;
}
