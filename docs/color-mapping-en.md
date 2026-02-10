# Color Mapping Table

## Statistics
- **Total Hardcoded Colors**: 3579 occurrences
- **Analysis Date**: 2025-12-30
- **Target**: Replace 90%+ of hardcoded colors

## High Priority Replacements (Top 30 - Covers ~70% usage)

| Hardcoded Color | Count | Mapped Variable | Description |
|----------------|-------|-----------------|-------------|
| `#ffffff` / `#fff` | 216 + 125 = 341 | `#fff` (keep) | White - too fundamental, keep hardcoded |
| `#333` | 139 | `@color-text-primary` (#1e293b) | Primary text (similar) |
| `#6b7280` | 138 | `@color-gray-500` / `@color-text-muted` | Gray text |
| `#374151` | 134 | `@color-gray-700` | Dark gray |
| `#1e293b` | 117 | `@color-text-primary` | Primary text |
| `#e5e7eb` | 113 | `@color-gray-200` / `@color-border` | Border color |
| `#56b26a` | 112 | `@color-accent` | **Theme green** (exact match) |
| `#1f2937` | 79 | `@color-gray-800` / `@color-primary` | Primary color |
| `#ddd` | 72 | `@color-gray-300` (#d1d5db) | Light gray border (similar) |
| `#666` | 71 | `@color-gray-500` (#6b7280) | Medium gray text (similar) |
| `#e2e8f0` | 65 | `@color-border-light` | Light border (needs new variable) |
| `#9ca3af` | 65 | `@color-gray-400` | Gray |
| `#d1d5db` | 60 | `@color-gray-300` | Gray border |
| `#64748b` | 59 | `@color-text-secondary` | Secondary text |
| `#f9fafb` | 49 | `@color-gray-50` | Lightest background |
| `#f3f4f6` | 48 | `@color-gray-100` | Light background |
| `#0080ff` | 45 | (keep) | Blue link - needs confirmation |
| `#e0e0e0` | 40 | `@color-gray-300` (#d1d5db) | Gray (similar) |
| `#f8fafc` | 38 | `@color-gray-50` (#f9fafb) | Lightest background (similar) |
| `#000000` / `#000` | 38 | `#000` (keep) | Black - keep |
| `#eee` | 37 | `@color-gray-200` (#e5e7eb) | Light gray background (similar) |
| `#f1f5f9` | 36 | `@color-border-light` | Light border |
| `#f8f9fa` | 35 | `@color-gray-50` | Lightest background (similar) |
| `#3b82f6` | 35 | (keep) | Blue - needs confirmation |
| `#f5f5f5` | 34 | `@color-gray-100` | Light background (similar) |
| `#0066cc` | 34 | (keep) | Blue - needs confirmation |
| `#ccc` | 32 | `@color-gray-300` | Gray |
| `#f1f1f1` | 30 | `@color-gray-100` | Light background (similar) |
| `#4caf50` | 28 | (keep) | Green - Material Design, likely 3rd party |

## Variables to Add

Based on high-frequency colors missing corresponding variables:

```less
// Additional border colors
@color-border-lighter: #f1f5f9;

// Link colors (if needed for consistency)
@color-link: #0080ff;
@color-link-hover: #0066cc;

// Blue palette (if needed)
@color-blue-500: #3b82f6;
```

## Exact Mapping Rules

### Theme Color (Exact Match)
- `#56B26A` → `@color-accent` ✅ Exact match

### Gray Scale (Exact Matches)
- `#f9fafb` → `@color-gray-50` ✅
- `#f3f4f6` → `@color-gray-100` ✅
- `#e5e7eb` → `@color-gray-200` ✅
- `#d1d5db` → `@color-gray-300` ✅
- `#9ca3af` → `@color-gray-400` ✅
- `#6b7280` → `@color-gray-500` ✅
- `#4b5563` → `@color-gray-600` ✅
- `#374151` → `@color-gray-700` ✅
- `#1f2937` → `@color-gray-800` ✅
- `#111827` → `@color-gray-900` ✅

### Text Colors (Exact Matches)
- `#1e293b` → `@color-text-primary` ✅
- `#64748b` → `@color-text-secondary` ✅
- `#6b7280` → `@color-text-muted` ✅

### Similar Mappings (Needs Visual Verification)
- `#333` → `@color-text-primary` (#1e293b) ⚠️ Needs verification
- `#666` → `@color-gray-500` (#6b7280) ⚠️ Needs verification
- `#ddd` → `@color-gray-300` (#d1d5db) ⚠️ Needs verification
- `#eee` → `@color-gray-200` (#e5e7eb) ⚠️ Needs verification
- `#ccc` → `@color-gray-300` (#d1d5db) ⚠️ Needs verification

### Keep As-Is (Do Not Replace)
- `#fff` / `#ffffff` - White, too fundamental
- `#000` / `#000000` - Black, too fundamental
- `#4caf50` - Material Design green, likely used for 3rd party components

## RGB/RGBA Colors

RGBA colors to handle separately (mainly used for shadows and transparency):

```less
// Shadow rgba (keep as-is)
rgba(0, 0, 0, 0.05)
rgba(0, 0, 0, 0.1)
rgba(0, 0, 0, 0.15)

// Semi-transparent backgrounds (may need new variables)
rgba(255, 255, 255, 0.9)
rgba(0, 0, 0, 0.5)
```

## Replacement Strategy

### Phase 1: Exact Match Replacements (High Confidence)
1. `#56b26a` → `@color-accent` (112 occurrences)
2. Gray scale exact matches (~600 occurrences)
3. Text color exact matches (~300 occurrences)

**Phase 1 Estimated**: ~1000 occurrences

### Phase 2: Similar Replacements (Needs Verification)
1. `#333` → `@color-text-primary` (139 occurrences)
2. `#666` → `@color-gray-500` (71 occurrences)
3. Other similar grays (~200 occurrences)

**Phase 2 Estimated**: ~400 occurrences

### Phase 3: Replace After Adding Variables
1. Add `@color-border-lighter`
2. Add `@color-link` series
3. Replace blue link colors

**Phase 3 Estimated**: ~200 occurrences

## Expected Replacement Progress

- **Total**: 3579 occurrences
- **Replaceable**: ~1600 occurrences (~45%)
- **Keep**: ~1979 occurrences (~55%, including white, black, rgba, special colors)

**Note**: Actual replacement may uncover more optimization opportunities, final replacement rate may reach 60-70%.

## Next Steps

1. ✅ Create color mapping table
2. ⏭️ Write automated replacement script
3. ⏭️ Replace high-confidence exact matches first
4. ⏭️ Visual verification for similar matches
5. ⏭️ Add missing variables
6. ⏭️ Complete visual regression testing

## Replacement Script Requirements

The script should:
- Support dry-run mode (preview without changing files)
- Auto-backup before replacement
- Handle hex, rgb, rgba color formats
- Preserve comments and whitespace
- Support file-by-file or batch processing
- Generate replacement report

## Testing Checklist

After each replacement batch:
- [ ] Run `pnpm run build` - no errors
- [ ] Visual comparison (screenshots before/after)
- [ ] Check key pages: Home, Chat, Settings, Prediction Tool
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Verify theme color consistency
- [ ] Browser compatibility (Chrome, Safari, Firefox)

## Rollback Plan

```bash
# If issues found, rollback:
rm -rf src
cp -r src_backup_YYYYMMDD_HHMMSS src
# Or using git:
git checkout -- src/
```

## Risk Assessment

### High Risk
- Batch replacement may introduce visual regressions
- Mitigation: Replace in batches, visual regression testing after each batch

### Medium Risk
- Similar color replacements may affect UI appearance
- Mitigation: Careful visual verification, adjust mapping as needed

### Low Risk
- Exact matches are safe to replace
- New features (variables) don't affect existing logic
