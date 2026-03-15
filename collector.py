#!/usr/bin/env python3
"""
Monafasa Atomic AI Context Collector v3.0
==========================================
Splits a large Laravel project into lean, numbered Markdown chunks (≤180 KB each).

KEY FEATURES:
  ✦ Global sequential numbering (01, 02, 03...) across ALL output files
  ✦ Category-based parts (Config, Models, Controllers, etc.)
  ✦ Feature-based smart bundles (User, Payment, Order, etc.)
  ✦ Full directory trees + embedded configs in the master map
  ✦ The AI reads the map → asks for file by number → gets exactly what it needs

Usage:
    python collector.py            # run from the Laravel project root
    python collector.py /path/to   # or pass the project root explicitly
"""

import os
import re
import sys
import glob
import shutil
import subprocess
import datetime
import platform
import textwrap
from pathlib import Path
from collections import defaultdict

# ──────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────
MAX_FILE_BYTES = 180 * 1024  # 180 KB hard ceiling
MIN_FEATURE_FILES = 3        # Minimum files to create a feature bundle
MIN_FEATURE_DIRS = 2         # Must come from at least 2 different directories

OUTPUT_DIR_NAME = "files-collector"

IGNORE_DIRS = {
    "vendor", "node_modules", "storage", ".git", "bootstrap/cache",
    "public", "dist", ".idea", ".vscode", "__pycache__", OUTPUT_DIR_NAME,
}

IGNORE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".ico",
    ".zip", ".rar", ".tar", ".gz", ".7z",
    ".exe", ".dll", ".so", ".dylib",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".bak", ".log", ".lock",
    ".mp3", ".mp4", ".avi", ".mov", ".mkv", ".wav", ".flac",
    ".ttf", ".woff", ".woff2", ".eot", ".otf",
    ".sqlite", ".db", ".map",
}

ALLOWED_EXTENSIONS = {
    ".php", ".js", ".ts", ".jsx", ".tsx", ".vue",
    ".env", ".json", ".yaml", ".yml",
    ".css", ".scss", ".less",
    ".md", ".txt", ".xml", ".html",
    ".sh", ".bash",
}

# Directories to show full tree in the map
MAP_TREE_DIRS = [
    "app/Models", "app/Http", "app/Services", "app/Actions",
    "app/Traits", "app/Concerns", "app/Events", "app/Listeners",
    "app/Jobs", "app/Mail", "app/Notifications", "app/Observers",
    "app/Policies", "app/Rules", "app/Enums", "app/Casts",
    "app/Exceptions", "app/Helpers", "app/Providers", "app/Console",
    "app/Http/Resources", "app/Repositories",
    "bootstrap", "config",
    "database/migrations", "database/seeders", "database/factories",
    "routes", "tests",
]

# Files to embed full content in the map
MAP_EMBED_FILES = [
    "composer.json", "phpunit.xml", "phpunit.xml.dist", ".env.example",
]

# ──────────────────────────────────────────────
# LARAVEL SUFFIXES & PREFIXES FOR ENTITY EXTRACTION
# ──────────────────────────────────────────────
LARAVEL_SUFFIXES = [
    "Controller", "Service", "Repository", "Request", "Resource",
    "Observer", "Policy", "Event", "Listener", "Job", "Notification",
    "Mail", "Mailable", "Action", "Test", "Factory", "Seeder",
    "Migration", "Middleware", "Provider", "Command", "Rule",
    "Trait", "Concern", "Cast", "Enum", "Scope", "Filter",
    "Transformer", "Handler", "Manager", "Helper", "Facade",
    "Interface", "Contract", "Exception", "Collection",
]

LARAVEL_PREFIXES = [
    "Create", "Update", "Delete", "Store", "Destroy",
    "Show", "Get", "Set", "Process", "Handle", "Send",
    "Notify", "Dispatch", "Queue", "Manage", "Validate",
    "Authorize", "Generate", "Export", "Import", "Sync",
    "Fetch", "List", "Search", "Filter", "Sort",
]

# Words too generic to be features
GENERIC_WORDS = {
    "base", "abstract", "app", "application", "kernel", "http",
    "auth", "authenticate", "authenticated", "web", "home", "index",
    "main", "test", "console", "exception", "handler", "helper",
    "middleware", "provider", "service", "route", "model",
    "controller", "request", "resource", "factory", "seeder",
    "migration", "event", "listener", "job", "mail", "notification",
    "bootstrap", "config", "database", "general", "common", "shared",
    "util", "utils", "utility", "trait", "concern", "interface",
    "contract", "enum", "cast", "rule",
}

# ──────────────────────────────────────────────
# THE 20-CATEGORY PLAN
# ──────────────────────────────────────────────

def _starts(rel: str, prefix: str):
    return rel.replace("\\", "/").startswith(prefix)


