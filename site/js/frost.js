/* =========================================================
   SHFrost — a fogged cooler-door pane rendered over the pour video.
   - Blurred, light-scattering fog everywhere by default
   - Pointer / touch wipes clear the glass; fog slowly creeps back
   - Condensation beads act as tiny lenses; a few drips run down the pane
   Plain WebGL1, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  var VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform sampler2D uVid;',
    'uniform sampler2D uSmall;',
    'uniform sampler2D uMask;',
    'uniform vec2 uRes;',
    'uniform vec2 uVidRes;',
    'uniform vec2 uSmallPx;',
    'uniform float uTime;',
    'uniform float uRefog;',
    'uniform float uDrips;',
    'varying vec2 vUv;',

    'vec2 coverUv(vec2 uv){',
    '  float sr = uRes.x / uRes.y; float vr = uVidRes.x / uVidRes.y;',
    '  vec2 s = sr > vr ? vec2(1.0, vr / sr) : vec2(sr / vr, 1.0);',
    '  return (uv - 0.5) * s + 0.5;',
    '}',
    'float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float vnoise(vec2 p){',
    '  vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);',
    '  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));',
    '  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);',
    '}',

    // condensation beads: returns (normal.xy, coverage)
    'vec3 beads(vec2 p, float scale, float seed, float density){',
    '  vec2 q = p * scale; vec2 id = floor(q); vec2 f = fract(q) - 0.5;',
    '  float h1 = hash(id + seed); float h2 = hash(id + seed + 17.3); float h3 = hash(id + seed + 41.9);',
    '  vec2 c = (vec2(h1, h2) - 0.5) * 0.62;',
    '  float rad = mix(0.09, 0.3, h3 * h3);',
    '  float on = step(1.0 - density, hash(id + seed + 7.7));',
    '  vec2 d = (f - c) / rad; d.y *= 1.12;',
    '  float len = length(d);',
    '  float m = smoothstep(1.0, 0.82, len) * on;',
    '  return vec3(d, m);',
    '}',

    // a few drips running down the pane, leaving a clear trail
    'vec4 drips(vec2 p, float aspect){',
    '  float cols = 11.0;',
    '  float cx = p.x / aspect * cols; float id = floor(cx);',
    '  float r = hash(vec2(id, 3.7));',
    '  float active = step(0.58, r) * uDrips;',
    '  float speed = 0.018 + r * 0.03;',
    '  float headY = 1.15 - fract(uTime * speed + r * 5.0) * 1.4;',
    '  float lx = (fract(cx) - 0.5) / cols * aspect;',
    '  lx += sin(p.y * 22.0 + r * 9.0) * 0.0035 + (r - 0.5) * 0.02;',
    '  float rad = 0.009 + r * 0.004;',
    '  vec2 dd = vec2(lx, (p.y - headY) * 0.75) / rad;',
    '  float head = smoothstep(1.0, 0.75, length(dd)) * active;',
    '  float above = p.y - headY;',
    '  float trail = smoothstep(rad * 0.55, rad * 0.1, abs(lx)) * step(0.0, above) * smoothstep(0.32, 0.0, above) * active;',
    '  return vec4(dd, head, trail);',
    '}',

    'void main(){',
    '  vec2 uv = vUv;',
    '  float aspect = uRes.x / uRes.y;',
    '  vec2 p = vec2(uv.x * aspect, uv.y);',
    '  vec2 vuv = coverUv(uv);',

    '  float raw = texture2D(uMask, uv).r;',
    '  float clear = smoothstep(0.16, 0.85, raw) * (1.0 - uRefog);',

    '  vec4 dr = drips(p, aspect);',
    '  clear = max(clear, dr.w * 0.85);',
    '  float fog = 1.0 - clear;',

    // sharp + blurred plates
    '  vec3 sharp = texture2D(uVid, vuv).rgb;',
    '  vec3 blur = vec3(0.0);',
    '  vec2 o = uSmallPx * 1.6;',
    '  blur = texture2D(uSmall, vuv).rgb * 2.0',
    '    + texture2D(uSmall, vuv + vec2( o.x,  o.y)).rgb + texture2D(uSmall, vuv + vec2(-o.x,  o.y)).rgb',
    '    + texture2D(uSmall, vuv + vec2( o.x, -o.y)).rgb + texture2D(uSmall, vuv + vec2(-o.x, -o.y)).rgb;',
    '  blur /= 6.0;',

    // frost: scatter light, cool it down, add grain
    '  float grain = vnoise(p * 210.0) * 0.6 + vnoise(p * 38.0 + 3.1) * 0.4;',
    '  float lum = dot(blur, vec3(0.299, 0.587, 0.114));',
    '  vec3 fogged = blur * 0.82 + vec3(0.075, 0.1, 0.11) + lum * vec3(0.06, 0.1, 0.11);',
    '  fogged += (grain - 0.5) * 0.045;',
    '  vec3 col = mix(sharp, fogged, fog);',

    // beads: densest on the fog, slowly reforming on the wiped glass
    '  vec3 b1 = beads(p, 26.0, 1.0, 0.55);',
    '  vec3 b2 = beads(p, 58.0, 9.0, 0.5);',
    '  vec3 b = b1.z > 0.01 ? b1 : b2;',
    '  float bm = b.z * mix(0.25, 1.0, fog);',
    '  if (dr.z > b.z) { b = vec3(dr.xy, dr.z); bm = dr.z; }',
    '  vec2 n = b.xy;',
    '  vec3 lens = texture2D(uVid, coverUv(uv - n * 0.028)).rgb;',
    '  float rim = smoothstep(0.45, 1.0, length(n));',
    '  vec3 drop = lens * (1.08 - rim * 0.55);',
    '  float spec = smoothstep(0.38, 0.0, length(n - vec2(-0.32, 0.38)));',
    '  drop += spec * 0.55;',
    '  col = mix(col, drop, bm);',

    // waterline where a wipe meets the fog
    '  float edge = smoothstep(0.1, 0.45, raw) * smoothstep(0.85, 0.45, raw) * (1.0 - uRefog);',
    '  col += edge * vec3(0.05, 0.07, 0.075);',

    // grade + vignette
    '  vec2 vq = (uv - 0.5) * vec2(1.15, 1.0);',
    '  col *= mix(0.62, 1.0, smoothstep(0.95, 0.25, length(vq)));',
    '  col = pow(col, vec3(1.04, 1.0, 0.97));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error('Shader compile failed: ' + log);
    }
    return s;
  }

  function SHFrost(canvas, video, options) {
    options = options || {};
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    if (!gl) throw new Error('WebGL unavailable');

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Program link failed');
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uVid', 'uSmall', 'uMask', 'uRes', 'uVidRes', 'uSmallPx', 'uTime', 'uRefog', 'uDrips'].forEach(function (k) {
      U[k] = gl.getUniformLocation(prog, k);
    });

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    function makeTex(unit) {
      var t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([13, 27, 30, 255]));
      return t;
    }
    var tVid = makeTex(0), tSmall = makeTex(1), tMask = makeTex(2);
    gl.uniform1i(U.uVid, 0);
    gl.uniform1i(U.uSmall, 1);
    gl.uniform1i(U.uMask, 2);

    // low-res copy of the video for the fog plate
    var SW = 160, SH = 90;
    var small = document.createElement('canvas');
    small.width = SW; small.height = SH;
    var sctx = small.getContext('2d');
    try { sctx.filter = 'blur(1.5px)'; } catch (e) { /* not supported: shader taps still blur */ }
    gl.uniform2f(U.uSmallPx, 1 / SW, 1 / SH);

    // wipe mask (white = clear glass)
    var mask = document.createElement('canvas');
    var mctx = mask.getContext('2d');
    var MW = 320, MH = 180;

    var state = {
      running: false, raf: 0, t0: performance.now(), last: 0, vidTime: -1,
      refog: 0, drips: 1, w: 0, h: 0, dpr: 1, hasFrame: false,
      lastPt: null, wiped: 0, onFirstWipe: options.onFirstWipe || null, firstFired: false,
      onFirstFrame: options.onFirstFrame || null,
      // adaptive quality: slow devices drop to half resolution, then to the plain video
      scale: 1, slow: 0, lastDraw: 0
    };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var maxDpr = window.innerWidth < 700 ? 0.75 : 1;
      state.dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * state.scale;
      state.w = Math.max(1, Math.round(rect.width * state.dpr));
      state.h = Math.max(1, Math.round(rect.height * state.dpr));
      canvas.width = state.w; canvas.height = state.h;
      gl.viewport(0, 0, state.w, state.h);
      gl.uniform2f(U.uRes, state.w, state.h);
      // keep the existing wipe when resizing
      var old = null;
      if (mask.width) { old = document.createElement('canvas'); old.width = mask.width; old.height = mask.height; old.getContext('2d').drawImage(mask, 0, 0); }
      MW = 320; MH = Math.max(90, Math.round(320 * rect.height / Math.max(1, rect.width)));
      mask.width = MW; mask.height = MH;
      mctx.fillStyle = '#000'; mctx.fillRect(0, 0, MW, MH);
      if (old) mctx.drawImage(old, 0, 0, MW, MH);
    }

    function brushRadius(kind) {
      var base = Math.max(MW, MH);
      return base * (kind === 'touch' ? 0.085 : 0.06);
    }

    function stamp(x, y, r, a) {
      var g = mctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
      g.addColorStop(0.5, 'rgba(255,255,255,' + (a * 0.85) + ')');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      mctx.fillStyle = g;
      mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.fill();
    }

    // x,y in 0..1 of the canvas box
    function wipeAt(nx, ny, kind, radiusScale, alpha) {
      var x = nx * MW, y = ny * MH;
      var r = brushRadius(kind) * (radiusScale || 1);
      var a = alpha == null ? 0.55 : alpha;
      var lp = state.lastPt;
      if (lp && lp.kind === kind) {
        var dx = x - lp.x, dy = y - lp.y, dist = Math.hypot(dx, dy);
        if (dist > r * 4) { stamp(x, y, r, a); }
        else {
          var steps = Math.max(1, Math.ceil(dist / (r * 0.25)));
          for (var i = 1; i <= steps; i++) stamp(lp.x + dx * i / steps, lp.y + dy * i / steps, r, a);
          state.wiped += dist / MW;
        }
      } else {
        stamp(x, y, r, a);
      }
      state.lastPt = { x: x, y: y, kind: kind };
      if (!state.firstFired && state.wiped > 0.6 && kind !== 'auto') {
        state.firstFired = true;
        if (state.onFirstWipe) state.onFirstWipe();
      }
    }

    function endStroke() { state.lastPt = null; }

    function uploadVideo() {
      if (video.readyState < 2 || !video.videoWidth) return;
      if (state.hasFrame && video.currentTime === state.vidTime) return;
      state.vidTime = video.currentTime;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tVid);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch (err) {
        state.running = false;
        if (options.onError) options.onError(err);
        return;
      }
      sctx.drawImage(video, 0, 0, SW, SH);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tSmall);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, small);
      gl.uniform2f(U.uVidRes, video.videoWidth, video.videoHeight);
      if (!state.hasFrame) {
        state.hasFrame = true;
        if (state.onFirstFrame) state.onFirstFrame();
      }
    }

    function frame(now) {
      if (!state.running) return;
      state.raf = requestAnimationFrame(frame);
      if (now - state.last < 32) return; // ~30 fps is plenty for fog
      var dt = Math.min(0.08, (now - state.last) / 1000);
      state.last = now;

      // fog creeps back in
      mctx.fillStyle = 'rgba(0,0,0,' + (0.42 * dt).toFixed(4) + ')';
      mctx.fillRect(0, 0, MW, MH);

      uploadVideo();
      if (!state.running) return;
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, tMask);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);

      gl.uniform1f(U.uTime, (now - state.t0) / 1000);
      gl.uniform1f(U.uRefog, state.refog);
      gl.uniform1f(U.uDrips, state.drips);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // a draw every ~33 ms is the target; if the device keeps falling well behind,
      // halve the resolution once, and if that is still too slow, hand back to the video
      if (state.lastDraw && document.visibilityState === 'visible') {
        var gap = now - state.lastDraw;
        state.slow = gap > 70 ? state.slow + 1 : Math.max(0, state.slow - 1);
        if (state.slow > 24) {
          state.slow = 0;
          if (state.scale > 0.5) { state.scale = 0.5; resize(); }
          else if (options.onTooSlow) { state.running = false; options.onTooSlow(); return; }
        }
      }
      state.lastDraw = now;
    }

    resize();

    return {
      start: function () {
        if (state.running) return;
        state.running = true; state.last = 0; state.lastDraw = 0; state.slow = 0;
        state.raf = requestAnimationFrame(frame);
      },
      stop: function () { state.running = false; cancelAnimationFrame(state.raf); },
      resize: resize,
      wipeAt: wipeAt,
      endStroke: endStroke,
      setRefog: function (v) { state.refog = v; },
      get refog() { return state.refog; },
      setDrips: function (v) { state.drips = v; }
    };
  }

  window.SHFrost = SHFrost;
})();
