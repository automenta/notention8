# Notention - The Decentralized Super App

Notention is a "Tool for Thought" that evolves into a **Peer-to-Peer Coordination Network**. It starts as a private semantic notebook and scales to a global marketplace for intent (Requests) and capacity (Offers).

## Core Philosophy

1.  **Everything is a Note:** A project, a task, a product for sale, a job offer - all are just Notes.
2.  **Semantic Properties:** We use a simple syntax to make text machine-readable.
    *   **Facts (Real):** `[role:is:Engineer]`, `[price:is:100]`
    *   **Constraints (Imaginary):** `[role:is:Engineer]`, `[price < 200]`, `[skill contains React]`
3.  **Matching Engine:** The app connects "Requests" (Imaginary) with "Offers" (Real) purely by semantic overlap. No central server required.

## Features

### 📝 Semantic Editor
Just type naturally. The editor automatically parses your intent.
-   **Properties:** `[key:op:value]` (e.g., `[status:is:Active]`)
-   **Logic:** `[budget < 500]`, `[deadline > 2025-01-01]`
-   **Tags:** `#project`, `#idea`

### ⚡️ P2P Network (Nostr)
Publish your notes to the censorship-resistant Nostr network.
-   **Publish:** Notes are signed events. Semantic data is published as tags.
-   **Discover:** Click **"Find Matches"** on any note to scan the network for compatible offers/requests.

### 🧠 The Gardener (AI)
The Ontology (schema) is not hardcoded. It emerges from usage.
-   **Local AI:** Scans your notes and infers types (Number, Date, Enum).
-   **Evolution:** As you write, the "Gardener" updates the schema automatically.
-   **Conflict Resolution:** (Coming Soon) Vote on shared definitions with peers.

### 🧪 Simulator (Developer Mode)
A "God Mode" for testing economic and social dynamics.
-   **Agents:** Spawn virtual users (Freelancers, Clients, Merchants).
-   **Cycles:** Run simulation cycles to watch agents post notes and find matches.
-   **Verification:** Prove that the ontology works before deploying to the mainnet.

## Getting Started

1.  **Write:** Create a note. Type `[skill:is:React]`.
2.  **Publish:** Click the "Publish" (Send) icon.
3.  **Match:** Create another note: `[skill contains React]`. Click the "Find Matches" (Search) icon.
4.  **Develop:** Go to Settings -> Toggle **Developer Mode** to access the Simulator and Ontology Graph.

## Tech Stack
-   **Frontend:** React, Vite, TailwindCSS
-   **Editor:** Tiptap
-   **Storage:** LocalForage (IndexedDB)
-   **Network:** Nostr (`nostr-tools`)
-   **AI:** Google Gemini (Optional) or Local Heuristics

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for deep dive into the matching logic, parser details, and P2P protocol.
