// Small JS to populate members and handle simple form UX
document.getElementById('year').textContent = new Date().getFullYear();

// Populate members list using embedded JSON if present, otherwise try fetching data/members.json
async function loadMembers(){
  // support both #members and the older #members-grid id
  const container = document.getElementById('members') || document.getElementById('members-grid');
  if(!container) return;

  // Try embedded data first
  const embedded = document.getElementById('members-data');
  try{
    let members = null;
    if(embedded){
      members = JSON.parse(embedded.textContent);
    } else {
      const res = await fetch('data/members.json');
      if(res.ok) members = await res.json();
    }

    if(!members || !members.length){
      container.innerHTML = '<p class="hint">Team roster is coming soon. Edit data/members.json or the embedded script in index.html to populate members.</p>';
      return;
    }

    container.innerHTML = members.map(m=>{
      const bioHtml = (m.bio||'').split('\n').map(p=>`<p>${p}</p>`).join('');
      return `
      <div class="member card">
        <div class="avatar"><img src="${m.avatar}" alt="${m.name}"></div>
        <div class="member-body">
          <h3>${m.name}</h3>
          ${bioHtml}
        </div>
      </div>
    `}).join('\n');
  }catch(err){
    container.innerHTML = '<p class="hint">Team roster is coming soon. There was an error loading the roster.</p>';
    console.error('loadMembers error', err);
  }
}

loadMembers();

// Inject a hamburger nav toggle for very small screens (<=420px)
(function mobileNavToggle(){
  try{
    const header = document.querySelector('.header-inner');
    if(!header) return;
    const nav = document.querySelector('.nav');
    if(!nav) return;

    // Create toggle button
    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Toggle navigation');
    btn.innerHTML = '\u2630'; // simple hamburger glyph

    // Insert before nav
    header.appendChild(btn);

    function toggle(){
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', toggle);

    // Close nav when a link is clicked (mobile)
    nav.addEventListener('click', e=>{
      if(e.target.tagName === 'A'){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });

    // Also close nav on Escape
    document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } });
  }catch(e){console.error('mobileNavToggle',e)}
})();

// Contact form: open user's mail client with a prefilled message and show an inline confirmation
const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = (form.name && form.name.value) ? form.name.value.trim() : '';
    const email = (form.email && form.email.value) ? form.email.value.trim() : '';
    const message = (form.message && form.message.value) ? form.message.value.trim() : '';

    // Build a mailto: URL with subject and body. Use encodeURIComponent to escape values.
    const subject = encodeURIComponent(`IncrediCubs website message from ${name || email || 'visitor'}`);
    let bodyText = '';
    if(name) bodyText += `Name: ${name}\n`;
    if(email) bodyText += `Email: ${email}\n\n`;
    bodyText += message || '';
    const body = encodeURIComponent(bodyText);
    const mailto = `mailto:incredicubs@gmail.com?subject=${subject}&body=${body}`;

    // Open the user's mail client. Some browsers block window.open for mailto so use location fallback.
    try{ window.location.href = mailto; }catch(err){ window.open(mailto); }

    // Show a local confirmation and reset the form
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = `Thanks ${name || 'Friend'}! Your email client was opened to send the message.`;
    form.appendChild(p);
    form.reset();
  });
}

