# CleanDictate 2.0 --- Next.js UI/UX Upgrade

## Product Direction

Transform the existing CleanDictate Streamlit interface into a polished,
production-style desktop/web experience using **Next.js** while
preserving the existing speech-processing functionality.

CleanDictate should feel like a modern voice-first writing assistant
rather than a transcription dashboard.

### Core positioning

> **Speak naturally. Write clearly.**

The product should take natural speech and turn it into clean, usable
text by combining transcription, speech cleanup, formatting, and tone
transformation.

The redesign must prioritize:

-   Minimal cognitive load
-   Fast dictation workflow
-   Excellent visual hierarchy
-   Clear recording state
-   Immediate feedback
-   Keyboard-first interaction
-   Responsive design
-   Accessible controls
-   Persistent dictation history

------------------------------------------------------------------------

# 1. Goals

## Primary Goal

Replace the current Streamlit UI with a high-quality **Next.js
frontend** without unnecessarily rewriting the existing backend or
speech-processing logic.

## UX Goal

The main workflow should be understandable within seconds:

**Open app → Press record → Speak → Stop → Review cleaned text →
Copy/use it → History is saved automatically**

The user should never feel like they are operating an ML demo.

It should feel like a finished product.

------------------------------------------------------------------------

# 2. Technology Stack

Use:

-   **Next.js** with App Router
-   **TypeScript**
-   **Tailwind CSS**
-   **shadcn/ui** for accessible primitives where useful
-   **Lucide React** for icons
-   React state/hooks
-   API routes or a thin API client layer for the existing backend
-   Local persistence for history initially; design the data layer so it
    can later be moved to PostgreSQL/Supabase/etc.

Do not introduce unnecessary libraries.

------------------------------------------------------------------------

# 3. Design Language

## Overall aesthetic

Create a premium, calm, voice-first interface inspired by modern
productivity tools.

Avoid:

-   Generic dashboard layouts
-   Excessive cards
-   Dense tables
-   Huge gradients
-   Excessive animations
-   Streamlit-looking controls
-   Too many colors
-   Decorative UI with no purpose

Prefer:

-   Large typography
-   Generous whitespace
-   Subtle borders
-   Soft elevation
-   Rounded but not excessively rounded components
-   Strong primary CTA
-   Clear empty states
-   Smooth micro-interactions
-   Consistent spacing

## Suggested visual system

Use a neutral background with one strong accent color.

Recommended structure:

-   Background: warm/neutral light surface
-   Main text: near-black
-   Secondary text: muted gray
-   Borders: subtle gray
-   Accent: indigo/violet or another single brand color
-   Success: restrained green
-   Warning: restrained amber
-   Error: restrained red

Support both **light and dark mode** if practical, but light mode is the
priority.

------------------------------------------------------------------------

# 4. Application Layout

Use a responsive application shell.

``` text
┌──────────────────────────────────────────────────────────────┐
│ CleanDictate                         Search   Theme   Profile │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  + New        │              Main Workspace                  │
│               │                                              │
│  Dictate      │                                              │
│  History      │                                              │
│               │                                              │
│  Settings     │                                              │
│               │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│                    Keyboard shortcuts                         │
└──────────────────────────────────────────────────────────────┘
```

### Desktop

Use a compact left sidebar.

### Tablet

Collapse sidebar into a drawer.

### Mobile

Use a top bar and bottom navigation/action area where appropriate.

------------------------------------------------------------------------

# 5. Main Dictation Workspace

This is the most important screen.

Do NOT make the homepage look like a settings dashboard.

## Hero area

Display:

**CleanDictate**

> Turn natural speech into polished writing.

Then a compact status line such as:

> Ready to dictate

------------------------------------------------------------------------

## Recording experience

The recording control should be the visual center of the page.

Example:

``` text
             Ready to dictate

                 ◉
            Start dictation

        Hold Space to talk
```

When recording:

``` text
             Listening...

                 ◉
             00:14

        ███████████████
        Live transcription...

     Release Space to finish
```

