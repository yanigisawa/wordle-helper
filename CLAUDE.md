# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wordle Helper is a vanilla JavaScript single-page application that assists users in solving Wordle puzzles by filtering a list of 5-letter words based on various criteria.

## Architecture

This is a static client-side application with no build process:
- **index.html**: Main UI with Bootstrap 5 styling
- **script.js**: Core filtering logic and event handlers
- **words.js**: Static array of 10,240 five-letter words
- **style.css**: Custom styles on top of Bootstrap

All processing happens in the browser. The app is designed for static hosting (e.g., GitHub Pages).

## Development Commands

Since this is a static site with no build process:
- **Run locally**: Open `index.html` directly in a browser or use a local web server (e.g., `python -m http.server`)
- **Deploy**: Push to GitHub and enable GitHub Pages on the `dev` branch

## Key Functions in script.js

- `filterExcludeLetters()`: Removes words containing specified letters
- `filterIncludeLetters()`: Keeps only words with specified letters
- `filterLetterPositions()`: Matches known letter positions
- `filterIncludedLettersButNotHere()`: Handles letters that exist but not in certain positions
- `getStartingWords()`: Suggests optimal starting words
- `getWordListStats()`: Calculates letter frequency statistics

## Testing Approach

No automated tests exist. Test manually by:
1. Opening index.html in a browser
2. Verifying filters work correctly with various inputs
3. Checking that results update in real-time

## Code Style

- Vanilla JavaScript (ES6+)
- Event-driven architecture
- Real-time filtering on input events
- No external JavaScript libraries except Bootstrap via CDN