# Архив задачи: Mobile Landscape Guard & Viewport Fix

## Summary
Задача заключалась в исправлении проблем с отображением игры в landscape-ориентации на мобильных устройствах. После неудачных попыток масштабирования ("fit-to-viewport"), которые приводили к регрессиям, было принято решение **заблокировать landscape-режим заглушкой** и стабилизировать viewport.

## Requirements
- Исправить "хаос" (наезды элементов) в landscape на мобилках.
- Сохранить стабильную работу в portrait.
- Устранить необходимость ручного зума (проблема "мелкого" интерфейса при возврате в portrait).

## Implementation
1. **Landscape Guard:**
   - Добавлен компонент-заглушка в `BalatroInferno.jsx`.
   - Появляется только при выполнении условий: `(orientation: landscape) and (hover: none) and (pointer: coarse) and (max-width: 980px) and (max-height: 520px)`.
   - Текст: "LANDSCAPE DETECTED / PLEASE ROTATE DEVICE".
   - Блокирует взаимодействие с игрой.

2. **Viewport Stabilization:**
   - Обновлен `meta viewport` в `index.html`: добавлено `maximum-scale=1.0, user-scalable=no`.
   - Это предотвращает нежелательный зум в Safari при смене ориентации и фиксирует масштаб интерфейса 1:1.

3. **Cleanup:**
   - Полностью удален код неудачной попытки "landscape scale" (transform), который вызывал баги.

## Testing
- **Portrait (Mobile):** Работает корректно, масштаб 1:1, без зума.
- **Landscape (Mobile):** Показывается заглушка, игра блокирована.
- **Desktop:** Изменения не затронули (заглушка не показывается благодаря проверке `coarse pointer` и размеров).
- **Сборка/Тесты:** `npm run build` и `npm test` проходят успешно.

## Lessons Learned
- **Mobile Safari Viewport:** Крайне капризен. `user-scalable=no` критически важен для веб-игр, чтобы избежать "плавающего" масштаба.
- **Adaptation Strategy:** Для сложных UI, завязанных на вертикаль, проще и надежнее запретить landscape, чем пытаться впихнуть невпихуемое через CSS-хаки (transform scale), рискуя сломать основной режим.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-mobile-landscape-guard.md`