CATEGORIES = [
    ("Config", "Configuration files (config/, .env*, composer.json, package.json, etc.)",
     lambda r: (
         _starts(r, "config/") or
         r in ("composer.json", "package.json", "phpunit.xml", "phpunit.xml.dist",
                "tsconfig.json", "vite.config.js", "vite.config.ts", "webpack.mix.js",
                "tailwind.config.js", "postcss.config.js", ".env.example") or
         (r.startswith(".env") and not r.endswith(".bak"))
     )),

    ("Migrations_Seeders", "Database migrations, seeders, and factories.",
     lambda r: _starts(r, "database/")),

    ("Models_Enums", "Eloquent models, enums, and casts.",
     lambda r: _starts(r, "app/Models/") or _starts(r, "app/Enums/") or _starts(r, "app/Casts/")),

    ("Routes", "Route definitions.",
     lambda r: _starts(r, "routes/")),

    ("Controllers_Core", "Core, API, and general web controllers.",
     lambda r: _starts(r, "app/Http/Controllers/") and "/Admin/" not in r.replace("\\", "/")),

    ("Controllers_Admin", "Admin-area controllers.",
     lambda r: _starts(r, "app/Http/Controllers/") and "/Admin/" in r.replace("\\", "/")),

    ("Services", "Service classes and business logic layers.",
     lambda r: _starts(r, "app/Services/") or _starts(r, "app/Repositories/")),

    ("Actions_Traits", "Single-action classes and reusable traits.",
     lambda r: _starts(r, "app/Actions/") or _starts(r, "app/Traits/") or _starts(r, "app/Concerns/")),

    ("Requests_Middleware", "Form request validators and HTTP middleware.",
     lambda r: _starts(r, "app/Http/Requests/") or _starts(r, "app/Http/Middleware/") or r == "app/Http/Kernel.php"),

    ("Providers_Console", "Service providers, console commands, and kernel.",
     lambda r: _starts(r, "app/Providers/") or _starts(r, "app/Console/")),

    ("Jobs_Events", "Queued jobs, events, and listeners.",
     lambda r: _starts(r, "app/Jobs/") or _starts(r, "app/Events/") or _starts(r, "app/Listeners/")),

    ("Notifications_Mail", "Notification classes, mailables, and markdown mail templates.",
     lambda r: _starts(r, "app/Notifications/") or _starts(r, "app/Mail/") or
     _starts(r, "resources/views/emails/") or _starts(r, "resources/views/mail/")),

    ("Tests", "Feature and unit tests.",
     lambda r: _starts(r, "tests/")),

    ("Resources_Views", "Blade templates and view resources.",
     lambda r: _starts(r, "resources/views/") and not _starts(r, "resources/views/emails/") and
     not _starts(r, "resources/views/mail/")),

    ("Frontend_JS", "JavaScript, TypeScript, and Vue components.",
     lambda r: _starts(r, "resources/js/") or _starts(r, "resources/ts/") or
     _starts(r, "resources/css/") or _starts(r, "resources/sass/") or _starts(r, "resources/scss/")),

    ("Observers_Policies", "Model observers, policies, and gates.",
     lambda r: _starts(r, "app/Observers/") or _starts(r, "app/Policies/")),

    ("Exceptions_Helpers", "Exception handlers and helper files.",
     lambda r: _starts(r, "app/Exceptions/") or _starts(r, "app/Helpers/") or r == "app/helpers.php"),

    ("API_Resources", "Eloquent API resources and transformers.",
     lambda r: _starts(r, "app/Http/Resources/") or _starts(r, "app/Transformers/")),

    ("Rules_Validation", "Custom validation rules.",
     lambda r: _starts(r, "app/Rules/")),

    ("Misc", "Everything else that didn't fit the categories above.",
     lambda r: True),
]

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def should_ignore_dir(dirname: str) -> bool:
    return dirname in IGNORE_DIRS or dirname.startswith(".")


def is_allowed_file(rel_path: str) -> bool:
    lower = rel_path.lower()
    for ext in IGNORE_EXTENSIONS:
        if lower.endswith(ext):
            return False
    for ext in ALLOWED_EXTENSIONS:
        if lower.endswith(ext):
            return True
    basename = os.path.basename(lower)
    return basename.startswith(".env")


def read_file_safe(filepath: str) -> str:
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception as e:
        return f"[ERROR READING FILE: {e}]"


def collect_files(project_root: str) -> list[str]:
    collected = []
    root = Path(project_root).resolve()
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not should_ignore_dir(d)]
        for fname in filenames:
            full = os.path.join(dirpath, fname)
            rel = os.path.relpath(full, root).replace("\\", "/")
            if is_allowed_file(rel):
                collected.append(rel)
    collected.sort()
    return collected


def categorise(files: list[str]) -> list[tuple[str, str, list[str]]]:
    """Returns list of (cat_name, cat_desc, [files]) in order. Skips empty."""
    buckets = []
    used = set()

    for cat_name, cat_desc, match_fn in CATEGORIES:
        if cat_name == "Misc":
            continue
        matched = []
        for rel in files:
            if rel not in used and match_fn(rel):
                matched.append(rel)
                used.add(rel)
        if matched:
            matched.sort()
            buckets.append((cat_name, cat_desc, matched))

    # Catch-all misc
    misc = [rel for rel in files if rel not in used]
    if misc:
        misc.sort()
        misc_desc = next(d for n, d, _ in CATEGORIES if n == "Misc")
        buckets.append(("Misc", misc_desc, misc))

    return buckets


# ──────────────────────────────────────────────
# FEATURE DETECTION & ENTITY EXTRACTION
# ──────────────────────────────────────────────

