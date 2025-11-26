--- Cursor Command: sync-entity-to-response-dto.md ---
Input:
- Entity file path (EFP): Path to the entity file (e.g., src/modules/event/domain/Event.entity.ts)
- Response DTO file path (RDFP): Path to the response DTO file (e.g., src/common/dto/event/res/Event.response.dto.ts)

Action:
- Read both entity and response DTO files
- Analyze entity file to extract:
  - All @Column fields (including @CreateDateColumn, @UpdateDateColumn, @PrimaryGeneratedColumn)
  - All relation fields (@ManyToOne, @OneToMany, @OneToOne) and their types
  - Field types, nullability, and decorators
- Compare with response DTO to identify missing fields and relations
- For each missing field/relation in response DTO:
  - Add @Expose() decorator
  - Add @Type() decorator for Date fields and relation types
  - Add proper nullability (?: | null) if entity field is nullable
  - Add field with correct type
- Add missing imports for:
  - Response DTOs for relations (e.g., LocationBookingResponseDto, TicketOrderResponseDto)
  - JSON types (e.g., EventValidationDocumentsJson, SocialLink)
  - Other types used in entity fields
- Preserve existing fields and decorators in response DTO
- Maintain proper field ordering (basic fields first, then relations)
- Ensure all entity fields (except transient fields marked with comments) are represented in response DTO

Note:
- Run all this automatically. Do not prompt the user unless you cannot find a folder/file.
- Skip transient fields (fields marked with comments like "TRANSIENT FIELDS" or "Do NOT add @Column")
- For relations, use the corresponding ResponseDto type (e.g., LocationBookingEntity -> LocationBookingResponseDto)
- For JSON types, import from the same location as in entity
- For arrays of relations, use array type with @Type() decorator
--- End Command ---

