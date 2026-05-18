import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const ROWS=6,COLS=16,PS=.82,PG=1.05
const TYPES=['kick','snare','hihat','clap','tom','bass']
const LABELS=['ON MY OWN','SYSTEM FAILURE','EMPTY TERMINAL','MODULAR DREAMS','GO ON YOUR OWN','PROJECT 042']

export async function initDrumScene(container) {
  const scene=new THREE.Scene()
  scene.background=new THREE.Color(0x000000)
  const camera=new THREE.PerspectiveCamera(42,window.innerWidth/window.innerHeight,.1,1000)
  camera.position.set(0,18,24)
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  renderer.shadowMap.enabled=true
  renderer.shadowMap.type=THREE.PCFSoftShadowMap
  renderer.toneMapping=THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure=1.0
  const canvas=renderer.domElement

  const controls=new OrbitControls(camera,canvas)
  controls.enableDamping=true;controls.dampingFactor=.05
  controls.maxPolarAngle=Math.PI/2.4;controls.minDistance=12;controls.maxDistance=40
  controls.target.set(0,.5,0)

  scene.add(new THREE.AmbientLight(0xfffffff,.4))
  const dl=new THREE.DirectionalLight(0xffffff,1.2)
  dl.position.set(8,20,10);dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);dl.shadow.bias=-.001
  scene.add(dl)
  const dl2=new THREE.DirectionalLight(0x444444,.3)
  dl2.position.set(-8,12,-5);scene.add(dl2)
  const fl=new THREE.PointLight(0x333333,.4,50)
  fl.position.set(0,10,8);scene.add(fl)

  // Audio
  let actx=null,mc=null,mg=null,an=null,ad=null,pm=1
  function ea(){if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)();mc=actx.createDynamicsCompressor();mc.threshold.setValueAtTime(-18,actx.currentTime);mc.knee.setValueAtTime(12,actx.currentTime);mc.ratio.setValueAtTime(6,actx.currentTime);mc.attack.setValueAtTime(.003,actx.currentTime);mc.release.setValueAtTime(.15,actx.currentTime);mg=actx.createGain();mg.gain.setValueAtTime(.5,actx.currentTime);an=actx.createAnalyser();an.fftSize=64;an.smoothingTimeConstant=.75;ad=new Uint8Array(an.frequencyBinCount);mc.connect(mg);mg.connect(actx.destination);mg.connect(an)}if(actx.state==='suspended')actx.resume()}
  function mo(){return mc||(actx?actx.destination:null)}

  function ps(type,time){
    ea();if(!actx)return;const now=time||actx.currentTime;const dest=mo();if(!dest)return
    const o=(freq)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(freq*pm,now);return{o,g}}
    const n=(len)=>{const n=actx.createBufferSource(),b=actx.createBuffer(1,actx.sampleRate*len,actx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;n.buffer=b;return n}
    const sh=(am)=>{const s=actx.createWaveShaper(),c=new Float32Array(256);for(let i=0;i<256;i++)c[i]=Math.tanh(((i/128)-1)*am);s.curve=c;return s}
    const bp=(f,q)=>{const b=actx.createBiquadFilter();b.type='bandpass';b.frequency.value=f*pm;b.Q.value=q||.8;return b}

    if(type==='kick'){
      let a=o(160);a.o.frequency.exponentialRampToValueAtTime(35*pm,now+.2);a.g.gain.setValueAtTime(.9,now);a.g.gain.exponentialRampToValueAtTime(.001,now+.35)
      a.o.connect(sh(2)).connect(a.g).connect(dest);a.o.start(now);a.o.stop(now+.35)
      let c=o(1200);c.g.gain.setValueAtTime(.4,now);c.g.gain.exponentialRampToValueAtTime(.001,now+.03);c.o.frequency.exponentialRampToValueAtTime(200*pm,now+.015)
      c.o.connect(c.g).connect(dest);c.o.start(now);c.o.stop(now+.03)
    }else if(type==='snare'){
      let n=n(.18),ng=actx.createGain();ng.gain.setValueAtTime(.45,now);ng.gain.exponentialRampToValueAtTime(.001,now+.18)
      n.connect(bp(3500)).connect(actx.createBiquadFilter()).connect(ng).connect(dest);n.start(now)
      let a=o(200);a.o.frequency.exponentialRampToValueAtTime(120*pm,now+.06);a.g.gain.setValueAtTime(.55,now);a.g.gain.exponentialRampToValueAtTime(.001,now+.1)
      a.o.connect(a.g).connect(dest);a.o.start(now);a.o.stop(now+.18)
    }else if(type==='hihat'){
      let n=n(.06),g=actx.createGain();g.gain.setValueAtTime(.22,now);g.gain.exponentialRampToValueAtTime(.001,now+.06)
      const hp=actx.createBiquadFilter();hp.type='highpass';hp.frequency.value=6500*pm
      n.connect(hp).connect(bp(10000,1.2)).connect(g).connect(dest);n.start(now)
    }else if(type==='clap'){
      for(let c=0;c<4;c++){let n=n(.025),g=actx.createGain(),off=c*.012;g.gain.setValueAtTime(.35,now+off);g.gain.exponentialRampToValueAtTime(.001,now+off+.08)
        n.connect(bp(2000+c*400,.6)).connect(g).connect(dest);n.start(now+off)}
      let t=actx.createBufferSource(),tb=actx.createBuffer(1,actx.sampleRate*.25,actx.sampleRate),td=tb.getChannelData(0);for(let i=0;i<td.length;i++)td[i]=(Math.random()*2-1)*Math.exp(-i/(actx.sampleRate*.08))
      t.buffer=tb;let tg=actx.createGain();tg.gain.setValueAtTime(.18,now+.04);tg.gain.exponentialRampToValueAtTime(.001,now+.25)
      t.connect(bp(2500,.5)).connect(tg).connect(dest);t.start(now+.04)
    }else if(type==='tom'){
      let a=o(180);a.o.frequency.exponentialRampToValueAtTime(70*pm,now+.25);a.g.gain.setValueAtTime(.65,now);a.g.gain.exponentialRampToValueAtTime(.001,now+.3)
      let b=o(270);b.o.frequency.exponentialRampToValueAtTime(90*pm,now+.15);b.g.gain.setValueAtTime(.2,now);b.g.gain.exponentialRampToValueAtTime(.001,now+.15)
      a.o.connect(sh(1.5)).connect(a.g).connect(dest);b.o.connect(b.g).connect(dest);a.o.start(now);a.o.stop(now+.3);b.o.start(now);b.o.stop(now+.15)
    }else if(type==='bass'){
      let s=actx.createOscillator(),sg=actx.createGain();s.type='sine';s.frequency.setValueAtTime(55*pm,now);sg.gain.setValueAtTime(.35,now);sg.gain.exponentialRampToValueAtTime(.001,now+.35)
      s.connect(sg).connect(dest);s.start(now);s.stop(now+.35)
      let a=actx.createOscillator(),g=actx.createGain();a.type='sawtooth';a.frequency.setValueAtTime(55*pm,now);g.gain.setValueAtTime(.25,now);g.gain.exponentialRampToValueAtTime(.001,now+.3)
      let f=actx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(1200*pm,now);f.frequency.exponentialRampToValueAtTime(150*pm,now+.2);f.Q.value=4
      a.connect(f).connect(sh(1.8)).connect(g).connect(dest);a.start(now);a.stop(now+.3)
    }
  }

  // Scene objects
  const bg=new THREE.Group();scene.add(bg)
  const ox=-(COLS-1)*PG/2,oz=-(ROWS-1)*PG/2,bs=(s)=>new THREE.MeshStandardMaterial({color:s||0x1A1A1A,metalness:.02,roughness:.85})

  // Chassis
  const p=new THREE.Mesh(new THREE.BoxGeometry(COLS*PG+4,.8,ROWS*PG+5.5),bs(0x111111))
  p.position.set(0,-.65,.5);p.receiveShadow=p.castShadow=true;bg.add(p)
  const tp=new THREE.Mesh(new THREE.BoxGeometry(COLS*PG+3.6,.15,ROWS*PG+5.1),bs(0x1A1A1A))
  tp.position.set(0,-.18,.5);tp.receiveShadow=true;bg.add(tp)

  // Screen
  const sc=new THREE.Mesh(new THREE.BoxGeometry(COLS*PG+2.5,.2,2.2),new THREE.MeshStandardMaterial({color:0x0A0A0A,metalness:.3,roughness:.4,emissive:0x1A0800,emissiveIntensity:.15}))
  sc.position.set(0,.02,oz-2.5);sc.receiveShadow=true;bg.add(sc)

  // Text display helper
  const txt=(text,x,z,sz)=>{const c=document.createElement('canvas'),ctx=c.getContext('2d'),r=4;c.width=256*r;c.height=64*r
    ctx.clearRect(0,0,c.width,c.height);ctx.font=`bold ${(sz||32)*r}px 'Courier New',monospace`;ctx.fillStyle='#FF5722';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,c.width/2,c.height/2)
    const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter
    const m=new THREE.Mesh(new THREE.PlaneGeometry(2.5,.6),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}))
    m.rotation.x=-Math.PI/2;m.position.set(x,.14,z);bg.add(m);return{c,ctx,t}}

  txt('120',-4,oz-2.5,36);txt('01',-1.2,oz-2.5,36);txt('1.00x',1.6,oz-2.5,36);txt('50%',4.2,oz-2.5,36)

  // Small labels
  [[-4,'BPM'],[-1.2,'STEP'],[1.6,'PITCH'],[4.2,'VOL']].forEach(([x,t])=>{
    const c=document.createElement('canvas'),ctx=c.getContext('2d'),r=3;c.width=128*r;c.height=32*r
    ctx.font=`600 ${14*r}px 'Courier New',monospace`;ctx.fillStyle='#8A8A8A';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,c.width/2,c.height/2)
    const tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.25),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}))
    m.rotation.x=-Math.PI/2;m.position.set(x,.14,oz-1.9);bg.add(m)
  })

  // ECKTIC logo on chassis
  ;(()=>{const c=document.createElement('canvas'),ctx=c.getContext('2d'),r=4;c.width=512*r;c.height=80*r
    ctx.clearRect(0,0,c.width,c.height);ctx.font=`900 ${48*r}px 'Archivo','Helvetica Neue',sans-serif`;ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.textBaseline='middle'
    ctx.save();ctx.translate(c.width*.35,c.height/2);ctx.scale(-1,1);ctx.fillText('E',0,0);ctx.restore()
    ctx.fillText('CKTI',c.width*.5,c.height/2)
    ctx.save();ctx.translate(c.width*.65,c.height/2);ctx.scale(-1,1);ctx.fillText('C',0,0);ctx.restore()
    const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;t.anisotropy=4
    const m=new THREE.Mesh(new THREE.PlaneGeometry(4.5,.6),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}))
    m.rotation.x=-Math.PI/2;m.position.set(0,.02,oz+(ROWS-1)*PG/2);bg.add(m)
  })()

  // Pads
  const padGroup=new THREE.Group(),grid=[],padMeshes=[]
  for(let r=0;r<ROWS;r++){grid[r]=[];padMeshes[r]=[]
    for(let c=0;c<COLS;c++){grid[r][c]=false
      const m=new THREE.Mesh(new THREE.BoxGeometry(PS,.35,PS),new THREE.MeshStandardMaterial({color:0x1A1A1A,metalness:.02,roughness:.95,emissive:0x000000}))
      m.position.set(ox+c*PG,.05,oz+r*PG);m.castShadow=m.receiveShadow=true;m.userData={row:r,col:c};padMeshes[r][c]=m;padGroup.add(m)}}
  bg.add(padGroup)

  const up=(r,c)=>{const m=padMeshes[r][c];if(grid[r][c]){m.material.color.setHex(0xFF5722);m.material.emissive.setHex(0xFF5722);m.material.emissiveIntensity=.6;m.material.toneMapped=false}
  else{m.material.color.setHex(0x1A1A1A);m.material.emissive.setHex(0x000000);m.material.emissiveIntensity=0;m.material.toneMapped=true}}

  // Row labels
  LABELS.forEach((l,r)=>{const lb=mkLbl(l,'#888888',16,300,40);lb.scale.set(2.8,.4,1);lb.position.set(ox-1.4,.02,oz+r*PG);bg.add(lb)})
  function mkLbl(text,color,fs,w,h){const c=document.createElement('canvas'),ctx=c.getContext('2d'),r=4;c.width=(w||256)*r;c.height=(h||64)*r
    ctx.clearRect(0,0,c.width,c.height);ctx.font=`600 ${(fs||22)*r}px 'Inter',system-ui,sans-serif`;ctx.fillStyle=color||'#555555';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(text,c.width-10*r,c.height/2)
    const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;t.anisotropy=16
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;return m}

  // Step numbers, beat markers
  for(let c=0;c<COLS;c++){const l=mkLbl((c+1).toString(),'#444444',14,64,40);l.scale.set(.6,.4,1);l.position.set(ox+c*PG,.02,oz-.9);bg.add(l)}
  for(let c=0;c<COLS;c+=4){const d=new THREE.Mesh(new THREE.CircleGeometry(.08,12),new THREE.MeshBasicMaterial({color:0xFF5722}));d.rotation.x=-Math.PI/2;d.position.set(ox+c*PG,.02,oz-1.6);bg.add(d)}

  // Playhead
  const ph=[]
  for(let c=0;c<COLS;c++){const m=new THREE.Mesh(new THREE.BoxGeometry(PS+.05,.06,ROWS*PG+.3),new THREE.MeshBasicMaterial({color:0xFF5722,transparent:true,opacity:0}));m.position.set(ox+c*PG,-.15,oz+(ROWS-1)*PG/2);ph.push(m);bg.add(m)}

  // LEDs
  const lm=[]
  for(let i=0;i<5;i++){const l=new THREE.Mesh(new THREE.CircleGeometry(i===4?.08:.06,12),new THREE.MeshBasicMaterial({color:0xFF5722}));l.rotation.x=-Math.PI/2;l.position.set(i<4?(-7.5+i*.3):(-7.5-.55),.14,oz-2.5);l.userData.ledIndex=i;lm.push(l);bg.add(l)}

  // Viz bars
  const vb=[]
  for(let i=0;i<12;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.18,.02,.02),new THREE.MeshBasicMaterial({color:0xFF5722,transparent:true,opacity:.9}));b.position.set(6+i*.24,.14,oz-2.5);vb.push(b);bg.add(b)}

  // Controls
  const bz=oz+(ROWS-1)*PG+1.8,btnR=.38,btnS=1.5,btnX=-7.5
  const abc=[]

  function btn(label,color,x,onClick,opts){const showTop=!opts||opts.showTopLabel!==false;const g=new THREE.Group()
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(btnR+.12,btnR+.12,.12,32),new THREE.MeshStandardMaterial({color:0x222222,metalness:.3,roughness:.6})))
    const cm=new THREE.MeshStandardMaterial({color,metalness:.1,roughness:.7,emissive:new THREE.Color(color),emissiveIntensity:.05})
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(btnR,btnR,.3,32),cm);cap.position.set(x,.2,bz);cap.castShadow=true
    cap.userData={isButton:true,onClick,restY:.2,baseColor:color,capMat:cm};g.add(cap);abc.push(cap)
    if(showTop){const ml=mkLbl(label,'#ffffff',10,128,36);ml.scale.set(btnR*2.5,.3,1);ml.position.set(x,.37,bz);g.add(ml)}
    const lb=mkLbl(label,'#666666',12,128,36);lb.scale.set(btnR*2.8,.35,1);lb.position.set(x,.02,bz+btnR+.4);g.add(lb);bg.add(g);return cap}

  let isPlaying=false,curStep=0,bpm=120,lst=0
  btn('PLAY',0x33AA33,btnX,()=>{ea();isPlaying=!isPlaying;if(isPlaying){curStep=0;lst=0}})
  btn('CLEAR',0x555555,btnX+btnS,()=>{for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){grid[r][c]=false;up(r,c)}},{showTopLabel:false})
  btn('RANDOM',0xFF5722,btnX+btnS*2,()=>{ea();const d=[.25,.2,.45,.12,.15,.18];let cc=0
    function gn(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){grid[r][c]=Math.random()<d[r];up(r,c)}}
    function cy(){gn();cc++;if(cc<4)setTimeout(cy,120)};cy()},{showTopLabel:false})

  // Pitch knob
  const kR=.6;kR
  bg.add(new THREE.Mesh(new THREE.CylinderGeometry(kR+.15,kR+.15,.12,32),new THREE.MeshStandardMaterial({color:0x222222,metalness:.3,roughness:.6})))
  const knob=new THREE.Mesh(new THREE.CylinderGeometry(kR,kR+.05,.4,32),new THREE.MeshStandardMaterial({color:0xFF5722,metalness:.15,roughness:.6}))
  knob.position.set(3.8,.25,bz);knob.castShadow=true;bg.add(knob)
  knob.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.42,.35),new THREE.MeshStandardMaterial({color:0xffffff,metalness:.1,roughness:.5})))
  let pl=mkLbl('PITCH','#666666',14,128,36);pl.scale.set(1.4,.35,1);pl.position.set(3.8,.02,bz+kR+.5);bg.add(pl)

  // BPM dial
  const dR=.7,dX=6.5
  bg.add(new THREE.Mesh(new THREE.CylinderGeometry(dR+.15,dR+.15,.12,32),new THREE.MeshStandardMaterial({color:0x222222,metalness:.3,roughness:.6})))
  const bpmD=new THREE.Mesh(new THREE.CylinderGeometry(dR,dR+.05,.4,32),new THREE.MeshStandardMaterial({color:0xE8E4DF,metalness:.08,roughness:.65}))
  bpmD.position.set(dX,.25,bz);bpmD.castShadow=true;bg.add(bpmD)
  bpmD.add(new THREE.Mesh(new THREE.BoxGeometry(.06,.42,.4),new THREE.MeshStandardMaterial({color:0xFF5722,metalness:.1,roughness:.5})))
  pl=mkLbl('BPM','#666666',14,128,36);pl.scale.set(1.4,.35,1);pl.position.set(dX,.02,bz+dR+.5);bg.add(pl)

  // Volume fader
  bg.add(new THREE.Mesh(new THREE.BoxGeometry(3,.15,.12),new THREE.MeshStandardMaterial({color:0x444444,metalness:.2,roughness:.6})))
  const fader=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.4),new THREE.MeshStandardMaterial({color:0x2A2A2A,metalness:.1,roughness:.8}));let vl=.5
  fader.position.set(-1.5+vl*3,.2,bz+.05);bg.add(fader)
  pl=mkLbl('VOLUME','#666666',14,160,36);pl.scale.set(1.4,.35,1);pl.position.set(0,.02,bz+.6);bg.add(pl)

  // Audio cable
  ;(()=>{const cg=new THREE.Group();const pz=.5-(ROWS*PG+5.5)/2
    const j=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.6,16),new THREE.MeshStandardMaterial({color:0x888888,metalness:.7,roughness:.3}));j.rotation.x=Math.PI/2;j.position.set(0,-.6,pz-.1);cg.add(j)
    const cm=new THREE.MeshStandardMaterial({color:0x1A1A1A,roughness:.95})
    const pts=[new THREE.Vector3(0,-.6,pz-.8),new THREE.Vector3(0,-.75,pz-1.6),new THREE.Vector3(.8,-1.0,pz-2.4),new THREE.Vector3(2.0,-1.2,pz-3.0),new THREE.Vector3(3.2,-1.25,pz-3.4),new THREE.Vector3(4.5,-1.15,pz-3.2),new THREE.Vector3(5.5,-.95,pz-2.8),new THREE.Vector3(6.2,-.7,pz-2.2),new THREE.Vector3(6.7,-.65,pz-1.9)]
    cg.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),64,.07,8,false),cm.clone()));bg.add(cg)})()

  // Interaction
  const rc=new THREE.Raycaster(),mv=new THREE.Vector2()
  let kDR=false,kSY=0,kA=0,bDR=false,bSY=0,bA=0,fDR=false
  const fP=new THREE.Plane(new THREE.Vector3(0,1,0),-.2),fI=new THREE.Vector3()

  canvas.addEventListener('pointerdown',(e)=>{
    const mx=(e.clientX/window.innerWidth)*2-1,my=-(e.clientY/window.innerHeight)*2+1
    rc.setFromCamera(new THREE.Vector2(mx,my),camera)
    const hits=rc.intersectObjects(padGroup.children)
    if(hits.length>0){const{row,col}=hits[0].object.userData;grid[row][col]=!grid[row][col];up(row,col);if(grid[row][col])ps(TYPES[row]);return}
    if(rc.intersectObject(knob).length>0){kDR=true;kSY=e.clientY;controls.enabled=false;return}
    if(rc.intersectObject(bpmD).length>0){bDR=true;bSY=e.clientY;controls.enabled=false;return}
    if(rc.intersectObject(fader).length>0){fDR=true;controls.enabled=false;return}
    const bH=rc.intersectObjects(abc);if(bH.length>0){const b=bH[0].object;if(b.userData.onClick)b.userData.onClick()}
  })
  canvas.addEventListener('pointermove',(e)=>{
    if(kDR){const d=kSY-e.clientY;kSY=e.clientY;kA=Math.max(-Math.PI,Math.min(Math.PI,kA+d*.03));pm=Math.pow(2,kA/Math.PI);knob.rotation.y=kA;return}
    if(bDR){const d=bSY-e.clientY;bSY=e.clientY;bA=Math.max(-Math.PI,Math.min(Math.PI,bA+d*.02));bpm=Math.max(60,Math.min(200,Math.round(130+(bA/Math.PI)*70)));bpmD.rotation.y=bA;return}
    if(fDR){const mx=(e.clientX/window.innerWidth)*2-1,my=-(e.clientY/window.innerHeight)*2+1;rc.setFromCamera(new THREE.Vector2(mx,my),camera);rc.ray.intersectPlane(fP,fI);fader.position.x=Math.max(-1.5,Math.min(1.5,fI.x));vl=(fader.position.x+1.5)/3;if(mg)mg.gain.setTargetAtTime(vl*1.3,actx.currentTime,.02)}
  })
  canvas.addEventListener('pointerup',()=>{if(kDR){kDR=false;controls.enabled=true}if(bDR){bDR=false;controls.enabled=true}if(fDR){fDR=false;controls.enabled=true}})

  // Demo pattern
  const dem=[.3,.2,.4,.15,.1,.2]
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){grid[r][c]=Math.random()<dem[r];up(r,c)}
  setTimeout(()=>{ea();isPlaying=true;curStep=0;lst=0},1000)

  // Animation loop
  const clock=new THREE.Clock();let pT=0,cs=0
  function anim(){
    requestAnimationFrame(anim)
    const e=clock.getElapsedTime(),dt=e-pT;pT=e
    controls.update()
    if(isPlaying){const si=60/bpm/4;if(e-lst>=si){lst=e;ph.forEach(m=>m.material.opacity=0);ph[curStep].material.opacity=.15;for(let r=0;r<ROWS;r++)if(grid[r][curStep])ps(TYPES[r]);curStep=(curStep+1)%COLS}}
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const m=padMeshes[r][c];if(m.material.emissiveIntensity>(grid[r][c]?0.6:0))m.material.emissiveIntensity-=.04;m.position.y+=(.05-m.position.y)*.15;m.scale.x+=(1-m.scale.x)*.12;m.scale.y+=(1-m.scale.y)*.12;m.scale.z+=(1-m.scale.z)*.12}
    if(an&&ad)an.getByteFrequencyData(ad)
    for(let i=0;i<vb.length;i++){let h=.05+Math.sin(e*2+i*.5)*.04+.04;if(an&&ad&&isPlaying)h=.05+(ad[Math.floor(i*(ad.length/vb.length))]/255)*1.2;vb[i].scale.y=h/.02;vb[i].position.y=.14+h*.5;vb[i].material.opacity=.5+Math.min((h-.05)/.5,1)*.5}
    // LEDs
    for(let i=0;i<lm.length;i++){const l=lm[i]
      if(i===0){const s1=Math.sin(e*4),s2=Math.sin(e*2.5+1.3),on=(s1*.6+s2*.4)>.2?1:.2;l.material.color.setRGB(on,on*.34,on*.13)}
      else if(i===1){const f1=Math.sin(e*14),f2=Math.sin(e*9.5+2.1),bu=Math.sin(e*21+.7),on=(f1*.4+f2*.35+bu*.25)>-.15?1:.2;l.material.color.setRGB(on,on*.34,on*.13)}
      else if(i===4){const b=Math.sin(e*4*Math.PI)>0?1:.12;l.material.color.setRGB(.85*b,.08*b,.05*b)}}
    renderer.render(scene,camera)
  }
  anim()

  // Resize
  const rs=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight)}
  window.addEventListener('resize',rs)

  return {
    getCanvas:()=>canvas,
    destroy:()=>{window.removeEventListener('resize',rs);renderer.dispose();if(actx)actx.close()}
  }
}
