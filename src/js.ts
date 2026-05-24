import type { BlockLayouts, BlockPreview, IllustrationMap } from "./types.js";

export function adminJS(
  layouts: BlockLayouts,
  illustrations: IllustrationMap,
  previews: Record<string, BlockPreview>,
): string {
  const SPAN: Record<number, number> = { 1: 6, 2: 3, 3: 2 };
  function safe(o: unknown) { return JSON.stringify(o).replace(/</g, "\\u003c"); }
  return `
(function(){
var ILLUS=${safe(illustrations)};
var LAYOUTS=${safe(layouts)};
var SPAN=${safe(SPAN)};
var PREV=${safe(previews)};

function lbl(el){var l=el.querySelector("label");return l?l.textContent.trim():"";}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

function getVals(fc){
  var v={};
  Array.from(fc.children).forEach(function(f){
    var l=lbl(f);if(!l)return;
    var el=f.querySelector("textarea,select,input");
    if(el)v[l]=el.value||"";
  });
  return v;
}

function renderPrev(box,cfg,fc){
  var vals=getVals(fc);
  var h=cfg.html.replace(/\\{\\{(.+?)\\}\\}/g,function(_,k){return esc(vals[k.trim()]||"");});
  box.innerHTML=(cfg.style?"<style>"+cfg.style+"</style>":"")+h;
}

function addPreview(sel){
  var w=sel.closest("div");
  if(!w||w.querySelector(".emd-illus-preview"))return;
  var b=document.createElement("div");b.className="emd-illus-preview";
  function r(){var v=sel.value,s=ILLUS[v];
    b.textContent="";
    if(s){var img=document.createElement("img");img.src=s;img.alt=v;b.appendChild(img);}
    if(v){var sp=document.createElement("span");sp.textContent=v;b.appendChild(sp);}
  }
  r();sel.addEventListener("change",r);w.appendChild(b);
}

function enhance(dialog){
  if(dialog.dataset.emdDone)return;
  dialog.dataset.emdDone="1";
  var h2=dialog.querySelector("h2");
  if(!h2)return;
  var type=h2.textContent.replace(/^Edit\\s+/,"").trim();
  var form=dialog.querySelector("form");
  if(!form)return;
  var fc=form.children[0];
  if(!fc||fc.children.length===0)return;

  var pcfg=PREV[type];
  if(pcfg){
    var prev=document.createElement("div");prev.className="emd-preview";
    form.parentNode.insertBefore(prev,form);
    function up(){renderPrev(prev,pcfg,fc);}
    up();
    fc.querySelectorAll("input,textarea,select").forEach(function(el){
      el.addEventListener("input",up);el.addEventListener("change",up);
    });
  }

  fc.querySelectorAll("select").forEach(function(s){
    var la=s.closest("div")?.querySelector("label");
    if(!la)return;var t=la.textContent.trim().toLowerCase();
    if(t.indexOf("illustration")>-1||t.indexOf("background")>-1||t.indexOf("foreground")>-1)addPreview(s);
  });

  var layout=LAYOUTS[type];
  if(!layout)return;

  var fields=Array.from(fc.children);
  var byLabel=new Map();
  fields.forEach(function(f){var l=lbl(f);if(l)byLabel.set(l,f);});

  fc.classList.remove("space-y-4");
  fc.classList.add("emd-grid");

  var ord=0;
  layout.forEach(function(g){
    var hdr=document.createElement("div");
    hdr.className="emd-section-label";
    hdr.textContent=g.label;
    hdr.style.order=String(ord++);
    fc.appendChild(hdr);

    var span=SPAN[g.cols]||6;
    g.fields.forEach(function(name){
      var el=byLabel.get(name);
      if(!el)return;
      el.style.order=String(ord++);
      var isTextarea=!!el.querySelector("textarea");
      el.style.gridColumn="span "+(isTextarea?6:span);
      byLabel.delete(name);
    });
  });

  byLabel.forEach(function(el){
    el.style.order=String(ord++);
    el.style.gridColumn="span 6";
  });
}

new MutationObserver(function(){
  document.querySelectorAll('div[role="dialog"][data-open]:not([data-emd-done])').forEach(enhance);
}).observe(document.body,{childList:true,subtree:true});
})();
`;
}
