package com.example.demo.dto.request.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SelectedCartItemRequest {

    @NotNull(message = "Cart item ID cannot be null")
    private Long cartItemId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity; 
}
