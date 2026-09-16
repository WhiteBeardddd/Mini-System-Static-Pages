# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

**Mini-System-Static-Pages** is a school project by Charles Benedict Boquecosa (BSIT, University of San Carlos). It is a small web-based information system with 3–4 frontend pages that let users view, add, edit, and delete records.

- Repo: https://github.com/WhiteBeardddd/Mini-System-Static-Pages (GitHub account: WhiteBeardddd)
- The repo starts empty. Scaffold everything from scratch.

## Scope and constraints

The professor clarified that the deliverable is **frontend-focused: static pages, no database**. To stay within that while still supporting CRUD:

- Use a minimal **Express** server whose only jobs are to serve the static pages from `public/` and expose a small REST API.
- Persist records in a **JSON file** (`data/equipment.json`) using Node's `fs` module. Do not add a database, ORM, or external service.
- Keep the frontend as **plain HTML, CSS, and vanilla JavaScript**. No React, no build step, no bundler, no CSS framework.
- Keep dependencies to `express` only. Ask before adding anything else.

If a requirement seems to push past these constraints (auth, a database, a framework), stop and ask first.

## Subject

A **Networking Lab Equipment Inventory**. Each record is a piece of lab equipment.

| Field     | Type   | Required | Notes                                        |
|-----------|--------|----------|----------------------------------------------|
| id        | string | auto     | `crypto.randomUUID()`                        |
| assetTag  | string | yes      | Unique (case-insensitive), e.g. `NET-SW-001` |
| name      | string | yes      | e.g. `Cisco Catalyst 2960 Switch`            |
| category  | string | yes      | Switch, Router, Firewall, Cable, Other       |
| location  | string | no       | e.g. `Rack A, Room LB-465`                   |
| status    | string | yes      | `Available`, `In use`, or `Under repair`     |
| notes     | string | no       | Free text                                    |
| createdAt | string | auto     | ISO timestamp                                |
| updatedAt | string | auto     | ISO timestamp, refreshed on edit             |

Seed `data/equipment.json` with 3 sample records covering all three statuses.

## Folder structure

```
.
├── CLAUDE.md
├── README.md
├── package.json
├── .gitignore            # node_modules/, .env, .DS_Store
├── server.js
├── data/
│   └── equipment.json
└── public/
    ├── index.html        # list all records
    ├── add.html          # add a record
    ├── edit.html         # edit a record (?id=...)
    ├── view.html         # record details (?id=...)
    ├── css/
    │   └── style.css     # one shared stylesheet
    └── js/
        ├── api.js        # shared fetch helpers
        ├── list.js
        ├── form.js       # shared by add.html and edit.html
        └── view.js
```

## Backend (server.js)

- `express.json()` and `express.static('public')`.
- Port from `process.env.PORT`, default `3000`.
- Read and write the JSON file through two small helpers (`readData`, `writeData`). Write with 2-space indentation.
- Validate on create and update: required fields, allowed status values, unique asset tag. Return `400` for validation errors, `409` for a duplicate asset tag, `404` for a missing record. Errors are JSON: `{ "error": "message" }`.
- Trim string inputs before saving. Never trust client-sent `id`, `createdAt`, or `updatedAt`.

| Method | Route                | Purpose        | Success |
|--------|----------------------|----------------|---------|
| GET    | /api/equipment       | List all       | 200     |
| GET    | /api/equipment/:id   | Get one        | 200     |
| POST   | /api/equipment       | Create         | 201     |
| PUT    | /api/equipment/:id   | Update         | 200     |
| DELETE | /api/equipment/:id   | Delete         | 204     |

`package.json` scripts: `"start": "node server.js"` and `"dev": "node --watch server.js"`.

## Frontend pages

1. **index.html (List)**: table of all records showing asset tag, name, category, location, and status. Includes a search box that filters by asset tag or name, a status filter, and an "Add equipment" button. Each row has View, Edit, and Delete actions. Show a clear empty state that points to adding a record.
2. **add.html (Add)**: form with all editable fields. Status is a `<select>`. On success, redirect to `index.html`.
3. **edit.html (Edit)**: same form, prefilled from `?id=`. The save button reads "Save changes". On success, redirect to `view.html?id=...`.
4. **view.html (Details)**: all fields including created and updated dates, with Edit and Delete buttons.

Behavior rules:

- Every delete asks for confirmation with `confirm()` that names the item.
- Show server error messages inline near the form, not as `alert()`.
- Disable the submit button while a request is in flight.
- If `?id=` is missing or the record is not found, show a message with a link back to the list.
- Escape user text before inserting into the DOM. Prefer `textContent` over `innerHTML`.
- Shared navigation header on every page.

## Design

- One shared stylesheet with CSS custom properties for colors and spacing.
- Palette: cool light background `#EEF1F4`, ink `#1C2430`, patch-cable blue accent `#2E6DB4`. Status colors: Available `#2F8F5B`, In use `#C98A1B`, Under repair `#B8433A`.
- Show status as a colored tag, like a cable label, so it stands out in the list.
- Sentence case for all labels and buttons. No all-caps labels.
- Responsive down to mobile (the table scrolls horizontally inside its own container), visible keyboard focus, and properly labeled form inputs.

## Working style

- Make targeted, surgical edits to existing files rather than rewriting whole files. When changes are extensive, provide the complete file.
- Keep explanations short and direct.
- Don't add features beyond what is listed here without asking.

## Setup

```bash
git clone https://github.com/WhiteBeardddd/Mini-System-Static-Pages.git
cd Mini-System-Static-Pages
npm install
npm run dev
```

Then open http://localhost:3000.

## Definition of done

- All four pages load and link to each other.
- Create, read, update, and delete all work and persist to `data/equipment.json` across server restarts.
- Validation errors show on the form.
- README.md covers what the system is, setup steps, and the API routes.