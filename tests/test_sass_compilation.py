import os

from src.build_assets import compile_sass


def test_sass_compilation_generates_valid_css():
    output_path = compile_sass()
    assert os.path.exists(output_path), "main.css must exist after compilation"

    with open(output_path, "r", encoding="utf-8") as f:
        css = f.read().lower()

    # Verify color palette from docs/styles-context.md
    assert "#0a0a0a" in css, "Base background #0A0A0A must be present"
    assert "#f5f5f4" in css, "Primary text #F5F5F4 must be present"

    # Verify typography
    assert "fraunces" in css, "Display typography Fraunces must be referenced"
    assert "inter" in css, "Body typography Inter must be referenced"

    # Verify container border radius rule (4rem)
    assert "4rem" in css, "Container border radius of 4rem must be present"

    # Verify signature element animation and conic gradient
    assert "conic-gradient" in css, "Signature element conic-gradient must be present"

    # Verify accessibility: prefers-reduced-motion
    assert "prefers-reduced-motion" in css, "prefers-reduced-motion must be supported"

    # Verify no comments in output
    assert "/*" not in css, "Compiled CSS must not contain block comments"
