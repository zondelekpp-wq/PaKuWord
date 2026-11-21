#!/usr/bin/env python3
"""Builds PaKuWord.zip – the ready-to-use app (flat, no subfolders). Run before every release:  python3 _build_zip.py"""
import os, zipfile
here = os.path.dirname(os.path.abspath(__file__))
SKIP_EXT = ('.md',)
SKIP = {'PaKuWord.zip', '_validate.js', '_build_zip.py', '.nojekyll'}
files = sorted(f for f in os.listdir(here)
               if os.path.isfile(os.path.join(here, f)) and not f.startswith('.git')
               and f not in SKIP and not f.endswith(SKIP_EXT))
with zipfile.ZipFile(os.path.join(here, 'PaKuWord.zip'), 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in files:
        z.write(os.path.join(here, f), f)
print(f'PaKuWord.zip: {len(files)} files')
