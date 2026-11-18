"use client";

// Ölçüye göre çizilen 3D kütle modeli. Yapay zekaya giden görselin iskeleti budur:
// ayak izi, duvarlar, açıklıklar ve elemanlar gerçek ölçüde (metre) çizilir.
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useFBX } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Mode, RoomBrief, Space, StandBrief, WallSide } from "./studio-data";

export type View = "persp" | "top" | "front";
export type SceneApi = { setView: (v: View) => void; capture: () => string | null };
// Kullanıcının sürükleyerek taşıdığı parçaların konumu (metre) ve dönüşü (radyan)
export type Move = { x: number; z: number; r: number };
export type Moves = Record<string, Move>;

const WALL = "#F2F0EB";
const WALL_T = 0.08;
const fmt = (n: number, lang: string) => `${n.toLocaleString(lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m`;

function Box({ size, pos, color, rough = 0.85, metal = 0, cast = true }: { size: [number, number, number]; pos: [number, number, number]; color: string; rough?: number; metal?: number; cast?: boolean }) {
  return (
    <mesh position={pos} castShadow={cast} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

// Ölçek figürü: gerçek insan modeli (ayakta 1,75 m; oturan 1,30 m). Model yüklenene kadar sade bir kapsül görünür.
const HUMAN = { stand: { url: "/models/insan-ayakta.fbx", height: 1.75 }, sit: { url: "/models/insan-oturan.fbx", height: 1.3 } };
const HUMAN_MAT = new THREE.MeshStandardMaterial({ color: "#8E8B85", roughness: 0.9 });

function HumanModel({ pose }: { pose: "stand" | "sit" }) {
  const { url, height } = HUMAN[pose];
  const fbx = useFBX(url);
  const obj = useMemo(() => {
    const o = fbx.clone(true);
    o.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        (m as THREE.Mesh).material = HUMAN_MAT;
        m.castShadow = true;
      }
    });
    // Dosyanın birimi ne olursa olsun: boy hedef yüksekliğe ölçeklenir, ayaklar zemine, gövde merkeze oturtulur
    const wrap = new THREE.Group();
    wrap.add(o);
    let box = new THREE.Box3().setFromObject(o);
    const size = box.getSize(new THREE.Vector3());
    if (size.z > size.y * 1.3) o.rotation.x = -Math.PI / 2; // Z yukarı gelen dosya
    box = new THREE.Box3().setFromObject(o);
    const k = height / Math.max(0.001, box.getSize(new THREE.Vector3()).y);
    o.scale.multiplyScalar(k);
    box = new THREE.Box3().setFromObject(o);
    const c = box.getCenter(new THREE.Vector3());
    o.position.x -= c.x;
    o.position.z -= c.z;
    o.position.y -= box.min.y;
    return wrap;
  }, [fbx, height]);
  return <primitive object={obj} />;
}

function Person({ pose = "stand" }: { pose?: "stand" | "sit" }) {
  const h = HUMAN[pose].height;
  return (
    <Suspense
      fallback={
        <mesh position={[0, h / 2, 0]} castShadow>
          <capsuleGeometry args={[0.2, h - 0.4, 6, 16]} />
          <meshStandardMaterial color="#9A9893" roughness={0.9} />
        </mesh>
      }
    >
      <HumanModel pose={pose} />
    </Suspense>
  );
}

// Sürüklenebilir parça: zeminde fareyle ya da parmakla taşınır, çift tıklamayla 90° döner.
// Sürükleme sırasında kamera döndürme kapatılır; parça alanın dışına çıkamaz.
const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
type DragCtx = { moves: Moves; onMove?: (id: string, m: Move) => void; half: [number, number] };