### Recording states

Implement clear states:

1.  `idle`
2.  `requesting_permission`
3.  `recording`
4.  `processing`
5.  `completed`
6.  `error`

Each state must have distinct visual feedback.

------------------------------------------------------------------------

# 6. Recording Button

Create one premium primary recording button.

Requirements:

-   Large clickable target
-   Keyboard accessible
-   Clear hover state
-   Clear active/recording state
-   Animated recording indicator
-   Recording duration
-   Disabled state while processing

Do not over-animate.

The animation should communicate:

> "The app is listening."

Not:

> "Look at this animation."

------------------------------------------------------------------------

# 7. Live Transcription

During recording, show live speech when available.

Example:

``` text
Live transcription

"so basically I wanted to discuss the project
timeline and uh the remaining tasks..."
```

Use a subtle typing/cursor effect only if it does not distract.

If live transcription is not available from the backend, show a
recording waveform/status instead and display the transcript after
processing.

Do not fake real-time transcription.

------------------------------------------------------------------------

# 8. Result Editor

After processing, transition smoothly into the result view.

The result area should have two modes:

### Clean view

``` text
We should complete the project by Friday.
```

### Original view

``` text
Um, so basically I was thinking that we should,
uh, maybe finish the project by Friday...
```

Allow the user to switch between:

-   Original
-   Cleaned

This creates a strong product demonstration.

------------------------------------------------------------------------

# 9. Result Actions

Place actions close to the generated text.

Primary actions:

-   Copy
-   Edit
-   Save
-   Delete

Secondary actions:

-   Make concise
-   Make professional
-   Make casual
-   Fix grammar

Use icon + tooltip where appropriate.

After copying:

> ✓ Copied to clipboard

Do not use intrusive toast notifications for every interaction.

------------------------------------------------------------------------

# 10. Tone / Writing Style

Create a compact style selector.

Suggested options:

-   Original
-   Professional
-   Casual
-   Concise

Design it as a segmented control or dropdown rather than four giant
cards.

Example:

``` text
Writing style

[ Professional ] [ Casual ] [ Concise ]
```

The current backend tone functionality should be reused rather than
duplicated.

------------------------------------------------------------------------

# 11. Dictation History ⭐

Add a dedicated **History** experience.

This is a required feature.

Every successfully processed dictation should be stored automatically.

## History sidebar

Show recent items:

``` text
History

Today
────────────────────
Project meeting
2 min ago

Email to professor
18 min ago

Assignment notes
1 hr ago

Yesterday
────────────────────
...
```

Each item should display:

-   Title
-   Short preview
-   Relative timestamp
-   Optional word count

Automatically generate a useful title from the first few words if the
user does not provide one.

Example:

> "Project timeline discussion..."

instead of:

> "Untitled dictation"

------------------------------------------------------------------------

# 12. History Page

Create a dedicated `/history` route.

Layout:

``` text
History

Search dictations...

Today
────────────────────────────────────────────

Project meeting
We should complete the frontend...
2 minutes ago                         →

Email to professor
I wanted to ask about...
18 minutes ago                        →

Yesterday
────────────────────────────────────────────

...
```

## History functionality

Implement:

-   Search
-   Open
-   Copy
-   Delete
-   Rename
-   Sort by newest/oldest
-   Empty state

Search should work across:

-   title
-   original transcript
-   cleaned transcript

------------------------------------------------------------------------

# 13. History Detail

Clicking a history item should open either:

-   a dedicated route, or
-   a right-side detail panel on desktop.

Show:

``` text
Project meeting

Created 2 minutes ago

Original
--------------------------------
...

Cleaned
--------------------------------
...

[ Copy ] [ Edit ] [ Delete ]
```

Allow the user to re-run tone transformations on historical text.

------------------------------------------------------------------------

# 14. History Data Model

Use a simple structure:

``` ts
export interface Dictation {
  id: string;
  title: string;
  originalText: string;
  cleanedText: string;
  createdAt: string;
  updatedAt: string;
  durationMs?: number;
  wordCount?: number;
  tone?: "original" | "professional" | "casual" | "concise";
}
```

For the first version, persist history using local storage or IndexedDB.

Important:

-   History must survive page refreshes.
-   Never lose a completed dictation because the user navigated away.
-   Avoid storing duplicate entries when the UI re-renders.

------------------------------------------------------------------------

# 15. Empty States

Do not leave blank screens.

### Empty history

``` text
No dictations yet

Your completed dictations will appear here.

[ Start dictating ]
```

### No search results

``` text
No dictations found

Try a different search term.
```

### No result yet

``` text
Your cleaned text will appear here
after you finish dictating.
```

------------------------------------------------------------------------

# 16. Keyboard Shortcuts

Make the product feel fast.

Suggested shortcuts:

  Shortcut                    Action
  --------------------------- ----------------------
  Space / configured hotkey   Start/stop dictation
  Ctrl/Cmd + Enter            Process
  Ctrl/Cmd + C                Copy result
  Ctrl/Cmd + K                Search history
  Esc                         Stop/cancel
  Ctrl/Cmd + Z                Undo last edit

Do not override browser shortcuts unless absolutely necessary.

Show shortcuts in tooltips or a small help panel.

------------------------------------------------------------------------

# 17. Word/Time Saved

Add a subtle productivity metric.

Example:

``` text
This session

142 words
~3 min typing saved
```

For the overall product:

``` text
Your stats

1,284 words dictated
18 min estimated time saved
```

Do not make this the main focus.

It is supporting feedback.

------------------------------------------------------------------------

# 18. Toasts and Feedback

Use restrained feedback for important events:

-   Copied
-   Saved
-   Deleted
-   History restored
-   Processing failed

Example:

> ✓ Dictation saved

Errors should be actionable:

> We couldn't process the recording. Check your microphone and try
> again.

Avoid technical stack traces in the UI.

------------------------------------------------------------------------

# 19. Loading / Processing Experience

Never show a generic:

> Loading...

Instead use contextual messages:

``` text
Processing your dictation...

Cleaning speech
   ✓

Formatting text
   •••

Preparing result
   •••
```

If the backend only provides one processing operation, do not fake
multiple processing stages.

Use:

> Processing your dictation...

with a polished skeleton/spinner.

------------------------------------------------------------------------

# 20. Error Handling

Handle:

### Microphone permission denied

``` text
Microphone access is blocked

Allow microphone access in your browser settings
and try again.
```

### Backend unavailable

``` text
CleanDictate is having trouble connecting.

[ Retry ]
```

### Empty recording

``` text
We didn't hear anything.

Try speaking for a little longer.
```

### Transcription failure

``` text
We couldn't transcribe that recording.

[ Try again ]
```

Never expose raw API errors to users.

------------------------------------------------------------------------

# 21. Settings

Create `/settings`.

Keep it simple.

Sections:

### General

-   Theme
-   Default writing style
-   Auto-copy
-   Auto-save history

### Dictation

-   Microphone
-   Recording hotkey
-   Silence detection

### Privacy

-   Clear history
-   Clear local data

Do not build unnecessary settings.

------------------------------------------------------------------------

# 22. Components

Use reusable components.

Suggested structure:

``` text
app/
├── page.tsx
├── history/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── settings/
│   └── page.tsx
├── layout.tsx
└── globals.css

components/
├── layout/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── AppShell.tsx
│
├── dictation/
│   ├── DictationRecorder.tsx
│   ├── RecordingButton.tsx
│   ├── RecordingStatus.tsx
│   ├── LiveTranscript.tsx
│   ├── ResultEditor.tsx
│   ├── ToneSelector.tsx
│   └── ResultActions.tsx
│
├── history/
│   ├── HistoryList.tsx
│   ├── HistoryItem.tsx
│   ├── HistorySearch.tsx
│   └── HistoryDetail.tsx
│
├── ui/
│   └── ...
│
└── providers/
    └── HistoryProvider.tsx

lib/
├── api.ts
├── history.ts
├── clipboard.ts
└── utils.ts

types/
└── dictation.ts
```

