(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

const yearEl = document.getElementById("year");
if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const todayEl = document.getElementById("todayDate");
if (todayEl) {
    todayEl.textContent = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

  /* ---- Live IST clock ---- */
  var clockEl = document.getElementById('localClock');
  function tickClock(){

    if(!clockEl) return;

    try{

        var t = new Intl.DateTimeFormat("en-GB",{
            timeZone:"Asia/Kolkata",
            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit",
            hour12:false
        }).format(new Date());

        clockEl.textContent="IST "+t;

    }catch(e){}

}
  tickClock();
  setInterval(tickClock, 1000);

  /* ---- Preloader ---- */
  var preloader = document.getElementById('preloader');
  var preloaderFill = document.getElementById('preloaderFill');
  var preloaderPct = document.getElementById('preloaderPct');

  function revealHero(){
    ['heroEyebrow','heroName','heroLede','heroCta','heroMeta'].forEach(function(id){
      document.getElementById(id).classList.add('in-view');
    });
document.getElementById("heroUnderline")?.classList.add("draw");

document.getElementById("portraitPath")?.classList.add("draw");

document.getElementById("portraitFill")?.classList.add("draw");
  }

  if (reduceMotion) {
    preloader.classList.add('hide');
    revealHero();
  } else {
    var pct = 0;
    var interval = setInterval(function(){
      pct += Math.random() * 18 + 6;
      if (pct >= 100) { pct = 100; clearInterval(interval); }
      preloaderFill.style.width = pct + '%';
      preloaderPct.textContent = Math.floor(pct) + '%';
      if (pct >= 100) {
        setTimeout(function(){
          preloader.classList.add('hide');
          revealHero();
        }, 220);
      }
    }, 130);
    // safety net in case interval stalls
    setTimeout(function(){
      if (!preloader.classList.contains('hide')) {
        preloaderFill.style.width = '100%';
        preloaderPct.textContent = '100%';
        preloader.classList.add('hide');
        revealHero();
      }
    }, 2600);
  }

  /* ---- Custom cursor + magnetic buttons ---- */
  if (fine && !reduceMotion) {
    var dot = document.getElementById('cursorDot');
    var coords = document.getElementById('cursorCoords');
    var shown = false;
    window.addEventListener('mousemove', function(e){
      if (!shown) { dot.style.opacity = 1; coords.style.opacity = 1; shown = true; }
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      coords.style.left = e.clientX + 'px';
      coords.style.top = e.clientY + 'px';
      coords.textContent = 'X:' + String(e.clientX).padStart(4,'0') + ' Y:' + String(e.clientY).padStart(4,'0');
    });
    window.addEventListener('mouseleave', function(){ dot.style.opacity = 0; coords.style.opacity = 0; });

    var gridBg = document.getElementById('gridBg');
    var rafId = null, targetX = 0, targetY = 0, curX = 0, curY = 0;
    window.addEventListener('mousemove', function(e){
      targetX = (e.clientX / window.innerWidth - 0.5) * 14;
      targetY = (e.clientY / window.innerHeight - 0.5) * 14;
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
    function tick(){
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      gridBg.style.transform = 'translate(' + curX.toFixed(1) + 'px,' + curY.toFixed(1) + 'px)';
      if (Math.abs(targetX-curX) > 0.05 || Math.abs(targetY-curY) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else { rafId = null; }
    }

    document.querySelectorAll('[data-magnet]').forEach(function(el){
      el.addEventListener('mouseenter', function(){ dot.classList.add('magnet'); });
      el.addEventListener('mouseleave', function(){
        dot.classList.remove('magnet');
        el.style.transform = 'translate(0,0)';
      });
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width/2);
        var my = e.clientY - (r.top + r.height/2);
        el.style.transform = 'translate(' + (mx*0.18).toFixed(1) + 'px,' + (my*0.28).toFixed(1) + 'px)';
      });
    });
  }

  /* ---- Scroll ruler ---- */
  var rulerFill = document.getElementById('rulerFill');
  function updateRuler(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    rulerFill.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', updateRuler, { passive:true });
  updateRuler();

  /* ---- Reveal on scroll (skips hero, which the preloader sequence handles) ---- */
  var revealEls = document.querySelectorAll('.reveal:not(#heroEyebrow):not(#heroName):not(#heroLede):not(#heroCta):not(#heroMeta)');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---- Skill meters ---- */
  var meters = document.querySelectorAll('.meter');
  if ('IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var el = entry.target;
          var level = el.getAttribute('data-level');
          el.querySelector('.meter-fill').style.width = level + '%';
          mio.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    meters.forEach(function(el){ mio.observe(el); });
  } else {
    meters.forEach(function(el){ el.querySelector('.meter-fill').style.width = el.getAttribute('data-level') + '%'; });
  }
/* ---------- Animated Counters ---------- */

  /* ---- Sheet counter + active nav link ---- */
 /* ---- Sheet counter + active nav link ---- */
var sections = document.querySelectorAll(
    "#sheet-01, #sheet-02, #sheet-03, #sheet-04, #sheet-05"
);
var sheetNo = document.getElementById("sheetNo");
var navA = document.querySelectorAll("nav.links a");

if ("IntersectionObserver" in window) {

    var sio = new IntersectionObserver(function(entries){

        entries.forEach(function(entry){

            if(!entry.isIntersecting) return;

            const id = entry.target.id;

            if(id === "sheet-services"){
                return;
            }

            if(id === "sheet-01") sheetNo.textContent = "01";
            if(id === "sheet-02") sheetNo.textContent = "02";
            if(id === "sheet-03") sheetNo.textContent = "03";
            if(id === "sheet-04") sheetNo.textContent = "04";
            if(id === "sheet-05") sheetNo.textContent = "05";

            navA.forEach(function(a){

                a.classList.remove("active");

                if(a.getAttribute("href")==="#"+id){

                    a.classList.add("active");

                }

            });

        });

    },{
    threshold:0.3
});

    sections.forEach(function(section){
        sio.observe(section);
    });

}
  /* ---- Mobile nav ---- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navA.forEach(function(a){
    a.addEventListener('click', function(){
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Theme toggle: Cyanotype <-> Diazo ---- */
  var themeBtn = document.getElementById('themeBtn');
  var themeLabel = document.getElementById('themeLabel');
  themeBtn.addEventListener('click', function(){
    var isDiazo = document.documentElement.getAttribute('data-theme') === 'diazo';
    document.documentElement.setAttribute('data-theme', isDiazo ? '' : 'diazo');
    themeLabel.textContent = isDiazo ? 'Cyanotype' : 'Diazo';
  });

  /* ---- Command palette ---- */
  var sheetsData = [
    { id: 'sheet-01', no: '01', label: 'Home / Cover' },
    { id: 'sheet-02', no: '02', label: 'About / Specification' },
    { id: 'sheet-03', no: '03', label: 'Skills / Components' },
    { id: 'sheet-04', no: '04', label: 'Work / Assemblies' },
    { id: 'sheet-05', no: '05', label: 'Contact / Sign-off' }
  ];
  var cmdkOverlay = document.getElementById('cmdkOverlay');
  var cmdkInput = document.getElementById('cmdkInput');
  var cmdkList = document.getElementById('cmdkList');
  var cmdkBtn = document.getElementById('cmdkBtn');
  var cmdkActive = 0;
  var lastFocused = null;

  function renderCmdk(filter){
    filter = (filter || '').toLowerCase();
    var items = sheetsData.filter(function(s){ return s.label.toLowerCase().indexOf(filter) !== -1; });
    cmdkList.innerHTML = '';
    items.forEach(function(s, i){
      var li = document.createElement('li');
      li.textContent = s.label;
      var span = document.createElement('span');
      span.textContent = 'SHEET ' + s.no;
      li.appendChild(span);
      li.className = (i === cmdkActive) ? 'active' : '';
      li.addEventListener('click', function(){ goToSheet(s.id); });
      li.dataset.id = s.id;
      cmdkList.appendChild(li);
    });
  }
  function goToSheet(id){
    document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    closeCmdk();
  }
  function openCmdk(){
    lastFocused = document.activeElement;
    cmdkActive = 0;
    cmdkOverlay.classList.add('open');
    cmdkOverlay.setAttribute('aria-hidden', 'false');
    cmdkInput.value = '';
    renderCmdk('');
    setTimeout(function(){ cmdkInput.focus(); }, 50);
  }
  function closeCmdk(){
    cmdkOverlay.classList.remove('open');
    cmdkOverlay.setAttribute('aria-hidden', 'true');
    if (lastFocused) lastFocused.focus();
  }
  cmdkBtn.addEventListener('click', openCmdk);
  cmdkOverlay.addEventListener('click', function(e){ if (e.target === cmdkOverlay) closeCmdk(); });
  cmdkInput.addEventListener('input', function(){ cmdkActive = 0; renderCmdk(cmdkInput.value); });
  cmdkInput.addEventListener('keydown', function(e){
    var items = cmdkList.querySelectorAll('li');
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdkActive = Math.min(cmdkActive+1, items.length-1); renderCmdk(cmdkInput.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkActive = Math.max(cmdkActive-1, 0); renderCmdk(cmdkInput.value); }
    else if (e.key === 'Enter') { e.preventDefault(); var li = items[cmdkActive]; if (li) goToSheet(li.dataset.id); }
    else if (e.key === 'Escape') { closeCmdk(); }
  });
  document.addEventListener('keydown', function(e){
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    var typing = tag === 'INPUT' || tag === 'TEXTAREA';
    if (e.key === '/' && !typing) { e.preventDefault(); openCmdk(); }
    else if (e.key === 'Escape') { closeCmdk(); closeModal(); }
  });

  /* ---- Project modal ---- */
  var projectsData = {
    '1': { no: 'PLATE 01 — LEDGER', title: 'Ledger', tagline: 'A budgeting dashboard that treats cash flow like a forecast, not a diary.',
      problem: 'Users had bank statements full of noise and no clear read on whether next month\u2019s bills were actually covered.',
      approach: 'Built a rules-based categorizer plus a rolling forecast view, so spending patterns turn into a simple runway number instead of a wall of transactions.',
      stack: ['React','Node.js','PostgreSQL','Chart.js'],
      metricValue: '3.2×', metricLabel: 'faster monthly reconciliation' },
    '2': { no: 'PLATE 02 — NIMBUS', title: 'Nimbus', tagline: 'Layered storm-tracking maps for teams who plan around the weather.',
      problem: 'Regional farm cooperatives needed a shared view of incoming weather that didn\u2019t require a meteorology background to read.',
      approach: 'Combined live radar tiles with a custom D3 layer for rainfall trends, tuned for quick scanning on low-end tablets in the field.',
      stack: ['Next.js','Mapbox GL','D3.js'],
      metricValue: '40%', metricLabel: 'fewer missed harvest windows' },
    '3': { no: 'PLATE 03 — FABLAB', title: 'Fablab', tagline: 'A marketplace built to feel as considered as the products it sells.',
      problem: 'Independent makers were stitching together generic storefronts that didn\u2019t reflect the craft behind their work.',
      approach: 'Designed a flexible product-page system with rich media support and a checkout flow tuned for low cart abandonment.',
      stack: ['Next.js','Stripe','Sanity CMS'],
      metricValue: '22%', metricLabel: 'lift in checkout completion' },
    '4': { no: 'PLATE 04 — PULSE', title: 'Pulse', tagline: 'A real-time whiteboard built for distributed design teams.',
      problem: 'Remote teams needed a shared canvas that stayed responsive with dozens of people drawing at once.',
      approach: 'Built a conflict-free sync layer over WebSockets with a custom Canvas renderer, keeping input latency under a frame even at scale.',
      stack: ['WebSockets','Canvas API','Redis'],
      metricValue: '<50ms', metricLabel: 'median sync latency' }
  };
  var modal = document.getElementById('projectModal');
  var modalContent = document.getElementById('modalContent');
  var modalClose = document.getElementById('modalClose');
  var modalTrigger = null;

  function openModal(id){
    var d = projectsData[id];
    if (!d) return;
    modalTrigger = document.activeElement;
    modalContent.innerHTML =
      '<div class="modal-plate">' + d.no + '</div>' +
      '<h3 id="modalTitle">' + d.title + '</h3>' +
      '<p class="modal-tagline">' + d.tagline + '</p>' +
      '<div class="modal-section"><h4>Problem</h4><p>' + d.problem + '</p></div>' +
      '<div class="modal-section"><h4>Approach</h4><p>' + d.approach + '</p></div>' +
      '<div class="modal-section"><h4>Stack</h4><div class="tag-row">' + d.stack.map(function(t){ return '<span class="tag">'+t+'</span>'; }).join('') + '</div></div>' +
      '<div class="modal-metric"><b>' + d.metricValue + '</b><span>' + d.metricLabel + '</span></div>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ modalClose.focus(); }, 50);
  }
  function closeModal(){
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalTrigger) modalTrigger.focus();
  }
  document.querySelectorAll('.project-card').forEach(function(card){
    card.addEventListener('click', function(){ openModal(card.getAttribute('data-project')); });
  });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });

  /* ---- Contact form (front-end only demo) ---- */
  const form = document.querySelector(".contact-form");
 if(form){

    var stamp=document.getElementById("sentStamp");

    form.addEventListener("submit",function(e){

        e.preventDefault();

        if(stamp){

            stamp.classList.add("show");

            setTimeout(function(){

                stamp.classList.remove("show");
                form.reset();

            },2200);

        }

    });

}
  /* ---- Console easter egg ---- */
  console.log('%c[ AM ] BLUEPRINT PORTFOLIO', 'color:#5ec8f5;font-family:monospace;font-size:14px;font-weight:bold;');
  console.log('%cSheet set complete — 05/05. Poking around? Nice instinct.', 'color:#8fa9c2;font-family:monospace;font-size:11px;');
  const light = document.querySelector(".mouse-light");

