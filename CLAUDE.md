# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Manifest V3 Chrome extension ("SA ID Number Tools") that generates and analyses South
African ID numbers. There is **no build system, package manager, linter, or test suite** —
the repo root *is* the unpacked extension.

## Developing

- Load: `chrome://extensions` → enable Developer mode → "Load unpacked" → select the repo root.
- Iterate: edit files, then hit the reload icon on the extension card. Popup changes need the
  popup reopened; `main.js` (background service worker) changes need the extension reloaded — use
  the "service worker" link on the card to open its console (that is where context-menu errors
  surface).
- Version lives only in `manifest.json` (`version`) and is bumped by hand in its own commit.
- The Chrome Web Store `description` field has a hard 132-character limit — past commits had to
  trim copy to fit it.
- No dependencies — `idgenerator.js` is plain DOM JS (jQuery was removed). The validity indicator
  is pure CSS (a coloured badge with a `\2713` / `\2715` glyph via `.id-status.valid` /
  `.id-status.invalid`) — the old `Circle_Green.png` / `Circle_Red.png` images were removed.
- `generator.css` is a self-contained design system: CSS custom properties on `:root` with a
  `@media (prefers-color-scheme: dark)` override, system-font stack, and a green accent
  (`--accent`) that matches the extension's icons. Keep new popup UI within those tokens.

## Architecture

Two execution contexts, both sharing the domain core `jSAID.js`:

1. **Background service worker** (`manifest.background.service_worker` = `main.js`, which
   `importScripts('jSAID.js')` at the top)
   Registers the "Add SA ID number" context menu (Male / Female submenu, `contexts: ['editable']`)
   on install. On click it builds a random 1970–1998 DOB, calls `generateID`, then injects the
   result into the exact frame that was right-clicked with
   `chrome.scripting.executeScript({ target: { tabId, frameIds: [info.frameId || 0] }, func: insertGeneratedId, args: [id] })`.
   `insertGeneratedId` runs in the page's isolated world: it sets `document.activeElement.value`
   (or `.textContent` for `contentEditable`) and dispatches `input`/`change` events. There is **no
   declared content script** — `activeTab` grants the needed access because a context-menu click
   is a user gesture, and `"scripting"` is in `permissions`. The `onClicked` listener is
   registered at top level so it survives service-worker restarts. No DOM, no `localStorage` here.

2. **Popup** (`generator.html` → `jSAID.js` + `idgenerator.js`, both plain classic scripts)
   `idgenerator.js` runs its body inside a `DOMContentLoaded` listener. Thirteen single-char
   `.id-omnibox` inputs act as one ID field (per-digit `keydown` handling, arrow/backspace
   navigation) — they must stay **direct adjacent siblings** inside `.id-text-container` so
   `previousElementSibling`/`nextElementSibling` and the `:nth-child` group gaps work. It wires
   the Random / Generate / Copy buttons, drives the `.id-status` badge via `extractFromID`, and
   mirrors the parsed birthdate / gender / citizenship into the controls. The Male / SA-citizen
   toggles are `<input type="checkbox" class="male|citizen">` styled as sliders — the checkbox
   `.checked` stays the source of truth. The last copied (or last persisted) ID is saved to
   `localStorage["last-id"]` and restored on open; Generate clears it by storing the string
   `"null"`. Only class selectors are used, so markup can be restyled freely as long as the
   classes stay.

### `jSAID.js` — the domain core (loaded in both the service worker and the popup)

- `generateLuhnDigit(str)` — check digit used everywhere. `oldLuhnDigit` is a dead alternate
  implementation kept for reference.
- `extractFromID(idNumber)` → `{ valid, birthdate, gender, citizen }`. Century is guessed by
  comparing the `YY` digits against the current 2-digit year (`< currentYear` ⇒ 2000s).
- `generateID(dob, male, citizen)` — `dob` must be a **6-char `YYMMDD`** string (regex-checked;
  returns an error *string* on failure). Layout: `YYMMDD` + gender `SSSS` (0000–4999 female,
  5000–9999 male) + citizenship bit (`0` citizen / `1` resident) + literal `8` + Luhn digit = 13.
- Date helpers: `randomValueBetween`, `randomDate`, `dateToUnformattedString` (→ `YYYYMMDD`).

## Gotchas

- The popup's `<input type="date">` yields `YYYY-MM-DD`, but `generateID` wants `YYMMDD`. The
  Generate handler reshapes it with `dob.replace(/-/g, "").substring(dob.length - 8)` — note it
  slices using the length of the *un-stripped* string. Both this and `main.js` take
  `dob.substring(dob.length - 6)` to get the trailing 6 digits; keep that convention if you touch it.
- `insertGeneratedId` in `main.js` is passed to `chrome.scripting.executeScript` as `func`, so it
  is serialised and runs with **no access to its surrounding scope** — keep it self-contained.
- `idgenerator.js` (popup only) uses `localStorage` and `document.execCommand('copy')` (via the
  off-screen `.hidden` textarea) — both are fine in an MV3 extension **page**, but neither exists
  in the service worker, so don't move that logic into `main.js`.
- The per-digit `keydown` handler calls `event.preventDefault()` unconditionally, so Tab and
  clipboard shortcuts don't work while a digit box is focused. Intentional-ish legacy behaviour,
  carried over from the jQuery version.
- `background.service_worker` is a single classic worker (not an ES module), so additional
  dependencies are pulled in with `importScripts(...)`, not `import`.
