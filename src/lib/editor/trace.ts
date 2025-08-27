/* eslint-disable @typescript-eslint/no-explicit-any */
// 화이트 톤 제거 + 팽창 + 마칭스퀘어 + 경로 단순화 + 둘레 최근접점

export function removeWhiteToCanvas(img: HTMLImageElement, threshold = 240) {
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
  const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0)
  const im = ctx.getImageData(0, 0, c.width, c.height); const d = im.data
  for (let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2]; if (r>=threshold&&g>=threshold&&b>=threshold) d[i+3]=0 }
  ctx.putImageData(im, 0, 0)
  return c
}

export function dilateAlpha(canvas: HTMLCanvasElement, radius = 2) {
  const w=canvas.width, h=canvas.height
  const sctx=canvas.getContext('2d')!, sim=sctx.getImageData(0,0,w,h)
  const dcv=document.createElement('canvas'); dcv.width=w; dcv.height=h
  const dctx=dcv.getContext('2d')!, dim=dctx.createImageData(w,h)
  const A=(x:number,y:number)=> sim.data[(y*w+x)*4+3]
  const set=(x:number,y:number,a:number)=>{ const i=(y*w+x)*4; dim.data[i]=sim.data[i]; dim.data[i+1]=sim.data[i+1]; dim.data[i+2]=sim.data[i+2]; dim.data[i+3]=Math.max(dim.data[i+3],a) }
  const r2=radius*radius
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    let m=0; for(let dy=-radius;dy<=radius;dy++) for(let dx=-radius;dx<=radius;dx++){
      const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=w||ny>=h) continue; if(dx*dx+dy*dy<=r2) m=Math.max(m,A(nx,ny))
    } set(x,y,m)
  }
  dctx.putImageData(dim,0,0); return dcv
}

export function marchingSquares(canvas: HTMLCanvasElement, alphaThreshold = 8) {
  const w=canvas.width, h=canvas.height
  const ctx=canvas.getContext('2d')!, data=ctx.getImageData(0,0,w,h).data
  const alpha=(x:number,y:number)=> data[(y*w+x)*4+3] > alphaThreshold
  let sx=-1, sy=-1; outer: for(let y=0;y<h;y++)for(let x=0;x<w;x++) if(alpha(x,y)){ sx=x; sy=y; break outer }
  if(sx<0) return [] as {x:number;y:number}[]
  const path: {x:number;y:number}[]=[]
  let x=sx, y=sy
  const visited=new Set<string>(); const key=(x:number,y:number)=>`${x},${y}`
  for(let i=0;i<w*h*4;i++){
    path.push({x,y}); visited.add(key(x,y))
    const right=alpha(x+1,y), down=alpha(x,y+1), left=alpha(x-1,y), up=alpha(x,y-1)
    if(!right&&down) y++; else if(!down&&left) x--; else if(!left&&up) y--; else if(!up&&right) x++; else { if(right) x++; else if(down) y++; else if(left) x--; else if(up) y--; else break }
    if(x===sx&&y===sy) break; if(x<1||y<1||x>=w-1||y>=h-1) break
  }
  return simplify(path,1.5)
}

export function simplify(points:{x:number;y:number}[], epsilon=1.2): {x:number;y:number}[]{
  if(points.length<3) return points
  const md=maxDistance(points); if(md.maxDist>epsilon){
    const r1=simplify(points.slice(0,md.index+1),epsilon)
    const r2=simplify(points.slice(md.index),epsilon)
    return r1.slice(0,-1).concat(r2)
  } return [points[0], points.at(-1)!]
}
function maxDistance(pts:{x:number;y:number}[]){
  const dist=(p:any,a:any,b:any)=>{ const A=p.x-a.x,B=p.y-a.y,C=b.x-a.x,D=b.y-a.y; const dot=A*C+B*D; const len=C*C+D*D; let t=len?dot/len:0; t=Math.max(0,Math.min(1,t)); const xx=a.x+t*C,yy=a.y+t*D; return Math.hypot(p.x-xx,p.y-yy) }
  let maxDist=0,index=0; const a=pts[0], b=pts.at(-1)!; for(let i=1;i<pts.length-1;i++){ const d=dist(pts[i],a,b); if(d>maxDist){ maxDist=d; index=i } } return {maxDist,index}
}

