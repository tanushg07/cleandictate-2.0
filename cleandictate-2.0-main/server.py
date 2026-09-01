"""
CleanDictate Web Server
------------------------
Runs the SpeechEngine (unchanged core logic from cleandictate.py) behind a
local FastAPI server, and streams status/console/result events to a browser
frontend over WebSocket. Replaces the tkinter GUI only -- all speech,
grammar-cleanup, style-transfer, and auto-typing logic is untouched.

Run with:  python server.py
Then open: http://127.0.0.1:8765
"""

import asyncio
import io
import json
import sys
import threading
import queue as pyqueue
from contextlib import redirect_stdout

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import the engine class from the (patched, CPU-compatible) cleandictate.py
# without triggering its tkinter GUI / __main__ block.
import importlib.util
import os

CLEANDICTATE_PATH = os.path.join(os.path.dirname(__file__), "cleandictate.py")
spec = importlib.util.spec_from_file_location("cleandictate_core", CLEANDICTATE_PATH)
cleandictate_core = importlib.util.module_from_spec(spec)
sys.modules["cleandictate_core"] = cleandictate_core
spec.loader.exec_module(cleandictate_core)

SpeechEngine = cleandictate_core.SpeechEngine

app = FastAPI()

# ---------------------------------------------------------------------------
# Global engine state
# ---------------------------------------------------------------------------
engine = None
engine_lock = threading.Lock()
engine_ready = False
engine_error = None

console_queue: "pyqueue.Queue[str]" = pyqueue.Queue()
event_queue: "pyqueue.Queue[dict]" = pyqueue.Queue()


class QueueWriter(io.TextIOBase):
    """Redirects print() output from the engine into console_queue."""
    def write(self, s):
        if s and s.strip("\n"):
            console_queue.put(s)
        return len(s)

    def flush(self):
        pass


def _engine_result_callback(result: dict):
    event_queue.put({"type": "result", "data": result})


def _init_engine_background():
    global engine, engine_ready, engine_error
    writer = QueueWriter()
    try:
        with redirect_stdout(writer):
            eng = SpeechEngine(gui_callback=_engine_result_callback)
            eng.select_microphone()
        with engine_lock:
            engine = eng
            engine_ready = True
        event_queue.put({"type": "status", "data": "idle"})
        event_queue.put({"type": "ready", "data": True})
    except Exception as e:
        engine_error = str(e)
        event_queue.put({"type": "error", "data": str(e)})


@app.on_event("startup")
def startup():
    t = threading.Thread(target=_init_engine_background, daemon=True)
    t.start()
    _setup_global_hotkeys()


def _setup_global_hotkeys():
    """F9=start, F10=stop, F11=copy-last-result, ESC=ignored (browser tab owns quit)."""
    from pynput import keyboard as pynput_keyboard

    def on_press(key):
        try:
            if key == pynput_keyboard.Key.f9:
                if engine_ready and engine and not engine.is_running:
                    writer = QueueWriter()
                    with redirect_stdout(writer):
                        engine.start_recording()
                    event_queue.put({"type": "status", "data": "recording"})
            elif key == pynput_keyboard.Key.f10:
                if engine_ready and engine and engine.is_running:
                    writer = QueueWriter()
                    with redirect_stdout(writer):
                        engine.stop_recording()
                    event_queue.put({"type": "status", "data": "idle"})
        except Exception:
            pass

    listener = pynput_keyboard.Listener(on_press=on_press)
    listener.daemon = True
    listener.start()


# ---------------------------------------------------------------------------
# WebSocket: streams console lines + engine result/status events to the UI
# ---------------------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            sent_any = False
            while not console_queue.empty():
                line = console_queue.get_nowait()
                await ws.send_text(json.dumps({"type": "console", "data": line}))
                sent_any = True
            while not event_queue.empty():
                ev = event_queue.get_nowait()
                await ws.send_text(json.dumps(ev))
                sent_any = True
            if not sent_any:
                await asyncio.sleep(0.05)
    except WebSocketDisconnect:
        pass


# ---------------------------------------------------------------------------
# Control endpoints
# ---------------------------------------------------------------------------
def _require_engine():
    if not engine_ready or engine is None:
        raise RuntimeError(engine_error or "Engine still initializing")
    return engine


@app.get("/api/status")
def status():
    return {
        "ready": engine_ready,
        "error": engine_error,
        "recording": bool(engine and getattr(engine, "is_running", False)),
    }


