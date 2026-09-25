import os

import sass


def compile_sass() -> str:
    """Compile SASS/SCSS files to static/css/main.css."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    scss_file = os.path.join(base_dir, "static", "scss", "main.scss")
    css_dir = os.path.join(base_dir, "static", "css")
    css_file = os.path.join(css_dir, "main.css")

    os.makedirs(css_dir, exist_ok=True)

    compiled_css = sass.compile(
        filename=scss_file,
        output_style="expanded",
        include_paths=[os.path.join(base_dir, "static", "scss")],
    )

    with open(css_file, "w", encoding="utf-8") as f:
        f.write(compiled_css)

    return css_file


if __name__ == "__main__":
    out = compile_sass()
    print(f"Compiled SASS successfully to {out}")