function Draggable({ id, base, ctx, y = 0, children }: { id: string; base: Move; ctx: DragCtx; y?: number; children: ReactNode }) {
  const get = useThree((st) => st.get);
  // Sürükleme sırasında kamera döndürme kapatılır
  const orbit = (on: boolean) => {
    const c = get().controls as { enabled: boolean } | null;
    if (c) c.enabled = on;
  };
  const drag = useRef<{ dx: number; dz: number } | null>(null);
  const hit = useRef(new THREE.Vector3());
  const m = ctx.moves[id] ?? base;
  const can = Boolean(ctx.onMove);
  const lim = (v: number, half: number) => Math.min(half, Math.max(-half, v));

  const down = (e: ThreeEvent<PointerEvent>) => {
    if (!can || !e.ray.intersectPlane(GROUND, hit.current)) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    orbit(false);
    drag.current = { dx: hit.current.x - m.x, dz: hit.current.z - m.z };
    document.body.style.cursor = "grabbing";
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current || !e.ray.intersectPlane(GROUND, hit.current)) return;
    e.stopPropagation();
    ctx.onMove?.(id, { x: lim(hit.current.x - drag.current.dx, ctx.half[0]), z: lim(hit.current.z - drag.current.dz, ctx.half[1]), r: m.r });
  };
  const up = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return;
    e.stopPropagation();
    (e.target as Element).releasePointerCapture(e.pointerId);
    drag.current = null;
    orbit(true);
    document.body.style.cursor = "grab";
  };
  return (
    <group
      position={[m.x, y, m.z]}
      rotation={[0, m.r, 0]}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onDoubleClick={(e) => {
        if (!can) return;
        e.stopPropagation();
        ctx.onMove?.(id, { ...m, r: m.r + Math.PI / 2 });
      }}
      onPointerOver={(e) => {
        if (!can) return;
        e.stopPropagation();
        if (!drag.current) document.body.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!drag.current) document.body.style.cursor = "";
      }}
    >
      {children}
    </group>
  );
}