def extract_entity(rel_path: str) -> str | None:
    """
    Extract the core 'entity' name from a file path.
    e.g. app/Http/Controllers/UserController.php → 'User'
         app/Services/PaymentGatewayService.php  → 'Payment'
         app/Models/User.php                     → 'User'
         database/migrations/2024_create_users_table.php → 'User'
    Returns None if no meaningful entity found.
    """
    basename = os.path.basename(rel_path)
    name, _ = os.path.splitext(basename)

    # Handle .blade.php
    if name.endswith(".blade"):
        name = name[:-6]

    # Skip files that are clearly not entity-related
    if name.startswith("_") or name.startswith("."):
        return None

    # For migrations: extract from "create_XXXX_table" or "add_XXXX_to_YYYY"
    if "migrations" in rel_path.lower():
        # Remove date prefix like 2024_01_01_000000_
        cleaned = re.sub(r'^\d{4}_\d{2}_\d{2}_\d{6}_', '', name)
        # Try patterns like "create_users_table", "add_role_to_users_table"
        m = re.search(r'(?:create|modify|update|alter|add\w*to)_(\w+?)(?:_table)?$', cleaned)
        if m:
            entity = m.group(1)
            # Singularize simple cases
            if entity.endswith('ies'):
                entity = entity[:-3] + 'y'
            elif entity.endswith('ses'):
                entity = entity[:-2]
            elif entity.endswith('s') and not entity.endswith('ss'):
                entity = entity[:-1]
            return entity.capitalize() if entity.lower() not in GENERIC_WORDS else None
        return None

    original_name = name

    # Strip Laravel suffixes
    for suffix in sorted(LARAVEL_SUFFIXES, key=len, reverse=True):
        if name.endswith(suffix) and len(name) > len(suffix):
            name = name[:-len(suffix)]
            break

    # Strip Laravel prefixes
    for prefix in sorted(LARAVEL_PREFIXES, key=len, reverse=True):
        if name.startswith(prefix) and len(name) > len(prefix):
            # Only strip if next char is uppercase (CamelCase boundary)
            remaining = name[len(prefix):]
            if remaining and remaining[0].isupper():
                name = remaining
                break

    # Split CamelCase and take the first meaningful word(s)
    # e.g. "PaymentGateway" → "Payment", "UserProfile" → "User"
    words = re.findall(r'[A-Z][a-z]+|[a-z]+|[A-Z]+(?=[A-Z][a-z]|\d|\b)', name)
    if not words:
        return None

    # The entity is typically the first 1-2 words
    entity = words[0]

    # Check if it's too generic
    if entity.lower() in GENERIC_WORDS:
        if len(words) > 1:
            entity = words[0] + words[1]
            if entity.lower() in GENERIC_WORDS:
                return None
        else:
            return None

    # Minimum length check
    if len(entity) < 3:
        return None

    return entity


def detect_features(files: list[str]) -> dict[str, list[str]]:
    """
    Analyze all files and group them by detected entity/feature.
    Only returns features with MIN_FEATURE_FILES+ files from MIN_FEATURE_DIRS+ dirs.
    """
    entity_files: dict[str, list[str]] = defaultdict(list)

    for rel in files:
        entity = extract_entity(rel)
        if entity:
            entity_files[entity.lower()].append(rel)

    # Filter: need enough files from enough different directories
    valid_features: dict[str, list[str]] = {}

    for entity_lower, matched_files in entity_files.items():
        if len(matched_files) < MIN_FEATURE_FILES:
            continue

        dirs = set()
        for f in matched_files:
            # Get the "type" directory (e.g., Controllers, Models, Services)
            parts = f.replace("\\", "/").split("/")
            if len(parts) >= 2:
                dirs.add(parts[1] if parts[0] == "app" and len(parts) >= 3 else parts[0])

        if len(dirs) >= MIN_FEATURE_DIRS:
            # Capitalize nicely
            display_name = entity_lower.capitalize()
            matched_files.sort()
            valid_features[display_name] = matched_files

    return dict(sorted(valid_features.items()))


# ──────────────────────────────────────────────
# PHP / ROUTE LIST HELPERS
# ──────────────────────────────────────────────

