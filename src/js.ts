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

function enhanceJson(field){
  var ta=field.querySelector("textarea");
  if(!ta)return;
  var la=field.querySelector("label");
  var isJson=la&&la.textContent.toLowerCase().indexOf("json")>-1;
  if(!isJson){try{if(ta.value.trim()){JSON.parse(ta.value);isJson=true;}}catch(e){}}
  if(!isJson)return;
  ta.classList.add("emd-json");
  var bar=document.createElement("div");bar.className="emd-json-bar";
  var btn=document.createElement("button");btn.type="button";btn.className="emd-json-fmt";
  btn.textContent="Format";
  var st=document.createElement("span");st.className="emd-json-status";
  bar.appendChild(btn);bar.appendChild(st);
  field.appendChild(bar);
  function validate(){
    if(!ta.value.trim()){ta.classList.remove("emd-json-err","emd-json-ok");st.textContent="";return;}
    try{JSON.parse(ta.value);ta.classList.remove("emd-json-err");ta.classList.add("emd-json-ok");st.textContent="Valid";st.style.color="";}
    catch(e){ta.classList.add("emd-json-err");ta.classList.remove("emd-json-ok");st.textContent="Invalid";st.style.color="#ef4444";}
  }
  btn.addEventListener("click",function(){
    try{ta.value=JSON.stringify(JSON.parse(ta.value),null,2);validate();}catch(e){validate();}
    ta.dispatchEvent(new Event("input",{bubbles:true}));
  });
  ta.addEventListener("input",validate);
  validate();
}

function extractSummary(fc){
  var vals=getVals(fc);var parts=[];
  ["Title","Heading","Name","Headline"].forEach(function(k){if(vals[k])parts.push(vals[k]);});
  if(!parts.length){for(var k in vals){if(vals[k]){parts.push(vals[k]);break;}}}
  var meta=[];
  ["Tone","Size","Align","Theme","Variant"].forEach(function(k){if(vals[k])meta.push(vals[k]);});
  var s=parts.join(" ");
  if(meta.length)s+=" \\u2014 "+meta.join(", ");
  return s.length>80?s.substring(0,77)+"...":s;
}

function injectSummary(el,summary){
  if(!el||!summary)return;
  var ex=el.querySelector(".emd-block-summary");
  if(ex){ex.textContent=summary;return;}
  var sp=document.createElement("span");sp.className="emd-block-summary";
  sp.textContent=summary;el.appendChild(sp);
}

var lastClicked=null;
document.addEventListener("click",function(e){lastClicked=e.target;},true);

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

  var blockItem=lastClicked&&!dialog.contains(lastClicked)?lastClicked.closest("[data-block],[data-type],button,[role=button]"):null;

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

  Array.from(fc.children).forEach(enhanceJson);

  if(blockItem){
    function updateSum(){injectSummary(blockItem,extractSummary(fc));}
    updateSum();
    fc.querySelectorAll("input,textarea,select").forEach(function(el){
      el.addEventListener("input",updateSum);el.addEventListener("change",updateSum);
    });
  }

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
    hdr.style.order=String(ord++);
    fc.appendChild(hdr);
    var ls=document.createElement("span");ls.textContent=g.label;hdr.appendChild(ls);
    var chev=document.createElement("span");chev.className="emd-chevron";hdr.appendChild(chev);

    var gf=[];
    var span=SPAN[g.cols]||6;
    g.fields.forEach(function(name){
      var el=byLabel.get(name);
      if(!el)return;
      el.style.order=String(ord++);
      var isTextarea=!!el.querySelector("textarea");
      el.style.gridColumn="span "+(isTextarea?6:span);
      byLabel.delete(name);
      gf.push(el);
    });

    hdr.addEventListener("click",function(){
      var c=hdr.classList.toggle("emd-collapsed");
      gf.forEach(function(f){f.style.display=c?"none":"";});
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
