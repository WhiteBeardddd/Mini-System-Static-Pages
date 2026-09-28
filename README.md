# Mini-System-Static-Pages

A Networking Lab Equipment Inventory: a small web-based information system for viewing, adding, editing, and deleting lab equipment records (switches, routers, firewalls, cables, and other gear).

This is a school project (BSIT, University of San Carlos). It uses plain HTML/CSS/vanilla JS pages served by a minimal Express server, with records stored in a MySQL database (run locally with XAMPP).

## Setup

1. Install [XAMPP](https://www.apachefriends.org/), open the XAMPP Control Panel, and start **Apache** and **MySQL**.
2. Open http://localhost/phpmyadmin, go to the **Import** tab, choose `database/equipment_db.sql`, and click **Import**. This creates the `equipment_db` database, the `equipment` table, and 3 sample records.
3. Install and run the app:

```bash
git clone https://github.com/WhiteBeardddd/Mini-System-Static-Pages.git
cd Mini-System-Static-Pages
npm install
npm run dev
```

Then open http://localhost:3000. The terminal should print `Connected to MySQL`.

The server uses XAMPP's defaults (`localhost:3306`, user `root`, empty password, database `equipment_db`). Override them with the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables if yours differ.

`npm start` runs the server without file-watching; `npm run dev` restarts on file changes.

By default the server listens on port 3000. Set the `PORT` environment variable to use a different port.

## Pages

- `index.html` — list all equipment, with search (by asset tag or name) and status filter
- `add.html` — add a new equipment record
- `edit.html` — edit an existing record (`?id=...`)
- `view.html` — view record details (`?id=...`)

## Data

Records are stored in the `equipment` table of the `equipment_db` MySQL database (schema in `database/equipment_db.sql`). Columns are snake_case in the database (`asset_tag`, `created_at`, ...) and camelCase in the API. Each record has:

| Field     | Type   | Notes                                        |
|-----------|--------|-----------------------------------------------|
| id        | string | generated with `crypto.randomUUID()`          |
| assetTag  | string | required, unique (case-insensitive)           |
| name      | string | required                                      |
| category  | string | required, e.g. Switch, Router, Firewall, Cable, Other |
| location  | string | optional                                      |
| status    | string | required: `Available`, `In use`, or `Under repair` |
| notes     | string | optional                                      |
| createdAt | string | ISO timestamp, set on create                  |
| updatedAt | string | ISO timestamp, refreshed on edit               |

## API routes

| Method | Route                | Purpose  | Success | Errors                          |
|--------|----------------------|----------|---------|----------------------------------|
| GET    | /api/equipment       | List all | 200     |                                   |
| GET    | /api/equipment/:id   | Get one  | 200     | 404 if not found                 |
| POST   | /api/equipment       | Create   | 201     | 400 validation, 409 duplicate tag |
| PUT    | /api/equipment/:id   | Update   | 200     | 400 validation, 404, 409 duplicate tag |
| DELETE | /api/equipment/:id   | Delete   | 204     | 404 if not found                 |

Errors are returned as JSON: `{ "error": "message" }`.

## Tech stack

- Backend: Node.js + Express (`express.static` for the frontend, a small REST API) with `mysql2`
- Database: MySQL / MariaDB via XAMPP
- Frontend: plain HTML, CSS, and vanilla JavaScript — no framework, no build step