Adapt this structure to the actual project rather than blindly
recreating it.

------------------------------------------------------------------------

# 23. Backend Integration

The existing speech/transcription backend is the source of truth.

The Next.js frontend should act as the presentation layer.

Do not rewrite working AI/speech logic just to match the new UI.

Create a clean API abstraction:

``` ts
export async function transcribeAudio(
  audio: Blob
): Promise<TranscriptionResult> {
  // call existing backend
}
```

And:

``` ts
export async function cleanTranscript(
  text: string,
  tone: Tone
): Promise<CleanTranscriptResult> {
  // call existing backend
}
```

Keep API URLs and configuration in environment variables.

Example:

``` env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Do not hardcode localhost throughout the application.

------------------------------------------------------------------------

# 24. Preserve Existing Functionality

The redesign must not remove existing working capabilities.

Before changing UI code:

1.  Inspect the current repository.
2.  Identify the current Streamlit entry point.
3.  Identify transcription logic.
4.  Identify filler/stutter cleanup.
5.  Identify tone transformation.
6.  Identify recording/hotkey functionality.
7.  Identify configuration/environment variables.
8.  Identify all backend endpoints or Python functions used by
    Streamlit.

Then build the Next.js UI around those capabilities.

If a current feature cannot be directly moved into the browser, preserve
it through the backend/API layer.

------------------------------------------------------------------------

# 25. Important Architecture Decision

Do NOT make Next.js responsible for microphone processing that belongs
on the backend.

Preferred flow:

``` text
                 ┌──────────────────┐
                 │    Next.js UI    │
                 │                  │
                 │ Recorder         │
                 │ Editor           │
                 │ History          │
                 │ Settings         │
                 └────────┬─────────┘
                          │
                          │ API
                          ▼
                 ┌──────────────────┐
                 │ Existing Backend │
                 │                  │
                 │ Speech-to-text   │
                 │ Cleaning         │
                 │ Tone processing  │
                 └──────────────────┘
