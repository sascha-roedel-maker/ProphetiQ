const CACHE='qulora-v11-3-3-11-data-consistency';
const CORE=['./manifest.webmanifest','./icon-192.png','./icon-512.png','./web-ranking-data.json'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache=>{
        for(const url of CORE){
          try{
            const r=await fetch(url,{cache:'no-store'});
            if(r&&r.ok)await cache.put(url,r.clone());
          }catch(e){}
        }
      })
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('qulora-')).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  const isNavigation=event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/');
  const isFreshData=url.pathname.endsWith('/trend-data.json')||url.pathname.endsWith('/web-ranking-data.json');

  if(isNavigation){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(async r=>{
          if(r&&r.ok){
            try{const c=await caches.open(CACHE);await c.put('./index.html',r.clone())}catch(e){}
          }
          return r;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(isFreshData){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(async r=>{
          if(r&&r.ok){try{const c=await caches.open(CACHE);await c.put(event.request,r.clone())}catch(e){}}
          return r;
        })
        .catch(()=>caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit=>hit||fetch(event.request))
  );
});