// Mark current nav link as active for multi-page navigation
;(function markActiveNav(){
  try{
    const navLinks = document.querySelectorAll('.nav a');
    if(!navLinks || !navLinks.length) return;
    const path = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(a=>{
      const href = a.getAttribute('href') || '';
      if(href.endsWith(path) || (path==='index.html' && href==='index.html')){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
    });
  }catch(e){console.error('markActiveNav error',e)}
})();

// Simple slideshow initializer: supports multiple .slideshow elements
(function initSlides(){
  try{
    const slideshows = document.querySelectorAll('.slideshow');
    slideshows.forEach(async slideshow=>{
      const slidesWrap = slideshow.querySelector('.slides');
      if(!slidesWrap) return;

      // If a data-src is provided, try to fetch a JSON index OR a directory listing and populate slides dynamically
      const dataSrc = slideshow.dataset.src;
      let imgs = [];
      const populateFromIndex = async ()=>{
        try{
          if(!dataSrc) return;
          const res = await fetch(dataSrc, { cache: 'no-store' });
          if(!res.ok) return;

          const contentType = (res.headers.get('content-type') || '').toLowerCase();

          // If the response is JSON (or the dataSrc ends with .json), parse it as an index
          if(contentType.includes('application/json') || dataSrc.toLowerCase().endsWith('.json')){
            const items = await res.json();
            if(!Array.isArray(items) || items.length===0) return;
            slidesWrap.innerHTML = items.map(it=>`<img src="${it.src}" alt="${(it.alt||'').replace(/\"/g,'')}">`).join('\n');
            return;
          }

          // Otherwise try to parse an HTML directory listing (http-server and many static servers expose this)
          const text = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const anchors = Array.from(doc.querySelectorAll('a'));
          const imgExt = /\.(jpe?g|png|gif|webp|svg)$/i;
          const base = new URL(dataSrc, window.location.href).href;
          const links = anchors
            .map(a=>a.getAttribute('href'))
            .filter(h=>h && imgExt.test(h))
            .map(h=> new URL(h, base).href);

          if(links.length) slidesWrap.innerHTML = links.map(src=>`<img src="${src}" alt="">`).join('\n');
        }catch(e){ console.debug('populateFromIndex error', e); }
      };

      // If data-src exists, await population before selecting img nodes
      const maybePopulate = dataSrc ? populateFromIndex() : Promise.resolve();

      // Wait for potential population then collect images
      await maybePopulate;
      imgs = Array.from(slidesWrap.querySelectorAll('img'));
      let index = 0;
      const interval = parseInt(slideshow.dataset.interval || '5000',10);
      let timer = null;

      const update = (i)=>{
        index = (i + imgs.length) % imgs.length;
        slidesWrap.style.transform = `translateX(${-index * 100}%)`;
        dots.forEach((d,di)=>d.classList.toggle('active', di===index));
      };

      // build controls
      const prev = slideshow.querySelector('.slide-prev');
      const next = slideshow.querySelector('.slide-next');
      const dotsWrap = slideshow.querySelector('.slide-dots');
      const dots = [];
      imgs.forEach((_,i)=>{
        const b = document.createElement('button');
        b.addEventListener('click', ()=>{ update(i); resetTimer(); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });

      if(prev) prev.addEventListener('click', ()=>{ update(index-1); resetTimer(); });
      if(next) next.addEventListener('click', ()=>{ update(index+1); resetTimer(); });

      function startTimer(){ if(timer) clearInterval(timer); timer = setInterval(()=>update(index+1), interval); }
      function resetTimer(){ startTimer(); }

      slideshow.addEventListener('mouseenter', ()=>{ if(timer) clearInterval(timer); });
      slideshow.addEventListener('mouseleave', ()=>{ startTimer(); });

      // init
      update(0);
      startTimer();
    });
  }catch(e){console.error('initSlides error',e)}
})();


// Shuffle collage items for a random layout on each load
;(function shuffleCollage(){
  try{
    const container = document.querySelector('.collage');
    if(!container) return;
    const items = Array.from(container.children);
    for(let i=items.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      container.appendChild(items[j]);
      items.splice(j,1);
    }
  }catch(e){console.error('shuffleCollage error',e)}
})();

// Fetch generated collage.json (if present) and render into the .collage container
;(async function loadCollage(){
  try{
    const container = document.querySelector('.collage');
    if(!container) return;
    const res = await fetch('data/collage.json');
    if(!res.ok) return; // leave the static markup in place
    const items = await res.json();
    if(!Array.isArray(items) || items.length===0) return;
    container.innerHTML = items.map(it=>`<a href="${it.src}"><img src="${it.src}" alt="${it.alt||''}"></a>`).join('\n');

    // After rendering, shuffle for random layout
    const elems = Array.from(container.children);
    for(let i=elems.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      container.appendChild(elems[j]);
      elems.splice(j,1);
    }
  }catch(err){
    // non-fatal
    console.debug('loadCollage:', err);
  }
})();