document.addEventListener("mousemove",(e)=>{

    light.style.left = e.clientX + "px";
    light.style.top = e.clientY + "px";
    });
/* ===== Floating Particles ===== */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = [];

for(let i=0;i<80;i++){

    particles.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        r:Math.random()*2+1,
        dx:(Math.random()-0.5)*0.4,
        dy:(Math.random()-0.5)*0.4
    });

}

function animateParticles(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{

        p.x+=p.dx;
        p.y+=p.dy;

        if(p.x<0 || p.x>canvas.width) p.dx*=-1;
        if(p.y<0 || p.y>canvas.height) p.dy*=-1;

        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle="rgba(94,200,245,.45)";
        ctx.fill();

    });

    requestAnimationFrame(animateParticles);
}

animateParticles();
/* ===== Counter Animation ===== */
/* ===== Animated Counters ===== */

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = +counter.dataset.target;

        let count = 0;
        const speed = target / 80;

        function updateCounter() {

            count += speed;

            if (count < target) {
                counter.innerText = Math.ceil(count);
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target;
            }
        }

        updateCounter();

        counterObserver.unobserve(counter);

    });
}, {
    threshold: 0.5
});

counters.forEach(counter => counterObserver.observe(counter));
/* ===== Back To Top ===== */

const topBtn = document.getElementById("backToTop");