// Marka logosu: yüklenen görsel oranı korunarak düz bir levhaya basılır
function LogoPlane({ url, max, pos, rotY = 0 }: { url: string; max: [number, number]; pos: [number, number, number]; rotY?: number }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    new THREE.TextureLoader().load(url, (t) => {
      if (!alive) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      made = t;
      setTex(t);
      invalidate();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [url, invalidate]);
  if (!tex) return null;
  const img = tex.image as { width: number; height: number };
  const k = Math.min(max[0] / img.width, max[1] / img.height);
  return (
    <mesh position={pos} rotation={[0, rotY, 0]}>
      <planeGeometry args={[img.width * k, img.height * k]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

// Ölçü etiketi: sahnenin içinde, ekranda sabit boyutta duran küçük bir levha.
// Yapay zekaya giden görüntü alınırken "labels" adlı bu nesneler gizlenir.
function Label({ pos, text }: { pos: [number, number, number]; text: string }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 192;
    c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1A1A1A";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#FFFFFF";
    g.font = "500 30px system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, c.width / 2, c.height / 2 + 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <sprite name="labels" position={pos} scale={[0.072, 0.024, 1]} renderOrder={10}>
      <spriteMaterial map={tex} sizeAttenuation={false} depthTest={false} transparent />
    </sprite>
  );
}

// ---------------------------------------------------------------- Fuar standı
function Stand({ b, lang, ctx, logo }: { b: StandBrief; lang: string; ctx: DragCtx; logo: string | null }) {
  const { w, d, h, type, elements, color } = b;
  const has = (e: string) => elements.includes(e as never);
  const back = type !== "ada";
  const left = type === "sira" || type === "kose";
  const right = type === "sira";
  const zBack = -d / 2 + (back ? WALL_T : 0);
  const xLeft = -w / 2 + (left ? WALL_T : 0);
  const xRight = w / 2 - (right ? WALL_T : 0);
  const depoW = Math.min(1.2, w * 0.3);
  const ledW = Math.min(3, w * 0.42);
  const ledX = has("depo") ? (xLeft + (xRight - depoW)) / 2 : 0;

  return (
    <group>
      {/* Zemin yükseltisi */}
      <Box size={[w, 0.1, d]} pos={[0, 0.05, 0]} color="#D8D5CE" cast={false} />
      {/* Duvarlar ve üst alın bandı */}
      {back && (
        <>
          <Box size={[w, h, WALL_T]} pos={[0, h / 2 + 0.1, -d / 2 + WALL_T / 2]} color={WALL} />
          <Box size={[w, 0.36, 0.02]} pos={[0, h - 0.08, zBack + 0.011]} color={color} rough={0.5} />
        </>
      )}
      {left && (
        <>
          <Box size={[WALL_T, h, d]} pos={[-w / 2 + WALL_T / 2, h / 2 + 0.1, 0]} color={WALL} />
          <Box size={[0.02, 0.36, d - WALL_T]} pos={[xLeft + 0.011, h - 0.08, WALL_T / 2]} color={color} rough={0.5} />
        </>
      )}
      {right && <Box size={[WALL_T, h, d]} pos={[w / 2 - WALL_T / 2, h / 2 + 0.1, 0]} color={WALL} />}

      {/* Depo: arka sağ köşe */}
      {has("depo") && (
        <Draggable id="depo" ctx={ctx} y={0.1} base={{ x: xRight - depoW / 2, z: zBack + 0.6, r: 0 }}>
          <Box size={[depoW, h, 1.2]} pos={[0, h / 2, 0]} color={WALL} />
          <Box size={[0.8, 2.05, 0.02]} pos={[-depoW / 2 + 0.5, 1.025, 0.61]} color="#CFCAC1" />
        </Draggable>
      )}

      {/* LED ekran: arka duvarda; ada standında ortada bir kulede */}
      {has("led") &&
        (back ? (
          <Box size={[ledW, (ledW * 9) / 16, 0.05]} pos={[ledX, 1.75, zBack + 0.03]} color="#101114" rough={0.25} metal={0.2} />
        ) : (
          <group position={[0, 0.1, 0]}>
            <Box size={[0.7, h, 0.5]} pos={[0, h / 2, 0]} color={WALL} />
            <Box size={[1.6, 0.9, 0.04]} pos={[0, 1.8, 0.27]} color="#101114" rough={0.25} metal={0.2} />
          </group>
        ))}

      {/* Karşılama bankosu: ön sol */}
      {has("banko") && (
        <Draggable id="banko" ctx={ctx} y={0.1} base={{ x: Math.max(-w / 2 + 1.2, -w / 4), z: d / 2 - 0.8, r: 0 }}>
          <Box size={[1.6, 1.05, 0.6]} pos={[0, 0.525, 0]} color={WALL} />
          <Box size={[1.6, 0.9, 0.02]} pos={[0, 0.5, 0.31]} color={color} rough={0.5} />
          <Box size={[1.7, 0.04, 0.68]} pos={[0, 1.07, 0]} color="#FBFAF8" rough={0.4} />
          {logo && <LogoPlane url={logo} max={[1.1, 0.5]} pos={[0, 0.5, 0.325]} />}
        </Draggable>
      )}

      {/* Toplantı alanı: yuvarlak masa ve üç sandalye */}
      {has("toplanti") && (
        <Draggable id="toplanti" ctx={ctx} y={0.1} base={{ x: Math.min(w / 4, w / 2 - 1.1), z: Math.min(d / 6, d / 2 - 1.1), r: 0 }}>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.04, 40]} />
            <meshStandardMaterial color="#FBFAF8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.37, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.72, 16]} />
            <meshStandardMaterial color="#2A2A2A" />
          </mesh>
          {[0, 2.1, 4.2].map((a) => (
            <group key={a} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]} rotation={[0, -a - Math.PI / 2, 0]}>
              <Box size={[0.45, 0.45, 0.45]} pos={[0, 0.225, 0]} color="#BDB8AE" />
              <Box size={[0.45, 0.4, 0.06]} pos={[0, 0.65, -0.2]} color="#BDB8AE" />
              {a === 0 && <Person pose="sit" />}
            </group>
          ))}
        </Draggable>
      )}

      {/* Ürün rafları: sol duvar, yoksa arka duvarın sol tarafı */}
      {has("raf") && (
        <Draggable id="raf" ctx={ctx} y={0.1} base={left ? { x: xLeft + 0.2, z: -d / 6, r: Math.PI / 2 } : back ? { x: -w / 2 + 1, z: zBack + 0.2, r: 0 } : { x: -w / 4, z: -d / 4, r: 0 }}>
          {[0.5, 1.0, 1.5, 2.0].map((y) => (
            <Box key={y} size={[1.4, 0.03, 0.35]} pos={[0, y, 0]} color="#FBFAF8" rough={0.5} />
          ))}
          <Box size={[0.03, 2.1, 0.35]} pos={[-0.7, 1.05, 0]} color="#CFCAC1" />
          <Box size={[0.03, 2.1, 0.35]} pos={[0.7, 1.05, 0]} color="#CFCAC1" />
        </Draggable>
      )}

      {/* Asma pano: standın üstünde halka */}
      {has("asma") && (
        <mesh position={[0, h + 1.3, 0]} castShadow>
          <cylinderGeometry args={[Math.min(w, d) * 0.28, Math.min(w, d) * 0.28, 0.9, 64, 1, true]} />
          <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Marka logosu: arka duvarda; LED ekran varsa solundaki boşlukta */}
      {logo &&
        back &&
        (has("led") ? (
          ledX - ledW / 2 - xLeft - 0.6 > 0.7 && <LogoPlane url={logo} max={[ledX - ledW / 2 - xLeft - 0.6, 0.7]} pos={[(xLeft + ledX - ledW / 2) / 2, 1.75, zBack + 0.012]} />
        ) : (
          <LogoPlane url={logo} max={[Math.min(2.4, w * 0.4), 0.8]} pos={[has("depo") ? (xLeft + xRight - depoW) / 2 : 0, h * 0.6, zBack + 0.012]} />
        ))}

      <Draggable id="p1" ctx={ctx} y={0.1} base={{ x: 0.2, z: d / 2 - 0.5, r: 0.3 }}>
        <Person />
      </Draggable>

      <Label pos={[0, 0.12, d / 2 + 0.45]} text={fmt(w, lang)} />
      <Label pos={[w / 2 + 0.45, 0.12, 0]} text={fmt(d, lang)} />
      <Label pos={[-w / 2 - 0.2, h / 2 + 0.1, -d / 2 - 0.2]} text={fmt(h, lang)} />
    </group>
  );
}

