"""Validate document references, planned arithmetic, and render the QA PDF."""
from pathlib import Path
import json, re, tomllib
from pypdf import PdfReader
from pdf2image import convert_from_path

ROOT = Path(__file__).resolve().parents[1]
broken = []
mds = sorted(ROOT.rglob('*.md'))
for file in mds:
    for target in re.findall(r'\]\(([^)]+)\)', file.read_text(encoding='utf-8')):
        if target.startswith(('http:', 'https:', 'codex:', '#')): continue
        path = target.split('#',1)[0]
        if not (file.parent/path).exists(): broken.append(f'{file.relative_to(ROOT)} -> {target}')
cfg=tomllib.loads((ROOT/'.codex/config.toml').read_text(encoding='utf-8'))
assert cfg['model']=='gpt-6-astra' and cfg['model_reasoning_effort']=='xhigh'
assert sum([90,280,180,240,60]) == 850
assert sum([130,420,260,360,100]) == 1270
assert 850*100 == 85000 and 1270*140 == 177800
assert round(177800*1.2) == 213360
assert sum([150,50,50,150]) == 400
assert sum([450,200,300,250]) == 1200
assert sum([1800,600,300,300]) == 3000
assert round(1800/(1000*.05*.8*.35*.9),2)==142.86
assert 600-240-80-30-12-18==220
assert (300+2*40+50)*110//100==473
assert not broken, broken

qa=ROOT/'tmp/docx-qa'
pdf=qa/'client-proposal.pdf'
reader=PdfReader(str(pdf))
pages=[]
for i,page in enumerate(reader.pages,1):
    txt=page.extract_text() or ''
    pages.append({'page':i,'chars':len(txt),'first':txt[:95],'last':txt[-130:]})
    (qa/f'page-{i}.txt').write_text(txt,encoding='utf-8')
report={'markdown_files':len(mds),'broken_local_links':broken,'config_valid':True,'arithmetic_valid':True,'pages':pages}
(qa/'structural-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
poppler=Path(r'C:\Users\kjm12\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin')
images=convert_from_path(str(pdf),dpi=130,poppler_path=str(poppler))
for i,im in enumerate(images,1): im.save(qa/f'page-{i}.png')
print(json.dumps(report,ensure_ascii=True,indent=2))
