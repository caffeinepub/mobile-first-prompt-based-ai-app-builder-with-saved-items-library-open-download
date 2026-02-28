# Specification

## Summary
**Goal:** Fix the chatbot runtime so that created chatbots correctly respond to user messages both in-app and in exported HTML.

**Planned changes:**
- Fix the `ChatbotRuntime` component to process user messages and generate bot responses, including a typing indicator delay before each reply
- Ensure a fallback response is shown when no keyword trigger matches
- Auto-scroll the message thread to the latest message after each exchange
- Audit and fix `ChatbotData` generation in `templates.ts` to always include at least one keyword–response pair and a non-empty fallback response string
- Audit and fix the chatbot HTML export in `exportCreationHtml.ts` so exported chatbot pages also respond correctly to user input

**User-visible outcome:** Users can open any created chatbot, type a message, and receive a bot reply every time — with a brief typing indicator — both inside the app and in exported HTML files.