@app.get("/api/microphones")
def microphones():
    eng = _require_engine()
    devices = []
    for i in range(eng.audio.get_device_count()):
        info = eng.audio.get_device_info_by_index(i)
        if info["maxInputChannels"] > 0:
            devices.append({"index": i, "name": info["name"]})
    return {"devices": devices, "current": eng.input_device_index}


@app.post("/api/microphone/{device_index}")
def set_microphone(device_index: int):
    eng = _require_engine()
    eng.set_microphone(device_index)
    return {"ok": True}


@app.post("/api/mode/{mode}")
def set_mode(mode: str):
    eng = _require_engine()
    eng.set_mode(mode)
    return {"ok": True}


@app.post("/api/tone/{tone}")
def set_tone(tone: str):
    eng = _require_engine()
    eng.set_tone(tone)
    return {"ok": True}


@app.post("/api/format/{fmt}")
def set_format(fmt: str):
    eng = _require_engine()
    eng.set_format(fmt)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Custom vocabulary / dictionary
# ---------------------------------------------------------------------------
class VocabularyRequest(BaseModel):
    word: str
class CorrectionRequest(BaseModel):
    heard_as: str
    replace_with: str
@app.get("/api/dictionary")
def get_dictionary(): return _require_engine().get_custom_dictionary()
@app.post("/api/dictionary/vocabulary")
def add_vocabulary(req: VocabularyRequest):
    if not req.word.strip(): raise HTTPException(status_code=400, detail="Word cannot be empty")
    _require_engine().add_vocabulary_word(req.word); return _require_engine().get_custom_dictionary()
@app.delete("/api/dictionary/vocabulary")
def delete_vocabulary(req: VocabularyRequest):
    _require_engine().remove_vocabulary_word(req.word); return _require_engine().get_custom_dictionary()
@app.post("/api/dictionary/correction")
def set_correction(req: CorrectionRequest):
    if not req.heard_as.strip() or not req.replace_with.strip(): raise HTTPException(status_code=400, detail="Both fields are required")
    _require_engine().set_dictionary_correction(req.heard_as, req.replace_with); return _require_engine().get_custom_dictionary()
@app.delete("/api/dictionary/correction")
def delete_correction(req: VocabularyRequest):
    _require_engine().remove_dictionary_correction(req.word); return _require_engine().get_custom_dictionary()

@app.post("/api/start")
def start():
    eng = _require_engine()
    writer = QueueWriter()
    with redirect_stdout(writer):
        eng.start_recording()
    event_queue.put({"type": "status", "data": "recording"})
    return {"ok": True}


@app.post("/api/stop")
def stop():
    eng = _require_engine()
    writer = QueueWriter()
    with redirect_stdout(writer):
        eng.stop_recording()
    event_queue.put({"type": "status", "data": "idle"})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Text rewrite (standalone, not tied to dictation/recording)
# ---------------------------------------------------------------------------

from fastapi.concurrency import run_in_threadpool


class RewriteRequest(BaseModel):
    text: str
    tone: str = "formal"
    format_type: str = "plain"


@app.post("/api/rewrite")
async def rewrite(req: RewriteRequest):
    eng = _require_engine()
    if not req.text or not req.text.strip():
        return {"result": ""}

    def _run():
        tone = req.tone.lower()
        writer = QueueWriter()
        with redirect_stdout(writer):
            if tone == "dual":
                formal = eng.style_engine.process(req.text, tone="formal", format_type=req.format_type)
                casual = eng.style_engine.process(req.text, tone="casual", format_type=req.format_type)
                return {"formal": formal, "casual": casual}
            else:
                result = eng.style_engine.process(req.text, tone=tone, format_type=req.format_type)
                return {"result": result}

    # style_engine.process runs CPU inference -- keep it off the event loop
    output = await run_in_threadpool(_run)
    return output


# ---------------------------------------------------------------------------
# Frontend
# ---------------------------------------------------------------------------
@app.get("/")
def index():
    return FileResponse(os.path.join(os.path.dirname(__file__), "web", "index.html"))


app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "web")), name="static")


if __name__ == "__main__":
    import uvicorn
    print("=" * 80)
    print("CleanDictate Web Server starting...")
    print("Open http://127.0.0.1:8765 in your browser")
    print("Loading models in the background -- this may take 30-90s on CPU.")
    print("=" * 80)
    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")