```

The frontend owns UX.

The backend owns AI/business logic.

------------------------------------------------------------------------

# 26. API Contract

Create a typed API layer.

Example response:

``` ts
interface TranscriptionResult {
  originalText: string;
  cleanedText: string;
  durationMs?: number;
  wordCount?: number;
}
```

If the current backend response differs, adapt the frontend to the real
response instead of changing the backend unnecessarily.

------------------------------------------------------------------------

# 27. Performance Requirements

The application should feel instant.

Requirements:

-   Avoid unnecessary client-side re-renders.
-   Use optimistic UI for simple actions such as delete where safe.
-   Debounce history search.
-   Lazy-load non-critical history details if needed.
-   Do not reload the complete history after every action.
-   Keep recording UI responsive while requests are processing.
-   Disable duplicate submissions.

------------------------------------------------------------------------

# 28. Accessibility

Minimum requirements:

-   Keyboard navigable
-   Visible focus states
-   Semantic buttons
-   Proper labels
-   ARIA labels for icon-only controls
-   Sufficient contrast
-   Do not communicate state using color alone
-   Recording state must be communicated through text/icon/status

The recording button must be accessible without a mouse.

------------------------------------------------------------------------

# 29. Responsive Behavior

### Desktop

Three functional areas can be visible:

``` text
Sidebar | Workspace | Optional History/Detail
```

### Tablet

``` text
Sidebar drawer | Workspace
```

### Mobile

Prioritize:

1.  Recording
2.  Result
3.  History
4.  Settings

Do not simply shrink the desktop UI.

Recompose the layout for mobile.

------------------------------------------------------------------------

# 30. Animations

Use subtle transitions for:

-   Recording state
-   Result appearing
-   Sidebar opening
-   History item selection
-   Copy confirmation
-   Modal/drawer transitions

Avoid animation on every element.

Recommended principle:

> Motion should explain state, not decorate the interface.

------------------------------------------------------------------------

# 31. Product Details That Make It Feel Finished

Add these small details:

-   "Ready to dictate" idle state
-   Recording duration
-   Live microphone status
-   Copy confirmation
-   Auto-save indicator
-   Relative timestamps
-   Search history
-   Keyboard shortcut hints
-   Empty states
-   Undo where appropriate
-   Clear error recovery
-   Theme toggle
-   Smooth page transitions
-   Responsive sidebar
-   Proper favicon/app metadata
-   Loading skeletons
-   Confirmation before clearing all history

These details matter more than adding ten new AI features.

------------------------------------------------------------------------

# 32. Do Not Do This

Avoid:

-   Rebuilding the AI pipeline in TypeScript
-   Replacing working backend logic unnecessarily
-   Adding a database for the first history implementation unless
    required
-   Adding authentication unless required
-   Adding unnecessary charts
-   Adding complex state-management libraries
-   Creating dozens of routes
-   Making every section a card
-   Overusing gradients
-   Making the recording button enormous on mobile
-   Showing technical errors to users
-   Fake progress bars
-   Fake live transcription

------------------------------------------------------------------------

# 33. Implementation Phases

## Phase 1 --- Foundation

-   Set up Next.js + TypeScript + Tailwind
-   Create App Router structure
-   Create design tokens
-   Build AppShell
-   Build sidebar
-   Build responsive layout
-   Connect existing backend

## Phase 2 --- Core Dictation

-   Microphone recording
-   Recording states
-   Recording button
-   API integration
-   Processing state
-   Result editor
-   Copy functionality

## Phase 3 --- Existing AI Features

-   Filler removal
-   Stutter/self-correction cleanup
-   Tone transformations
-   Original vs cleaned comparison

## Phase 4 --- Dictation History

-   History data model
-   Auto-save completed dictations
-   History sidebar
-   `/history`
-   Search
-   Open
-   Rename
-   Copy
-   Delete
-   Persistence

## Phase 5 --- Polish

-   Keyboard shortcuts
-   Toasts
-   Empty states
-   Error states
-   Loading states
-   Responsive behavior
-   Accessibility
-   Dark mode
-   Micro-interactions

## Phase 6 --- Final QA

Test:

-   First-time microphone permission
-   Recording
-   Stop recording
-   Empty recording
-   Failed API call
-   Long transcript
-   Copy
-   Edit
-   Refresh
-   History persistence
-   Delete
-   Search
-   Mobile layout
-   Keyboard navigation
-   Dark mode

------------------------------------------------------------------------

# 34. Definition of Done

The migration is complete when:

-   The main application no longer depends on Streamlit for its user
    interface.
-   Next.js provides the complete user-facing UI.
-   Existing transcription functionality still works.
-   Existing cleanup functionality still works.
-   Existing tone functionality still works.
-   Users can record speech from the Next.js UI.
-   Users can view and edit processed text.
-   Users can copy the result.
-   Every completed dictation is automatically saved to history.
-   History survives refresh.
-   Users can search, open, rename, copy and delete history entries.
-   The UI works on desktop and mobile.
-   Loading, error, empty and success states are polished.
-   Keyboard interaction works.
-   The interface feels like a finished productivity product rather than
    a Streamlit prototype.

------------------------------------------------------------------------

# 35. Final UX Principle

The most important design rule:

> **The user should think about what they want to say, not about how to
> operate the application.**

The ideal interaction is:

``` text
        THINK
          ↓
       SPEAK
          ↓
   CLEAN DICTATE
          ↓
   CLEAN + FORMAT
          ↓
      REVIEW
          ↓
     COPY / USE
          ↓
      AUTO-SAVED
       TO HISTORY
```

Build the experience around this loop.

**Do not optimize for showing technical complexity. Optimize for making
the product feel effortless.**
