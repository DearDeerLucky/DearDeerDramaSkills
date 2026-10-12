#!/usr/bin/env python3
"""Build a local Dear Deer workbench from an explicit asset manifest; no network or generation."""
import argparse,base64,copy,hashlib,json,mimetypes,re,shutil
from pathlib import Path

KINDS={'document','image','audio','video','text','data'}
def validate(data):
    if not isinstance(data,dict) or not isinstance(data.get('projects'),list) or not data['projects']:
        raise ValueError('Manifest needs projects and assets.')
    assets=data.get('assets',{})
    if not isinstance(assets,dict): raise ValueError('assets must be an object')
    for aid,a in assets.items():
        if not re.fullmatch(r'[A-Za-z0-9_-]+',aid) or not isinstance(a,dict) or a.get('kind') not in KINDS:
            raise ValueError(f'Invalid asset: {aid}')
        if a.get('url') and not a.get('source'): raise ValueError(f'Use local source or inline text, not URL: {aid}')
        if not a.get('source') and not isinstance(a.get('text'),str): raise ValueError(f'Asset needs actual local source or text: {aid}')
    project_ids=set()
    for p in data['projects']:
        if not re.fullmatch(r'[A-Za-z0-9_-]+',p.get('id','')) or p['id'] in project_ids: raise ValueError('Unique project ID required')
        project_ids.add(p['id'])
        if not isinstance(p.get('metadata'),dict) or not isinstance(p.get('nodes'),list): raise ValueError('metadata and nodes required')
        node_ids={n.get('id') for n in p['nodes']}
        if len(node_ids)!=len(p['nodes']) or not all(re.fullmatch(r'N\d{2}',n or '') for n in node_ids): raise ValueError('Unique Nxx node IDs required')
        if not {'N00','N01','N02','N03','N04','N05','N06','N07','N08','N09','N10','N14'}<=node_ids: raise ValueError('Preserve the twelve preproduction nodes')
        item_ids=set()
        for n in p['nodes']:
            if not isinstance(n.get('items'),list) or not isinstance(n.get('depends'),list):raise ValueError('items and depends required')
            if set(n['depends'])-node_ids:raise ValueError('Unknown node dependency')
            groups={g['id'] for g in n.get('groups',[])}
            for i in n['items']:
                iid=i.get('id','')
                if not re.fullmatch(r'[A-Za-z0-9_-]+',iid) or iid in item_ids or i.get('kind') not in KINDS:raise ValueError('Unique valid item ID and kind required')
                item_ids.add(iid)
                if i.get('group') and i['group'] not in groups:raise ValueError(f'Unknown group for {iid}')
                if set(i.get('defaultAssets',[]))-set(assets):raise ValueError(f'Missing referenced asset for {iid}')
                if i.get('initialSelected') and not i.get('defaultAssets'):raise ValueError('A missing asset cannot be initially selected')
        for round_ in p.get('characterDesign',{}).get('rounds',[]):
            options=round_.get('options',[])
            if len({o.get('id') for o in options})!=len(options):raise ValueError('Unique direction IDs within each round required')
            for option in options:
                if set(option.get('assetIds',[]))-set(assets):raise ValueError('Missing direction image')

def build(manifest,output,standalone=False,refresh=False):
    root=Path(__file__).resolve().parents[1]
    template=root/'assets/preproduction-web'
    if manifest:
        origin=manifest.resolve().parent;data=json.loads(manifest.read_text())
    else:
        origin=template;raw=(template/'project-data.js').read_text();data=json.loads(raw.split('=',1)[1].strip().rstrip(';'))
    validate(data)
    output=output.resolve()
    if output==root or root in output.parents:raise ValueError('Use an independent output directory outside the Skill folder')
    if output.exists() and any(output.iterdir()) and not (refresh and (output/'build-receipt.json').is_file()):
        raise ValueError('Output must be empty, or an earlier generated workbench with --refresh')
    # Check every input before changing an existing generated workbench.
    resolved={}
    for aid,a in data.get('assets',{}).items():
        if a.get('source'):
            source=Path(a['source']);source=source if source.is_absolute() else origin/source
            if not source.is_file():raise FileNotFoundError(f'Actual source missing: {aid}: {source}')
            resolved[aid]=source.resolve()
    output.mkdir(parents=True,exist_ok=True)
    for name in ['index.html','styles.css','app.js']:shutil.copyfile(template/name,output/name)
    prepared=copy.deepcopy(data);receipt=[]
    for aid,a in prepared.get('assets',{}).items():
        a['id']=aid
        if aid in resolved:
            source=resolved[aid];safe=re.sub(r'[^A-Za-z0-9._-]','_',source.name)
            filename=aid+'-'+safe;folder='assets' if a['kind'] in {'image','audio','video'} else 'materials'
            target=output/folder/filename;target.parent.mkdir(exist_ok=True)
            if target.resolve()!=source:shutil.copyfile(source,target)
            a.update(url=folder+'/'+filename,filename=source.name,bytes=source.stat().st_size)
            if a['kind'] in {'document','text','data'} and source.suffix.lower() in {'.md','.txt','.json','.srt','.csv'}:a['text']=source.read_text()
            receipt.append({'id':aid,'source':str(source),'copy':a['url'],'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
        else:
            a.setdefault('filename',aid+'.md');a.setdefault('bytes',len(a['text'].encode()))
        a.setdefault('name',aid);a.pop('source',None)
    for p in prepared['projects']:
        for k,v in p['metadata'].items():p['metadata'][k]='' if v is None else str(v)
    def js(value):return 'window.DRAMA_DATA='+json.dumps(value,ensure_ascii=False,indent=2).replace('<','\\u003c')+';\n'
    (output/'project-data.js').write_text(js(prepared))
    page=None
    if standalone:
        embedded=copy.deepcopy(prepared)
        for a in embedded['assets'].values():
            if 'text' in a:a.pop('url',None);continue
            local=output/a['url'];mime=mimetypes.guess_type(local.name)[0] or 'application/octet-stream'
            a['url']='data:'+mime+';base64,'+base64.b64encode(local.read_bytes()).decode()
        html=(template/'index.html').read_text()
        html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+(template/'styles.css').read_text()+'</style>')
        html=html.replace('<script src="project-data.js" defer></script>','<script>'+js(embedded)+'</script>')
        html=html.replace('<script src="app.js" defer></script>','<script defer>'+ (template/'app.js').read_text().replace('</script','<\\/script')+'</script>')
        # Inline scripts execute immediately; initialize app only after the body exists.
        start=html.index('<script defer>');end=html.index('</script>',start)+len('</script>');app=html[start:end].replace('<script defer>','<script>')
        html=html[:start]+html[end:];html=html.replace('</body>',app+'\n</body>')
        page=output/'Dear-Deer-工作台.html';page.write_text(html)
    (output/'build-receipt.json').write_text(json.dumps({'format':'dear-drama-workbench-build-v1','sources':receipt,'standalone':str(page) if page else None,'source_note':'Local files copied; no media generated, no project selected or publicly published.'},ensure_ascii=False,indent=2))
    return output/'index.html',page

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest',type=Path);parser.add_argument('--output',required=True,type=Path);parser.add_argument('--standalone',action='store_true');parser.add_argument('--refresh',action='store_true')
    args=parser.parse_args()
    try:
        index,page=build(args.manifest,args.output,args.standalone,args.refresh)
    except (ValueError,OSError,json.JSONDecodeError) as e:parser.exit(2,str(e)+'\n')
    print(json.dumps({'index':str(index),'standalone':str(page) if page else None},ensure_ascii=False))
