/* ===========================================================
   Perfumería Divina Gracia — lógica de la tienda (compartida)
   =========================================================== */
(function(){
  "use strict";
  const TEL='573144327663';
  const TEL_BONITO='314 432 7663';
  const DATA=['assets/data/products.json','https://perfumeriajc.github.io/assets/data/products.json'];
  const BEST=['assets/data/bestsellers.json','https://perfumeriajc.github.io/assets/data/bestsellers.json'];
  const FAM=['assets/data/families.json','https://perfumeriajc.github.io/assets/data/families.json'];
  const PER_PAGE=24;

  const $=s=>document.querySelector(s);
  const num=v=>Number(String(v==null?'':v).replace(/[^\d.-]/g,''))||0;
  const pesos=n=>'$'+num(n).toLocaleString('es-CO');

  let PRODUCTOS=[], BESTSELLERS=[], FAMILIES=[], FAMMAP={};
  let carrito=cargarCarrito();
  let estado={cat:document.body.dataset.cat||'',q:'',fam:'',page:1};

  /* ---------- Carrito en el navegador (persistente) ---------- */
  function cargarCarrito(){try{return JSON.parse(localStorage.getItem('dg_carrito'))||[];}catch(e){return [];}}
  function guardarCarrito(){localStorage.setItem('dg_carrito',JSON.stringify(carrito));}
  const find=id=>PRODUCTOS.find(p=>String(p.id)===String(id));
  const enCarrito=id=>carrito.find(c=>String(c.id)===String(id));
  const fam=p=>{const f=p&&p.fragrance;return f&&typeof f==='object'?(f.family||''):'';};
  const famNombre=p=>{const id=fam(p);return FAMMAP[id]||id;};
  const etiqueta=p=>[p.category==='Femenino'?'Dama':(p.category==='Masculino'?'Caballero':p.category),famNombre(p)].filter(Boolean).join(' · ');
  const total=()=>carrito.reduce((s,c)=>{const p=find(c.id);return s+(p?num(p.price):0)*c.qty;},0);

  function toast(m){let t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('ver');setTimeout(()=>t.classList.remove('ver'),1700);}

  function agregar(id){const i=enCarrito(id);if(i)i.qty++;else carrito.push({id,qty:1});guardarCarrito();refrescarCarrito();reRender();toast('Añadido al pedido');
    const b=$('#badge');if(b){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}}
  function cambiar(id,d){const i=enCarrito(id);if(!i)return;i.qty+=d;if(i.qty<=0)carrito=carrito.filter(c=>String(c.id)!==String(id));guardarCarrito();refrescarCarrito();reRender();}
  function quitar(id){carrito=carrito.filter(c=>String(c.id)!==String(id));guardarCarrito();refrescarCarrito();reRender();}

  function refrescarCarrito(){
    const n=carrito.reduce((s,c)=>s+c.qty,0);
    const b=$('#badge');if(b){b.textContent=n;b.dataset.n=n;}
    const tot=$('#total');if(tot)tot.textContent=pesos(total());
    const wa=$('#btnWa');if(wa)wa.disabled=carrito.length===0;
    const body=$('#dBody');if(!body)return;
    if(!carrito.length){body.innerHTML='<div class="d-vacio"><span class="serif">Tu pedido está vacío</span>Añade tus fragancias favoritas.</div>';return;}
    body.innerHTML=carrito.map(c=>{const p=find(c.id);if(!p)return '';return `<div class="li"><img src="${p.image||''}" alt="">
      <div class="info"><div class="n">${p.title||''}</div><div class="p">${pesos(num(p.price)*c.qty)}</div>
      <div class="qty"><button data-menos="${p.id}">−</button><span>${c.qty}</span><button data-mas="${p.id}">+</button>
      <button class="quitar" data-quitar="${p.id}"><i class="fa-solid fa-trash"></i></button></div></div></div>`;}).join('');
  }
  function msgWa(){let t='Hola Divina Gracia, quiero hacer este pedido:\n\n';carrito.forEach(c=>{const p=find(c.id);if(p)t+=`• ${c.qty} x ${p.title} — ${pesos(num(p.price)*c.qty)}\n`;});t+=`\nTotal: ${pesos(total())}`;return 'https://wa.me/'+TEL+'?text='+encodeURIComponent(t);}

  /* ---------- Inyección de barra, carrito y pie ---------- */
  function inyectar(){
    const hayHero=!!$('.hero');
    const header=document.createElement('header');
    header.className='top'+(hayHero?'':' fixed-solid'); header.id='top';
    header.innerHTML=`<div class="wrap">
      <div class="brand">
      <a href="index.html">
      <img src="assets/images/2.svg" class="logo-white" alt="Divina Gracia">
      <img src="assets/images/1.svg" class="logo-color" alt="Divina Gracia">
      </a></div>
      <nav>
        <a class="lnk" href="femenino.html">Dama</a>
        <a class="lnk" href="masculino.html">Caballero</a>
        <a class="lnk" href="contacto.html">Contáctenos</a>
        <span class="pedido-link" id="abrirPedido">Pedido <span class="c" id="badge" data-n="0">0</span></span>
      </nav></div>`;
    document.body.insertBefore(header,document.body.firstChild);

    const extra=document.createElement('div');
    extra.innerHTML=`
      <section class="cta-band wrap-cta"><div class="lbl">¿Lista para tu pedido?</div>
        <h2>Arma tu selección y envíanosla por WhatsApp en un toque</h2>
        <a href="https://wa.me/${TEL}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"/></svg>Escríbenos ahora</a>
      </section>`;
    // la franja CTA se coloca dentro de un .wrap si la página define #cta-aqui
    const ctaSlot=$('#cta-aqui');
    if(ctaSlot){ctaSlot.appendChild(extra.firstElementChild);}

    const footer=document.createElement('footer');
    footer.className='site';
    footer.innerHTML=`<div class="wrap"><div class="cols">
      <div class="brand"><b>Divina Gracia</b><small>Perfumería</small><p>Fragancias para dama y caballero. Pide fácil por WhatsApp.</p></div>
      <div class="lnks"><span class="h">Tienda</span><a href="femenino.html">Dama</a><a href="masculino.html">Caballero</a><a href="index.html#mas-vendidos">Más vendidos</a></div>
      <div class="lnks"><span class="h">Contacto</span><a href="https://wa.me/${TEL}" target="_blank" rel="noopener">WhatsApp ${TEL_BONITO}</a><a href="contacto.html">Contáctenos</a><span>Bogotá, Colombia</span></div>
    </div><div class="copy">© ${new Date().getFullYear()} Perfumería Divina Gracia</div></div>`;
    document.body.appendChild(footer);

    const drawer=document.createElement('div');
    drawer.innerHTML=`
      <div class="scrim" id="scrim"></div>
      <aside class="drawer" id="drawer" aria-label="Tu pedido">
        <div class="d-head"><h2>Tu pedido</h2><button id="cerrarDrawer" aria-label="Cerrar">&times;</button></div>
        <div class="d-body" id="dBody"></div>
        <div class="d-foot">
          <div class="total-row"><span class="lbl">Total</span><span class="val" id="total">$0</span></div>
          <button class="btn-wa" id="btnWa" disabled><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>Pedir por WhatsApp</button>
          <div class="nota">No se cobra nada aquí. Coordinamos pago y entrega por WhatsApp.</div>
        </div>
      </aside>
      <a class="wa-float" href="https://wa.me/${TEL}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607z"/></svg></a>
      <div class="toast" id="toast"></div>`;
    document.body.appendChild(drawer);
  }

  /* ---------- Render de productos ---------- */
  function tarjeta(p){
    const d=enCarrito(p.id);
    const link=p.link||('product-details.html?id='+p.id);
    return `<article class="item ${d?'added':''}">
      <div class="foto"><a href="${link}"><img src="${p.image||''}" alt="${p.title||''}" loading="lazy"></a></div>
      <div class="meta"><div class="eyebrow">${etiqueta(p)}</div>
      <h3 class="nombre"><a href="${link}">${p.title||''}</a></h3>
      <div class="precio">${pesos(p.price)}</div>
      <button class="add ${d?'on':''}" data-add="${p.id}">${d?'✓ En tu pedido':'Añadir'}</button></div></article>`;
  }
  let io;
  function observar(sel){if(io)io.disconnect();
    io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.06});
    document.querySelectorAll(sel+' .item').forEach((el,i)=>{el.style.transitionDelay=(Math.min(i,8)*40)+'ms';io.observe(el);});}

  /* ---------- Página: catálogo ---------- */
  function listaFiltrada(){
    return PRODUCTOS.filter(p=>(!estado.cat||p.category===estado.cat)
      &&(!estado.fam||fam(p)===estado.fam)
      &&(p.title||'').toLowerCase().includes(estado.q.toLowerCase()));
  }
  function montarFiltroFamilia(){
    const bar=document.querySelector('.bar');if(!bar||document.getElementById('filtroFamilia'))return;
    const presentes=new Set(PRODUCTOS.filter(p=>!estado.cat||p.category===estado.cat).map(p=>fam(p)).filter(Boolean));
    if(!presentes.size)return;
    const sel=document.createElement('select');sel.id='filtroFamilia';sel.className='filtro';
    let html='<option value="">Todas las familias</option>';
    FAMILIES.filter(f=>presentes.has(f.id)).forEach(f=>{html+=`<option value="${f.id}">${f.name}</option>`;});
    sel.innerHTML=html;
    const search=bar.querySelector('.search');
    if(search)search.insertAdjacentElement('afterend',sel);else bar.appendChild(sel);
    sel.addEventListener('change',()=>{estado.fam=sel.value;estado.page=1;pintarCatalogo();});
  }
  function pintarCatalogo(){
    const grid=$('#grid');if(!grid)return;
    const lista=listaFiltrada();
    const cont=$('#count');if(cont)cont.textContent=lista.length+(lista.length===1?' fragancia':' fragancias');
    const paginas=Math.max(1,Math.ceil(lista.length/PER_PAGE));
    if(estado.page>paginas)estado.page=1;
    const ini=(estado.page-1)*PER_PAGE;
    const pagina=lista.slice(ini,ini+PER_PAGE);
    grid.innerHTML=pagina.length?pagina.map(tarjeta).join(''):'<div class="vacio"><span class="serif">Sin resultados</span>Prueba con otro nombre.</div>';
    observar('#grid');
    pintarPaginacion(paginas);
  }
  function pintarPaginacion(paginas){
    const pg=$('#paginacion');if(!pg)return;
    if(paginas<=1){pg.innerHTML='';return;}
    const p=estado.page;let html='';
    html+=`<button ${p===1?'disabled':''} data-pg="${p-1}">‹</button>`;
    const nums=new Set([1,paginas,p,p-1,p+1]);
    let prev=0;
    for(let i=1;i<=paginas;i++){if(!nums.has(i))continue;if(i-prev>1)html+='<span style="color:var(--gris)">…</span>';html+=`<button class="${i===p?'on':''}" data-pg="${i}">${i}</button>`;prev=i;}
    html+=`<button ${p===paginas?'disabled':''} data-pg="${p+1}">›</button>`;
    pg.innerHTML=html;
  }

  /* ---------- Página: index ---------- */
  function pintarIndex(){
    const fg=$('#featGrid');
    if(fg){const p=PRODUCTOS.find(x=>BESTSELLERS.some(b=>String(b)===String(x.id)))||PRODUCTOS[0];
      if(p){const link=p.link||('product-details.html?id='+p.id);
        fg.innerHTML=`<div class="feat-img"><a href="${link}"><img src="${p.image}" alt="${p.title}"></a></div>
        <div class="feat-info"><div class="fam">${etiqueta(p)}</div><h2>${p.title}</h2><div class="pr">${pesos(p.price)}</div>
        <button class="add" data-add="${p.id}">Añadir al pedido</button></div>`;}}
    const bs=$('#bestsellers');
    if(bs){let lista=PRODUCTOS.filter(p=>BESTSELLERS.some(b=>String(b)===String(p.id)));
      if(lista.length<4)lista=lista.concat(PRODUCTOS.slice(0,8)).slice(0,8);
      bs.innerHTML=lista.map(tarjeta).join('');observar('#bestsellers');}
  }

  /* ---------- Página: detalle ---------- */
  function pintarDetalle(){
    const cont=$('#detalle');if(!cont)return;
    const id=new URLSearchParams(location.search).get('id');
    const p=find(id);
    if(!p){cont.innerHTML='<div class="vacio" style="padding:160px 0"><span class="serif">Producto no encontrado</span><a href="index.html" style="color:var(--verde);border-bottom:1px solid var(--oro)">Volver al inicio</a></div>';return;}
    document.title=p.title+' · Divina Gracia';
    const f=p.fragrance&&typeof p.fragrance==='object'?p.fragrance:{};
    const n=f.notes&&typeof f.notes==='object'?f.notes:{};
    const fila=(et,arr)=>(arr&&arr.length)?`<div class="nota-fila"><div class="et">${et}</div><div class="vals">${arr.map(x=>`<span>${x}</span>`).join('')}</div></div>`:'';
    const catLink=p.category==='Masculino'?'masculino.html':'femenino.html';
    const catNom=p.category==='Masculino'?'Caballero':'Dama';
    cont.innerHTML=`
      <div class="detalle-grid">
        <div class="detalle-img"><img src="${p.image}" alt="${p.title}"></div>
        <div class="detalle-info">
          <div class="crumbs"><a href="index.html">Inicio</a> / <a href="${catLink}">${catNom}</a></div>
          <div class="fam">${etiqueta(p)}</div>
          <h1>${p.title}</h1>
          <div class="precio">${pesos(p.price)}</div>
          ${p.Des?`<p class="desc">${p.Des}</p>`:''}
          <div class="acciones-det">
            <button class="add" data-add="${p.id}">Añadir al pedido</button>
            <button class="wa" id="waDetalle"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z"/></svg>Preguntar</button>
          </div>
          ${(n.top||n.middle||n.base)?`<div class="piramide"><h3>Pirámide olfativa</h3>${fila('Salida',n.top)}${fila('Corazón',n.middle)}${fila('Fondo',n.base)}</div>`:''}
        </div>
      </div>`;
    const wa=$('#waDetalle');if(wa)wa.addEventListener('click',()=>{
      window.open('https://wa.me/'+TEL+'?text='+encodeURIComponent('Hola Divina Gracia, me interesa: '+p.title+' ('+pesos(p.price)+'). ¿Está disponible?'),'_blank');});
    // relacionados
    const rel=$('#relacionados');
    if(rel){const otros=PRODUCTOS.filter(x=>x.category===p.category&&String(x.id)!==String(p.id)).slice(0,4);
      rel.innerHTML=otros.map(tarjeta).join('');observar('#relacionados');}
  }

  /* ---------- Re-render según página ---------- */
  function reRender(){
    const pg=document.body.dataset.page;
    document.querySelectorAll('.item').forEach(()=>{}); // no-op
    if(pg==='catalogo')pintarCatalogo();
    else if(pg==='home')pintarIndex();
    else if(pg==='producto')pintarDetalle();
  }

  /* ---------- Eventos globales ---------- */
  function eventos(){
    document.body.addEventListener('click',e=>{
      const a=e.target.closest('[data-add]');if(a){e.preventDefault();agregar(a.dataset.add);return;}
      const pg=e.target.closest('[data-pg]');if(pg){estado.page=num(pg.dataset.pg)||1;pintarCatalogo();window.scrollTo({top:$('#grid').getBoundingClientRect().top+window.scrollY-110,behavior:'smooth'});}
    });
    const dBody=$('#dBody');
    if(dBody)dBody.addEventListener('click',e=>{const m=e.target.closest('[data-mas]'),me=e.target.closest('[data-menos]'),q=e.target.closest('[data-quitar]');
      if(m)cambiar(m.dataset.mas,1);if(me)cambiar(me.dataset.menos,-1);if(q)quitar(q.dataset.quitar);});
    const ab=$('#abrirPedido');if(ab)ab.addEventListener('click',()=>{$('#drawer').classList.add('ver');$('#scrim').classList.add('ver');});
    const cd=$('#cerrarDrawer');if(cd)cd.addEventListener('click',cerrarDrawer);
    const sc=$('#scrim');if(sc)sc.addEventListener('click',cerrarDrawer);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')cerrarDrawer();});
    const wa=$('#btnWa');if(wa)wa.addEventListener('click',()=>{if(carrito.length)window.open(msgWa(),'_blank');});
    const bus=$('#buscar');if(bus)bus.addEventListener('input',e=>{estado.q=e.target.value;estado.page=1;pintarCatalogo();});
    if($('.hero'))window.addEventListener('scroll',()=>{$('#top').classList.toggle('solid',window.scrollY>60);},{passive:true});
  }
  function cerrarDrawer(){$('#drawer').classList.remove('ver');$('#scrim').classList.remove('ver');}

  /* ---------- Carga de datos ---------- */
  async function cargar(urls){for(const u of urls){try{const r=await fetch(u+(u.indexOf('http')===0?'?t='+Date.now():''));if(r.ok)return await r.json();}catch(e){}}return null;}
  async function init(){
    inyectar();eventos();
    const prods=await cargar(DATA);
    PRODUCTOS=(prods||[]).filter(p=>p&&typeof p==='object');
    BESTSELLERS=(await cargar(BEST))||[];
    FAMILIES=(await cargar(FAM))||[];
    FAMMAP={};FAMILIES.forEach(f=>FAMMAP[f.id]=f.name);
    refrescarCarrito();
    const pg=document.body.dataset.page;
    if(pg==='catalogo'){montarFiltroFamilia();pintarCatalogo();}
    else if(pg==='home')pintarIndex();
    else if(pg==='producto')pintarDetalle();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
