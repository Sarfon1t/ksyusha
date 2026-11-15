const canvas=document.getElementById("particles"),ctx=canvas.getContext("2d");
const replay=document.getElementById("replay"),love=document.getElementById("love");
let w=0,h=0,dpr=1,particles=[],sparkles=[],start=performance.now(),bursts=[];
const colors=["#e8caff","#ff9bd5","#a9c8ff","#fff3ff","#f7bfe5","#c5a0ff"];
function geo(){return {x:w/2,y:h/2+20,s:Math.min(1,w/720,h/760)}}
function mask(kind){
 const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d"),o=geo();
 g.save();g.translate(o.x,o.y);g.scale(o.s,o.s);g.fillStyle="#fff";g.strokeStyle="#fff";g.lineWidth=7;g.lineJoin="round";
 if(kind==="gift"){
  g.beginPath();g.roundRect(-145,-5,290,215,12);g.fill();
  g.beginPath();g.roundRect(-165,-38,330,48,10);g.fill();
  g.fillRect(-20,-38,40,253);
  g.beginPath();g.ellipse(-48,-73,48,27,-.48,0,Math.PI*2);g.ellipse(48,-73,48,27,.48,0,Math.PI*2);g.arc(0,-69,18,0,Math.PI*2);g.fill();
  g.lineWidth=6;g.strokeRect(-145,-5,290,215);g.strokeRect(-165,-38,330,48);
 }else{
  g.beginPath();g.arc(-91,-154,47,0,Math.PI*2);g.arc(91,-154,47,0,Math.PI*2);g.fill();
  g.beginPath();g.ellipse(0,-103,126,112,0,0,Math.PI*2);g.fill();
  g.beginPath();g.ellipse(0,-52,55,43,0,0,Math.PI*2);g.fill();
  g.beginPath();g.ellipse(0,95,105,142,0,0,Math.PI*2);g.fill();
  g.beginPath();g.ellipse(-126,52,58,88,-.35,0,Math.PI*2);g.ellipse(126,52,58,88,.35,0,Math.PI*2);g.fill();
  g.beginPath();g.ellipse(-61,218,67,48,-.12,0,Math.PI*2);g.ellipse(61,218,67,48,.12,0,Math.PI*2);g.fill();
  g.lineWidth=7;g.beginPath();g.arc(-91,-154,47,0,Math.PI*2);g.arc(91,-154,47,0,Math.PI*2);
  g.ellipse(0,-103,126,112,0,0,Math.PI*2);g.ellipse(0,95,105,142,0,0,Math.PI*2);
  g.ellipse(-126,52,58,88,-.35,0,Math.PI*2);g.ellipse(126,52,58,88,.35,0,Math.PI*2);
  g.ellipse(-61,218,67,48,-.12,0,Math.PI*2);g.ellipse(61,218,67,48,.12,0,Math.PI*2);g.stroke();
 }
 g.restore();return c;
}
function sample(c,n){
 const d=c.getContext("2d").getImageData(0,0,w,h).data,a=[];
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(d[(y*w+x)*4+3]>30)a.push({x,y});
 return Array.from({length:n},()=>a[Math.random()*a.length|0]||{x:w/2,y:h/2});
}
function build(){
 const n=Math.max(2600,Math.min(6200,Math.floor(w*h/155))),a=sample(mask("gift"),n),b=sample(mask("teddy"),n);
 particles=Array.from({length:n},(_,i)=>({x:Math.random()*w,y:Math.random()*h,a:a[i],b:b[i],color:colors[i%colors.length],r:.75+Math.random()*1.45,p:Math.random()*6.28,v:.055+Math.random()*.07}));
 sparkles=Array.from({length:Math.min(300,Math.floor(w*h/2500))},()=>({x:Math.random()*w,y:Math.random()*h,r:.5+Math.random()*1.8,p:Math.random()*6.28,color:colors[Math.random()*colors.length|0]}));
}
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);build()}
function smooth(t){return t*t*(3-2*t)}
function heart(x,y,size,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(size/30,size/30);ctx.globalAlpha=alpha;ctx.fillStyle="#ff477f";ctx.shadowColor="#ff477f";ctx.shadowBlur=22;ctx.beginPath();ctx.moveTo(0,10);ctx.bezierCurveTo(-28,-8,-15,-25,0,-12);ctx.bezierCurveTo(15,-25,28,-8,0,10);ctx.fill();ctx.restore()}
function details(progress){
 const o=geo();ctx.save();ctx.translate(o.x,o.y);ctx.scale(o.s,o.s);
 if(progress<.35){ctx.globalAlpha=1-progress/.35;ctx.strokeStyle="#fff0ff";ctx.lineWidth=3;ctx.shadowColor="#e5b9ff";ctx.shadowBlur=15;ctx.beginPath();ctx.roundRect(-145,-5,290,215,12);ctx.roundRect(-165,-38,330,48,10);ctx.moveTo(-20,-38);ctx.lineTo(-20,210);ctx.moveTo(20,-38);ctx.lineTo(20,210);ctx.ellipse(-48,-73,48,27,-.48,0,Math.PI*2);ctx.ellipse(48,-73,48,27,.48,0,Math.PI*2);ctx.stroke()}
 if(progress>.94){ctx.globalAlpha=1;ctx.fillStyle="#25172f";ctx.shadowBlur=0;ctx.beginPath();ctx.arc(-43,-112,6,0,Math.PI*2);ctx.arc(43,-112,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(0,-65,12,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#39213c";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-57);ctx.quadraticCurveTo(-9,-45,-18,-53);ctx.moveTo(0,-57);ctx.quadraticCurveTo(9,-45,18,-53);ctx.stroke();heart(0,98,77);ctx.fillStyle="#fff";ctx.font="bold 14px system-ui";ctx.textAlign="center";ctx.fillText("I LOVE YOU",0,146)}
 ctx.restore();
}
function restart(){start=performance.now();bursts=[];build()}
function animate(now){
 const t=(now-start)/1000,gift=smooth(Math.min(1,t/2.1)),bear=smooth(Math.max(0,Math.min(1,(t-3)/3)));
 ctx.clearRect(0,0,w,h);const gr=ctx.createRadialGradient(w/2,h/2,5,w/2,h/2,Math.min(w,h)*.46);gr.addColorStop(0,"rgba(155,93,220,.14)");gr.addColorStop(1,"rgba(9,7,20,0)");ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
 for(const s of sparkles){ctx.globalAlpha=.25+(Math.sin(now*.002+s.p)+1)*.28;ctx.fillStyle=s.color;ctx.shadowColor=s.color;ctx.shadowBlur=9;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;ctx.shadowBlur=0;
 const blend=t<3?0:bear;
 for(const p of particles){const drift=(1-gift)*5+(1-blend)*1.2,tx=p.a.x+(p.b.x-p.a.x)*blend+Math.sin(now*.001+p.p)*drift,ty=p.a.y+(p.b.y-p.a.y)*blend+Math.cos(now*.0012+p.p)*drift;p.x+=(tx-p.x)*p.v;p.y+=(ty-p.y)*p.v;ctx.globalAlpha=.8+Math.sin(now*.003+p.p)*.18;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;ctx.shadowBlur=0;details(blend);
 bursts=bursts.filter(b=>now-b.time<1300);for(const b of bursts){const q=(now-b.time)/1300;heart(b.x,b.y-q*75,20*(1-q)+5,1-q)}
 requestAnimationFrame(animate)
}
replay.addEventListener("click",restart);
love.addEventListener("click",()=>{for(let i=0;i<9;i++)bursts.push({x:w/2+(Math.random()-.5)*230,y:h/2+70+(Math.random()-.5)*100,time:performance.now()+i*55})});
addEventListener("resize",resize);resize();requestAnimationFrame(animate);
