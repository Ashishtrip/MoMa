# MoMa Money Manager

## Overview

Money manager web app built with vanilla HTML/CSS/ES6 JS modules.

## New Structure (Refactored)

```
MoMa/
├── index.html
├── styles.css
├── js/
│   ├── app.js (imports)
│   ├── models/ (Transaction, Collection, Storage)
│   ├── utils/ (Validator, CSVExporter, ChartManager)
│   ├── views/ (UIView)
│   └── controllers/ (AppController)
└── tests.html (unit tests)
```

## Features (Enhanced)

- ES6 modules for maintainability
- Add/Edit/Delete w/ undo toast (5s)
- Dynamic filters (subcat by category)
- ARIA accessibility, keyboard nav
- Canvas pie charts
- CSV export, localStorage
- Form validation, responsive dark theme
- Unit tests (QUnit)

## Usage

1. `open index.html`
2. Tests: `open tests.html`
3. Live Server for dev
