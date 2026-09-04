#!/usr/bin/env python3
"""Parses every Unity C# file with tree-sitter and fails on syntax errors.
Install: pip install tree-sitter tree-sitter-c-sharp
"""
import os
import sys, glob
from tree_sitter import Language, Parser
import tree_sitter_c_sharp as tscs
lang = Language(tscs.language())
parser = Parser(lang)
bad = 0
files = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'unity', 'Nestam', 'Assets', '**', '*.cs'), recursive=True))
for f in files:
    src = open(f, 'rb').read()
    tree = parser.parse(src)
    errs = []
    def walk(n):
        if n.type == 'ERROR' or n.is_missing:
            errs.append((n.start_point, n.type, src[n.start_byte:n.end_byte][:60]))
        for c in n.children: walk(c)
    walk(tree.root_node)
    if errs:
        bad += 1
        print('ERRORS in', f)
        for e in errs[:8]: print('   line', e[0][0]+1, e[1], e[2])
    else:
        print('ok  ', f.split('/Assets/')[1], '(%d lines)' % src.count(b'\n'))
print('files:', len(files), 'with syntax errors:', bad)
sys.exit(1 if bad else 0)
