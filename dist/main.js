(()=>{"use strict";const e={BEGINNER:{WIDTH:8,HEIGHT:8,BOMBS:10},INTERMEDIATE:{WIDTH:16,HEIGHT:16,BOMBS:40},EXPERT:{WIDTH:31,HEIGHT:16,BOMBS:99}},t=(e,t,n)=>{let l=t-1<0?0:t-1,o=t+1>=e[0].length?e[0].length-1:t+1,r=n-1<0?0:n-1,i=n+1>=e.length?e.length-1:n+1;const h=[];for(let g=r;g<=i;g++)for(let r=l;r<=o;r++)g===n&&r===t||h.push({...e[g][r],x:r,y:g});return h},n=(e,l,o)=>{const r=e[o][l];if(r.show){const i=t(e,l,o);if(i.filter((e=>e.flagged)).length===r.neighbors)for(let t of i)if(!t.flagged&&!t.show&&n(e,t.x,t.y))return!0;return!1}return!(r.flagged||(e[o][l].show=!0,!e[o][l].bomb))||(0===r.neighbors&&t(e,l,o).forEach((t=>{n(e,t.x,t.y)})),!1)},l=document.getElementById("out"),o=document.getElementById("time"),r=document.getElementById("start"),i=document.getElementById("bombs-left"),h=document.getElementById("mode"),g=document.getElementById("hs-beginner"),f=document.getElementById("hs-intermediate"),s=document.getElementById("hs-expert"),d=document.getElementById("canvas"),c=d.getContext("2d");let a={BEGINNER:999,INTERMEDIATE:999,EXPERT:999},E=null;try{E=window.localStorage}catch(e){}const m=()=>{g.innerText=a.BEGINNER,f.innerText=a.INTERMEDIATE,s.innerText=a.EXPERT};(()=>{if(E){const e=E.getItem("highScore");e&&(a=JSON.parse(e))}m()})();let I="BEGINNER",u=0;const b=["blue","green","red","purple","maroon","turquoise","black","gray"],T=e=>{c.font=.8*u+"px Arial",c.textAlign="center",c.textBaseline="middle",c.fillStyle="#bcbcbc",c.fillRect(0,0,d.width,d.height);for(let t in e)for(let n in e[t]){const l=e[t][n];if(l.show){let e="#000",o="";l.bomb?(c.fillStyle="#a33",c.fillRect(n*u,t*u,u,u),o="X"):l.neighbors&&(e=b[l.neighbors-1],o=l.neighbors),o&&(c.fillStyle=e,c.fillText(o,n*u+u/2,t*u+u/2))}else c.fillStyle="#333",c.fillRect(n*u,t*u,u,u),l.flagged&&(c.fillStyle="#f1f1f1",c.fillText("P",n*u+u/2,t*u+u/2))}c.fillStyle="#000";for(let t in e){for(let n in e[t])c.fillRect(n*u,0,1,d.height);c.fillRect(0,t*u,d.width,1)}};let w,B,H=0,y=null;const x=()=>{i.innerText=e[I].BOMBS-(e=>{let t=0;for(let n=0;n<e.length;n++)for(let l=0;l<e[0].length;l++)e[n][l].flagged&&t++;return t})(B)+" 💣"},R=()=>{o.innerText="⏱️ "+H},S=()=>{R(),y&&clearInterval(y),y=null},M=()=>{l.innerText="",w=!1,H=0,S(),(()=>{const t=e[I];u=.6*window.innerHeight/t.HEIGHT,u*t.WIDTH>window.innerWidth&&(u=.6*window.innerWidth/t.WIDTH),d.width=t.WIDTH*u,d.height=t.HEIGHT*u})();const n=e[I];B=((e,n,l)=>{if(e<=0||n<=0)throw Error("Width and height must be >1");const o=[];for(let t=0;t<n;t++){const t=[];for(let n=0;n<e;n++)t.push({neighbors:0,bomb:!1,show:!1,flagged:!1});o.push(t)}return((e,t)=>{for(let n=0;n<t;n++){const t=[0,0];do{t[1]=Math.floor(Math.random()*e.length),t[0]=Math.floor(Math.random()*e[0].length)}while(e[t[1]][t[0]].bomb);e[t[1]][t[0]].bomb=!0}})(o,l),(e=>{for(let n=0;n<e.length;n++)for(let l=0;l<e[n].length;l++)e[n][l].neighbors=t(e,l,n).filter((e=>e.bomb)).length})(o),o})(n.WIDTH,n.HEIGHT,n.BOMBS),x(),T(B)};M();const D=e=>{S(),l.innerText=e,w=!0},N=(e,t)=>{let l=!1;if(!w){if(y||(l=!0,R(),y=setInterval((()=>{H++,R()}),1e3)),n(B,e,t)){if(l)return M(),void N(e,t);D("Boom! You loose"),(e=>{for(let t=0;t<e.length;t++)for(let n=0;n<e[0].length;n++)e[t][n].bomb&&(e[t][n].show=!0)})(B)}var o,r;(e=>{let t=e.length*e[0].length,n=0;for(let l=0;l<e.length;l++)for(let o=0;o<e[0].length;o++){const r=e[l][o];if(r.bomb&&t--,r.show){if(r.bomb)return!1;n++}}if(n===t){for(let t=0;t<e.length;t++)for(let n=0;n<e[0].length;n++)e[t][n].bomb&&!e[t][n].show&&(e[t][n].flagged=!0);return!0}return!1})(B)&&(D("You win"),x(),o=I,r=H,E&&a[o]>r&&(a[o]=r,m(),E.setItem("highScore",JSON.stringify(a)))),T(B)}},G=t=>{const n=t.target.getBoundingClientRect();let l=Math.floor((t.clientX-n.left)/u),o=Math.floor((t.clientY-n.top)/u);const r=e[I];return l>=r.WIDTH&&(l=r.WIDTH-1),o>=r.HEIGHT&&(o=r.HEIGHT-1),l<0&&(l=0),o<0&&(o=0),[l,o]};d.onmousedown=e=>{1===e.which?N(...G(e)):3===e.which&&((e,t)=>{!w&&y&&((e,t,n)=>!e[n][t].show&&(e[n][t].flagged=!e[n][t].flagged,!0))(B,e,t)&&(x(),T(B))})(...G(e))},r.addEventListener("click",(e=>{M()})),d.oncontextmenu=()=>!1,h.addEventListener("change",(t=>{const n=t.target.value;n in e?(I=n,M()):alert("Did not find mode")}))})();