def _find_php() -> str:
    found = shutil.which("php")
    if found:
        return found

    if platform.system() == "Windows":
        common_paths = [
            r"C:\xampp\php\php.exe",
            r"C:\laragon\bin\php\php-8.3*\php.exe",
            r"C:\laragon\bin\php\php-8.2*\php.exe",
            r"C:\laragon\bin\php\php-8.1*\php.exe",
            r"C:\laragon\bin\php\php-8.0*\php.exe",
            r"C:\wamp64\bin\php\php8*\php.exe",
            r"C:\wamp\bin\php\php8*\php.exe",
            r"C:\php\php.exe",
            r"C:\tools\php\php.exe",
            os.path.expanduser(r"~\scoop\apps\php\current\php.exe"),
            os.path.expanduser(r"~\.config\herd\bin\php.exe"),
            os.path.expanduser(r"~\AppData\Local\Programs\php\php.exe"),
        ]
        for pattern in common_paths:
            matches = glob.glob(pattern)
            if matches:
                matches.sort()
                return matches[-1]
        try:
            result = subprocess.run(
                ["where", "php"], capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().splitlines()[0]
        except Exception:
            pass

    return "php"


def _run_php(php_path: str, args: list[str], cwd: str, timeout: int = 60):
    """Try multiple strategies to run PHP."""
    # Strategy 1: Direct
    cmd = [php_path] + args
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=cwd)
        if r.returncode == 0:
            return r
    except (FileNotFoundError, Exception):
        pass

    # Strategy 2: shell=True
    try:
        shell_cmd = f'"{php_path}" ' + " ".join(args)
        r = subprocess.run(shell_cmd, capture_output=True, text=True,
                           timeout=timeout, cwd=cwd, shell=True)
        if r.returncode == 0:
            return r
    except Exception:
        pass

    # Strategy 3: PowerShell (Windows)
    if platform.system() == "Windows":
        try:
            ps_cmd = f'php {" ".join(args)}'
            r = subprocess.run(
                ["powershell", "-NoProfile", "-Command", ps_cmd],
                capture_output=True, text=True, timeout=timeout, cwd=cwd,
            )
            if r.returncode == 0:
                return r
        except Exception:
            pass

    try:
        return r  # type: ignore
    except NameError:
        return subprocess.CompletedProcess(args=cmd, returncode=1, stdout="", stderr="All strategies failed.")


def get_route_list(project_root: str) -> str:
    php = _find_php()
    try:
        print(f"  → Using PHP: {php}")
        print(f"  → Running optimize:clear first...")
        cr = _run_php(php, ["artisan", "optimize:clear"], project_root, 30)
        if cr.returncode == 0:
            print(f"  ✓ optimize:clear succeeded.")
        else:
            print(f"  ⚠ optimize:clear failed, continuing...")

        print(f"  → Running route:list...")
        r = _run_php(php, ["artisan", "route:list", "--columns=method,uri,name,middleware"],
                     project_root, 60)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout.strip()
        else:
            msg = r.stderr.strip() if r.stderr.strip() else "No output."
            return f"[Could not generate route list: {msg}]"
    except subprocess.TimeoutExpired:
        return "[php artisan route:list timed out after 60s]"
    except Exception as e:
        return f"[Error: {e}] [PHP path: {php}]"


# ──────────────────────────────────────────────
# DIRECTORY TREE GENERATOR
# ──────────────────────────────────────────────

def generate_dir_tree(project_root: str, target_dir: str) -> str:
    full_path = os.path.join(project_root, target_dir)
    if not os.path.isdir(full_path):
        return f"  [Directory not found: {target_dir}/]"

    lines = []
    file_count = 0
    total_bytes = 0

    for dirpath, dirnames, filenames in os.walk(full_path):
        dirnames[:] = sorted([d for d in dirnames if not should_ignore_dir(d)])
        filenames = sorted(filenames)
        rel_dir = os.path.relpath(dirpath, full_path).replace("\\", "/")
        depth = 0 if rel_dir == "." else rel_dir.count("/") + 1

        if rel_dir != ".":
            indent = "│   " * (depth - 1) + "├── "
            lines.append(f"{indent}{os.path.basename(dirpath)}/")

        for fname in filenames:
            full_file = os.path.join(dirpath, fname)
            skip = any(fname.lower().endswith(ext) for ext in IGNORE_EXTENSIONS)
            if skip:
                continue
            try:
                fsize = os.path.getsize(full_file)
            except OSError:
                fsize = 0
            total_bytes += fsize
            file_count += 1
            size_str = f"{round(fsize / 1024, 1)} KB" if fsize >= 1024 else f"{fsize} B"
            indent = "│   " * depth + "├── "
            lines.append(f"{indent}{fname}  ({size_str})")

    if not lines:
        return f"  [Empty or no matching files in {target_dir}/]"

    return "\n".join(lines) + f"\n\n  → {file_count} files, ~{round(total_bytes / 1024, 1)} KB total"


# ──────────────────────────────────────────────
# FILE BLOCK BUILDER
# ──────────────────────────────────────────────

def build_file_block(rel_path: str, project_root: str) -> str:
    full = os.path.join(project_root, rel_path)
    content = read_file_safe(full)
    ext = os.path.splitext(rel_path)[1].lstrip(".")
    if rel_path.endswith(".blade.php"):
        ext = "blade.php"
    return f"## `{rel_path}`\n\n```{ext}\n{content}\n```\n\n---\n\n"


# ──────────────────────────────────────────────
# PART WRITER (with global sequential numbering)
# ──────────────────────────────────────────────

