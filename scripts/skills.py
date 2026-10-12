#!/usr/bin/env python3
"""Manage only the owned Dear Deer drama Skills; external definitions are discovered read-only."""
import argparse,datetime,hashlib,json,os,re,shutil,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CATALOG=ROOT/'skills/dear-deer-drama-hub/references/catalog.json'
ORIGIN='.dear-skill-origin.json'

def catalog():
    data=json.loads(CATALOG.read_text(encoding='utf-8'))
    if data.get('schema_version')!=1:raise ValueError('Unsupported catalog schema')
    ids=[s['id'] for s in data['skills']]
    if len(ids)!=len(set(ids)):raise ValueError('Duplicate skill ID')
    return data

def owned(data):return [s for s in data['skills'] if s['distribution']=='bundled']

def install_target(value=None):
    if value:return Path(value).expanduser().resolve()
    return (Path(os.environ.get('CODEX_HOME',str(Path.home()/'.codex')))/'skills').resolve()

def hashes(folder):
    return {str(p.relative_to(folder)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(folder.rglob('*')) if p.is_file() and p.name!=ORIGIN and '__pycache__' not in p.parts and p.suffix!='.pyc'}

def entry_name(path):
    text=path.read_text(encoding='utf-8')
    front=re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)',text,re.S)
    if not front:return None
    match=re.search(r'^name:\s*(.*?)\s*$',front.group(1),re.M)
    return match.group(1).strip('"\'') if match else None

