(function() {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var V = 600;
  var CHUNK = 400;
  var LEAD = 900;
  var REACH = 420;
  var REGION_LEN = 2000;
  var CENTER = 520;
  var DRIFT = 24;
  var GENTLE = 0.25;
  var STORE = 'landscape-journey';

  var REGIONS = ['gafsa', 'kebili', 'zarzis'];

  var LAYERS = [
    { f: 0.5, shift: 1, base: [400, 426, 402], amp: [10, 5, 0] },
    { f: 0.75, shift: 0, base: [470, 446, 514], amp: [16, 3, 3] },
    { f: 1, shift: 0, base: [560, 566, 568], amp: [14, 4, 5] }
  ];

  var TAPER = {
    both: function(t) { return Math.pow(Math.sin(Math.PI * t), 0.5); },
    tail: function(t) { return 1 - 0.85 * t; },
    trunk: function(t) { return 1.15 - 0.5 * t; },
    limb: function(t) { return 1.25 - 0.75 * t; },
    flat: function() { return 1; }
  };

  var seed;
  var N;
  var rnd;

  function mulberry(a) {
    return function() {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mix(a, b) {
    var h = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ b;
    h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function makeNoise(rand) {
    var p = new Uint8Array(512);
    var q = [];
    var i, j, t;
    for (i = 0; i < 256; i++) q[i] = i;
    for (i = 255; i > 0; i--) {
      j = Math.floor(rand() * (i + 1));
      t = q[i]; q[i] = q[j]; q[j] = t;
    }
    for (i = 0; i < 512; i++) p[i] = q[i & 255];

    function fade(v) { return v * v * v * (v * (v * 6 - 15) + 10); }

    function grad(h, x, y) {
      switch (h & 7) {
        case 0: return x + y;
        case 1: return -x + y;
        case 2: return x - y;
        case 3: return -x - y;
        case 4: return x;
        case 5: return -x;
        case 6: return y;
        default: return -y;
      }
    }

    return function(x, y) {
      var xf = Math.floor(x), yf = Math.floor(y);
      var X = xf & 255, Y = yf & 255;
      x -= xf; y -= yf;
      var u = fade(x), v = fade(y);
      var a = p[X] + Y, b = p[X + 1] + Y;
      var n0 = grad(p[a], x, y) + u * (grad(p[b], x - 1, y) - grad(p[a], x, y));
      var n1 = grad(p[a + 1], x, y - 1) + u * (grad(p[b + 1], x - 1, y - 1) - grad(p[a + 1], x, y - 1));
      return n0 + v * (n1 - n0);
    };
  }

  function rand(a, b) { return a + (b - a) * rnd(); }

  function smooth(t) { return t * t * (3 - 2 * t); }

  function round1(v) { return Math.round(v * 10) / 10; }

  function seg(x0, y0, x1, y1, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
    return out;
  }

  function quad(a, b, c, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, s = 1 - t;
      out.push([s * s * a[0] + 2 * s * t * b[0] + t * t * c[0], s * s * a[1] + 2 * s * t * b[1] + t * t * c[1]]);
    }
    return out;
  }

  function blob(cx, cy, rx, ry, rough, n, rot) {
    var out = [], off = rnd() * 500, c = Math.cos(rot || 0), s = Math.sin(rot || 0);
    n = n || 20;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var k = 1 + rough * N(off + Math.cos(a) * 1.3, off + Math.sin(a) * 1.3);
      var px = Math.cos(a) * rx * k, py = Math.sin(a) * ry * k;
      out.push([cx + px * c - py * s, cy + px * s + py * c]);
    }
    return out;
  }

  function densify(pts, step, jit) {
    var out = [], off = rnd() * 300, acc = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
      var n = Math.max(1, Math.ceil(d / step));
      for (var k = 0; k < n; k++) {
        var t = k / n, j = jit * N(off + acc * 0.05, 7.7);
        acc += d / n;
        out.push([a[0] + dx * t - dy / d * j, a[1] + dy * t + dx / d * j]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function Sheet(shift) {
    this.ops = [];
    this.shift = shift;
    this.tf = null;
  }

  Sheet.prototype.add = function(cls, d, o) {
    if (!d) return;
    var last = this.ops[this.ops.length - 1];
    if (last && last.cls === cls && cls !== 'w') last.d += d;
    else this.ops.push({ cls: cls, d: d, o: o });
  };

  Sheet.prototype.shape = function(pts) {
    var n = pts.length, i, area = 0, out = '';
    if (n < 3) return '';
    if (this.tf) pts = pts.map(this.tf);
    for (i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      area += a[0] * b[1] - b[0] * a[1];
    }
    for (var k = 0; k < n; k++) {
      var p = pts[area < 0 ? n - 1 - k : k];
      out += (k ? 'L' : 'M') + round1(p[0]) + ' ' + round1(p[1]);
    }
    return out + 'Z';
  };

  Sheet.prototype.ink = function(level, pts) {
    if (level === 'p') this.add('p', this.shape(pts));
    else this.add('i' + Math.min(5, level + this.shift), this.shape(pts));
  };

  Sheet.prototype.paper = function(pts) {
    this.add('p', this.shape(pts));
  };

  Sheet.prototype.wash = function(pts, strength) {
    this.add('w', this.shape(pts), round1(Math.min(1, strength * Math.pow(0.7, this.shift)) * 10) / 10);
  };

  Sheet.prototype.brush = function(level, pts, wid, taper, noi, off) {
    var n = pts.length;
    if (n < 2) return;
    var L = [], R = [], acc = 0;
    taper = taper || TAPER.both;
    noi = noi === undefined ? 0.5 : noi;
    off = off === undefined ? rnd() * 500 : off;
    for (var i = 0; i < n; i++) {
      var a = pts[i > 0 ? i - 1 : 0], b = pts[i < n - 1 ? i + 1 : n - 1];
      var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (i > 0) {
        var ex = pts[i][0] - pts[i - 1][0], ey = pts[i][1] - pts[i - 1][1];
        acc += Math.sqrt(ex * ex + ey * ey);
      }
      var w = wid * taper(i / (n - 1)) * Math.max(0.1, 1 + noi * 1.5 * N(off + acc * 0.04, 3.7));
      L.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]);
      R.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]);
    }
    this.ink(level, L.concat(R.reverse()));
  };

  Sheet.prototype.dry = function(level, pts, wid, noi, gap, off) {
    var run = [], o = off === undefined ? rnd() * 500 : off;
    for (var i = 0; i < pts.length; i++) {
      var keep = N(o + i * 0.21, 9.1) > gap;
      if (keep) run.push(pts[i]);
      if ((!keep || i === pts.length - 1) && run.length) {
        if (run.length >= 3) this.brush(level, run, wid, TAPER.both, noi);
        run = [];
      }
    }
  };

  function journey(L, x) {
    return (x - CENTER) / LAYERS[L].f + CENTER;
  }

  function regionAt(J) {
    var p = J / REGION_LEN;
    p = ((p % 3) + 3) % 3;
    var k = Math.floor(p) % 3, f = p - Math.floor(p);
    var t = f < 0.6 ? 0 : smooth((f - 0.6) / 0.4);
    return { k: k, n: (k + 1) % 3, t: t };
  }

  function pickRegion(L, x) {
    var g = regionAt(journey(L, x));
    return rnd() < g.t ? { r: g.n, w: g.t } : { r: g.k, w: 1 - g.t };
  }

  function groundY(L, x) {
    var g = regionAt(journey(L, x)), lay = LAYERS[L];
    var base = lay.base[g.k] * (1 - g.t) + lay.base[g.n] * g.t;
    var amp = lay.amp[g.k] * (1 - g.t) + lay.amp[g.n] * g.t;
    return base + amp * (N(x * 0.004 + L * 37.1, 0.37) + 0.4 * N(x * 0.017 + L * 11.3, 1.91));
  }

  function jebel(sh, x, base, w, h, fade) {
    sh.shift += fade;
    var n = Math.max(16, Math.round(w / 7)), top = [], i, k, u, e;
    var peak = rand(0.3, 0.7), steepLeft = rnd() < 0.5, off = rnd() * 300, x0 = x - w / 2;
    for (i = 0; i <= n; i++) {
      u = i / n;
      e = u < peak ? u / peak : (1 - u) / (1 - peak);
      e = Math.pow(Math.sin(e * Math.PI / 2), (u < peak) === steepLeft ? 0.7 : 1.5);
      top.push([x0 + u * w, base - h * e * (0.86 + 0.2 * N(off + u * 4.3, 1.3) + 0.07 * N(off + u * 17, 2.9))]);
    }
    sh.paper(top.concat([[x0 + w, base + 30], [x0, base + 30]]));
    sh.wash(top.concat([[x0 + w, base + 6], [x0, base + 6]]), 1);
    sh.brush(2, top, 1.3, TAPER.both, 0.6);

    var bands = Math.max(2, Math.round(h / 16)), tilt = rand(-0.25, 0.25);
    for (k = 1; k <= bands; k++) {
      var run = [];
      for (i = 0; i <= n; i++) {
        u = i / n;
        var depth = k * (h / bands) * 0.55 * (1 + 0.35 * N(off + k * 2.7, i * 0.07 + 5.1)) + tilt * (u - 0.5) * h;
        var y = top[i][1] + Math.max(2, depth);
        if (y < base - 3) run.push([top[i][0], y]);
        else {
          if (run.length > 3) sh.dry(3, run, 0.55, 0.5, 0);
          run = [];
        }
      }
      if (run.length > 3) sh.dry(3, run, 0.55, 0.5, 0);
    }

    var gullies = Math.round(w / 28);
    for (k = 0; k < gullies; k++) {
      i = Math.floor(rand(0.08, 0.92) * n);
      var len = (base - top[i][1]) * rand(0.2, 0.65), gx = top[i][0], gy = top[i][1] + 1, pts = [];
      for (var j = 0; j <= 6; j++) pts.push([gx + N(off + k * 3.3, j * 0.3) * 4, gy + len * j / 6]);
      sh.brush(3, pts, 0.8, TAPER.tail, 0.5);
    }
    sh.shift -= fade;
  }

  function mesa(sh, x, base, w, h) {
    var T = 1 + Math.floor(rnd() * 3), tiers = [], j, lx = x - w / 2, rx = x + w / 2;
    for (j = 0; j < T; j++) {
      tiers.push({ l: lx, r: rx, y: base - h * (j + 1) / T * (j === T - 1 ? 1 : rand(0.9, 1)) });
      var inset = (rx - lx) * rand(0.06, 0.16);
      lx += inset * rand(0.4, 1.6);
      rx -= inset * rand(0.4, 1.6);
    }
    var corners = [[tiers[0].l, base + 30]], prev = base + 30;
    for (j = 0; j < T; j++) {
      corners.push([tiers[j].l, prev], [tiers[j].l, tiers[j].y]);
      prev = tiers[j].y;
    }
    for (j = T - 1; j >= 0; j--) {
      corners.push([tiers[j].r, tiers[j].y], [tiers[j].r, j > 0 ? tiers[j - 1].y : base + 30]);
    }
    var sil = densify(corners, 6, 1.1);
    sh.paper(sil);
    sh.wash(sil, 0.8);
    var outline = sil.filter(function(p) { return p[1] < base + 1; });
    sh.brush(1, outline, 1.15, TAPER.both, 0.5);

    for (j = 0; j < T; j++) {
      var t = tiers[j], bottom = j > 0 ? tiers[j - 1].y : base, band = bottom - t.y;
      var flutes = Math.round((t.r - t.l) / 4);
      for (var k = 0; k < flutes; k++) {
        var fx = rand(t.l + 2, t.r - 2), fy = t.y + rand(1, 4), fl = band * rand(0.25, 0.95);
        sh.brush(rnd() < 0.4 ? 3 : 4, seg(fx, fy, fx + rand(-1.5, 1.5), fy + fl, 4), rand(0.35, 0.7), TAPER.tail, 0.4);
      }
      sh.dry(2, densify([[t.l + 2, t.y + 2.5], [t.r - 2, t.y + 2.5]], 5, 0.6), 0.6, 0.5, -0.1);
      var lines = Math.floor(band / 12);
      for (k = 1; k <= lines; k++) {
        var ly = t.y + band * k / (lines + 1) + rand(-2, 2);
        sh.dry(4, densify([[t.l + 3, ly], [t.r - 3, ly + rand(-1, 1)]], 6, 0.8), 0.45, 0.5, 0.1);
      }
    }
  }

  function palm(sh, x, base, h, lean, detail) {
    var n = 10, trunk = [], i, t, bend = rand(-0.15, 0.15);
    for (i = 0; i <= n; i++) {
      t = i / n;
      trunk.push([x + lean * h * Math.pow(t, 1.6) + bend * h * Math.sin(t * Math.PI) * 0.3, base - h * t]);
    }
    var top = trunk[n], tw = Math.max(0.5, h * 0.02);
    sh.brush('p', trunk, tw * 1.7, TAPER.flat, 0);
    sh.brush(2, trunk, tw, TAPER.trunk, 0.35);
    if (detail) {
      var notches = Math.round(h / 9);
      for (i = 1; i < notches; i++) {
        var f = i / notches * n, a = trunk[Math.floor(f)], b = trunk[Math.min(n, Math.floor(f) + 1)], r = f - Math.floor(f);
        var px = a[0] + (b[0] - a[0]) * r, py = a[1] + (b[1] - a[1]) * r, nw = tw * (1.15 - 0.5 * i / notches) * 1.3;
        sh.brush(1, [[px - nw, py + nw * 0.4], [px, py - nw * 0.1], [px + nw, py - nw * 0.5]], Math.max(0.2, tw * 0.22), TAPER.both, 0.2);
      }
    }

    var F = detail ? Math.round(rand(10, 15)) : Math.round(rand(6, 9));
    for (var fi = 0; fi < F; fi++) {
      var ang = Math.PI * (-0.12 + 1.24 * (fi + rand(-0.3, 0.3)) / (F - 1));
      var L = h * rand(0.26, 0.4) * (0.75 + 0.25 * Math.sin(ang));
      var droop = rand(0.5, 1.0) * (1 - 0.6 * Math.max(0, Math.sin(ang)));
      var pts = [];
      for (var k = 0; k <= 8; k++) {
        var s = k / 8;
        pts.push([top[0] + Math.cos(ang) * L * s, top[1] - Math.sin(ang) * L * s + droop * L * s * s]);
      }
      sh.brush(2, pts, Math.max(0.35, L * 0.018), TAPER.tail, 0.3);
      if (!detail) continue;
      for (k = 2; k <= 8; k++) {
        var p = pts[k], q = pts[k - 1];
        var dx = p[0] - q[0], dy = p[1] - q[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= d; dy /= d;
        var len = L * 0.2 * (1 - 0.55 * k / 8);
        for (var side = -1; side <= 1; side += 2) {
          var rx = dx * Math.cos(0.9) - side * dy * Math.sin(0.9), ry = side * dx * Math.sin(0.9) + dy * Math.cos(0.9) + 0.6;
          var rl = Math.sqrt(rx * rx + ry * ry);
          sh.ink(2, [p, [p[0] + rx / rl * len, p[1] + ry / rl * len], [p[0] + dx * len * 0.28, p[1] + dy * len * 0.28]]);
        }
      }
    }
    sh.ink(1, blob(top[0], top[1] + h * 0.01, h * 0.03, h * 0.022, 0.3, 8));
    if (detail && rnd() < 0.6) {
      var dates = 1 + Math.floor(rnd() * 3);
      for (i = 0; i < dates; i++) {
        sh.ink(2, blob(top[0] + rand(-1, 1) * h * 0.045, top[1] + h * 0.05, h * 0.016, h * 0.03, 0.35, 8));
      }
    }
  }

  function olive(sh, x, base, h) {
    var cx = x + rand(-0.08, 0.08) * h, cy = base - h * 0.68, spread = h * rand(0.55, 0.8), masses = [], i, k;
    var count = 3 + Math.floor(rnd() * 3);
    for (i = 0; i < count; i++) {
      masses.push({
        x: cx + rand(-0.5, 0.5) * spread,
        y: cy + rand(-0.18, 0.1) * h,
        rx: spread * rand(0.35, 0.55),
        ry: h * rand(0.18, 0.28)
      });
    }
    masses.sort(function(a, b) { return a.y - b.y; });
    var forks = 2 + Math.floor(rnd() * 2);
    for (i = 0; i < forks; i++) {
      var m = masses[(i * 2 + 1) % masses.length];
      var a = [x + rand(-0.03, 0.03) * h, base + 1];
      var b = [x + (m.x - x) * 0.25 + rand(-0.08, 0.08) * h, base - h * rand(0.25, 0.38)];
      var c = [m.x + rand(-0.2, 0.2) * m.rx, m.y + m.ry * 0.3];
      var limb = quad(a, b, c, 9);
      sh.brush('p', limb, h * 0.05, TAPER.limb, 0);
      sh.brush(i === 0 ? 1 : 2, limb, h * 0.034, TAPER.limb, 0.7);
    }
    sh.brush(4, seg(x - spread * 0.6, base + 1.5, x + spread * 0.6, base + 1.5, 6), 1.2, TAPER.both, 0.4);

    for (i = 0; i < masses.length; i++) {
      var ms = masses[i], shape = blob(ms.x, ms.y, ms.rx, ms.ry, 0.22, 18);
      sh.paper(shape);
      sh.ink(5, shape);
      var leaves = Math.min(220, Math.round(ms.rx * ms.ry / 4.5)), tones = { 2: [], 3: [], 4: [] };
      for (k = 0; k < leaves; k++) {
        var rr = Math.sqrt(rnd()), th = rnd() * Math.PI * 2;
        var lx = ms.x + Math.cos(th) * rr * ms.rx * 0.95, ly = ms.y + Math.sin(th) * rr * ms.ry * 0.95;
        var la = rand(-0.9, 0.9) + (rnd() < 0.5 ? 0 : Math.PI), ll = rand(2, 4) * h / 100, lw = ll * 0.22;
        var ux = Math.cos(la) * ll / 2, uy = Math.sin(la) * ll / 2;
        tones[ly > ms.y + ms.ry * 0.25 ? 2 : ly > ms.y - ms.ry * 0.3 ? 3 : 4].push([[lx - ux, ly - uy], [lx - uy / ll * 2 * lw, ly + ux / ll * 2 * lw], [lx + ux, ly + uy], [lx + uy / ll * 2 * lw, ly - ux / ll * 2 * lw]]);
      }
      [4, 3, 2].forEach(function(level) {
        tones[level].forEach(function(leaf) { sh.ink(level, leaf); });
      });
      var rim = [];
      for (k = 0; k <= 10; k++) {
        var ra = Math.PI * (0.1 + 0.8 * k / 10);
        rim.push([ms.x + Math.cos(ra) * ms.rx, ms.y + Math.sin(ra) * ms.ry]);
      }
      sh.dry(2, rim, 0.6, 0.5, -0.2);
    }
  }

  function dune(sh, x, base, w, h) {
    var n = 26, pk = rand(0.55, 0.72), prof = [], i, u, e, off = rnd() * 200, x0 = x - w / 2;
    for (i = 0; i <= n; i++) {
      u = i / n;
      e = u < pk ? Math.pow(Math.sin(u / pk * Math.PI / 2), 1.6) : Math.pow(Math.cos((u - pk) / (1 - pk) * Math.PI / 2), 0.7);
      prof.push([x0 + u * w, base - h * e * (1 + 0.06 * N(off + u * 3, 0.5))]);
    }
    var ip = Math.round(pk * n);
    sh.paper(prof.concat([[x0 + w, base + 20], [x0, base + 20]]));
    sh.wash(prof.slice(ip).concat([[x0 + w, base + 3], [prof[ip][0] + w * 0.05, base + 3]]), 1);
    sh.brush(2, prof.slice(Math.floor(n * 0.25), Math.min(n, ip + 3) + 1), 1.0, TAPER.both, 0.4);
    sh.dry(3, prof.slice(0, ip + 1), 0.55, 0.4, -0.05);
    sh.dry(3, prof.slice(ip), 0.5, 0.4, 0.1);
    for (var k = 1; k <= 4; k++) {
      var row = [];
      for (i = 2; i < ip - 1; i++) {
        var y = prof[i][1] + k * h * 0.16 + Math.sin(i * 1.7 + k) * 0.8;
        if (y < base - 1) row.push([prof[i][0], y]);
      }
      if (row.length >= 3) sh.dry(4, row, 0.4, 0.5, 0.05);
    }
  }

  function rock(sh, x, base, w, h) {
    var n = 14, pts = blob(x, base - h * 0.45, w / 2, h * 0.55, 0.25, n).map(function(p) { return [p[0], Math.min(p[1], base + 2)]; });
    sh.paper(pts);
    sh.wash(pts, 0.7);
    var upper = pts.slice(n / 2).concat([pts[0]]);
    sh.brush(2, upper, 0.5 + w * 0.02, TAPER.both, 0.6);
    var marks = 2 + Math.floor(rnd() * 3);
    for (var i = 0; i < marks; i++) {
      var p = upper[1 + Math.floor(rnd() * (upper.length - 2))];
      var len = h * rand(0.25, 0.5);
      sh.brush(3, seg(p[0], p[1] + 1, p[0] + len * rand(0.2, 0.6), p[1] + len, 3), 0.3 + w * 0.01, TAPER.tail, 0.4);
    }
  }

  function tuft(sh, x, base, s) {
    var blades = Math.round(rand(6, 12));
    for (var i = 0; i < blades; i++) {
      var a = -Math.PI / 2 + rand(-0.95, 0.95), len = s * rand(0.5, 1), bend = Math.cos(a) * len * 0.35, pts = [];
      for (var k = 0; k <= 4; k++) {
        var t = k / 4;
        pts.push([x + Math.cos(a) * len * t + bend * t * t, base + Math.sin(a) * len * t + len * 0.25 * t * t]);
      }
      sh.brush(rnd() < 0.5 ? 2 : 3, pts, Math.max(0.25, s * 0.03), TAPER.tail, 0.2);
    }
  }

  function opuntia(sh, x, base, s) {
    var pads = [], i;
    var row = 2 + Math.floor(rnd() * 2);
    for (i = 0; i < row; i++) pads.push({ x: x + (i - (row - 1) / 2) * s * 0.3, y: base - s * 0.22, r: rand(-0.3, 0.3) });
    var extra = 2 + Math.floor(rnd() * 4);
    for (i = 0; i < extra; i++) {
      var p = pads[Math.floor(rnd() * pads.length)], a = rand(-0.9, 0.9);
      pads.push({ x: p.x + Math.sin(a) * s * 0.36, y: p.y - Math.cos(a) * s * 0.36, r: a });
    }
    pads.sort(function(a, b) { return b.y - a.y; });
    for (i = 0; i < pads.length; i++) {
      var pd = pads[i], shape = blob(pd.x, pd.y, s * 0.13, s * 0.2, 0.1, 14, pd.r);
      sh.paper(shape);
      sh.wash(shape, 0.5);
      sh.dry(2, shape.concat([shape[0]]), 0.55, 0.4, -0.3);
      for (var k = 0; k < 3; k++) sh.ink(1, blob(pd.x + rand(-0.07, 0.07) * s, pd.y + rand(-0.12, 0.12) * s, 0.5, 0.5, 0, 5));
    }
  }

  function cube(sh, l, base, w, h, dome, door) {
    var r = l + w, t = base - h;
    var box = densify([[l, base + 2], [l, t], [r, t], [r, base + 2]], 5, 0.4);
    sh.paper(box);
    sh.wash([[r - w * 0.22, t], [r, t], [r, base], [r - w * 0.22, base]], 0.6);
    sh.brush(2, box.slice(1, -1), 0.8, TAPER.both, 0.3);
    if (dome) {
      var dc = l + w * dome.at, rd = w * dome.size, arc = [];
      for (var k = 0; k <= 16; k++) {
        var a = Math.PI * k / 16;
        arc.push([dc - Math.cos(a) * rd, t - Math.sin(a) * rd * 1.05 - Math.pow(Math.sin(a), 8) * rd * 0.12]);
      }
      sh.paper(arc.concat([[dc + rd, t + 1], [dc - rd, t + 1]]));
      sh.wash(arc.slice(8).concat([[dc + rd, t + 1], [dc, t + 1]]), 0.5);
      sh.brush(2, arc, 0.75, TAPER.both, 0.3);
      sh.brush(2, seg(dc, t - rd * 1.15, dc, t - rd * 1.15 - Math.max(2, rd * 0.25), 3), 0.4, TAPER.flat, 0);
    }
    if (door) {
      var dw = w * 0.17, dh = h * 0.5, dx = l + w * door, pts = [[dx - dw / 2, base]];
      for (var j = 0; j <= 8; j++) {
        var b = Math.PI * j / 8;
        pts.push([dx - Math.cos(b) * dw / 2, base - dh + dw / 2 - Math.sin(b) * dw / 2]);
      }
      pts.push([dx + dw / 2, base]);
      sh.ink(1, pts);
    }
  }

  function house(sh, x, base, w) {
    var parts = 1 + Math.floor(rnd() * 3), widths = [], total = 0, i;
    for (i = 0; i < parts; i++) { widths.push(w * rand(0.55, 1)); total += widths[i]; }
    var l = x - total / 2, domed = Math.floor(rnd() * parts);
    for (i = 0; i < parts; i++) {
      var bw = widths[i], bh = bw * rand(0.5, 0.8);
      cube(sh, l, base, bw, bh, i === domed && rnd() < 0.8 ? { at: rand(0.35, 0.65), size: rand(0.2, 0.3) } : null, rnd() < 0.7 ? rand(0.25, 0.75) : 0);
      if (rnd() < 0.5) sh.ink(2, [[l + bw * 0.7, base - bh * 0.7], [l + bw * 0.8, base - bh * 0.7], [l + bw * 0.8, base - bh * 0.58], [l + bw * 0.7, base - bh * 0.58]]);
      l += bw - 0.5;
    }
    sh.brush(4, seg(x - total * 0.6, base + 2, x + total * 0.6, base + 2, 6), 1.1, TAPER.both, 0.4);
  }

  function koubba(sh, x, base, w) {
    var h = w * rand(0.75, 0.95);
    cube(sh, x - w / 2, base, w, h, { at: 0.5, size: 0.4 }, 0.5);
    sh.ink(2, [[x - w / 2 - 1, base - h - 3], [x - w / 2 + 3, base - h - 3], [x - w / 2 + 3, base - h + 0.5], [x - w / 2 - 1, base - h + 0.5]]);
    sh.ink(2, [[x + w / 2 - 3, base - h - 3], [x + w / 2 + 1, base - h - 3], [x + w / 2 + 1, base - h + 0.5], [x + w / 2 - 3, base - h + 0.5]]);
    sh.brush(4, seg(x - w, base + 2, x + w, base + 2, 6), 1.1, TAPER.both, 0.4);
  }

  function ksar(sh, x, base, w, h) {
    var l = x - w / 2, merlons = Math.max(3, Math.round(w / 10)), mw = w / merlons, top = [[l, base + 2]], i;
    for (i = 0; i < merlons; i++) {
      var hh = h * (1 + 0.1 * N(x * 0.1 + i * 0.4, 2.2)), a = l + i * mw;
      top.push([a, base - hh], [a, base - hh - h * 0.13], [a + mw * 0.55, base - hh - h * 0.13], [a + mw * 0.55, base - hh]);
    }
    top.push([l + w, base - h], [l + w, base + 2]);
    var sil = densify(top, 4, 0.5);
    sh.paper(sil);
    sh.wash(sil, 0.6);
    sh.brush(2, sil.slice(1, -1), 0.7, TAPER.both, 0.4);
    var bricks = Math.round(w * h / 70);
    for (i = 0; i < bricks; i++) {
      var bx = rand(l + 3, l + w - 6), by = rand(base - h * 0.85, base - 2);
      sh.brush(4, seg(bx, by, bx + rand(3, 6), by, 2), 0.35, TAPER.both, 0.2);
    }
    var gx = l + w * rand(0.25, 0.75), gw = Math.min(w * 0.12, h * 0.4), gh = h * 0.62, gate = [[gx - gw / 2, base]];
    for (i = 0; i <= 8; i++) {
      var b = Math.PI * i / 8;
      gate.push([gx - Math.cos(b) * gw / 2, base - gh + gw / 2 - Math.sin(b) * gw / 2]);
    }
    gate.push([gx + gw / 2, base]);
    sh.ink(1, gate);
  }

  function camel(sh, x, base, s, dir, rider) {
    function P(u, v) { return [x + dir * u * s, base - v * s]; }
    function map(list) { return list.map(function(q) { return P(q[0], q[1]); }); }
    var g = rnd() * Math.PI * 2, hips = [-0.32, -0.24, 0.18, 0.26], i;
    for (i = 0; i < 4; i++) {
      var sw = Math.sin(g + i * Math.PI / 2 + (i > 1 ? Math.PI : 0));
      var leg = map([[hips[i], 0.52], [hips[i] + sw * 0.05, 0.27], [hips[i] + sw * 0.1, 0.02], [hips[i] + sw * 0.1 + 0.04, 0]]);
      sh.brush(i % 2 ? 2 : 1, leg, Math.max(0.35, s * 0.022), function(t) { return 1 - 0.35 * t; }, 0.2);
    }
    var body = map([[-0.42, 0.58], [-0.38, 0.7], [-0.22, 0.82], [-0.08, 0.98], [0.06, 0.9], [0.2, 0.76], [0.32, 0.72], [0.36, 0.6], [0.2, 0.5], [-0.1, 0.48], [-0.35, 0.52]]);
    sh.paper(body);
    sh.ink(3, body);
    sh.brush(2, body.slice(0, 8), Math.max(0.4, s * 0.016), TAPER.both, 0.3);
    var neck = map([[0.3, 0.68], [0.42, 0.7], [0.5, 0.8], [0.54, 0.92], [0.6, 0.97], [0.68, 0.95]]);
    sh.brush(1, neck, Math.max(0.5, s * 0.04), function(t) { return 1.1 - 0.5 * t; }, 0.2);
    sh.ink(1, map([[0.62, 0.99], [0.72, 0.97], [0.73, 0.93], [0.63, 0.92]]));
    sh.brush(2, map([[-0.41, 0.63], [-0.45, 0.52], [-0.46, 0.44]]), Math.max(0.25, s * 0.01), TAPER.tail, 0.2);
    if (rider) {
      var robe = map([[-0.17, 0.92], [0.05, 0.94], [-0.03, 1.22], [-0.09, 1.22]]);
      sh.paper(robe);
      sh.ink(2, robe);
      sh.brush(1, map([[0.0, 0.94], [0.05, 0.82], [0.07, 0.74]]), Math.max(0.3, s * 0.014), TAPER.tail, 0.2);
      var head = P(-0.06, 1.29);
      sh.ink(1, blob(head[0], head[1], s * 0.05, s * 0.045, 0.2, 8));
      sh.brush(1, map([[0.03, 1.05], [0.24, 0.9], [0.42, 0.78]]), Math.max(0.2, s * 0.007), TAPER.tail, 0.1);
    }
  }

  function figure(sh, x, base, s, dir) {
    var robe = [[x - 0.17 * s, base], [x + 0.15 * s, base], [x + 0.06 * s, base - 0.76 * s], [x - 0.07 * s, base - 0.78 * s]];
    sh.paper(robe);
    sh.ink(2, robe);
    sh.ink(1, blob(x, base - 0.88 * s, 0.085 * s, 0.09 * s, 0.2, 8));
    sh.brush(1, seg(x + dir * 0.24 * s, base, x + dir * 0.19 * s, base - 1.05 * s, 4), Math.max(0.25, s * 0.012), TAPER.flat, 0.2);
  }

  function boat(sh, x, y, L, dir) {
    function P(u, v) { return [x + dir * u * L, y - v * L]; }
    var top = [], bottom = [], i, u;
    for (i = 0; i <= 10; i++) {
      u = -0.5 + i / 10;
      top.push(P(u, 0.06 + 0.14 * Math.pow(Math.abs(2 * u), 2.2) + Math.max(0, u) * 0.08));
    }
    for (i = 10; i >= 0; i--) {
      u = -0.5 + i / 10;
      bottom.push(P(u * 0.92, 0.04 - 0.09 * (1 - Math.pow(2 * u, 2))));
    }
    var hull = top.concat(bottom);
    sh.paper(hull);
    sh.ink(2, hull);
    sh.brush(1, top, Math.max(0.3, L * 0.012), TAPER.both, 0.3);
    var foot = P(0.06, 0.1), head = P(0.0, 0.92), ya = P(-0.36, 0.24), yb = P(0.4, 1.08);
    sh.brush(1, seg(foot[0], foot[1], head[0], head[1], 4), Math.max(0.25, L * 0.01), TAPER.flat, 0.2);
    var sail = [ya, P(-0.05, 0.62), yb, P(0.1, 0.5), P(0.12, 0.16)];
    sh.paper(sail);
    sh.wash(sail, 0.5);
    sh.dry(3, [ya, P(0.0, 0.2), P(0.12, 0.16), P(0.14, 0.55), yb], Math.max(0.2, L * 0.006), 0.3, -0.4);
    sh.brush(1, seg(ya[0], ya[1], yb[0], yb[1], 6), Math.max(0.25, L * 0.009), TAPER.both, 0.2);
    for (i = 0; i < 3; i++) {
      var ry = y + L * (0.08 + i * 0.05), half = L * (0.45 - i * 0.1);
      sh.brush(4, seg(x - half + rand(-2, 2), ry, x + half + rand(-2, 2), ry, 5), 0.4, TAPER.both, 0.5);
    }
  }

  function sail(sh, x, y, s) {
    sh.ink(2, [[x - s * 0.3, y - s * 0.3], [x + s * 0.4, y - s * 1.1], [x + s * 0.2, y - s * 0.1]]);
    sh.brush(2, seg(x - s * 0.5, y, x + s * 0.5, y - s * 0.04, 3), Math.max(0.3, s * 0.06), TAPER.both, 0.2);
  }

  function birds(sh, x, y, n) {
    for (var i = 0; i < n; i++) {
      var bx = x + rand(-45, 45), by = y + rand(-22, 22), s = rand(2.5, 5);
      sh.brush(2, [[bx - s, by - s * 0.35], [bx - s * 0.5, by - s * 0.55], [bx, by]], 0.42, TAPER.both, 0.2);
      sh.brush(2, [[bx, by], [bx + s * 0.5, by - s * 0.6], [bx + s * 1.05, by - s * 0.4]], 0.42, TAPER.both, 0.2);
    }
  }

  function grove(sh, x, base, count, hmin, hmax, spread) {
    for (var i = 0; i < count; i++) {
      palm(sh, x + rand(-spread, spread), base + rand(-1, 2), rand(hmin, hmax), rand(-0.15, 0.15), hmax > 30);
    }
  }

  function mirage(sh, x, base) {
    var count = 2 + Math.floor(rnd() * 5), spread = count * 7, oldTf = sh.tf;
    sh.ink(3, blob(x, base - 2, spread + 10, 3, 0.3, 12));
    var trees = [];
    for (var i = 0; i < count; i++) trees.push([x + rand(-spread, spread), rand(18, 38), rand(-0.12, 0.12)]);
    trees.forEach(function(t) { palm(sh, t[0], base - 1, t[1], t[2], false); });
    sh.shift += 2;
    sh.tf = function(p) { return [p[0], base + (base - p[1]) * 0.6]; };
    trees.forEach(function(t) { palm(sh, t[0], base - 1, t[1], t[2], false); });
    sh.tf = oldTf;
    sh.shift -= 2;
    for (var k = 0; k < 7; k++) {
      var y = base + 2 + k * rand(2.2, 3.4);
      sh.brush('p', seg(x - spread - 25, y, x + spread + 25, y + rand(-0.3, 0.3), 10), rand(0.35, 0.8), TAPER.both, 0.4);
    }
  }

  function wave(sh, x, y, len, level, wid) {
    sh.brush(level, [[x, y], [x + len * 0.3, y - len * 0.03], [x + len * 0.65, y - len * 0.02], [x + len, y + len * 0.01]], wid, TAPER.both, 0.4);
  }

  function put(items, z, fn, args) {
    items.push({ z: z, fn: fn, args: args });
  }

  function spawnFar(items, x0, x1) {
    for (var x = x0; x < x1; x += 50) {
      var pr = pickRegion(0, x), reg = pr.r, g = 0.35 + 0.65 * pr.w, xx = x + rand(0, 50), gy = groundY(0, xx);
      if (reg === 0 && rnd() < 0.22) {
        var w = rand(260, 720), deep = rnd() < 0.5;
        put(items, deep ? 0 : 1, jebel, [xx, gy + (deep ? -6 : 4), w, rand(70, 200) * Math.sqrt(w / 600) * g, deep ? 1 : 0]);
      }
      if (reg === 1) {
        if (rnd() < 0.035) put(items, 0, jebel, [xx, gy - 2, rand(500, 900), rand(22, 48) * g, 1]);
        if (rnd() < 0.16) put(items, 3, grove, [xx, gy, 3 + Math.floor(rnd() * 6), 9, 16, 22]);
      }
      if (reg === 2) {
        put(items, 1.5, wave, [x - 4, gy, 58, 1, 0.45]);
        if (rnd() < 0.03) put(items, 2, jebel, [xx, gy, rand(300, 700), rand(6, 14), 1]);
        if (rnd() < 0.06) put(items, 4, sail, [xx, gy + rand(1, 3), rand(5, 9)]);
      }
      if (rnd() < (reg === 2 ? 0.05 : 0.025)) put(items, 5, birds, [xx, rand(90, 280), 3 + Math.floor(rnd() * 5)]);
    }
  }

  function spawnMid(items, x0, x1) {
    for (var x = x0; x < x1; x += 50) {
      var pr = pickRegion(1, x), reg = pr.r, g = 0.35 + 0.65 * pr.w, xx = x + rand(0, 50), gy = groundY(1, xx), k;
      if (reg === 0) {
        if (rnd() < 0.11) put(items, gy - 100, mesa, [xx, gy + 3, rand(140, 340) * (0.6 + 0.4 * g), rand(60, 150) * g]);
        if (rnd() < 0.15) put(items, gy + 4, rock, [xx, gy + rand(2, 8), rand(8, 22), rand(5, 13)]);
        if (rnd() < 0.08) put(items, gy + 2, grove, [xx, gy + 2, 3 + Math.floor(rnd() * 5), 40, 75, 30]);
        if (rnd() < 0.3) put(items, gy + 6, tuft, [xx, gy + rand(2, 12), rand(5, 9)]);
        if (rnd() < 0.015) put(items, gy + 3, koubba, [xx, gy + 3, rand(16, 24)]);
      }
      if (reg === 1) {
        for (k = 0; k < 3; k++) {
          var cy = gy + rand(3, 115);
          put(items, -10000, wave, [xx + rand(-20, 20), cy, rand(15, 140) * (0.5 + (cy - gy) / 110), rnd() < 0.3 ? 4 : 5, rand(0.3, 0.8)]);
        }
        if (rnd() < 0.07) put(items, gy - 50, dune, [xx, gy + 2, rand(220, 480), rand(25, 70) * g]);
        if (rnd() < 0.05) put(items, gy - 60, mirage, [xx, gy]);
        if (rnd() < 0.08) put(items, gy + 2, grove, [xx, gy + 2, 3 + Math.floor(rnd() * 6), 35, 70, 35]);
        if (rnd() < 0.025) {
          var cb = gy + rand(4, 26), n = 2 + Math.floor(rnd() * 3), s = rand(24, 32), dir = rnd() < 0.5 ? 1 : -1;
          for (k = 0; k < n; k++) put(items, cb, camel, [xx + k * s * 0.95 * dir, cb, s, dir, rnd() < 0.5]);
          put(items, cb, figure, [xx + n * s * 0.95 * dir, cb, s * 0.55, dir]);
        }
      }
      if (reg === 2) {
        var hz = LAYERS[0].base[2] + 2, sea = gy - hz - 3;
        for (k = 0; k < 9 && sea > 6; k++) {
          var wy = hz + Math.pow(rnd(), 0.8) * sea, depth = (wy - hz) / sea;
          put(items, -10000, wave, [xx + rand(-25, 25), wy, depth < 0.15 ? rand(30, 90) : (8 + 34 * depth) * rand(0.6, 1.3), depth > 0.55 ? 3 : 4, 0.25 + 0.75 * depth]);
        }
        put(items, -9999, wave, [xx + rand(-10, 10), gy - rand(1.5, 4), rand(40, 80), 2, 0.6]);
        put(items, -9999, wave, [xx + rand(-10, 10), gy - rand(5, 9), rand(20, 50), 3, 0.45]);
        if (rnd() < 0.11 && sea > 20) {
          var by = hz + 6 + rnd() * (sea - 12);
          put(items, by, boat, [xx, by, 10 + 26 * (by - hz) / sea, rnd() < 0.5 ? 1 : -1]);
        }
        if (rnd() < 0.06) put(items, gy + 2, grove, [xx, gy + 2, 1 + Math.floor(rnd() * 3), 50, 80, 25]);
        if (rnd() < 0.04) put(items, gy + 3, house, [xx, gy + 3, rand(18, 30)]);
        if (rnd() < 0.2) put(items, -9000, wave, [xx, gy + rand(8, 60), rand(30, 120), 5, 0.5]);
      }
    }
  }

  function spawnNear(items, x0, x1) {
    for (var x = x0; x < x1; x += 50) {
      var pr = pickRegion(2, x), reg = pr.r, g = 0.35 + 0.65 * pr.w, xx = x + rand(0, 50), gy = groundY(2, xx), b;
      if (rnd() < 0.3) put(items, -10000, wave, [xx, gy + rand(4, 34), rand(6, 20), 4, 0.5]);
      if (reg === 0) {
        if (rnd() < 0.55) { b = gy + rand(0, 22); put(items, b, tuft, [xx, b, rand(9, 18)]); }
        if (rnd() < 0.12) { b = gy + rand(0, 18); var rw = rand(16, 46); put(items, b, rock, [xx, b, rw, rw * rand(0.5, 0.8)]); }
        if (rnd() < 0.045) { b = gy + rand(0, 10); put(items, b, palm, [xx, b, rand(170, 250) * g, rand(-0.12, 0.12), true]); }
        if (rnd() < 0.03) { b = gy + rand(2, 16); put(items, b, opuntia, [xx, b, rand(40, 60)]); }
        if (rnd() < 0.012) { b = gy + rand(2, 8); put(items, b, koubba, [xx, b, rand(40, 60)]); }
      }
      if (reg === 1) {
        if (rnd() < 0.38) { b = gy + rand(-4, 16); put(items, b, palm, [xx, b, rand(130, 290) * g, rand(-0.12, 0.12), true]); }
        if (rnd() < 0.12) { b = gy + rand(0, 20); put(items, b, palm, [xx, b, rand(22, 42), rand(-0.3, 0.3), true]); }
        if (rnd() < 0.025) { b = gy + rand(0, 6); put(items, b - 0.5, ksar, [xx, b, rand(120, 260), rand(30, 50)]); }
        if (rnd() < 0.015) { b = gy + rand(8, 24); put(items, b, camel, [xx, b, rand(70, 90), rnd() < 0.5 ? 1 : -1, rnd() < 0.7]); }
        if (rnd() < 0.15) { b = gy + rand(0, 22); put(items, b, tuft, [xx, b, rand(8, 14)]); }
      }
      if (reg === 2) {
        if (rnd() < 0.35) { b = gy + rand(-3, 18); put(items, b, olive, [xx, b, rand(65, 125) * (0.5 + 0.5 * g)]); }
        if (rnd() < 0.045) { b = gy + rand(0, 10); put(items, b, palm, [xx, b, rand(180, 250) * g, rand(-0.1, 0.1), true]); }
        if (rnd() < 0.03) { b = gy + rand(0, 6); put(items, b - 0.5, house, [xx, b, rand(40, 70)]); }
        if (rnd() < 0.03) { b = gy + rand(2, 16); put(items, b, opuntia, [xx, b, rand(40, 60)]); }
        if (rnd() < 0.15) put(items, -9000, wave, [xx, gy + rand(3, 24), rand(40, 140), 4, 0.5]);
      }
    }
  }

  var SPAWN = [spawnFar, spawnMid, spawnNear];

  function ground(sh, L, x0, x1) {
    var pts = [];
    for (var x = x0 - 6; x <= x1 + 6; x += 6) pts.push([x, groundY(L, x)]);
    sh.paper(pts.concat([[x1 + 6, V + 40], [x0 - 6, V + 40]]));
    sh.dry(L === 2 ? 2 : 3, pts, L === 0 ? 0.5 : 0.85, 0.4, -0.3, (x0 - 6) / 6 * 0.21 + L * 50);
  }

  function buildChunk(L, i) {
    rnd = mulberry(mix(mix(seed, L + 1), i));
    var x0 = i * CHUNK, x1 = x0 + CHUNK, sh = new Sheet(LAYERS[L].shift), items = [];
    SPAWN[L](items, x0, x1);
    ground(sh, L, x0, x1);
    items.sort(function(a, b) { return a.z - b.z; });
    items.forEach(function(it) { it.fn.apply(null, [sh].concat(it.args)); });
    return sh;
  }

  var state = { s: 0, scale: 1, top: 0, W: 0, layers: [], last: 0, calm: null };

  function place(svg, i) {
    var sc = state.scale;
    svg.style.left = (i * CHUNK * sc) + 'px';
    svg.style.width = (CHUNK * sc) + 'px';
    svg.style.height = (V * sc) + 'px';
  }

  function makeChunk(L, i) {
    var sh = buildChunk(L, i), svg = document.createElementNS(NS, 'svg'), html = '';
    svg.setAttribute('viewBox', (i * CHUNK) + ' 0 ' + CHUNK + ' ' + V);
    svg.setAttribute('preserveAspectRatio', 'none');
    sh.ops.forEach(function(op) {
      html += '<path class="' + op.cls + '"' + (op.o ? ' fill-opacity="' + op.o + '"' : '') + ' d="' + op.d + '"/>';
    });
    svg.innerHTML = html;
    place(svg, i);
    return svg;
  }

  function ensure(layer, L, i) {
    if (layer.chunks[i]) return;
    var svg = makeChunk(L, i), next = null, best = Infinity;
    Object.keys(layer.chunks).forEach(function(k) {
      var j = Number(k);
      if (j > i && j < best) { best = j; next = layer.chunks[k]; }
    });
    layer.el.insertBefore(svg, next);
    layer.chunks[i] = svg;
  }

  function update(budget) {
    var sc = state.scale, Wv = state.W / sc;
    for (var L = 0; L < 3; L++) {
      var layer = state.layers[L], o = state.s * LAYERS[L].f, i;
      layer.el.style.transform = 'translate3d(' + (-o * sc).toFixed(2) + 'px,' + state.top.toFixed(2) + 'px,0)';
      var need0 = Math.floor((o - REACH) / CHUNK), need1 = Math.floor((o + Wv + REACH) / CHUNK);
      var want0 = Math.floor((o - LEAD) / CHUNK), want1 = Math.floor((o + Wv + LEAD) / CHUNK);
      Object.keys(layer.chunks).forEach(function(k) {
        var j = Number(k);
        if (j < want0 - 1 || j > want1 + 1) {
          layer.el.removeChild(layer.chunks[k]);
          delete layer.chunks[k];
        }
      });
      for (i = need0; i <= need1; i++) ensure(layer, L, i);
      for (i = need1 + 1; i <= want1 && budget > 0; i++) {
        if (!layer.chunks[i]) { ensure(layer, L, i); budget--; }
      }
      for (i = need0 - 1; i >= want0 && budget > 0; i--) {
        if (!layer.chunks[i]) { ensure(layer, L, i); budget--; }
      }
    }
  }

  function measure() {
    var H = window.innerHeight;
    state.W = window.innerWidth;
    state.scale = Math.min(H / V, state.W / 480);
    state.top = H - V * state.scale;
    state.layers.forEach(function(layer) {
      Object.keys(layer.chunks).forEach(function(k) { place(layer.chunks[k], Number(k)); });
    });
  }

  function loop(now) {
    if (state.last) state.s += DRIFT * (state.calm.matches ? GENTLE : 1) * Math.min(0.1, (now - state.last) / 1000);
    state.last = now;
    update(1);
    requestAnimationFrame(loop);
  }

  function build() {
    var root = document.createElement('div');
    root.className = 'landscape';
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '<svg class="landscape-defs" width="0" height="0"><defs><linearGradient id="landscape-wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0.34"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs></svg>';
    for (var L = 0; L < 3; L++) {
      var el = document.createElement('div');
      el.className = 'landscape-layer';
      root.appendChild(el);
      state.layers.push({ el: el, chunks: {} });
    }
    document.body.insertBefore(root, document.body.firstChild);
  }

  function init() {
    var saved = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    seed = saved ? saved.seed : (Math.random() * 4294967296) >>> 0;
    N = makeNoise(mulberry(seed));
    build();
    measure();
    var start = REGIONS.indexOf(new URLSearchParams(window.location.search).get('landscape'));
    if (start >= 0) state.s = (start + 3) * REGION_LEN - REGION_LEN * 0.2 - state.W / state.scale / 2;
    else state.s = saved ? saved.s : Math.random() * REGION_LEN * 3;
    update(0);
    window.addEventListener('resize', function() {
      measure();
      update(0);
    });
    window.addEventListener('pagehide', function() {
      sessionStorage.setItem(STORE, JSON.stringify({ seed: seed, s: state.s }));
    });
    state.calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