// ---------------------------------------------------------------- Oda
type Hole = { center: number; width: number; bottom: number; top: number; kind: "window" | "door" };

// Açıklıklı duvar: duvar boyunca kutu parçalarından kurulur (yerel x ekseni boyunca)
function HoledWall({ len, h, holes }: { len: number; h: number; holes: Hole[] }) {
  const parts: { x: number; w: number; y: number; hh: number }[] = [];
  const sorted = [...holes].sort((a, b) => a.center - b.center);
  let cursor = -len / 2;
  for (const o of sorted) {
    const s = o.center - o.width / 2;
    const e = o.center + o.width / 2;
    if (s > cursor) parts.push({ x: (cursor + s) / 2, w: s - cursor, y: h / 2, hh: h });
    if (o.bottom > 0) parts.push({ x: o.center, w: o.width, y: o.bottom / 2, hh: o.bottom });
    if (o.top < h) parts.push({ x: o.center, w: o.width, y: (o.top + h) / 2, hh: h - o.top });
    cursor = e;
  }
  if (cursor < len / 2) parts.push({ x: (cursor + len / 2) / 2, w: len / 2 - cursor, y: h / 2, hh: h });
  return (
    <group>
      {parts.map((p, i) => (
        <Box key={i} size={[p.w, p.hh, WALL_T]} pos={[p.x, p.y, 0]} color={WALL} />
      ))}
      {holes.map((o) =>
        o.kind === "window" ? (
          <mesh key="w" position={[o.center, (o.bottom + o.top) / 2, 0]}>
            <boxGeometry args={[o.width, o.top - o.bottom, 0.02]} />
            <meshStandardMaterial color="#BFD3E0" transparent opacity={0.35} roughness={0.1} />
          </mesh>
        ) : (
          <Box key="d" size={[o.width - 0.04, o.top - 0.02, 0.04]} pos={[o.center, o.top / 2, -0.03]} color="#C9C3B8" />
        ),
      )}
    </group>
  );
}

function holesFor(side: Exclude<WallSide, "none">, len: number, h: number, r: RoomBrief): Hole[] {
  const holes: Hole[] = [];
  const both = r.window === side && r.door === side;
  if (r.door === side) {
    const width = Math.min(0.9, len * 0.4);
    holes.push({ kind: "door", width, bottom: 0, top: Math.min(2.1, h - 0.1), center: both ? -len / 2 + width / 2 + 0.4 : -len / 2 + Math.max(width / 2 + 0.4, len * 0.25) });
  }
  if (r.window === side) {
    const width = Math.min(2.4, len * (both ? 0.35 : 0.5));
    holes.push({ kind: "window", width, bottom: 0.9, top: Math.min(h - 0.3, 2.3), center: both ? len / 2 - width / 2 - 0.4 : 0 });
  }
  return holes;
}

