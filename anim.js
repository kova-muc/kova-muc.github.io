/* Живой фон: облака, ветер с инерцией, качающиеся деревья/трава/волосы/одежда, моргание.
   Всё считается на видеокарте, цикл бесконечный и без шва. Если WebGL нет — остаётся обычный bg.jpg. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.id = "bgAnim"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const gl = cv.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) return cv.remove();

  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex; uniform vec2 uRes; uniform vec4 uView; uniform float uT, uBlink; uniform vec4 uWind;
const vec2 IMG = vec2(1672., 941.);
const vec2 EYE = vec2(397., 414.);
vec3 tex(vec2 p){ return texture2D(uTex, p / IMG).rgb; }
float sky(vec2 p){
  float l = dot(tex(p), vec3(.299,.587,.114));
  float m = smoothstep(.14,.19,l) * (1. - smoothstep(520.,560.,p.y));
  m *= smoothstep(55., 95., length(p - vec2(1195.,535.)));      /* солнце стоит на месте */
  m *= 1. - step(1440., p.x) * smoothstep(430., 470., p.y);     /* окна домов */
  return m;
}
float blob(vec2 p, vec2 c, vec2 r){ return 1. - smoothstep(.5, 1., length((p - c) / r)); }
void main(){
  vec2 v = vec2(gl_FragCoord.x / uRes.x, 1. - gl_FragCoord.y / uRes.y);
  vec2 p = (uView.xy + (v - .5) * uView.zw) * IMG;
  vec2 d = vec2(0.);
  /* деревья: чем выше, тем сильнее качаются */
  float tl = (1.-smoothstep(260.,310.,p.x)) * smoothstep(250.,290.,p.y) * (1.-smoothstep(560.,640.,p.y)) * clamp((620.-p.y)/340.,0.,1.);
  float tc = smoothstep(520.,580.,p.x) * (1.-smoothstep(930.,980.,p.x)) * smoothstep(500.,530.,p.y) * (1.-smoothstep(585.,625.,p.y)) * clamp((600.-p.y)/90.,0.,1.);
  d.x += 9. * (tl + .4*tc) * (uWind.x + .22*sin(uT*.8 + p.x*.018 + p.y*.011));
  d.y += 1.5 * tl * sin(uT*.6 + p.x*.02);
  /* трава */
  float wy = 630. + p.x*.045;
  float gb = smoothstep(580.,600.,p.y) * (1.-smoothstep(wy-6.,wy+2.,p.y)) * clamp((wy-p.y)/60.,0.,1.);
  float gf = (1.-smoothstep(300.,340.,p.x)) * smoothstep(560.,600.,p.y) * (1.-smoothstep(820.,850.,p.y)) * clamp((840.-p.y)/260.,0.,1.);
  d.x += 6. * max(gb,gf) * (uWind.y + .35*sin(uT*1.5 + p.x*.05 + p.y*.03));
  /* волосы и одежда */
  d.x += 3.2 * blob(p, vec2(368.,385.), vec2(112.,85.)) * (uWind.z + .3*sin(uT*1.9 + p.y*.06));
  float body = blob(p, vec2(445.,650.), vec2(215.,175.));
  d.x += 2.4 * body * (uWind.w + .25*sin(uT*1.3 + p.y*.04));
  d.y += .7 * body * sin(uT*1.1);
  vec2 q = p + d;
  /* моргание: глаза сжимаются в щель */
  float e = blob(q, EYE, vec2(54.,32.));
  q.y = EYE.y + (q.y - EYE.y) * (1. + uBlink * 6. * e);
  vec3 base = tex(q);
  /* облака плывут влево-вверх: два сдвинутых слоя с плавным перекрёстным затуханием */
  float f1 = fract(uT/22.), f2 = fract(uT/22. + .5);
  vec2 dir = normalize(vec2(1.,.55)) * 46. * (.45 + .55*(1. - clamp(q.y/560.,0.,1.)));
  vec2 sA = q + dir*f1, sB = q + dir*f2;
  vec3 cA = mix(base, tex(sA), sky(sA)), cB = mix(base, tex(sB), sky(sB));
  float wA = sin(3.14159*f1), wB = sin(3.14159*f2);
  gl_FragColor = vec4(mix(base, (cA*wA + cB*wB)/(wA+wB), sky(q)), 1.);
}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return cv.remove();
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return cv.remove();
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  const uRes = U("uRes"), uView = U("uView"), uT = U("uT"), uBlink = U("uBlink"), uWind = U("uWind");

  function resize() {
    const r = Math.min(devicePixelRatio || 1, 1.5), w = innerWidth, h = innerHeight;
    cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    gl.viewport(0, 0, cv.width, cv.height);
    const ia = 1672 / 941, a = w / h;
    const vx = a > ia ? 1 : a / ia, vy = a > ia ? ia / a : 1;
    const focus = w <= 768 ? 0.27 : 0.5;                 /* на телефоне держим в кадре персонажа */
    const cx = Math.min(Math.max(focus, vx / 2), 1 - vx / 2);
    gl.uniform2f(uRes, cv.width, cv.height);
    gl.uniform4f(uView, cx, 0.5, vx, vy);
  }
  addEventListener("resize", resize); resize();

  /* ветер: порывы + пружины разной «тяжести» дают инерцию (дерево запаздывает, волосы реагируют быстро) */
  const sp = [{k:1.3,c:1.1,s:1}, {k:3,c:1.6,s:1}, {k:6,c:2.2,s:1}, {k:4,c:1.8,s:.8}].map(o => ({...o, x:0, v:0}));
  const gust = (t) => Math.min(Math.max(.4 + .35*Math.sin(t*.31) + .25*Math.sin(t*.13+2) + .15*Math.sin(t*.77), 0), 1.1);
  let nextBlink = 2.5, blinkStart = -9, dbl = false;
  function blink(t) {
    if (t > nextBlink) { blinkStart = t; dbl = Math.random() < .25; nextBlink = t + 2.5 + Math.random()*4; }
    let b = (t - blinkStart) / .22;
    if (dbl && b > 1.5) b = (t - blinkStart - .38) / .22;
    return b > 0 && b < 1 ? Math.sin(Math.PI * b) : 0;
  }

  const img = new Image();
  img.onload = () => {
    const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.uniform1i(U("uTex"), 0);
    let last = performance.now(), t = 0;
    (function frame(now) {
      const dt = Math.min((now - last) / 1000, .05); last = now; t += dt;
      const g = gust(t), w = [];
      for (const o of sp) { o.v += ((g * o.s - o.x) * o.k - o.v * o.c) * dt; o.x += o.v * dt; w.push(o.x); }
      gl.uniform1f(uT, t); gl.uniform1f(uBlink, blink(t)); gl.uniform4f(uWind, w[0], w[1], w[2], w[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      cv.classList.add("on");
      requestAnimationFrame(frame);
    })(last);
  };
  img.onerror = () => cv.remove();
  img.src = "bg.jpg";
})();
