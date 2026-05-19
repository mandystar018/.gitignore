# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shape Tracker is a small browser-based app that accepts three side lengths and determines what type of triangle (if any) they form. It uses Webpack to bundle ES modules, jQuery for DOM manipulation, and Bootstrap for styling.

## Commands

```bash
npm install          # install dependencies (required before first run)
npm run start        # start webpack-dev-server with live reload (opens browser)
npm run build        # produce a development bundle in dist/
npm run lint         # run ESLint over src/*.js
```

There is no test runner configured. Linting runs automatically during `build` and `start` via `eslint-loader`.

## Architecture

- **Entry point**: `src/main.js` — imports jQuery, Bootstrap, styles, and the `Triangle` class; wires the form submit handler.
- **Business logic**: `src/triangle.js` — exports a `Triangle` constructor (default export). `Triangle.prototype.checkType` is the method to implement; it currently returns a placeholder string.
- **Template**: `src/index.html` — used by `HtmlWebpackPlugin` as the page shell; the bundled script is injected into `<body>`.
- **Output**: Webpack writes `dist/bundle.js` (cleaned on each build via `CleanWebpackPlugin`).

## Key Conventions

- ES module syntax (`import`/`export default`) is used throughout; `ecmaVersion: 2018`.
- ESLint enforces `eslint:recommended` plus 2-space indentation and semicolons (both at `warn` level). There is a live `debugger` statement in `main.js` — remove it before shipping.
- jQuery is available globally in ESLint config (`"jquery": true`), so `$` does not need to be declared.
- Source maps are enabled (`eval-source-map`) for development debugging.
- `node_modules/` and `dist/` are gitignored; never commit them.
