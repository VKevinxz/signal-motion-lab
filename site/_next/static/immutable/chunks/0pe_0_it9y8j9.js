(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,12407,e=>{"use strict";var t=e.i(637),o=e.i(94621),a=e.i(94709),r=e.i(29044),l=e.i(26203);let n=({x:e,y:t,w:a,h:r})=>`roundedBox(q - vec2(${(0,l.f)(e)}, ${(0,l.f)(t)}), vec2(${(0,l.f)(a)}, ${(0,l.f)(r)}), ${(0,l.f)(o.b.radius)})`,i=`#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCam;
uniform float uTan;
uniform vec3 uPZ;
uniform vec3 uPS;
uniform vec3 uOn;
uniform float uEnd;
uniform float uBloom;
uniform float uGrow;
uniform float uWhite;
uniform vec4 uCol;
uniform float uColB;
uniform float uOutline;
uniform vec3 uMark;
uniform float uOpenR;
uniform vec3 uMouse;
uniform float uFloor;
uniform float uFillY;
uniform float uLand;
uniform float uCharge;
uniform vec3 uAccent;
uniform vec3 uSecondary;
uniform vec3 uWarm;
out vec4 outColor;

#define R 1.0
#define PITCH ${(0,l.f)(o.q.wallPitch)}
#define FPITCH ${(0,l.f)(o.q.facadePitch)}
#define ORANGE uAccent
#define CYAN uSecondary
#define BLUE uSecondary
#define MAGENTA mix(uAccent, uSecondary, 0.5)
#define AMBER uAccent
#define COOL uSecondary
#define WARM uWarm

float pixAng;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 tint(int k) { return k == 1 ? CYAN : ORANGE; }
vec3 fringe(int k) { return k == 1 ? MAGENTA : CYAN; }

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r;
}
float petals(vec2 p, float s) {
  return abs(roundedBox(p, vec2(s * 0.94), s * 0.15));
}
float pourMark(vec2 p, float s) {
  vec2 q = p / s;
  float body = min(min(${n(o.b.body[0])}, ${n(o.b.body[1])}), ${n(o.b.body[2])});
  return min(body, ${n(o.b.drop)}) * s;
}

void traceSegment(vec2 p, vec2 a, vec2 b, float start, inout vec2 nearest) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
  float d = length(p - a - t * ab);
  if (d < nearest.x) nearest = vec2(d, start + t * length(ab));
}
vec2 markPath(vec2 p, bool drop) {
  vec2 nearest = vec2(100.0, 0.0);
  float start = 0.0;
  if (drop) {
    vec2 pts[5] = vec2[5](vec2(.08,.92),vec2(.92,.92),vec2(.92,.20),vec2(.08,.20),vec2(.08,.92));
    for (int i = 0; i < 4; i++) {
      traceSegment(p, pts[i], pts[i+1], start, nearest);
      start += length(pts[i+1] - pts[i]);
    }
  } else {
    vec2 pts[9] = vec2[9](vec2(-.04,.92),vec2(-.92,.92),vec2(-.92,-.92),vec2(.92,-.92),vec2(.92,.06),vec2(.08,.06),vec2(.08,-.48),vec2(-.04,-.48),vec2(-.04,.92));
    for (int i = 0; i < 8; i++) {
      traceSegment(p, pts[i], pts[i+1], start, nearest);
      start += length(pts[i+1] - pts[i]);
    }
  }
  return vec2(min(nearest.y, start - nearest.y), nearest.y);
}

vec3 markCurrent(vec2 p) {
  if (uMark.x < .01 || uLand < .01) return vec3(0.0);
  float ms = uPS.x * uMark.y;
  vec2 q = p / ms;
  if (max(abs(q.x), abs(q.y)) > 1.1) return vec3(0.0);
  float sd = pourMark(p, ms) / ms;
  if (abs(sd) > .14) return vec3(0.0);
  bool drop = q.x > .02 && q.y > .13;
  vec2 path = markPath(q, drop);
  float phase = mod(max(uCharge - ${(0,l.f)(o.E.delay)}, 0.0), ${(0,l.f)(o.E.cycle)});
  float envelope = smoothstep(0.0, .12, phase) * (1.0 - smoothstep(${(0,l.f)(o.E.fadeFrom)}, ${(0,l.f)(o.E.travel)}, phase));
  if (envelope <= 0.0) return vec3(0.0);
  float front = phase * (drop ? .65 : 1.5);
  float head = exp(-pow((path.x - front) / .22, 2.0)) * smoothstep(0.0, .15, phase);
  float reached = 1.0 - smoothstep(front - .10, front + .04, path.x);
  float charged = reached * envelope;
  float drift = (sin(path.y * 13.0 - uTime * 1.7) + .4 * sin(path.y * 39.0 + uTime * 2.3)) * (.002 + head * .006);
  float width = max(.0055, fwidth(sd) * .65);
  float thread = exp(-pow((sd - drift) / width, 2.0));
  float echo = exp(-pow((sd + .012 + drift * 1.6) / (width * .65), 2.0)) * head * .18;
  float halo = exp(-abs(sd) / .025);
  vec3 white = mix(ORANGE, WARM, .8);
  vec3 light = white * (thread * (.10 * charged + head * .50 * envelope) + echo * .45 * envelope);
  light += ORANGE * halo * (.025 * charged + head * .10 * envelope);
  return light * uMark.x * uLand * uMark.z;
}

vec3 ledEmit(vec2 c, float rimGain) {
  vec3 e = vec3(0.0);
  if (uCol.z > 0.001) {
    float dx = c.x - uCol.x;
    float a = abs(dx);
    float extTop = smoothstep(uCol.y + 0.04, uCol.y - 0.3, c.y);
    float ext = extTop * smoothstep(uColB - 0.012, uColB + 0.02, c.y);
    float extSoft = extTop * smoothstep(uColB - 0.55, uColB + 0.1, c.y);
    float core = exp(-a * a / 0.0014);
    float body = exp(-a * a / 0.02);
    float wide = exp(-a / 0.32);
    vec3 fr = dx < 0.0 ? MAGENTA : CYAN;
    float near = smoothstep(uColB + 0.9, uColB, c.y);
    float stream = (0.72 + 0.28 * sin(c.y * 9.0 + uTime * 7.6)) * (0.4 + 0.6 * smoothstep(3.1, 0.6, c.y)) * (1.0 + 0.5 * near);
    vec3 col = (WARM * core * 5.8 + ORANGE * body * 2.9) * ext + mix(ORANGE, fr, smoothstep(0.08, 0.3, a)) * wide * 1.05 * extSoft;
    e += col * stream * uCol.z;
    float dy = c.y - uColB;
    float pulse = 0.8 + 0.2 * sin(uTime * 7.6 + uColB * 9.0);
    float hit = exp(-(a * a) / 0.004 - (dy * dy) / 0.0016);
    float spread = exp(-(dy * dy) / 0.0009) * exp(-a / 0.22) * step(-0.06, dy) * uLand;
    e += (WARM * hit * 3.1 * (0.5 + 0.5 * uLand) + mix(ORANGE, WARM, 0.3) * spread * 1.6) * pulse * uCol.z;
  }
  if (uMark.x > 0.001) {
    float ms = uPS.x * uMark.y;
    float sd = pourMark(c, ms);
    float inMark = smoothstep(0.012, -0.012, sd);
    float fill = inMark * smoothstep(uFillY + 0.03, uFillY - 0.03, c.y);
    float surf = inMark * exp(-pow((c.y - uFillY) / 0.03, 2.0));
    float edge = exp(-sd * sd / 0.0011);
    float breathe = 0.86 + 0.14 * sin(uTime * 1.4);
    vec3 body = mix(WARM * 0.7, ORANGE, smoothstep(0.0, 0.1, c.x) * smoothstep(0.0, 0.1, c.y)) * mix(1.0, 0.7, smoothstep(-0.2, 0.0, sd));
    vec3 rim = mix(c.x < 0.0 ? MAGENTA : CYAN, WARM, 0.55);
    e += (body * fill * 0.46 * uMark.z * breathe + WARM * surf * 1.4 + rimGain * (rim * edge * 0.42 + ORANGE * exp(-abs(sd) / 0.09) * 0.14)) * uMark.x;
  }
  if (uOutline > 0.001) {
    float d = petals(c, uPS.x);
    float reach = uCol.w * 1.25;
    float rev = 1.0 - smoothstep(reach - 0.1, reach, abs(c.x));
    float head = exp(-pow((abs(c.x) - reach + 0.08) / 0.08, 2.0)) * (1.0 - smoothstep(0.85, 1.0, uCol.w));
    float line = exp(-d * d / 0.0011);
    e += (mix(ORANGE, WARM, 0.45) * line * 2.0 + ORANGE * exp(-d / 0.07) * 0.3) * rev * (1.0 + head * 1.8) * uOutline;
  }
  if (uOpenR > 0.0 && uOpenR < 1.6 && max(abs(c.x), abs(c.y)) < R) {
    float r = length(c);
    e += mix(CYAN, WARM, 0.35) * exp(-pow((r - uOpenR + 0.1) / 0.07, 2.0)) * 1.1;
  }
  return e;
}

vec3 neon(float d, float t, float on, vec3 col) {
  float tube = max(0.010, t * pixAng * 1.3);
  float e = 0.010 / tube;
  float d2 = d * d;
  float body = exp(-d2 / (tube * tube)) * e;
  float core = exp(-d2 / (tube * tube * 0.16)) * e;
  float halo = exp(-d / 0.05) * 0.42 + exp(-d / 0.24) * 0.13;
  return (col * (body * 2.6 + halo) + mix(col, vec3(1.0), 0.8) * core * 2.4) * on;
}

vec3 spill(vec3 p) {
  vec3 s = vec3(0.0);
  for (int k = 0; k < 3; k++) {
    float on = uOn[k];
    float dz = p.z - uPZ[k];
    if (on <= 0.001 || abs(dz) > 7.0) continue;
    float dist = length(vec2(petals(p.xy, uPS[k]), dz));
    s += tint(k) * on * (exp(-dist / 0.16) * 0.9 + exp(-dist / 0.9) * 0.22);
  }
  return s;
}

vec3 endLight(vec3 p) {
  float de = max(p.z - uEnd, 0.0);
  vec3 col = mix(BLUE, CYAN, exp(-de / 4.0));
  return col * (exp(-de / 5.0) * 0.4 + 0.18 * exp(-de / 12.0)) * (0.6 + 0.4 * uBloom);
}

vec3 bands(vec3 p) {
  float z = p.z + uTime * 0.6;
  float id = floor(z / 3.4);
  float f = fract(z / 3.4) - 0.5;
  vec3 col = mod(id, 2.0) < 1.0 ? CYAN : ORANGE;
  return col * exp(-f * f * 60.0) * 0.16;
}

vec3 surface(vec3 p, vec3 n, vec2 suv, float t, vec3 rd, float gain, float pitch, bool emit) {
  float cosI = max(abs(dot(rd, n)), 0.06);
  float fw = t * pixAng / cosI / pitch;
  vec2 g = suv / pitch;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float dd = length(f);
  float r = 0.16;
  float aa = clamp(fw * 0.6, 0.02, 0.5);
  float dotM = smoothstep(r + aa, r - aa, dd);
  float halo = exp(-dd * dd * 26.0) * 0.3;
  float led = (dotM + halo) * (0.4 + 0.6 * hash(id));
  led = mix(led, 0.085, smoothstep(0.35, 1.1, fw));
  float fog = exp(-t * 0.17);
  vec3 sp = spill(p);
  vec3 ex = endLight(p);
  float wave = 1.0 + 0.22 * smoothstep(0.6, 1.0, sin(p.z * 0.5 + uTime * 0.9));
  vec3 amb = mix(AMBER, COOL, smoothstep(1.5, 10.0, t));
  vec3 ambient = amb * (0.11 * fog * wave + 0.10 * exp(-t * 0.6));
  vec3 L = ambient + sp * 1.5 + ex + bands(p) * (0.35 + 0.65 * fog);
  vec3 base = vec3(0.012, 0.02, 0.016) * fog + sp * 0.08 + ex * 0.04;
  vec3 res = base + led * gain * L;
  if (!emit && abs(n.z) < 0.5 && !(n.y > 0.5 && p.z > 0.0)) {
    float rib = abs(fract((p.z + 0.08) / 2.4) - 0.5);
    float edge = exp(-rib * rib * 18000.0);
    float recess = exp(-rib * rib * 1400.0);
    res *= 1.0 - recess * 0.3;
    res += mix(COOL, WARM, 0.3) * edge * fog * 0.15;
  }
  if (emit) {
    vec3 em = ledEmit((id + 0.5) * pitch, 1.0);
    float re = 0.21;
    float lit = smoothstep(re + aa, re - aa, dd) + exp(-dd * dd * 12.0) * 0.4;
    res += em * lit + ledEmit(p.xy, 0.0) * 0.09 + markCurrent(p.xy);
  }
  if (emit || (n.y > 0.5 && p.z > 0.0 && uCam.z > uPZ.x + 0.1)) {
    float md = length(gl_FragCoord.xy - uMouse.xy) / (uRes.y * 0.13);
    float mg = exp(-md * md) * uMouse.z;
    vec3 mc = mix(WARM, ORANGE, smoothstep(0.0, 1.0, md));
    float lit = smoothstep(0.21 + aa, 0.21 - aa, dd) + exp(-dd * dd * 12.0) * 0.4;
    res += mc * mg * lit * (0.4 + 0.2 * hash(id + floor(uTime * 6.0))) * (emit ? 1.0 : 0.6);
  }
  return res;
}

vec3 reflection(vec3 p, vec3 rd) {
  vec3 rr = vec3(rd.x, -rd.y, rd.z);
  vec3 c = vec3(0.0);
  if (rr.z >= -0.0001) return c;
  for (int k = 0; k < 3; k++) {
    float tk = (uPZ[k] - p.z) / rr.z;
    if (tk <= 0.0 || uOn[k] <= 0.001) continue;
    vec3 q = p + rr * tk;
    float d = petals(q.xy, uPS[k]);
    float b = 0.025 + tk * 0.05;
    c += tint(k) * uOn[k] * (exp(-d / b) * 0.9 + exp(-d / (b * 4.0)) * 0.2);
  }
  if (p.z > 0.0) {
    vec3 q = p + rr * (-p.z / rr.z);
    c += ledEmit(q.xy, 0.0) * 0.16;
    float fpx = uRes.y * 0.5 / uTan;
    float depth = uCam.z - q.z;
    vec2 onScreen = uRes * 0.5 + (q.xy - uCam.xy) / depth * fpx;
    float pd = length(onScreen - uMouse.xy) / (uRes.y * 0.16);
    c += mix(WARM, ORANGE, smoothstep(0.0, 1.0, pd)) * exp(-pd * pd) * uMouse.z * 0.9;
    float blur = 0.09 + min(p.z, 4.0) * 0.075;
    float sd = pourMark(q.xy, uPS.x * uMark.y);
    float silhouette = smoothstep(blur, -blur, sd);
    float bloom = exp(-abs(sd) / (blur * 1.8));
    float edgeSoftness = 0.045 + min(p.z, 4.0) * 0.025;
    float contour = exp(-sd * sd / (edgeSoftness * edgeSoftness));
    vec3 wash = mix(ORANGE, WARM, 0.4) * (silhouette * 0.14 + contour * 0.24 + bloom * 0.04) * uMark.x * uMark.z;
    float beam = exp(-q.x * q.x / (blur * 2.5)) * exp(-abs(q.y - uColB) / 1.8);
    wash += mix(ORANGE, WARM, 0.25) * beam * uCol.z * 0.035;
    wash += ORANGE * exp(-petals(q.xy, uPS.x) / (blur * 1.5)) * uOutline * 0.035;
    c += wash * exp(-p.z * 0.25);
  }
  float te = (uEnd - p.z) / rr.z;
  vec3 e = p + rr * te;
  float r = length(e.xy);
  float w = 0.04 + te * 0.03;
  c += mix(CYAN, WARM, 0.45) * exp(-r / w) * 0.7 * uBloom * smoothstep(0.2, 0.9, uOpenR);
  return c;
}

vec3 darkScene(vec3 ro, vec3 rd, vec2 uv) {
  float t = 1e5;
  int kind = 0;
  vec3 o = ro;
  float tb = 0.0;
  bool inside = ro.z <= 0.0;
  float openA = 1.0;
  vec3 closedCol = vec3(0.0);
  if (!inside) {
    float tg = rd.y < 0.0 ? (uFloor - ro.y) / rd.y : 1e5;
    float tf = rd.z < 0.0 ? -ro.z / rd.z : 1e5;
    vec3 pf = ro + rd * tf;
    bool hole = abs(pf.x) < R && abs(pf.y) < R && tf < 1e4;
    if (hole) openA = 1.0 - smoothstep(uOpenR - 0.28, uOpenR, length(pf.xy));
    if (tg < tf) { t = tg; kind = 4; openA = 1.0; }
    else if (!hole || openA < 0.002) { t = tf; kind = 3; openA = 1.0; }
    else {
      if (openA < 0.998) closedCol = surface(pf, vec3(0.0, 0.0, 1.0), pf.xy, tf, rd, 0.7, FPITCH, true);
      o = pf; tb = tf; inside = true;
    }
  }
  vec3 n = vec3(0.0);
  if (inside) {
    float tx = abs(rd.x) > 1e-5 ? (sign(rd.x) * R - o.x) / rd.x : 1e5;
    float ty = abs(rd.y) > 1e-5 ? (sign(rd.y) * R - o.y) / rd.y : 1e5;
    float tw = min(tx, ty);
    if (o.z + rd.z * tw > uEnd) {
      t = tb + tw;
      if (tx < ty) { kind = 1; n = vec3(-sign(rd.x), 0.0, 0.0); }
      else { kind = rd.y < 0.0 ? 2 : 1; n = vec3(0.0, -sign(rd.y), 0.0); }
    } else {
      kind = 0;
      t = rd.z < 0.0 ? tb + (uEnd - o.z) / rd.z : 1e5;
    }
  }
  vec3 p = ro + rd * t;
  vec3 col = vec3(0.0);
  if (kind == 0) col = surface(p, vec3(0.0, 0.0, 1.0), p.xy, t, rd, 0.45, PITCH, false);
  else if (kind == 1) col = surface(p, n, abs(n.x) > 0.5 ? vec2(p.z, p.y) : vec2(p.z, p.x), t, rd, 1.0, PITCH, false);
  else if (kind == 3) col = surface(p, vec3(0.0, 0.0, 1.0), p.xy, t, rd, 0.7, FPITCH, true);
  else {
    col = surface(p, vec3(0.0, 1.0, 0.0), vec2(p.z, p.x), t, rd, kind == 2 ? 0.6 : 0.5, PITCH, false);
    if (kind == 4) {
      float depth = max(p.z, 0.0);
      float pool = exp(-p.x * p.x / 20.0 - pow((depth - 0.9) / 3.0, 2.0));
      float contactFade = smoothstep(0.0, 0.45, depth);
      col += mix(COOL, WARM, 0.3) * (0.006 + pool * 0.022) * contactFade * exp(-depth * 0.12);
      float lineWidth = max(t * pixAng / max(abs(rd.y), 0.06), 0.004);
      float divider = 1.0 - smoothstep(0.0, lineWidth, depth);
      col += ORANGE * divider * (0.15 * 0.5);
    }
    float fr = 0.12 + 0.5 * pow(1.0 - abs(rd.y), 4.0);
    col += reflection(p, rd) * fr;
  }
  col = mix(closedCol, col, openA);

  for (int k = 0; k < 3; k++) {
    float on = uOn[k];
    if (on <= 0.001 || rd.z >= 0.0) continue;
    float tk = (uPZ[k] - ro.z) / rd.z;
    if (tk <= 0.0 || tk > t) continue;
    vec3 q = ro + rd * tk;
    float d = petals(q.xy, uPS[k]);
    col += neon(d, tk, on, tint(k));
    float ab = 0.004 + 0.02 * dot(uv, uv);
    vec2 c0 = ro.xy;
    float db = petals(c0 + (q.xy - c0) * (1.0 + ab), uPS[k]);
    float dr = petals(c0 + (q.xy - c0) * (1.0 - ab), uPS[k]);
    col += fringe(k) * max(exp(-db / 0.03) - exp(-dr / 0.03), 0.0) * 0.4 * on;
  }

  if (rd.z < 0.0 && ro.z > uEnd) {
    vec3 toL = normalize(vec3(0.0, 0.0, uEnd) - ro);
    float ang = length(rd - toL);
    float vis = 1.0;
    if (ro.z > 0.0) {
      vec2 m = ro.xy + toL.xy * (-ro.z / toL.z);
      vis = (1.0 - smoothstep(0.82, 0.98, max(abs(m.x), abs(m.y)))) * (1.0 - smoothstep(uOpenR - 0.28, uOpenR, length(m)));
    }
    float g = uGrow;
    float a0 = 0.006 * g;
    float core = exp(-(ang * ang) / (a0 * a0));
    float mid = exp(-ang / (0.022 * g));
    float outer = exp(-ang / (0.09 * g));
    col += vis * uBloom * (WARM * core * 2.2 + mix(CYAN, WARM, 0.3) * mid * 0.42 + BLUE * outer * 0.10);
  }
  return col;
}

void main() {
  pixAng = 2.0 * uTan / uRes.y;
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 rd = normalize(vec3(uv * uTan, -1.0));
  vec3 c = 1.0 - exp(-darkScene(uCam, rd, uv) * 1.15);
  c *= 1.0 - 0.35 * smoothstep(0.6, 1.8, length(uv));
  c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(c * (1.0 - uWhite), 1.0 - uWhite);
}`;var s=e.i(430);async function c(e){let t=await (0,a.f)(e,i);if(!t)return null;let l=(0,r.f)(document.documentElement,{accent:"--background-accent",secondary:"--background-accent-cool",white:"--background-raised"}),n=l.white.map((e,t)=>e+(l.accent[t]-e)*o.t.warmAccent);return t.set("uTan",s.G),t.set("uPZ",...o.q.portals.z),t.set("uPS",...o.q.portals.s),t.set("uEnd",o.q.end),t.set("uAccent",...l.accent.slice(0,3)),t.set("uSecondary",...l.secondary.slice(0,3)),t.set("uWarm",...n.slice(0,3)),t}e.s(["runTunnel",0,function({host:e,stage:a,canvas:r,mark:l,splash:n,sceneAt:i,onFrame:d,onStatic:f}){let u=null,p=!1,m=!1,x=0,v=0,h=0,y=1,b=0,g=0,k=.5,A={x:0,y:0},M=0,w=o.I.slowFrameMs,R=()=>{v=a.clientWidth,y=(h=a.clientHeight)/2/s.G;let t=e.getBoundingClientRect();b=t.top+window.scrollY,g=t.height-h;let r=a.getBoundingClientRect(),n=l.getBoundingClientRect();k=n.height/2*s.g/(y*o.q.portals.s[0]*o.b.half),A.x=(v/2-(n.left-r.left+n.width/2))*s.g/y,A.y=(n.top-r.top+n.height/2-h/2)*s.g/y;let i=Math.min(window.devicePixelRatio||1,o.I.maxPixelRatio,Math.sqrt(o.I.maxPixels/(v*h)))*o.I.quality[M];u?.resize(Math.round(v*i),Math.round(h*i))},z={x:-1e4,y:-1e4,tx:-1e4,ty:-1e4,cx:-1e4,cy:-1e4,s:0,ts:0,hoverable:!1},C=e=>{z.hoverable="mouse"===e.pointerType,z.cx=e.clientX,z.cy=e.clientY,z.ts=1},E=()=>z.ts=0,O=()=>{cancelAnimationFrame(x),x=0,G=0,L=0},q=()=>{O(),u?.dispose(),u=null,e.dataset.mode="static",f?.()},S=performance.now(),P=S,F=!1,T=!1,N=1/0,B=0,G=0,W=0,L=0,I=0,$=0,Y=!1,Z="",H=[],U=t=>{if(x=requestAnimationFrame(U),!u)return;let l=b-window.scrollY,c=o.Z.maxScreensPerSecond*h*Math.min(t-G,o.I.maxFrameGapMs)/1e3,f=l-B,p=Math.max(0,f<0?l+g:-l),m=Math.max(0,Math.min(Math.abs(f)-c,p));B=G?l-Math.sign(f)*m:l,G=t;let C=B,E=a.getBoundingClientRect();z.tx=z.cx-E.left,z.ty=z.cy-E.top,z.x<-1e3&&z.cx>-1e3&&(z.x=z.tx,z.y=z.ty);let O=Math.abs(z.tx-z.x)>o.Z.pointerSettlePx||Math.abs(z.ty-z.y)>o.Z.pointerSettlePx||Math.abs(z.ts-z.s)>o.Z.pointerSettleFade;(C!==N||O)&&(W=t),N=C;let D=t-W<o.I.idleAfterMs;if(!D&&$++%o.I.idleDrawEvery)return;if(L){if(H.push((t-L)/(D?1:o.I.idleDrawEvery)),t-I>o.I.sampleWindowMs&&H.length>=o.I.minSamples){let e=H.sort((e,t)=>e-t)[Math.floor(H.length/2)];if(H.length=0,I=t,e>w){if(M===o.I.quality.length-1)return q();M++,R()}}}else I=t;L=t;let j=i(C,h,k),_={x:A.x*(1-j.align),y:A.y*(1-j.align),z:j.camZ},K=(e,t,o)=>{let a=_.z-o;return{sx:v/2+(e-_.x)/a*y,sy:h/2-(t-_.y)/a*y,D:a}},X=j.mark>o.E.markOn&&j.landed>o.E.landedOn&&j.column>o.E.columnOn;X&&!F&&(P=t),F=X;let J=K(0,0,0),Q=y*o.q.portals.s[0]*j.markScale/J.D,V=X&&z.hoverable&&z.ts>0&&(0,s.c)((z.tx-J.sx)/Q,(J.sy-z.ty)/Q),ee=Math.max(0,(t-P)/1e3-o.E.delay)%o.E.cycle;if(V&&!T&&ee>=o.E.travel&&(P=t-1e3*o.E.delay),T=V,n){let e=K(0,j.columnBottom,0),t=`${j.splash.toFixed(3)}|${e.sx.toFixed(1)}|${e.sy.toFixed(1)}`;t!==Z&&(Z=t,n.style.visibility=j.splash>o.Z.hidden?"":"hidden",n.style.transform=`translate3d(${e.sx.toFixed(1)}px, ${e.sy.toFixed(1)}px, 0)`,n.style.opacity=j.splash.toFixed(3))}let et=d?.(j,K)??0;if("live"!==e.dataset.mode&&(e.dataset.mode="live"),j.white>=1-o.Z.hidden){Y||u.clear(),Y=!0;return}Y=!1,z.x+=(z.tx-z.x)*o.Z.pointerFollow,z.y+=(z.ty-z.y)*o.Z.pointerFollow,z.s+=(z.ts-z.s)*o.Z.pointerFade;let eo=r.width/v,ea=u.set;ea("uTime",(t-S)/1e3),ea("uCam",_.x,_.y,_.z),ea("uOn",...j.portals),ea("uBloom",(1-o.j.textDim*et)*(1+o.j.near*j.bloomNear)),ea("uGrow",j.grow),ea("uWhite",j.white),ea("uCol",0,j.columnTop,j.column,j.draw),ea("uColB",j.columnBottom),ea("uOutline",j.outline),ea("uMark",j.mark,j.markScale,j.markFill),ea("uFillY",j.fillY),ea("uLand",j.landed),ea("uOpenR",j.open),ea("uFloor",j.floor),ea("uCharge",Math.max(0,(t-P)/1e3)),ea("uMouse",z.x*eo,(h-z.y)*eo,z.s),u.draw()},D=()=>{!x&&m&&u&&(x=requestAnimationFrame(U))},j=new IntersectionObserver(([e])=>{(m=e.isIntersecting)?D():O()});j.observe(e);let _=new ResizeObserver(R);_.observe(a),_.observe(document.body),window.addEventListener("pointermove",C,{passive:!0}),document.documentElement.addEventListener("pointerleave",E),r.addEventListener("webglcontextlost",q);let K=async()=>{let[e,t]=await Promise.all([c(r),X]);return p?e?.dispose():e?void(u=e,w=Math.max(o.I.slowFrameMs,t*o.I.slowFrameRatio),R(),D()):q()},X=new Promise(e=>{let t=0,a=0,r=1/0,l=n=>{t&&(r=Math.min(r,n-t)),t=n,++a>o.I.refreshSamples?e(r):requestAnimationFrame(l)};requestAnimationFrame(l)}),J=()=>{},Q=new IntersectionObserver(([e])=>{e.isIntersecting&&(Q.disconnect(),J=(0,t.v)(K))},{rootMargin:o.I.prepareMargin});Q.observe(e);let V=matchMedia(o.r),ee=()=>{p=!0,Q.disconnect(),J(),q()};return V.addEventListener("change",ee),()=>{p=!0,O(),J(),Q.disconnect(),V.removeEventListener("change",ee),j.disconnect(),_.disconnect(),window.removeEventListener("pointermove",C),document.documentElement.removeEventListener("pointerleave",E),r.removeEventListener("webglcontextlost",q),u?.dispose()}}],12407)}]);