class SequentialWriter:
    """Manages global sequential numbering across all output files."""

    def __init__(self, output_dir: str, project_root: str, timestamp: str):
        self.output_dir = output_dir
        self.project_root = project_root
        self.timestamp = timestamp
        self.next_num = 1
        self.all_outputs: list[dict] = []  # master registry

    def _make_header(self, global_num: int, title: str, description: str,
                     cat_id: str = "", part_info: str = "") -> str:
        num_str = f"{global_num:02d}"
        part_label = f" {part_info}" if part_info else ""
        cat_label = f" [Category: {cat_id}]" if cat_id else ""
        return textwrap.dedent(f"""\
        # {num_str} – {title}{part_label}

        > **Description:** {description}{cat_label}
        > **Generated:** {self.timestamp}

        ---

        """)

    def write_category(self, cat_name: str, cat_desc: str,
                       file_rels: list[str], cat_index: int) -> list[dict]:
        """
        Write one category. May produce multiple files if content > 180KB.
        Uses global sequential numbering.
        Returns list of output metadata dicts.
        """
        if not file_rels:
            return []

        # Build all blocks
        blocks = [(rel, build_file_block(rel, self.project_root)) for rel in file_rels]
        total_size = sum(len(b.encode("utf-8")) for _, b in blocks)
        header_overhead = 300  # approximate

        # Determine how many parts needed
        est_parts = max(1, -(-total_size // (MAX_FILE_BYTES - header_overhead)))

        # Split into chunks
        chunks: list[list[tuple[str, str]]] = []
        current_chunk: list[tuple[str, str]] = []
        current_size = 0

        for rel, block in blocks:
            block_bytes = len(block.encode("utf-8"))
            if current_size + block_bytes + header_overhead > MAX_FILE_BYTES and current_chunk:
                chunks.append(current_chunk)
                current_chunk = []
                current_size = 0
            current_chunk.append((rel, block))
            current_size += block_bytes
        if current_chunk:
            chunks.append(current_chunk)

        total_parts = len(chunks)
        cat_id = f"C{cat_index:02d}"
        results = []

        for part_idx, chunk in enumerate(chunks, 1):
            global_num = self.next_num
            self.next_num += 1

            if total_parts == 1:
                fname = f"{global_num:02d}-{cat_name}.md"
                part_info = ""
            else:
                fname = f"{global_num:02d}-{cat_name}-{cat_id}-p{part_idx}of{total_parts}.md"
                part_info = f"(Part {part_idx}/{total_parts} of {cat_name})"

            header = self._make_header(global_num, cat_name, cat_desc, cat_id, part_info)
            body = header + "".join(block for _, block in chunk)

            out_path = os.path.join(self.output_dir, fname)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(body)

            file_list = [rel for rel, _ in chunk]
            info = {
                "global_num": global_num,
                "filename": fname,
                "type": "category",
                "cat_name": cat_name,
                "cat_id": cat_id,
                "cat_desc": cat_desc,
                "part": part_idx,
                "total_parts": total_parts,
                "files": len(file_list),
                "size_kb": round(len(body.encode("utf-8")) / 1024, 1),
                "file_list": file_list,
            }
            results.append(info)
            self.all_outputs.append(info)

        return results

    def write_feature_bundle(self, feature_name: str,
                             file_rels: list[str]) -> list[dict]:
        """
        Write a feature bundle. May split if > 180KB.
        """
        if not file_rels:
            return []

        desc = f"All files related to the '{feature_name}' feature across the entire project."
        blocks = [(rel, build_file_block(rel, self.project_root)) for rel in file_rels]
        total_size = sum(len(b.encode("utf-8")) for _, b in blocks)
        header_overhead = 300

        chunks: list[list[tuple[str, str]]] = []
        current_chunk: list[tuple[str, str]] = []
        current_size = 0

        for rel, block in blocks:
            block_bytes = len(block.encode("utf-8"))
            if current_size + block_bytes + header_overhead > MAX_FILE_BYTES and current_chunk:
                chunks.append(current_chunk)
                current_chunk = []
                current_size = 0
            current_chunk.append((rel, block))
            current_size += block_bytes
        if current_chunk:
            chunks.append(current_chunk)

        total_parts = len(chunks)
        results = []

        for part_idx, chunk in enumerate(chunks, 1):
            global_num = self.next_num
            self.next_num += 1

            if total_parts == 1:
                fname = f"{global_num:02d}-Feature_{feature_name}.md"
                part_info = ""
            else:
                fname = f"{global_num:02d}-Feature_{feature_name}-p{part_idx}of{total_parts}.md"
                part_info = f"(Part {part_idx}/{total_parts} of Feature: {feature_name})"

            header = self._make_header(global_num, f"Feature: {feature_name}", desc, "", part_info)
            body = header + "".join(block for _, block in chunk)

            out_path = os.path.join(self.output_dir, fname)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(body)

            file_list = [rel for rel, _ in chunk]
            info = {
                "global_num": global_num,
                "filename": fname,
                "type": "feature",
                "feature_name": feature_name,
                "cat_name": f"Feature_{feature_name}",
                "cat_desc": desc,
                "part": part_idx,
                "total_parts": total_parts,
                "files": len(file_list),
                "size_kb": round(len(body.encode("utf-8")) / 1024, 1),
                "file_list": file_list,
            }
            results.append(info)
            self.all_outputs.append(info)

        return results


# ──────────────────────────────────────────────
# MASTER MAP BUILDER
# ──────────────────────────────────────────────

def build_master_map(output_dir: str, writer: SequentialWriter,
                     route_list: str, timestamp: str, project_root: str,
                     total_files: int, features: dict[str, list[str]]):
    lines: list[str] = []
    all_outputs = writer.all_outputs

    # ── Header ──
    lines.append("# 00 – Monafasa Project Map (Master Reference)\n\n")
    lines.append(f"> **Generated:** {timestamp}  \n")
    lines.append(f"> **Project Root:** `{project_root}`  \n")
    lines.append(f"> **Total Source Files:** {total_files}  \n")
    lines.append(f"> **Total Output Files:** {len(all_outputs)}  \n")
    cat_count = sum(1 for o in all_outputs if o['type'] == 'category')
    feat_count = sum(1 for o in all_outputs if o['type'] == 'feature')
    lines.append(f"> **Category Parts:** {cat_count} | **Feature Bundles:** {feat_count}  \n\n")
    lines.append("---\n\n")

    # ── How to Use ──
    lines.append("## 📖 How to Use This Map\n\n")
    lines.append("This file is the **complete project reference**. Upload it FIRST.\n\n")
    lines.append("### Numbering System\n\n")
    lines.append("Every output file has a **unique sequential number** (01, 02, 03...).  \n")
    lines.append("If a category is too large, it splits into numbered parts:\n\n")
    lines.append("```\n")
    lines.append("05-Controllers_Core.md              ← Single file (fits in 180KB)\n")
    lines.append("08-Services-C07-p1of3.md             ← Services Part 1 of 3\n")
    lines.append("09-Services-C07-p2of3.md             ← Services Part 2 of 3\n")
    lines.append("10-Services-C07-p3of3.md             ← Services Part 3 of 3\n")
    lines.append("```\n\n")
    lines.append("### Two Ways to Access Code\n\n")
    lines.append("1. **By Category** – Ask for a numbered category part (e.g., `05-Controllers_Core.md`)  \n")
    lines.append("   → Gets you ALL controllers, or ALL models, etc.\n\n")
    lines.append("2. **By Feature** – Ask for a feature bundle (e.g., `25-Feature_User.md`)  \n")
    lines.append("   → Gets you EVERYTHING related to User: Model, Controller, Service, ")
    lines.append("Request, Migration, Tests, Views... all in one file.\n\n")
    lines.append("### What's in This Map\n\n")
    lines.append("1. **Table of Contents** – Every output file with size\n")
    lines.append("2. **Feature Bundles Index** – Cross-cutting feature groups\n")
    lines.append("3. **Full Directory Trees** – Structure of every important folder\n")
    lines.append("4. **Embedded Configs** – composer.json, phpunit.xml, .env.example in full\n")
    lines.append("5. **Route List** – Full `php artisan route:list` output\n")
    lines.append("6. **Complete File Index** – Every file → its output part number\n\n")
    lines.append("---\n\n")

    # ══════════════════════════════════════════
    # 1. TABLE OF CONTENTS
    # ══════════════════════════════════════════
    lines.append("## 1. 📂 Table of Contents\n\n")

    # Category parts
    lines.append("### Category Parts\n\n")
    lines.append("| # | File | Category | Part | Files | Size |\n")
    lines.append("|--:|------|----------|------|------:|-----:|\n")
    for o in all_outputs:
        if o['type'] == 'category':
            part_str = f"p{o['part']}/{o['total_parts']}" if o['total_parts'] > 1 else "—"
            lines.append(f"| {o['global_num']:02d} | `{o['filename']}` | {o['cat_name']} "
                         f"| {part_str} | {o['files']} | {o['size_kb']} KB |\n")

    lines.append("\n")

    # Feature bundles
    if feat_count > 0:
        lines.append("### Feature Bundles\n\n")
        lines.append("| # | File | Feature | Files | Size |\n")
        lines.append("|--:|------|---------|------:|-----:|\n")
        for o in all_outputs:
            if o['type'] == 'feature':
                fname = o.get('feature_name', '')
                lines.append(f"| {o['global_num']:02d} | `{o['filename']}` | {fname} "
                             f"| {o['files']} | {o['size_kb']} KB |\n")
        lines.append("\n")

    total_size = sum(o['size_kb'] for o in all_outputs)
    lines.append(f"**Grand Total: {len(all_outputs)} files, ~{round(total_size, 1)} KB**\n\n")
    lines.append("---\n\n")

    # ══════════════════════════════════════════
    # 2. FEATURE BUNDLES DETAIL
    # ══════════════════════════════════════════
    if features:
        lines.append("## 2. 🔗 Feature Bundles Detail\n\n")
        lines.append("Each feature bundle collects ALL files related to a specific entity ")
        lines.append("from across the entire project (Model + Controller + Service + Request ")
        lines.append("+ Migration + Tests + Views, etc.).\n\n")

        for feat_name, feat_files in features.items():
            # Find the output file(s) for this feature
            feat_outputs = [o for o in all_outputs
                            if o['type'] == 'feature' and o.get('feature_name') == feat_name]
            output_names = ", ".join(f"`{o['filename']}`" for o in feat_outputs)

            lines.append(f"### 🏷️ {feat_name} ({len(feat_files)} files) → {output_names}\n\n")

            # Group by directory
            by_dir: dict[str, list[str]] = defaultdict(list)
            for f in feat_files:
                parts = f.replace("\\", "/").split("/")
                if len(parts) >= 2:
                    dir_key = "/".join(parts[:-1])
                else:
                    dir_key = "."
                by_dir[dir_key].append(os.path.basename(f))

            for dir_key in sorted(by_dir.keys()):
                files_in_dir = by_dir[dir_key]
                lines.append(f"- `{dir_key}/`: {', '.join(f'`{f}`' for f in files_in_dir)}\n")
            lines.append("\n")

        lines.append("---\n\n")
    else:
        lines.append("## 2. 🔗 Feature Bundles\n\n")
        lines.append("*No cross-cutting features detected (need 3+ files from 2+ directories).*\n\n")
        lines.append("---\n\n")

    # ══════════════════════════════════════════
    # 3. DIRECTORY TREES
    # ══════════════════════════════════════════
    lines.append("## 3. 🌳 Directory Trees (Full Structure)\n\n")

    for tree_dir in MAP_TREE_DIRS:
        full_dir = os.path.join(project_root, tree_dir)
        if not os.path.isdir(full_dir):
            continue
        lines.append(f"### 📁 `{tree_dir}/`\n\n```\n")
        lines.append(generate_dir_tree(project_root, tree_dir))
        lines.append("\n```\n\n")

    lines.append("---\n\n")

    # ══════════════════════════════════════════
    # 4. EMBEDDED CONFIG FILES
    # ══════════════════════════════════════════
    lines.append("## 4. 📄 Key Configuration Files (Full Content)\n\n")

    embedded = 0
    for embed_file in MAP_EMBED_FILES:
        full_path = os.path.join(project_root, embed_file)
        if os.path.isfile(full_path):
            content = read_file_safe(full_path)
            ext = os.path.splitext(embed_file)[1].lstrip(".") or "text"
            size_kb = round(len(content.encode("utf-8")) / 1024, 1)
            lines.append(f"### `{embed_file}` ({size_kb} KB)\n\n```{ext}\n")
            lines.append(content)
            if not content.endswith("\n"):
                lines.append("\n")
            lines.append("```\n\n")
            embedded += 1

    if not embedded:
        lines.append("*No config files found to embed.*\n\n")
    lines.append("---\n\n")

    # ══════════════════════════════════════════
    # 5. ROUTE LIST
    # ══════════════════════════════════════════
    lines.append("## 5. 🛣️ Route List\n\n")
    lines.append("Also saved as `route-list.txt`.\n\n```\n")
    lines.append(route_list)
    lines.append("\n```\n\n---\n\n")

    # ══════════════════════════════════════════
    # 6. COMPLETE FILE INDEX
    # ══════════════════════════════════════════
    lines.append("## 6. 🗂️ Complete File Index\n\n")
    lines.append("Every source file → its output part. A file may appear in BOTH a category ")
    lines.append("part AND a feature bundle.\n\n")

    # Build reverse index: file → list of output filenames
    file_to_outputs: dict[str, list[str]] = defaultdict(list)
    for o in all_outputs:
        for f in o.get("file_list", []):
            file_to_outputs[f].append(f"#{o['global_num']:02d} `{o['filename']}`")

    lines.append("| # | File Path | Found In |\n")
    lines.append("|--:|-----------|----------|\n")
    all_indexed_files = sorted(file_to_outputs.keys())
    for idx, fpath in enumerate(all_indexed_files, 1):
        outputs_str = " ‧ ".join(file_to_outputs[fpath])
        lines.append(f"| {idx} | `{fpath}` | {outputs_str} |\n")

    lines.append(f"\n**Total: {len(all_indexed_files)} unique files indexed.**\n\n")
    lines.append("---\n\n")
    lines.append("*End of Project Map – Monafasa Atomic AI Context Collector v3.0*\n")

    content = "".join(lines)
    out_path = os.path.join(output_dir, "00-Project_Map.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    size_kb = round(len(content.encode("utf-8")) / 1024, 1)
    print(f"  ✓ 00-Project_Map.md ({size_kb} KB)")
    return size_kb


def export_route_list(output_dir: str, route_list: str):
    out_path = os.path.join(output_dir, "route-list.txt")
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"# Monafasa Route List\n# Generated: {ts}\n")
        f.write(f"# Command: php artisan route:list --columns=method,uri,name,middleware\n")
        f.write("#" + "=" * 70 + "\n\n")
        f.write(route_list + "\n")
    size_kb = round(os.path.getsize(out_path) / 1024, 1)
    print(f"  ✓ route-list.txt ({size_kb} KB)")


# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────

def main():
    project_root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    project_root = os.path.abspath(project_root)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print()
    print("╔═══════════════════════════════════════════════════════╗")
    print("║   Monafasa Atomic AI Context Collector v3.0           ║")
    print("╠═══════════════════════════════════════════════════════╣")
    print("║   ✦ Global Sequential Numbering (01, 02, 03...)      ║")
    print("║   ✦ Category Parts (Models, Controllers, Services)   ║")
    print("║   ✦ Feature Bundles (User, Payment, Order, etc.)     ║")
    print("║   ✦ Full Directory Trees + Embedded Configs           ║")
    print("║   ✦ Complete File Index in Master Map                 ║")
    print("╚═══════════════════════════════════════════════════════╝")
    print(f"  Project Root : {project_root}")
    print(f"  Timestamp    : {timestamp}")
    print(f"  Max Part Size: {MAX_FILE_BYTES // 1024} KB")
    print()

    # Prepare output
    output_dir = os.path.join(project_root, OUTPUT_DIR_NAME)
    if os.path.exists(output_dir):
        for f in os.listdir(output_dir):
            fp = os.path.join(output_dir, f)
            if os.path.isfile(fp) and (f.endswith(".md") or f.endswith(".txt")):
                os.remove(fp)
    else:
        os.makedirs(output_dir)

    # ── Step 1: Collect ──
    print("[1/6] Scanning project files...")
    all_files = collect_files(project_root)
    print(f"  Found {len(all_files)} source files.\n")

    # ── Step 2: Categorise ──
    print("[2/6] Categorising into atomic parts...")
    buckets = categorise(all_files)
    for cat_name, _, files in buckets:
        print(f"  {cat_name}: {len(files)} files")
    print()

    # ── Step 3: Detect features ──
    print("[3/6] Detecting cross-cutting features...")
    features = detect_features(all_files)
    if features:
        for feat_name, feat_files in features.items():
            dirs = set()
            for f in feat_files:
                parts = f.replace("\\", "/").split("/")
                if len(parts) >= 3 and parts[0] == "app":
                    dirs.add(parts[1])
                elif len(parts) >= 2:
                    dirs.add(parts[0])
            print(f"  🔗 {feat_name}: {len(feat_files)} files across {len(dirs)} directories")
    else:
        print("  No cross-cutting features detected.")
    print()

    # ── Step 4: Route list ──
    print("[4/6] Running php artisan route:list...")
    route_list = get_route_list(project_root)
    if route_list.startswith("["):
        print(f"  ⚠ {route_list}")
    else:
        print(f"  ✓ Captured {len(route_list.splitlines())} lines.")
    print()

    # ── Step 5: Write everything ──
    print("[5/6] Writing output files with sequential numbering...")
    writer = SequentialWriter(output_dir, project_root, timestamp)

    # A) Category parts (numbered 01, 02, 03...)
    print("\n  ─── Category Parts ───")
    for cat_idx, (cat_name, cat_desc, cat_files) in enumerate(buckets, 1):
        results = writer.write_category(cat_name, cat_desc, cat_files, cat_idx)
        for r in results:
            part_str = f" p{r['part']}/{r['total_parts']}" if r['total_parts'] > 1 else ""
            print(f"  ✓ #{r['global_num']:02d} {r['filename']} "
                  f"({r['files']} files, {r['size_kb']} KB){part_str}")

    # B) Feature bundles (continue numbering)
    if features:
        print("\n  ─── Feature Bundles ───")
        for feat_name, feat_files in features.items():
            results = writer.write_feature_bundle(feat_name, feat_files)
            for r in results:
                print(f"  ✓ #{r['global_num']:02d} {r['filename']} "
                      f"({r['files']} files, {r['size_kb']} KB)")

    # Route list file
    export_route_list(output_dir, route_list)
    print()

    # ── Step 6: Master Map ──
    print("[6/6] Building Master Map...")
    for d in MAP_TREE_DIRS:
        if os.path.isdir(os.path.join(project_root, d)):
            count = sum(1 for _ in Path(os.path.join(project_root, d)).rglob("*") if _.is_file())
            if count > 0:
                print(f"  📁 {d}/ → {count} files")

    map_size = build_master_map(output_dir, writer, route_list, timestamp,
                                project_root, len(all_files), features)
    print()

    # ── Summary ──
    total_output = len(writer.all_outputs) + 2  # +map +route-list
    cat_parts = [o for o in writer.all_outputs if o['type'] == 'category']
    feat_parts = [o for o in writer.all_outputs if o['type'] == 'feature']
    total_size = sum(o['size_kb'] for o in writer.all_outputs) + map_size

    print("═══════════════════════════════════════════════════════")
    print(f"  ✅ DONE!")
    print(f"  Output Directory  : {output_dir}")
    print(f"  Total Output Files: {total_output}")
    print(f"     • Category Parts  : {len(cat_parts)}")
    print(f"     • Feature Bundles : {len(feat_parts)}")
    print(f"     • Master Map      : 1 (00-Project_Map.md)")
    print(f"     • Route List      : 1 (route-list.txt)")
    print(f"  Total Size        : ~{round(total_size, 1)} KB")
    print(f"  Source Files      : {len(all_files)}")
    print("═══════════════════════════════════════════════════════")
    print()
    print("  📋 WORKFLOW:")
    print("  1. Upload  00-Project_Map.md  FIRST to any AI assistant")
    print("  2. The AI reads it → understands everything:")
    print("     • Full directory structure")
    print("     • composer.json / phpunit.xml / .env")
    print("     • Complete route list")
    print("     • Every file indexed with its part number")
    print("  3. The AI asks for what it needs:")
    print('     → "Send me #05 (Controllers_Core)"')
    print('     → "Send me #25 (Feature_User)"')
    print("  4. You upload only what's requested. Zero waste!")
    print()
    if features:
        print("  🔗 DETECTED FEATURES:")
        for feat_name, feat_files in features.items():
            feat_out = [o for o in writer.all_outputs
                        if o['type'] == 'feature' and o.get('feature_name') == feat_name]
            nums = ", ".join(f"#{o['global_num']:02d}" for o in feat_out)
            print(f"     {feat_name} ({len(feat_files)} files) → {nums}")
        print()


if __name__ == "__main__":
    main()
