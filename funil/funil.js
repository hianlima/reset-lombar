/* ============ FUNIL RESET LOMBAR — HELPERS COMPARTILHADOS ============ */

var Funil = (function(){

  /* ---- Meta Pixel: evento customizado por etapa (pra medir queda no Ads Manager) ---- */
  function trackEtapa(nome){
    if (typeof fbq === "function") {
      fbq("trackCustom", "Funil_" + nome);
    }
  }

  /* ---- Persistência simples entre etapas (mesma aba/sessão) ---- */
  var STORE_KEY = "resetlombar_funil";

  function getState(){
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {};
    } catch(e){ return {}; }
  }

  function setState(patch){
    var state = getState();
    Object.assign(state, patch);
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch(e){}
    return state;
  }

  /* ---- Motor do chat simulado: digita e revela mensagens em sequência ----
     script: [{ from:'them'|'me', text:'...', delay:900 }, ...]
     onDone: chamado quando a última mensagem termina de aparecer
  */
  function playChat(container, script, onDone){
    var i = 0;
    function next(){
      if (i >= script.length) { if (onDone) onDone(); return; }
      var msg = script[i++];
      var delay = msg.delay != null ? msg.delay : 1100;

      if (msg.from === "them") {
        var typing = document.createElement("div");
        typing.className = "fchat-row them";
        typing.innerHTML = '<div class="fchat-bubble typing"><span></span><span></span><span></span></div>';
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;

        setTimeout(function(){
          typing.remove();
          var row = document.createElement("div");
          row.className = "fchat-row them";
          row.innerHTML = '<div class="fchat-bubble">' + msg.text + '</div>';
          container.appendChild(row);
          container.scrollTop = container.scrollHeight;
          setTimeout(next, delay);
        }, Math.min(1800, 500 + msg.text.length * 18));
      } else {
        var row = document.createElement("div");
        row.className = "fchat-row me";
        row.innerHTML = '<div class="fchat-bubble">' + msg.text + '</div>';
        container.appendChild(row);
        container.scrollTop = container.scrollHeight;
        setTimeout(next, delay);
      }
    }
    next();
  }

  /* ---- Confete simples em canvas, sem lib externa ---- */
  function confetti(canvas, durationMs){
    durationMs = durationMs || 2200;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    function resize(){
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();
    window.addEventListener("resize", resize);

    var colors = ["#C9A15C", "#141414", "#F2711A", "#2E8B57", "#C0392B"];
    var pieces = [];
    var w = canvas.clientWidth, h = canvas.clientHeight;
    for (var n = 0; n < 90; n++){
      pieces.push({
        x: Math.random()*w,
        y: -20 - Math.random()*h*0.5,
        r: 4 + Math.random()*5,
        c: colors[n % colors.length],
        vy: 2 + Math.random()*3,
        vx: -1.5 + Math.random()*3,
        rot: Math.random()*360,
        vr: -6 + Math.random()*12
      });
    }
    var start = performance.now();
    function frame(t){
      var elapsed = t - start;
      ctx.clearRect(0,0,w,h);
      pieces.forEach(function(p){
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI/180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
        ctx.restore();
      });
      if (elapsed < durationMs) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0,0,w,h);
        window.removeEventListener("resize", resize);
      }
    }
    requestAnimationFrame(frame);
  }

  return { trackEtapa: trackEtapa, getState: getState, setState: setState, playChat: playChat, confetti: confetti };
})();