export function nearestOnPolyline(pt:{x:number;y:number}, poly:{x:number;y:number}[]){
  let best=poly[0], bestD=Infinity
  for(let i=0;i<poly.length-1;i++){
    const a=poly[i], b=poly[i+1]
    const {x,y}=projectPointOnSegment(pt,a,b)
    const d=Math.hypot(pt.x-x, pt.y-y)
    if(d<bestD){ bestD=d; best={x,y} }
  }
  return best
}
function projectPointOnSegment(p:{x:number;y:number}, a:{x:number;y:number}, b:{x:number;y:number}){
  const vx=b.x-a.x, vy=b.y-a.y
  const wx=p.x-a.x, wy=p.y-a.y
  const c1=wx*vx+wy*vy, c2=vx*vx+vy*vy
  let t=c2? c1/c2:0; t=Math.max(0,Math.min(1,t))
  return { x: a.x + t*vx, y: a.y + t*vy }
}

/* ===== 배경 제거(샘플 색 기준) ===== */
export function removeBySampleToCanvas(img: HTMLImageElement, sample: [number,number,number], threshold = 28) {
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight
  const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0)
  const im = ctx.getImageData(0, 0, c.width, c.height); const d = im.data
  const [sr, sg, sb] = sample
  for (let i=0;i<d.length;i+=4){
    const dr=d[i]-sr, dg=d[i+1]-sg, db=d[i+2]-sb
    const dist = Math.hypot(dr, dg, db)
    if (dist < threshold) d[i+3] = 0
  }
  // 경계 안티앨리어스: 1px blur 후 재이진화
  ctx.putImageData(im, 0, 0)
  ctx.filter = 'blur(1px)'
  ctx.drawImage(c, 0, 0)
  ctx.filter = 'none'
  const p = ctx.getImageData(0,0,c.width,c.height); const pd=p.data
  for (let i=0;i<pd.length;i+=4) pd[i+3] = pd[i+3] > 16 ? 255 : 0
  ctx.putImageData(p,0,0)
  return c
}

/* ===== 침심(화이트 축소)/펜창(컹 확장) - px 단위 ===== */
export function erodeAlpha(canvas: HTMLCanvasElement, radius=1){
  // dilateAlpha가 이미 있으므로 대칭 연산으로 구현
  const w=canvas.width,h=canvas.height
  const ctx=canvas.getContext('2d')!, src=ctx.getImageData(0,0,w,h)
  const tmp=document.createElement('canvas'); tmp.width=w; tmp.height=h
  const tctx=tmp.getContext('2d')!; tctx.putImageData(src,0,0)
  tctx.globalCompositeOperation='destination-out'
  // 간단 근사: blur→threshold 반전
  tctx.filter='blur('+Math.max(1, radius)+'px)'; tctx.drawImage(tmp,0,0); tctx.filter='none'
  const id=tctx.getImageData(0,0,w,h), d=id.data
  for(let i=0;i<d.length;i+=4){ const a=d[i+3]; d[i]=d[i+1]=d[i+2]=255; d[i+3]= a>200?255:0 }
  tctx.putImageData(id,0,0)
  return tmp
}

/* ===== PNG DataURL 반환 ===== */
export function canvasToPng(c: HTMLCanvasElement){ return c.toDataURL('image/png') }

