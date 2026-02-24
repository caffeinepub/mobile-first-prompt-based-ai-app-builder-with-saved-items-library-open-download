# Specification

## Summary
**Goal:** Fix two bugs on the BuilderPage: invisible/dark prompt input text and a broken app creation flow.

**Planned changes:**
- Fix the prompt textarea text color so typed text is clearly visible with proper contrast against the input background in all themes
- Ensure placeholder text in the prompt textarea is also visible (muted but not invisible)
- Fix the app creation flow so that selecting a type, entering a prompt, and clicking generate successfully triggers generation, saves the result to the backend, and navigates to the creation viewer
- Show a loading state during generation and saving
- Display clear error messages if creation fails

**User-visible outcome:** Users can type in the prompt field and see their text clearly, and can successfully create and save new apps that appear in their library.