// Mobilya parçaları: gerçek ölçüde (metre) kutu ve silindirlerden kurulur. Yapay zeka bu kütleleri gerçek mobilyaya çevirir.
type Part = { s: [number, number, number]; p: [number, number, number]; c: string } | { round: [number, number]; p: [number, number, number]; c: string };
// sit: oturan insanın parçaya göre yeri [x, z, dönüş]
type Piece = { id: string; x: number; z: number; r: number; parts: Part[]; sit?: [number, number, number] };

const SEAT = "#BDB8AE";
const WOOD = "#C9B89C";
const WHITE = "#FBFAF8";
const DARK = "#3D3B38";
const SOFT = "#D9D4CA";

const chair = (x = 0, z = 0): Part[] => [
  { s: [0.45, 0.45, 0.45], p: [x, 0.225, z], c: SEAT },
  { s: [0.45, 0.4, 0.06], p: [x, 0.65, z - 0.2], c: SEAT },
];
const roundTable = (radius: number): Part[] => [
  { round: [radius, 0.04], p: [0, 0.74, 0], c: WHITE },
  { round: [0.05, 0.72], p: [0, 0.36, 0], c: DARK },
];

function roomPieces(space: Space, w: number, l: number): Piece[] {
  const hw = w / 2;
  const hl = l / 2;
  const span = (max: number) => Math.max(1.2, Math.min(max, w - 0.6));
  switch (space) {
    case "salon":
      return [
        { id: "hali", x: -w * 0.08, z: -hl + 1.75, r: 0, parts: [{ s: [Math.min(2.6, w - 1), 0.02, 1.7], p: [0, 0.01, 0], c: SOFT }] },
        {
          id: "koltuk",
          x: -w * 0.08,
          z: -hl + 0.55,
          r: 0,
          sit: [0.55, 0.12, 0],
          parts: [
            { s: [2.2, 0.42, 0.9], p: [0, 0.21, 0], c: SEAT },
            { s: [2.2, 0.42, 0.2], p: [0, 0.63, -0.35], c: SEAT },
            { s: [0.2, 0.6, 0.9], p: [-1.0, 0.3, 0], c: SEAT },
            { s: [0.2, 0.6, 0.9], p: [1.0, 0.3, 0], c: SEAT },
          ],
        },
        { id: "sehpa", x: -w * 0.08, z: -hl + 1.75, r: 0, parts: [{ s: [1.1, 0.36, 0.6], p: [0, 0.18, 0], c: WOOD }] },
        {
          id: "berjer",
          x: Math.min(hw - 0.7, -w * 0.08 + 1.9),
          z: -hl + 1.7,
          r: -Math.PI / 2,
          parts: [
            { s: [0.8, 0.42, 0.8], p: [0, 0.21, 0], c: SEAT },
            { s: [0.8, 0.45, 0.16], p: [0, 0.64, -0.32], c: SEAT },
          ],
        },
        {
          id: "tv",
          x: -hw + 0.3,
          z: Math.min(hl - 1.2, 0.6),
          r: Math.PI / 2,
          parts: [
            { s: [1.8, 0.5, 0.4], p: [0, 0.25, 0], c: WOOD },
            { s: [1.4, 0.8, 0.05], p: [0, 1.15, -0.1], c: "#101114" },
          ],
        },
      ];
    case "mutfak": {
      const run = span(3.6);
      return [
        {
          id: "tezgah",
          x: 0,
          z: -hl + 0.3,
          r: 0,
          parts: [
            { s: [run, 0.88, 0.6], p: [0, 0.44, 0], c: WHITE },
            { s: [run, 0.04, 0.64], p: [0, 0.9, 0.01], c: DARK },
            { s: [run, 0.7, 0.35], p: [0, 1.85, -0.125], c: WHITE },
          ],
        },
        { id: "buzdolabi", x: Math.max(-hw + 0.4, -run / 2 - 0.45), z: -hl + 0.34, r: 0, parts: [{ s: [0.7, 2.0, 0.66], p: [0, 1.0, 0], c: "#C4C6C8" }] },
        {
          id: "ada",
          x: 0,
          z: Math.min(hl - 1.3, -hl + 2.1),
          r: 0,
          parts: [
            { s: [1.8, 0.88, 0.9], p: [0, 0.44, 0], c: WOOD },
            { s: [1.9, 0.04, 1.0], p: [0, 0.9, 0], c: WHITE },
            ...[-0.6, 0, 0.6].flatMap((x): Part[] => [
              { round: [0.17, 0.04], p: [x, 0.66, 0.75], c: SEAT },
              { round: [0.03, 0.64], p: [x, 0.32, 0.75], c: DARK },
            ]),
          ],
        },
      ];
    }
    case "yatak":
      return [
        {
          id: "yatak",
          x: 0,
          z: -hl + 1.05,
          r: 0,
          parts: [
            { s: [1.6, 0.5, 2.0], p: [0, 0.25, 0], c: WHITE },
            { s: [1.7, 1.1, 0.08], p: [0, 0.55, -1.02], c: WOOD },
            { s: [0.6, 0.12, 0.4], p: [-0.4, 0.56, -0.7], c: SOFT },
            { s: [0.6, 0.12, 0.4], p: [0.4, 0.56, -0.7], c: SOFT },
          ],
        },
        { id: "komodin1", x: -1.1, z: -hl + 0.28, r: 0, parts: [{ s: [0.45, 0.5, 0.4], p: [0, 0.25, 0], c: WOOD }] },
        { id: "komodin2", x: 1.1, z: -hl + 0.28, r: 0, parts: [{ s: [0.45, 0.5, 0.4], p: [0, 0.25, 0], c: WOOD }] },
        { id: "dolap", x: -hw + 0.32, z: Math.min(hl - 1.1, l * 0.15), r: Math.PI / 2, parts: [{ s: [Math.min(2.0, l - 1), 2.2, 0.6], p: [0, 1.1, 0], c: WHITE }] },
      ];
    case "ofis":
      return [
        {
          id: "masa",
          x: 0,
          z: -hl + 1.3,
          r: 0,
          sit: [0, -0.62, 0],
          parts: [
            { s: [1.6, 0.04, 0.8], p: [0, 0.73, 0], c: WOOD },
            { s: [0.04, 0.71, 0.76], p: [-0.76, 0.355, 0], c: DARK },
            { s: [0.04, 0.71, 0.76], p: [0.76, 0.355, 0], c: DARK },
            ...chair(0, -0.62),
          ],
        },
        { id: "misafir1", x: -0.45, z: -hl + 2.2, r: Math.PI, parts: chair() },
        { id: "misafir2", x: 0.45, z: -hl + 2.2, r: Math.PI, parts: chair() },
        { id: "kitaplik", x: -hw + 0.2, z: 0, r: Math.PI / 2, parts: [{ s: [Math.min(1.8, l - 1), 2.0, 0.35], p: [0, 1.0, 0], c: WHITE }] },
      ];
    case "magaza":
      return [
        { id: "raf", x: 0, z: -hl + 0.2, r: 0, parts: [{ s: [span(3.2), 2.1, 0.35], p: [0, 1.05, 0], c: WHITE }] },
        { id: "stant1", x: -w * 0.2, z: 0, r: 0, parts: [{ s: [1.5, 1.2, 0.5], p: [0, 0.6, 0], c: WOOD }] },
        { id: "stant2", x: w * 0.2, z: 0, r: 0, parts: [{ s: [1.5, 1.2, 0.5], p: [0, 0.6, 0], c: WOOD }] },
        {
          id: "kasa",
          x: hw - 1.1,
          z: hl - 0.8,
          r: Math.PI,
          parts: [
            { s: [1.6, 1.0, 0.6], p: [0, 0.5, 0], c: WHITE },
            { s: [1.7, 0.04, 0.68], p: [0, 1.02, 0], c: DARK },
          ],
        },
      ];
    case "cafe": {
      const set = (id: string, x: number, z: number, sit = false): Piece => ({
        id,
        x,
        z,
        r: 0,
        sit: sit ? [-0.62, 0, Math.PI / 2] : undefined,
        parts: [...roundTable(0.35), ...chair(-0.62, 0), ...chair(0.62, 0)],
      });
      return [
        {
          id: "bar",
          x: 0,
          z: -hl + 0.5,
          r: 0,
          parts: [
            { s: [span(2.8), 1.05, 0.6], p: [0, 0.525, 0], c: WOOD },
            { s: [span(2.8) + 0.1, 0.04, 0.7], p: [0, 1.07, 0], c: DARK },
          ],
        },
        set("masa1", -w * 0.24, hl * 0.1, true),
        set("masa2", w * 0.24, hl * 0.1),
        set("masa3", 0, hl * 0.6),
      ];
    }
    case "klinik":
      return [
        {
          id: "muayene",
          x: 0,
          z: -hl + 1.1,
          r: 0,
          parts: [
            { s: [0.7, 0.6, 1.9], p: [0, 0.3, 0], c: WHITE },
            { s: [0.6, 0.1, 0.4], p: [0, 0.65, -0.7], c: SOFT },
          ],
        },
        { id: "dolap", x: -w * 0.28, z: -hl + 0.27, r: 0, parts: [{ s: [1.2, 0.9, 0.5], p: [0, 0.45, 0], c: WHITE }] },
        { id: "bekleme", x: -hw + 0.35, z: l * 0.18, r: Math.PI / 2, sit: [0, 0, 0], parts: [...chair(-0.55, 0), ...chair(0, 0), ...chair(0.55, 0)] },
        {
          id: "banko",
          x: hw - 1.2,
          z: hl - 0.8,
          r: Math.PI,
          parts: [
            { s: [1.8, 1.05, 0.6], p: [0, 0.525, 0], c: WHITE },
            { s: [1.9, 0.04, 0.68], p: [0, 1.07, 0], c: WOOD },
          ],
        },
      ];
  }
}

