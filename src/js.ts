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

function miniMd(s){
  s=esc(s);
  s=s.replace(/^### (.+)$/gm,"<h4>$1</h4>");
  s=s.replace(/^## (.+)$/gm,"<h3>$1</h3>");
  s=s.replace(/^# (.+)$/gm,"<h2>$1</h2>");
  s=s.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/\*(.+?)\*/g,"<em>$1</em>");
  s=s.replace(/\[([^\\]]+)\]\([^)]+\)/g,"<u>$1</u>");
  s=s.replace(/^- (.+)$/gm,"&#8226; $1<br>");
  s=s.replace(/\\n\\n/g,"</p><p>");
  s=s.replace(/\\n/g,"<br>");
  return "<p>"+s+"</p>";
}

function enhanceMd(field){
  var ta=field.querySelector("textarea");
  if(!ta||ta.classList.contains("emd-json"))return;
  var la=field.querySelector("label");
  var isMd=false;
  if(la){var t=la.textContent.toLowerCase();if(/markdown|rich.?text/.test(t))isMd=true;}
  if(!isMd){var v=ta.value;if(v&&v.length>10&&(/^#{1,3} /m.test(v)||/\*\*.+?\*\*/.test(v)||/\[.+?\]\(.+?\)/.test(v)))isMd=true;}
  if(!isMd)return;
  var mb=document.createElement("div");mb.className="emd-md-preview";
  field.appendChild(mb);
  function render(){var v=ta.value.trim();mb.innerHTML=v?miniMd(v):"";mb.style.display=v?"":"none";}
  render();ta.addEventListener("input",render);
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

  var tb=document.createElement("div");tb.className="emd-toolbar";
  form.parentNode.insertBefore(tb,form);
  var si=document.createElement("input");si.type="text";si.placeholder="Search fields\\u2026";si.className="emd-search";
  tb.appendChild(si);
  var cb=document.createElement("button");cb.type="button";cb.className="emd-copy-btn";cb.textContent="Copy JSON";
  tb.appendChild(cb);
  si.addEventListener("input",function(){
    var q=si.value.toLowerCase().trim();
    Array.from(fc.children).forEach(function(f){
      var isHdr=f.classList.contains("emd-section-label");
      if(!q){f.style.display=(!isHdr&&f.dataset.emdCollapsed)?"none":"";return;}
      if(isHdr){f.style.display="none";return;}
      var l=lbl(f);
      f.style.display=(l&&l.toLowerCase().indexOf(q)>-1)?"":"none";
    });
  });
  cb.addEventListener("click",function(){
    navigator.clipboard.writeText(JSON.stringify(getVals(fc),null,2)).then(function(){
      cb.textContent="Copied!";setTimeout(function(){cb.textContent="Copy JSON";},1500);
    });
  });

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

  Array.from(fc.children).forEach(function(f){enhanceJson(f);enhanceMd(f);});

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
      gf.forEach(function(f){f.style.display=c?"none":"";if(c)f.dataset.emdCollapsed="1";else delete f.dataset.emdCollapsed;});
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