window.addEventListener("scroll",()=>{

    if(window.scrollY>400){

        topBtn.classList.add("show");

    }else{

        topBtn.classList.remove("show");

    }

});

topBtn.addEventListener("click",()=>{

    window.scrollTo({

        top:0,
        behavior:"smooth"

    });

});
/* ===== Skills Filter ===== */
const filterButtons = document.querySelectorAll(".filter-btn");
const panels = document.querySelectorAll(".skill-panel");
const techItems = document.querySelectorAll(".tech-item");

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        panels.forEach(panel => {

            if (filter === "all" || panel.classList.contains(filter)) {

                panel.hidden = false;

            } else {

                panel.hidden = true;

            }

        });

        techItems.forEach(item => {

            if (filter === "all" || item.classList.contains(filter)) {

                item.hidden = false;

            } else {

                item.hidden = true;

            }

        });

    });

});

/* ===== Scroll Progress ===== */



const progress = document.getElementById("scrollProgress");

window.addEventListener("scroll",()=>{

    const scrollTop = window.scrollY;

    const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const percent = (scrollTop/docHeight)*100;

    progress.style.width = percent + "%";

    // 👇 Ye nayi line add karo

});
/* ===== Button Loading ===== */

document.querySelectorAll(".btn,.project-btn").forEach(button=>{

    button.addEventListener("click",function(){

        this.classList.add("loading");

        setTimeout(()=>{

            this.classList.remove("loading");

        },1200);

    });

});
/* ===== Cursor Trail ===== */

