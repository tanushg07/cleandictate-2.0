# CleanDictate

> **Note**: This project has been cloned from [https://github.com/SharadhNaidu/CleanDictate.git](https://github.com/SharadhNaidu/CleanDictate.git). All rights to the original codebase belong to him.

Intelligent Dictation Engine with real-time speech-to-text, filler removal, and dual tone transformation (Professional & Casual).

## Requirements

- Python 3.10+
- Intel i5+ / AMD5+
- Windows 10/11

## Installation

```powershell
# Clone the repository
git clone https://github.com/tanushg07/cleandictate-2.0.git
cd CleanDictate

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install dependencies
pip install faster-whisper transformers spacy pyaudio pynput scipy

# Download spaCy model
python -m spacy download en_core_web_sm
```

## Run

```powershell
python cleandictate.py
```

## Hotkeys

| Key | Action |
|-----|--------|
| F9  | Start Recording |
| F10 | Stop Recording |
| F11 | Copy Output |
| ESC | Quit |

## Modes

- **Live**: Real-time VAD, instant typing
- **Document**: Record all, process on stop

## Tones

- `neutral` - No style change
- `formal` - Professional business tone
- `casual` - Friendly conversational tone
- `concise` - Brief and direct
- `dual` - Both formal & casual output

## Web UI

CleanDictate also ships a browser-based frontend that runs the same
`SpeechEngine` (from `cleandictate.py`) behind a local FastAPI server, and
replaces the tkinter GUI with a web page.

```bash
python server.py
```

Then open **http://127.0.0.1:8765** in your browser.

The web UI (`web/index.html`) includes:

- **Dictate** — live/document recording, tone & format controls, custom
  dictionary, text rewriting, and an advanced pipeline console.
- **Pricing** — an overview of CleanDictate's plans, from free local-only
  use up to enterprise deployments.

### Features

**Dictation history**
Every dictation from the current session is kept in a scrollable chip list
below the Output card (last 5 results, newest first). Click a chip to
reload that result — including its cleaned text, tone/format metadata, and
any correction highlights — back into the Output card. History is kept
in-browser for the current session only; it isn't persisted to disk.

**Rewrite text in a required format**
The Rewrite card lets you paste or type any text and reprocess it through
CleanDictate's style engine on demand — independent of live dictation.
Choose a **tone** (`formal`, `casual`, `concise`, or `dual` for both side
by side) and a **format** (`plain`, `email`, or `bullets`), then click
**Rewrite** to get freshly restyled output with a one-click copy button on
each result.

**Custom dictionary**
Teach CleanDictate your own vocabulary and correction rules so recognition
gets more accurate over time:
- **Vocabulary** — add names, acronyms, and technical terms (e.g. product
  names, medical/IT jargon) that the model should recognize.
- **Correction rules** — map a commonly mis-heard phrase to the text it
  should actually become (`heard as` → `replace with`).

Entries are managed via `/api/dictionary` and persisted server-side in
`custom_dictionary.json`, so they carry over between sessions.

### Plans

| Plan | Engine | Audience | Billing |
|---|---|---|---|
| **Local Basic** | Local model | Anyone, single device | Free |
| **Local + Local LLM (Professional)** | Local model + local LLM | IT professionals & healthcare workers who need on-device AI rewriting with full confidentiality | Per user, one-time or annual |
| **Local + Local LLM (Enterprise)** | Local model + local LLM | Enterprises deploying offline AI dictation fleet-wide | Per employee, one-time or annual |
| **Cloud Sync (Team)** | Local model + cloud sync | Enterprises wanting settings/history synced across employee devices | Per employee, one-time or annual |
| **Cloud Sync + LLM (Team + AI)** | Local model + cloud sync + cloud LLM | Enterprises wanting cloud sync plus AI-powered rewriting for every employee | Per employee, one-time or annual |

All local-only plans process audio and text entirely on-device — nothing is
uploaded. Cloud-tier plans add sync and/or cloud LLM processing on top of the
same local engine.
