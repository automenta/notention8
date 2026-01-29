# Notention Phase 5: The Sovereign Thought Computer
> **Philosophy**: "Notes" are just data. **Thoughts** are the atomic units of reality. Notention is not a note-taking app; it is a **Sovereign Thought Computer**.

## The Core Shift

We are moving beyond "productivity" into **Sovereignty**. The goal is not just to do more work, but to align our digital environment with our mental model, minimizing friction between *intent* and *effect*.

1.  **Notes -> Thoughts**: A "Note" is a passive record. A "Thought" is an active object that can be remembered, shared, or executed.
2.  **Users -> Pilots**: The system never acts without permission. Automation is an exoskeleton, not a replacement. Manual mode is the "Gold Standard" of operation; automation is just a specific type of high-leverage manual action.
3.  **Apps -> Skills**: We don't need more apps. We need **Skills** that our Thought Computer can execute to interact with the world for us.

---

## Strategic Pillars

### 1. The Pilot's Cockpit (Ergonomics First)
**Principle**: *The system must be faster and better than a blank sheet of paper, even without AI.*

Automation is useless if the manual experience is clunky. We must perfect the **Manual Mode**.
-   **Thought Ergonomics**: Typing matches the speed of thinking. Autocomplete, fast-entry, and instant retrieval.
-   **No Magic, Just Mechanics**: "Self-Demonstration" isn't magic; it's the system showing you how it works so you can trust it.
-   **The "Opt-In" Co-Pilot**: AI features (VoltAgent) are off by default. You summon them like a genie. They never interrupt.

**Implementation Details**:
-   **Component**: `HybridEditor` with Monaco/CodeMirror hybrid for structured text.
-   **Data**: `ThoughtNode` interface extends `Note` with `status: 'active' | 'archived'`, `urgency: 0-1`, and `context`.
-   **UX**: "Command Palette" style entry for everything (`Ctrl+K` -> "New Thought").

### 2. Ontological Resonance (Alignment)
**Principle**: *If we speak the same language, we can coordinate without friction.*

The "Ontology" is not just a schema; it's a **Shared Language of Thought**.
-   **Self-Evolving Semantics**: The system learns *your* vocabulary. If you say "Grok", it learns what that means.
-   **Network Resonance**: When two users share an ontology, they can "match" thoughts instantly (e.g., "I need a job" <-> "I need a dev") without a middleman.
-   **Scalable Wisdom**: As the community refines ontologies, the "Global Brain" gets smarter, but *you* decide which parts to download.

**Implementation Details**:
-   **Engine**: `OntologyLearner` (Agent) watches user typing patterns to suggest schema updates.
-   **Storage**: IPFS/Nostr for sharing Ontology fragments (lexicons).
-   **Protocol**: `NIP-99` (simulated) for semantic intent matching.

## The Flywheel: Solving the Naked Page

**Problem**: The hardest part of thinking is starting.
**Solution**: The system provides **Ignition**.

### 3. Ignition (The Cold Start)
**Principle**: *The system should offer a handle to grab onto when the mind is slippery.*

-   **The Daily Compass**: Upon opening, show a "Summary of Yesterday" + "Focus for Today".
-   **Contextual Nudges**: "You left off on [Project X]. Want to resume?"
-   **Serendipity**: "Remember this thought from 2 years ago?" (Spaced Repetition).
-   **Socratic Mode**: User types "I'm stuck". Agent asks: "What is the specific blocker?" (Therapist/Coach mode).

**Implementation Details**:
-   **View**: `IgnitionDashboard.tsx` replaces the blank list on startup.
-   **Agent**: `FlywheelAgent` runs locally, analyzing `last_active` and `orphaned_thoughts`.
-   **Logic**: `ContextAwarenessEngine` scores "Relevance" of old notes based on current time/location/open tabs.

---

### 4. Thought Execution (VoltAgent)
**Principle**: *A Thought sufficient to specify an action is an action.*

If you can write it down clearly enough, the machine should be able to do it—but only when you say "Engage".
-   **Thoughts as Programs**: A Note like `[Task: Buy Milk]` is a valid program.
-   **The "Ghost" User**: The Agent doesn't use a hidden API. It uses *your* browser, *your* mouse, *your* keyboard. It is a "Ghost" in your machine, doing exactly what you would do, but faster.
-   **Transparent Operations**: You see every click. You can pause, rewind, or take over at any time.

**Implementation Details**:
-   **Bridge**: WebSocket connection from `VoltAgent` (Backend) to `AgentCursor` (Frontend).
-   **Visuals**: `AgentOverlay` component draws SVG paths for mouse movements.
-   **Safety**: "Dead Man's Switch" - pressing any key pauses the Agent.

---

## The Master Plan

## The Master Plan (Technical Execution)

### Phase 5.1: The Sovereign Kernel (Manual Perfection)
*Goal: The best "Thought Processor" on earth, even offline.*
1.  **Refined Editor**:
    *   [ ] Implement `HybridEditor` with inline property rendering.
    *   [ ] Add `PropertyAutocomplete` based on local Ontology.
2.  **Ignition Dashboard**:
    *   [ ] Create `FlywheelAgent` (local logic only, no LLM needed initially).
    *   [ ] Build `IgnitionView` (React) to display cues/nudges.
3.  **Visualization ("Ghost Mode")**:
    *   [ ] Connect `AgentService` to `AgentCursor` via WebSocket.
    *   [ ] Create `TutorialSkill` that purely demonstrates UI features without side effects.

### Phase 5.2: The Opt-In Exocortex (Automation)
*Goal: Breaking the barrier between Thought and Action.*
1.  **The Bridge**:
    *   [ ] Enhance `VoltAgentProvider` to broadcast `action_start`, `action_end`, `cursor_move` events.
    *   [ ] Implement "Dead Man's Switch" (User input > Agent input).
2.  **Self-Evolution**:
    *   [ ] Implement `SelfEvolveSkill` allowing Agent to toggle Settings.
    *   [ ] Add `PermissionGate` UI component: "Agent wants to enable AI. Allow? [Y/N]".
3.  **Action**:
    *   [ ] Implement `BrowserSkill` with "Projector" mode (runs in user's visible browser via extension or CDP, or streams headless view).

### Phase 5.3: The Resonant Web (Network)
*Goal: A social network of pure intent.*
-   **Intent Broadcasting**: "I am looking for X".
-   **Semantic Matching**: The network finds "I have X".
-   **Sovereign Data**: Your data never leaves your device until a handshake is made.

---

## Implications: The Ultimate Conclusion

If successful, Notention becomes a **Universal Interface**.
-   **The End of "Apps"**: Why open Uber, DoorDash, and Expedia? Just write a Thought: `[Trip: NYC] [Ride: Uber] [Food: Pizza]`. The system handles the implementation details.
-   **The Exocortex**: It manages your memory, your calendar, your relationships, and your work. It is the digital extension of your biological brain.
-   **Life Improvement**: By offloading the "implementation details" of life to the machine, humans are free to focus on the *content* and *direction* of their lives.

> "The computer is a bicycle for the mind." - Steve Jobs
> "Notention is a self-driving car for the mind." - TODO5.md