def validate_bundle(data):
    errors=[];results=[]
    for skill in owned(data):
        base=(ROOT/skill['source']).resolve()
        if ROOT not in base.parents:errors.append(f"Source outside project: {skill['id']}");continue
        main=base/'SKILL.md'
        if not main.is_file() or entry_name(main)!=skill['id']:errors.append(f"Entry name mismatch: {skill['id']}");continue
        text=main.read_text(encoding='utf-8');front=text.split('---',2)[1]
        if not re.search(r'^description:\s*\S',front,re.M):errors.append(f"Description missing: {skill['id']}")
        if not re.fullmatch(r'[a-z0-9-]{1,64}',skill['id']):errors.append(f"Invalid ID: {skill['id']}")
        for p in base.rglob('*'):
            if p.is_symlink():errors.append(f'Source symlink: {p.relative_to(ROOT)}')
            if not p.is_file() or '__pycache__' in p.parts:continue
            if p.suffix=='.md':
                for link in re.findall(r'\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
                    link=link.strip('<>').split('#',1)[0]
                    if link and ':' not in link and not (p.parent/link).exists():errors.append(f'Broken link: {p.relative_to(ROOT)} -> {link}')
            if p.suffix=='.py':
                try:compile(p.read_text(encoding='utf-8'),str(p),'exec')
                except SyntaxError as e:errors.append(str(e))
        results.append({'id':skill['id'],'file_count':len(hashes(base))})
    for p in ROOT.rglob('*'):
        if not p.is_file() or any(part in {'.git','.local','__pycache__'} for part in p.relative_to(ROOT).parts):continue
        if p.name==ORIGIN or p.name.startswith('.env') or p.suffix in {'.pem','.key'}:errors.append(f'Private runtime file in public source: {p.relative_to(ROOT)}')
        if p.suffix in {'.md','.py','.js','.json','.yaml','.yml','.html','.css'}:
            text=p.read_text(encoding='utf-8')
            # User-machine locations and known credential formats are never part of this package.
            if re.search(r'/(?:Users|private)/(?:[A-Za-z0-9_-]+)/',text):errors.append(f'Personal absolute path: {p.relative_to(ROOT)}')
            if re.search(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{30,})\b',text):errors.append(f'Credential-shaped content: {p.relative_to(ROOT)}')
    if errors:raise ValueError('\n'.join(errors))
    return {'valid':True,'project_version':data['version'],'skills':results}

def definition_paths():
    base=Path(os.environ.get('CODEX_HOME',str(Path.home()/'.codex')))
    paths=[]
    for start in [base/'skills',Path.home()/'.agents/skills']:
        if start.is_dir():paths.extend(start.rglob('SKILL.md'))
    cache=base/'plugins/cache'
    if cache.is_dir():paths.extend(cache.glob('*/*/*/skills/**/SKILL.md'))
    return sorted(set(paths))

def doctor(data,target):
    paths=definition_paths();by_name={}
    for p in paths:
        try:name=entry_name(p)
        except (OSError,UnicodeError):continue
        if name:by_name.setdefault(name,[]).append(str(p))
    report=[]
    for skill in data['skills']:
        if skill['distribution']=='bundled':
            dest=target/skill['id'];same=dest.is_dir() and hashes(ROOT/skill['source'])==hashes(dest)
            state='installed_same' if same else 'installed_different' if dest.exists() else 'not_installed'
            report.append({'id':skill['id'],'state':state,'source':str(ROOT/skill['source']),'installed':str(dest)})
        else:
            found=by_name.get(skill.get('lookup_name',skill['id']),[])
            report.append({'id':skill['id'],'state':'definition_found' if found else 'definition_missing','matches':found,'execution':'not_verified_by_inventory'})
    return {'project_version':data['version'],'target':str(target),'skills':report,'gaps':data['gaps']}

def install(data,ids,target,dry_run=False,replace=False):
    validate_bundle(data)
    if target==ROOT or ROOT in target.parents:raise ValueError('Install target must be outside the source project')
    chosen=[s for s in owned(data) if s['id'] in ids]
    if len(chosen)!=len(ids):raise ValueError('Install supports only owned skills listed in this catalog')
    plans=[]
    for skill in chosen:
        src=ROOT/skill['source'];dest=target/skill['id']
        if dest==ROOT or dest in ROOT.parents:raise ValueError('Install destination contains the source project')
        if dest.is_symlink() or (dest.exists() and not dest.is_dir()):raise ValueError(f'Preserved non-directory or linked target: {dest}')
        same=dest.is_dir() and hashes(src)==hashes(dest)
        action='unchanged' if same else 'replace_with_backup' if dest.exists() else 'create'
        if action=='replace_with_backup' and not replace and not dry_run:raise ValueError(f'Different installed version preserved: {skill["id"]}; inspect --dry-run before --replace')
        plans.append((src,dest,action))
    if dry_run:return {'dry_run':True,'target':str(target),'plan':[{'id':d.name,'action':a,'requires_replace':a=='replace_with_backup'} for _,d,a in plans]}
    target.mkdir(parents=True,exist_ok=True)
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    results=[]
    for src,dest,action in plans:
        backup=None
        if action=='replace_with_backup':
            backup=ROOT/'.local/install-backups'/stamp/dest.name;backup.parent.mkdir(parents=True,exist_ok=True)
            shutil.copytree(dest,backup)
            if hashes(dest)!=hashes(backup):raise ValueError(f'Backup mismatch: {dest}')
            shutil.rmtree(dest)
        if action!='unchanged':shutil.copytree(src,dest,ignore=shutil.ignore_patterns('__pycache__','*.pyc',ORIGIN))
        if hashes(src)!=hashes(dest):raise ValueError(f'Installed copy mismatch: {dest}')
        (dest/ORIGIN).write_text(json.dumps({'format':'dear-drama-skill-origin-v1','repository_root':str(ROOT),'source':str(src),'version':data['version'],'source_hashes':hashes(src)},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        results.append({'id':dest.name,'action':action,'backup':str(backup) if backup else None,'installed':str(dest)})
    return {'installed':results,'project_version':data['version']}

def main():
    parser=argparse.ArgumentParser(description=__doc__);sub=parser.add_subparsers(dest='command',required=True)
    sub.add_parser('list');sub.add_parser('validate')
    d=sub.add_parser('doctor');d.add_argument('--target')
    i=sub.add_parser('install');group=i.add_mutually_exclusive_group(required=True);group.add_argument('--skill',action='append');group.add_argument('--all',action='store_true');i.add_argument('--target');i.add_argument('--dry-run',action='store_true');i.add_argument('--replace',action='store_true')
    args=parser.parse_args();data=catalog()
    if args.command=='list':result=data
    elif args.command=='validate':result=validate_bundle(data)
    elif args.command=='doctor':result=doctor(data,install_target(args.target))
    else:result=install(data,{s['id'] for s in owned(data)} if args.all else set(args.skill),install_target(args.target),args.dry_run,args.replace)
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    try:main()
    except (ValueError,OSError,json.JSONDecodeError) as error:print(str(error),file=sys.stderr);sys.exit(2)
