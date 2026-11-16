# 🎯 Routine Engine 

> ⚠️ **Project Status:** **Experimental MVP / Initial Release (v0.1.0)**
> This project is currently in an early, experimental stage of development. The existing codebase was built to validate the core workflow and get the system up and running in a local environment. It will undergo continuous refactoring, architectural improvements, and feature additions over time.

A lightweight, automated local daily focus management system featuring bidirectional **Obsidian** synchronization and interactive desktop notifications for **Linux (Fedora)**.

Built to eliminate friction between Markdown planning and daily execution, running silently in the background as a native `systemd` user service.

---

## ✨ Features (Current Version)

* **Bidirectional Obsidian Sync:** Parses checklist tasks (`- [ ]` / `- [x]`) directly from `Foco de Hoje.md` into a local database and writes status changes made via the web dashboard back to the Markdown file in real time.
* **Fast Local Persistence:** Uses **SQLite** (`better-sqlite3`) to store the weekly priority schedule and daily execution logs with zero external dependencies or cloud servers.
* **Minimalist Web Dashboard:** A clean, dependency-free HTML/CSS/JS interface served locally via **Express** for quick task tracking and toggling.
* **Interactive Desktop Notifications:** Triggers native Linux alerts via `notify-send` at session startup displaying the day's primary focus and leisure directive. Clicking the notification action automatically opens the web dashboard in your default browser (`xdg-open`).
* **Infrastructure Automation (`systemd`):** Dedicated TypeScript scripts to install, configure, and remove the background daemon in user-space (`systemctl --user`) with a single command.

---

## 🛠️ Tech Stack

* **Runtime & Language:** Node.js + TypeScript (`tsx`)
* **HTTP Server:** Express
* **Database:** SQLite (`better-sqlite3`)
* **Linux Integration:** `notify-send` (libnotify), `xdg-open`, `systemd --user`

---

## 📂 Project Structure

```text
qg-rotina/
├── public/
│   └── index.html              # Minimalist web dashboard UI
├── src/
│   ├── database.ts             # SQLite initialization, schema, and weekly schedule seed
│   ├── sync-md.ts              # Regex parser and bidirectional Obsidian Markdown sync
│   ├── notifier.ts             # Interactive desktop notification dispatcher
│   ├── server.ts               # Express server and REST API routes
│   ├── install-service.ts      # Automated systemd user service setup
│   └── uninstall-service.ts    # Automated systemd service cleanup and removal
├── package.json
└── tsconfig.json

```


## 🚀 Prerequisites

* **Operating System:** Linux (tested on Fedora with KDE Plasma / GNOME)
* **Node.js:** v20+
* **System Utilities:** `libnotify` (`notify-send`) and `xdg-utils` (`xdg-open`), typically pre-installed on most desktop distributions.
* **Obsidian Vault:** A Markdown file located by default at `~/Documentos/QG/00 - Rotina/Foco de Hoje.md` (configurable in `src/sync-md.ts`).

---

## ⚙️ Installation & Usage

1. **Clone the repository and install dependencies:**
```bash
git clone [https://github.com/your-username/qg-rotina.git](https://github.com/your-username/qg-rotina.git)
cd qg-rotina
npm install

```


2. **Adjust your Obsidian vault path (if needed):**
Open `src/sync-md.ts` and update the `VAULT_PATH` constant:
```typescript
const VAULT_PATH = join(homedir(), 'Documentos', 'QG');

```


3. **Expected Markdown format in `Foco de Hoje.md`:**
```markdown
# Foco de Hoje

- [ ] Review route architecture
- [ ] Refactor sync module
- [x] Set up local environment

```


4. **Install as an automated Linux background service:**
```bash
npm run setup-service

```


This script automatically resolves your machine's absolute paths, generates `~/.config/systemd/user/qg-rotina.service`, enables autostart on login, and launches the server on port `3456`.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the server in development mode with hot-reload (`tsx watch`). *(Stop the systemd service first to avoid port conflicts).* |
| `npm run setup-service` | Generates the `.service` file, registers it with `systemd --user`, and starts the app in the background. |
| `npm run remove-service` | Stops the running process, disables autostart, and removes the `.service` unit file from `systemd`. |

---

## 🔌 API Endpoints

* **`GET /api/hoje`**
Syncs the Markdown file into SQLite and returns a JSON payload containing the current day's weekly schedule focus and registered tasks.
* **`PATCH /api/tarefas/:id`**
Accepts `{ "concluida": boolean }`, updates the task status in SQLite, and toggles the matching checkbox inside `Foco de Hoje.md`.

---

## 🖥️ Manual Systemd Management

If you want to inspect logs or control the daemon manually from the terminal:

```bash
# Check service status
systemctl --user status qg-rotina.service

# Follow live logs
journalctl --user -u qg-rotina.service -f

# Restart after manual code changes
systemctl --user restart qg-rotina.service

```

---

## 🗺️ Refactoring Roadmap (Next Steps)

* [ ] Extract file paths and server port into environment variables (`.env`).
* [ ] Add support for editing the weekly schedule directly from the web UI.
* [ ] Implement a file watcher (`fs.watch`) on the Markdown file for instant sync without requiring a page reload.
* [ ] Add unit tests for the Markdown parser and date calculation logic.
