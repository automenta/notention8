# Notention Master Roadmap: The Path to Elegance & Ubiquity
> **Vision:** A Universal Action Agent where "Thinking" (Notes) seamlessly becomes "Doing" (Agents).

## Philosophy: "Utility through Ergonomics"
We have the backend (`VoltAgent`). The next challenge is **Interface**. The system must feel like an extension of the user's mind—anticipating intent, suggesting actions, and executing silently but visibly.

---

## Phase 1: Ergonomic Mastery (The Hybrid Interface)
**Goal:** Making the "Semantic Note" concept intuitive and powerful for non-engineers.

### 1.1 The Hybrid Semantic Editor
Moves beyond simple markdown to a "Living Document" interface.
- [ ] **Property Autocomplete:** Typing `[` triggers a popup suggesting known ontology keys (`status`, `priority`) and values (`active`, `high`) based on history.
- [ ] **Natural Language -> Semantic Injection:** "Ghost text" suggestions that convert typed sentences into properties.
    *   *User types:* "Buy milk tomorrow"
    *   *System suggests:* `[task:buy] [item:milk] [due:tomorrow]`
- [ ] **Live Validation:** Visual feedback when a property matches (Green match) or violates (Red error) the ontology.

### 1.2 "Active Note" Feedback Loop
Users must *see* the Agent working within the Note itself.
- [ ] **Execution Stream:** A dedicated UI section (sidebar or bottom sheet) streaming Agent logs/screenshots in real-time.
- [ ] **Result Injection:** Agents append results as structured blocks (Tables, Cards) that render natively, not just raw JSON/Markdown.
- [ ] **Confetti/Haptics:** Subtle delight when a task transitions from `[status:active]` to `[status:done]` via agent.

### 1.3 "One-Click" Action Bar
- [ ] **Contextual Actions:** A floating bar that suggests relevant Skills based on Note properties.
    *   *Note has `[url:github.com...]`* -> Suggest: "Summarize Issue", "Create PR".
    *   *Note has `[location:Austin]`* -> Suggest: "Search Zillow", "Check Weather".

---

## Phase 2: The Skill Ecosystem (Extensibility)
**Goal:** Empowering users and developers to extend the system without touching core code.

### 2.1 "Zero-Code" Skill Definition
Allow users to define simple Skills directly in Notes.
- [ ] **Macro Skills:** Define a sequence of existing skills as a new skill.
    *   `[skill:RecruitReactDev] = [skill:IndeedSearch] -> [skill:SummarizeResumes] -> [skill:EmailBest]`
- [ ] **Prompt Skills:** Define a new LLM capability via a prompt note.
    *   Note `@skill:Poet`: "You are a poet. Rewrite the input text as a haiku."
    *   Usage: `[skill:Poet] "System status is online"`

### 2.2 Developer Regulation & Discovery
- [ ] **Skill Marketplace/Registry:** A `npm`-like registry for sharing signed Skills.
- [ ] **Sandboxed Execution:** Run third-party skills in an isolated V8 context or Docker container for security.
- [ ] **Standard Library:** Polishing the "Core Skills" to perfection:
    *   `@skill:Browser` (Playwright)
    *   `@skill:FileSystem` (Safe R/W)
    *   `@skill:Shell` (Restricted commands)

---

## Phase 3: Autonomous & Background Agents
**Goal:** The system works for you even when you aren't looking.

### 3.1 "Cron Notes" & Monitors
- [ ] **Recurring Tasks:** Semantic properties for scheduling.
    *   `[schedule:daily:09:00] [task:CheckServerHealth]`
- [ ] **State Monitors:** Agents that watch external signals and create Notes.
    *   `[monitor:btc_price < 50000]` -> Triggers -> Create Note "Buy Opportunity".

### 3.2 Self-Healing & Optimization
- [ ] **Ontology Pruning:** Background agent that merges duplicate tags (`#dev` vs `#develop`) and suggests cleaning up unused properties.
- [ ] **Link Rot Fixer:** Agent checks `[url:...]` links in library and archives content / flags broken ones.

---

## Phase 4: Networked Intelligence (Nostr)
**Goal:** Agents collaborating beyond the single-user boundary.

### 4.1 P2P Intent Matching
- [ ] **"Publish" Button:** One-click publish to Nostr relays.
- [ ] **Semantic Handshake:** Agents negotiate matches (Job Offer <-> Job Seeker) using standardized property sets before alerting humans.
- [ ] **Reputation Web:** Trust scores for external Agents based on past interactions.

---

## Verification & Success Metrics

### Ergonomics Check
- [ ] **The "Mom Test":** Can a non-technical user create a complex automation (e.g., "Watch crazyflights and email me deals") in < 2 minutes?
- [ ] **Latency:** Autocomplete appears in < 50ms.

### Extensibility Check
- [ ] **"5-Minute Skill":** A developer can write, test, and install a new TypeScript Skill in under 5 minutes.

### Reliability
- [ ] **Uptime:** Background monitors run for 24h+ without crashing.
- [ ] **Safety:** Sandboxed skills cannot access `id_rsa` or unapproved dirs.