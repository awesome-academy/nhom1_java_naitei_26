package com.example.demo.dto.response.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {

    private Long id;
    private Long productId;
    private Long userId;
    private String userName;
    private Short score;
    private String comment;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
