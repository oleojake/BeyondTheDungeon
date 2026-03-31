# I18N pending work

## UI text completed ✅

- ✅ frontend/src/scenes/profile-settings.scene.tsx
- ✅ frontend/src/scenes/profile.scene.tsx
- ✅ frontend/src/scenes/mis-fichas.scene.tsx
- ✅ frontend/src/scenes/mis-mapas.scene.tsx

## UI text pending

- frontend/src/scenes/mis-campanas.scene.tsx (requires extensive translation keys)
- frontend/src/scenes/mi-ficha.scene.tsx (requires extensive translation keys for character sheet)
- frontend/src/scenes/inventario.scene.tsx (requires inventory-specific translation keys)
- frontend/src/scenes/editar-campana.scene.tsx (requires campaign editor translation keys)

## Translation keys added ✅

All translation keys have been added to:

- `frontend/src/locales/en/translation.json`
- `frontend/src/locales/es/translation.json`

For the following scenes:

- scenes.campaigns (comprehensive keys for campaigns management)
- scenes.characterSheet (comprehensive keys for character sheet editor)
- scenes.characterSheets (keys for character sheets list)
- scenes.maps (keys for battle maps list)
- scenes.profileSettings (keys for settings page)
- scenes.profile (keys for profile page)
- scenes.inventory (basic keys)
- scenes.dice (basic keys)

## Remaining work

### Files needing useTranslation implementation:

1. **mis-campanas.scene.tsx** (~800 lines)
   - Add `import { useTranslation } from "react-i18next"`
   - Replace all hardcoded Spanish text with `t()` calls
   - Update alerts, confirms, and error messages

2. **mi-ficha.scene.tsx** (~780 lines)
   - Add `import { useTranslation } from "react-i18next"`
   - Replace all character sheet labels and placeholders
   - Update validation messages and success notifications

3. **inventario.scene.tsx** (~73KB)
   - Most complex file with inventory management logic
   - Add `import { useTranslation } from "react-i18next"`
   - Replace UI text while preserving inventory logic
   - May need additional translation keys for inventory-specific features

4. **editar-campana.scene.tsx** (~49KB)
   - Campaign editor with rich text functionality
   - Add `import { useTranslation } from "react-i18next"`
   - Replace all campaign management UI text
   - Update chapter/scene management text

## Compendium data pending

- Populate translations for compendium item/monster/spell names and descriptions by ID (frontend i18n mapping).
- This would be done via backend data seeding or frontend ID-to-name mapping files.

## Notes

- All translation infrastructure is in place
- useTranslation hook is properly configured
- Language toggle component exists
- Completed files successfully use i18next
- Remaining files follow the same pattern established in completed files
