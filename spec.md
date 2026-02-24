# Specification

## Summary
**Goal:** Improve game prompt fidelity so “Game” creations reliably match the user’s intended game kind (e.g., “space shooter” generates a shooter-style game).

**Planned changes:**
- Refine prompt intent detection for Game creation so shooter-related keywords (shoot/shooter/fire/gun) take precedence over broader space-themed terms, including in mixed-language prompts that contain key English intent terms.
- Update the Game generation UI to show the detected game kind from the current prompt (e.g., “Detected: Shooter”).
- Add a manual game-kind override control (runner/shooter/catch/puzzle/space) that, when selected, forces generation to use the chosen kind; otherwise default to automatic detection.

**User-visible outcome:** When generating a 2D game, users see which game kind was detected from their prompt and can manually override it so prompts like “space shooter” reliably produce a shooter gameplay preview.
