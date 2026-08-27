#!/usr/bin/env python3
"""WCAG 2.2 contrast audit for the OpenRally mockups.

Scans CSS rules that set both a foreground `color` and a `background`/`background-color`,
resolves `var(--token)` one level deep against `:root`, and reports any pair below the
threshold for its text size. Gradients are checked against *every* colour stop, since the
text sits over all of them.

This is the mockup-side counterpart to the token contrast unit test required by
PRD-PHASE1-MVP §7.1. It exists because a white-on-#E8442A failure (3.97:1) reached five
shipped mockups and was found by eye, not by CI.

Usage:  python3 tools/contrast-audit.py docs/tennis-app/mockups/*.html
Exit 1 if any pair fails.
"""
import re, sys

def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexstr):
    h = hexstr.lstrip('#')
    if len(h) == 3:
        h = ''.join(ch * 2 for ch in h)
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

HEX = re.compile(r'#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b')
VAR = re.compile(r'var\(\s*(--[\w-]+)\s*\)')
RULE = re.compile(r'([^{}]+)\{([^{}]*)\}', re.S)
NAMED = {'white': '#ffffff', 'black': '#000000'}

def root_tokens(css):
    tokens = {}
    for sel, body in RULE.findall(css):
        if ':root' not in sel:
            continue
        for line in body.split(';'):
            if ':' not in line:
                continue
            k, _, v = line.partition(':')
            k, v = k.strip(), v.strip()
            if k.startswith('--'):
                tokens[k] = v
    return tokens

def colours_of(value, tokens, depth=0):
    """Every concrete colour a declaration can paint. Gradients yield all stops."""
    if depth > 3:
        return []
    value = value.strip()
    for name, hx in NAMED.items():
        value = re.sub(rf'\b{name}\b', hx, value)
    out = list(HEX.findall(value))
    for tok in VAR.findall(value):
        if tok in tokens:
            out += colours_of(tokens[tok], tokens, depth + 1)
    return out

def is_large(body):
    """WCAG large text: >=18.66px bold, or >=24px."""
    m = re.search(r'font-size:\s*([\d.]+)px', body)
    if not m:
        return False
    size = float(m.group(1))
    bold = re.search(r'font-weight:\s*(bold|[6-9]00)', body) is not None
    return size >= 24 or (size >= 18.66 and bold)

def audit(path):
    css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', open(path).read(), re.S))
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)  # comments carry hex codes; they paint nothing
    tokens = root_tokens(css)
    failures = []
    for sel, body in RULE.findall(css):
        if ':root' in sel:
            continue
        fg = re.search(r'(?:^|[;{\s])color:\s*([^;}]+)', body)
        bg = re.search(r'(?:^|[;{\s])background(?:-color)?:\s*([^;}]+)', body)
        if not (fg and bg):
            continue
        fgs = colours_of(fg.group(1), tokens)
        bgs = colours_of(bg.group(1), tokens)
        if not (fgs and bgs):
            continue
        need = 3.0 if is_large(body) else 4.5
        for f in fgs:
            for b in bgs:
                r = ratio(f, b)
                if r < need:
                    failures.append((sel.strip().replace('\n', ' ')[:60], f, b, r, need))
    return failures

def main(paths):
    bad = 0
    for p in paths:
        fails = audit(p)
        name = p.rsplit('/', 1)[-1]
        if not fails:
            print(f"PASS  {name}")
            continue
        bad += len(fails)
        print(f"FAIL  {name}  ({len(fails)} pair(s))")
        for sel, f, b, r, need in fails:
            print(f"        {f} on {b} = {r:.2f}:1  (needs {need})   {sel}")
    print(f"\n{bad} failing pair(s) across {len(paths)} file(s)")
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
