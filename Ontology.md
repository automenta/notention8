# Ontology Design: The "Min-Max" Approach

## 1. Philosophy: Maximize Utility, Minimize Friction
Instead of forcing users to be "Architects" who manually design complex schemas before writing a single note, we adopt a **descriptive** rather than **prescriptive** approach.

-   **Don't** build a complex Drag-and-Drop Ontology Editor.
-   **Do** let the Ontology emerge from natural language usage.
-   **Do** use the Simulator/LLM to do the heavy lifting of standardization.

## 2. The Protocol (Network Agnostic)
The core data structures are designed to be transport-independent.

### 2.1. Concepts (Tags) & Attributes (Properties)
**Data Structure:**
```typescript
// A flat list of known attributes. No complex inheritance trees.
interface AttributeDefinition {
  key: string;           // e.g. "budget"
  type: 'number' | 'string' | 'date' | 'enum' | 'contact';
  suggestedTags: string[]; // e.g. ["project", "purchase"] - where this usually appears
  stats: {
    usageCount: number;
  };
}
```

## 3. Network Topology Support
The system supports two distinct modes of operation.

### 3.1. Peer-to-Peer (Nostr) - *Primary*
-   **Storage:** Notes are signed events (Kind 1 or 30023).
-   **Discovery:** Simulator scans the "Web of Trust".
-   **Consensus:** Emergent.
-   **Power:** Uncensorable, resilient.

### 3.2. Client/Server (Managed) - *Secondary*
-   **Storage:** Database + API.
-   **Discovery:** Server provides `ontology.json`.
-   **Consensus:** Authoritative.
-   **Use Case:** Corporate knowledge bases.

## 4. The "Zero-UI" Workflow
We remove the dedicated `/ontology` management page entirely in V1.

### 4.1. Writing (The Input)
The user just writes.
-   *User types:* "Meeting with @bob about #project-alpha. [priority:high]"
-   *System:* Records a note. Sees new property `priority`.

### 4.2. The "Gardener" (Background Agent)
This is the "Simulator" in a passive mode. It watches the user's notes.
1.  **Observation:** "I see you've used `[priority:...]` on 3 notes tagged `#project`."
2.  **Inference:** "Priority seems to be an Enum with values {high, medium, low}."
3.  **Action:** It silently creates a provisional `AttributeDefinition` for `priority`.

### 4.3. The Feedback (Just-in-Time UI)
The next time the user types `[p...`:
-   **Autocomplete:** Shows `priority` (derived from the Gardener's inference).
-   **Validation:** If the user types `[priority:10]`, the UI gently nudges: *"Previously you used High/Medium/Low. Treat as a number now?"*

## 5. The Simulator (Active Evolution)
To achieve **Ubiquity**, the Simulator acts as the bridge between the Local and the Network.

### 5.1. Goal
Ensure the user's "local dialect" matches the "network language".

### 5.2. Process
1.  **Fetch:** The Simulator pulls ontologies from the configured source.
2.  **Simulate:** It tries to map the user's notes to these standards.
3.  **Suggestion:** It pops up a "Refactor" suggestion based on the active context.

## 6. Verification: The Story Suite
To prove the Ontology is sufficiently expressive, we define a **Test Suite of Stories**.

### 6.1. The Test Process
1.  **Input:** A plain English story.
2.  **Attempt:** The Simulator tries to express this using *only* current Ontology terms.
3.  **Score:** Pass/Fail.
4.  **Result:** If Fails, the Gardener suggests new Attributes.

### 6.2. Initial Story Suite
-   **Story A:** The Freelance Gig (Services)
-   **Story B:** The Marketplace (Goods)
-   **Story C:** The Project Manager (Knowledge)

## 7. Technical Implementation Details

### 7.1. Note Data Structure (JSON)
Internal representation of a Note with semantic properties.

```json
{
  "id": "uuid-1234",
  "content": "Selling my bike. [price:100] [currency:USD]",
  "tags": ["sale", "bike"],
  "properties": [
    { "key": "price", "operator": "is", "value": "100", "type": "number" },
    { "key": "currency", "operator": "is", "value": "USD", "type": "string" }
  ],
  "created_at": "2023-10-27T10:00:00Z"
}
```

### 7.2. Nostr Event Mapping
How semantic data is serialized to Nostr events.

-   **Kind:** `1` (Short Note) or `30023` (Long Form Content).
-   **Tags:**
    -   `t`: Standard hashtags (e.g., `["t", "sale"]`).
    -   `property`: Custom tag for semantic data. Format: `["property", "key", "operator", "value"]`.

**Example Event:**
```json
{
  "kind": 1,
  "content": "Selling my bike. [price:100] [currency:USD]",
  "tags": [
    ["t", "sale"],
    ["t", "bike"],
    ["property", "price", "is", "100"],
    ["property", "currency", "is", "USD"]
  ]
}
```

### 7.3. Client/Server API Endpoints
For the managed mode.

-   `GET /api/ontology`: Returns the authoritative `ontology.json`.
-   `POST /api/notes`: Create a note. Server parses properties and validates against ontology.
-   `GET /api/notes?q=[price<500]`: Semantic search.

### 7.4. Gardener Logic (Thresholds)
When does the Gardener promote a property?

-   **Min Usage:** Used on at least **3** distinct notes.
-   **Consistency:** Value type matches > **80%** of the time (e.g., mostly numbers).
-   **Co-occurrence:** Often appears with specific tags (e.g., `price` with `#sale`).

## 8. Roadmap

### Phase 1: MVP (Local Only)
-   Implement `[key:value]` parsing in Editor.
-   Implement "Gardener" (Local LLM) to build `ontology.json` from usage.
-   Basic Autocomplete based on local history.

### Phase 2: P2P Connectivity
-   Implement Nostr publishing with `property` tags.
-   Implement "Simulator" to fetch friend's ontologies and suggest alignments.

### Phase 3: The Global Graph
-   Advanced Querying: "Show me all `#jobs` where `[budget > 1000]`" (aggregating from Nostr).
-   Reputation: Filter ontologies by Web of Trust.