function PieceMesh({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) =>
        "round" in p ? (
          <mesh key={i} position={p.p} castShadow receiveShadow>
            <cylinderGeometry args={[p.round[0], p.round[0], p.round[1], 32]} />
            <meshStandardMaterial color={p.c} roughness={0.6} />
          </mesh>
        ) : (
          <Box key={i} size={p.s} pos={p.p} color={p.c} rough={0.7} />
        ),
      )}
    </>
  );
}

function Room({ r, lang, ctx }: { r: RoomBrief; lang: string; ctx: DragCtx }) {
  const { w, l, h } = r;
  const floor = { sicak: "#C9AE8A", notr: "#C8C2B8", acik: "#E2DCD1", koyu: "#6E5B48" }[r.tone];
  const pieces = useMemo(() => roomPieces(r.space, w, l), [r.space, w, l]);
  return (
    <group>
      <Box size={[w, 0.05, l]} pos={[0, -0.025, 0]} color={floor} cast={false} rough={0.7} />
      {/* Arka, sol ve sağ duvar; ön duvar kesit için açık */}
      <group position={[0, 0, -l / 2 - WALL_T / 2]}>
        <HoledWall len={w + WALL_T * 2} h={h} holes={holesFor("back", w + WALL_T * 2, h, r)} />
      </group>
      <group position={[-w / 2 - WALL_T / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <HoledWall len={l} h={h} holes={holesFor("left", l, h, r).map((o) => ({ ...o, center: -o.center }))} />
      </group>
      <group position={[w / 2 + WALL_T / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <HoledWall len={l} h={h} holes={holesFor("right", l, h, r)} />
      </group>
      {pieces.map((p) => (
        <Draggable key={`${r.space}-${p.id}`} id={`${r.space}-${p.id}`} ctx={ctx} base={{ x: p.x, z: p.z, r: p.r }}>
          <PieceMesh parts={p.parts} />
          {p.sit && (
            <group position={[p.sit[0], 0, p.sit[1]]} rotation={[0, p.sit[2], 0]}>
              <Person pose="sit" />
            </group>
          )}
        </Draggable>
      ))}
      <Draggable id="p1" ctx={ctx} base={{ x: w / 2 - 0.6, z: l / 2 - 0.6, r: -0.6 }}>
        <Person />
      </Draggable>
      <Label pos={[0, 0.05, l / 2 + 0.45]} text={fmt(w, lang)} />
      <Label pos={[w / 2 + 0.45, 0.05, 0]} text={fmt(l, lang)} />
      <Label pos={[-w / 2 - 0.25, h / 2, -l / 2 - 0.25]} text={fmt(h, lang)} />
    </group>
  );
}

// ---------------------------------------------------------------- Kamera ve görüntü alma
function Rig({ onReady, size, frontal }: { onReady: (api: SceneApi) => void; size: [number, number, number]; frontal: boolean }) {
  const { camera, gl, scene, invalidate } = useThree();
  const view = useRef<View>("persp");
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const [w, h, d] = size;

  useEffect(() => {
    const R = Math.max(w, d, h * 1.4) * 1.25 + 2.5;
    const target = new THREE.Vector3(0, h * 0.4, 0);
    const place = (v: View) => {
      view.current = v;
      const p = v === "top" ? [0, R * 1.7, 0.01] : v === "front" ? [0, h * 0.55, R * 1.2] : frontal ? [R * 0.32, R * 0.72, R * 1.3] : [R * 0.78, R * 0.62, R * 0.95]; // oda: açık ön cepheden, sağ duvar görüşü kapatmasın
      camera.position.set(p[0], p[1], p[2]);
      controls.current?.target.copy(target);
      camera.lookAt(target);
      controls.current?.update();
      invalidate();
    };
    place(view.current);
    onReady({
      setView: place,
      // Yapay zekaya giden görüntü her zaman perspektiften alınır; kullanıcının açısı sonra geri yüklenir
      capture: () => {
        const prev = { pos: camera.position.clone(), view: view.current };
        place("persp");
        const labels: THREE.Object3D[] = [];
        scene.traverse((o) => o.name === "labels" && labels.push(o));
        labels.forEach((o) => (o.visible = false));
        gl.render(scene, camera);
        const url = gl.domElement.toDataURL("image/jpeg", 0.9);
        labels.forEach((o) => (o.visible = true));
        camera.position.copy(prev.pos);
        view.current = prev.view;
        controls.current?.update();
        invalidate();
        return url && url.length > 2000 ? url : null;
      },
    });
  }, [w, h, d, frontal, camera, gl, scene, invalidate, onReady]);

  return <OrbitControls ref={controls} makeDefault enableDamping={false} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={2} maxDistance={80} />;
}

export default function StudioScene({
  mode,
  stand,
  room,
  lang,
  onReady,
  moves,
  onMove,
  logo = null,
}: {
  mode: Mode;
  stand: StandBrief;
  room: RoomBrief;
  lang: string;
  onReady: (api: SceneApi) => void;
  moves: Moves;
  onMove?: (id: string, m: Move) => void;
  logo?: string | null;
}) {
  const size = useMemo<[number, number, number]>(() => (mode === "stand" ? [stand.w, stand.h, stand.d] : [room.w, room.h, room.l]), [mode, stand.w, stand.h, stand.d, room.w, room.h, room.l]);
  const span = Math.max(size[0], size[2]);
  const ctx = useMemo<DragCtx>(() => ({ moves, onMove, half: [Math.max(0.2, size[0] / 2 - 0.25), Math.max(0.2, size[2] / 2 - 0.25)] }), [moves, onMove, size]);

  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 38, near: 0.1, far: 300, position: [10, 8, 12] }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ touchAction: "none" }}
    >
      <color attach="background" args={["#ECEAE5"]} />
      <hemisphereLight args={["#ffffff", "#d9d4ca", 0.9]} />
      <directionalLight
        position={[span * 0.6, span * 1.1 + 6, span * 0.8]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-bias={-0.0004}
      />
      <Environment resolution={128}>
        <Lightformer intensity={1.4} position={[0, 6, 4]} scale={[12, 4, 1]} />
        <Lightformer intensity={0.6} position={[-6, 3, -2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
      {/* Salon zemini */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.051, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#E4E1DA" roughness={1} />
      </mesh>
      {mode === "stand" ? <Stand b={stand} lang={lang} ctx={ctx} logo={logo} /> : <Room r={room} lang={lang} ctx={ctx} />}
      <Rig onReady={onReady} size={size} frontal={mode === "interior"} />
    </Canvas>
  );
}