const trails=[];

for(let i=0;i<12;i++){

    const dot=document.createElement("div");

    dot.className="trail";

    document.body.appendChild(dot);

    trails.push({
        element:dot,
        x:0,
        y:0
    });

}

let mouseX=0;
let mouseY=0;

document.addEventListener("mousemove",(e)=>{

    mouseX=e.clientX;
    mouseY=e.clientY;

});

function animateTrail(){

    let x=mouseX;
    let y=mouseY;

    trails.forEach((trail,index)=>{

        trail.x+=(x-trail.x)*0.35;
        trail.y+=(y-trail.y)*0.35;

        trail.element.style.left=trail.x+"px";
        trail.element.style.top=trail.y+"px";

        x=trail.x;
        y=trail.y;

    });

    requestAnimationFrame(animateTrail);

}

animateTrail();
/* ===== Project Search ===== */

const search = document.getElementById("projectSearch");

if(search){

    const cards=document.querySelectorAll(".project-card");

    search.addEventListener("keyup",()=>{

        const value=search.value.toLowerCase();

        cards.forEach(card=>{

            const text=card.innerText.toLowerCase();

            card.style.display=text.includes(value)?"block":"none";

        });

    });

}
let visitors = localStorage.getItem("visitors");

if (!visitors) {
    visitors = 1;
} else {
    visitors = Number(visitors) + 1;
}

localStorage.setItem("visitors", visitors);

const visitorEl = document.getElementById("visitorCount");

if (visitorEl) {
    visitorEl.textContent = visitors;
}

})();
