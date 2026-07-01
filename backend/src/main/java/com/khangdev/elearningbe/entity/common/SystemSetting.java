package com.khangdev.elearningbe.entity.common;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "system_settings", indexes = {
        @Index(name = "idx_setting_key", columnList = "setting_key")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "setting_key", unique = true, nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "value_type", length = 20)
    private String valueType; // STRING, INTEGER, BOOLEAN, JSON

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;
}