/* ===== 알파→마스크 캔버스 ===== */
export function alphaToMaskCanvas(url: string): Promise<HTMLCanvasElement>{
  return new Promise(res=>{
    const img = new Image(); img.onload = ()=> {
      const c=document.createElement('canvas'); c.width=img.width; c.height=img.height
      const ctx=c.getContext('2d')!; ctx.drawImage(img,0,0)
      const im=ctx.getImageData(0,0,c.width,c.height); const d=im.data
      for(let i=0;i<d.length;i+=4){ d[i]=d[i+1]=d[i+2]=255; d[i+3]= d[i+3]>10?255:0 }
      ctx.putImageData(im,0,0); res(c)
    }; img.src=url
  })
}

/* ===== 경로(Polyline) → PathPoint[]로 ===== */
export function polyToPathPoints(poly: {x:number;y:number}[]): {path: {x:number;y:number}[]} {
  return { path: poly.map(p=>({x:p.x, y:p.y})) }
}

/* ===== 귀/굴면 합성: baseMask에 ear(Union) + hole(Subtract) ===== */
export function unionEarAndHole(baseMask: HTMLCanvasElement, opts:{
  side: 'top'|'left'|'right', count: 1|2, holeRpx: number, earRpx: number, safePadPx: number
}): { union: HTMLCanvasElement; holes: {cx:number;cy:number;r:number}[] } {
  const c=document.createElement('canvas'); c.width=baseMask.width; c.height=baseMask.height
  const ctx=c.getContext('2d')!; ctx.drawImage(baseMask,0,0)
  const bbox = (()=>{ // 불투명 bbox
    const id=ctx.getImageData(0,0,c.width,c.height).data
    let minX=c.width, maxX=0, minY=c.height, maxY=0, hit=false
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
      if (id[(y*c.width+x)*4+3] > 10){ hit=true; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y }
    }
    if(!hit) return null; return {x:minX,y:minY,w:maxX-minX,h:maxY-minY}
  })()
  if(!bbox) return { union: baseMask, holes: [] }

  let cx=(bbox.x+bbox.x+bbox.w)/2, cy=bbox.y+opts.safePadPx
  if (opts.side==='left'){ cx=bbox.x+opts.safePadPx; cy=(bbox.y+bbox.y+bbox.h)/2 }
  if (opts.side==='right'){ cx=bbox.x+bbox.w-opts.safePadPx; cy=(bbox.y+bbox.y+bbox.h)/2 }

  // ear union
  ctx.globalCompositeOperation='source-over'
  ctx.fillStyle='#fff'
  ctx.beginPath(); ctx.arc(cx, cy, opts.earRpx, 0, Math.PI*2); ctx.fill()

  const holes=[{cx,cy,r:opts.holeRpx}]
  if (opts.count===2){
    if (opts.side==='top'){
      const gap = opts.safePadPx*3
      const cx1 = Math.max(bbox.x+opts.safePadPx, cx-gap)
      const cx2 = Math.min(bbox.x+bbox.w-opts.safePadPx, cx+gap)
      ctx.beginPath(); ctx.arc(cx1, cy, opts.earRpx, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx2, cy, opts.earRpx, 0, Math.PI*2); ctx.fill()
      holes.push({cx:cx1,cy,r:opts.holeRpx},{cx:cx2,cy,r:opts.holeRpx})
    } else {
      const gap = opts.safePadPx*3
      const cy1 = Math.max(bbox.y+opts.safePadPx, cy-gap)
      const cy2 = Math.min(bbox.y+bbox.h-opts.safePadPx, cy+gap)
      ctx.beginPath(); ctx.arc(cx, cy1, opts.earRpx, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy2, opts.earRpx, 0, Math.PI*2); ctx.fill()
      holes.push({cx,cy:cy1,r:opts.holeRpx},{cx,cy:cy2,r:opts.holeRpx})
    }
  }

  // hole subtract
  ctx.globalCompositeOperation='destination-out'
  for(const h of holes){ ctx.beginPath(); ctx.arc(h.cx,h.cy,h.r,0,Math.PI*2); ctx.fill() }
  ctx.globalCompositeOperation='source-over'
  return { union: c, holes }
}
