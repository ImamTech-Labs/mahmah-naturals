"""Prepare the customer-facing files for static hosting."""

from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "dist"


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    for name in ("index.html", "styles.css", "cart-storage.js", "app.js"):
        shutil.copy2(ROOT / name, OUTPUT / name)
    shutil.copytree(ROOT / "assets", OUTPUT / "assets", dirs_exist_ok=True)


if __name__ == "__main__":
    main()

