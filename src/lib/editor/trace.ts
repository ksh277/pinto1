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

export function simplify(points:{x:number;y:number}[], epsilon=1.2){
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
