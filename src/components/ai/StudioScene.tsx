"use client";

// Ölçüye göre çizilen 3D kütle modeli. Yapay zekaya giden görselin iskeleti budur:
// ayak izi, duvarlar, açıklıklar ve elemanlar gerçek ölçüde (metre) çizilir.
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import type { Mode, RoomBrief, StandBrief, WallSide } from "./studio-data";

export type View = "persp" | "top" | "front";
export type SceneApi = { setView: (v: View) => void; capture: () => string | null };

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

// Ölçek figürü: 1,75 m
function Person({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.875, 0]} castShadow>
        <capsuleGeometry args={[0.2, 1.35, 6, 16]} />
        <meshStandardMaterial color="#9A9893" roughness={0.9} />
      </mesh>
    </group>
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
function Stand({ b, lang }: { b: StandBrief; lang: string }) {
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
        <group position={[xRight - depoW / 2, 0.1, zBack + 0.6]}>
          <Box size={[depoW, h, 1.2]} pos={[0, h / 2, 0]} color={WALL} />
          <Box size={[0.8, 2.05, 0.02]} pos={[-depoW / 2 + 0.5, 1.025, 0.61]} color="#CFCAC1" />
        </group>
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
        <group position={[Math.max(-w / 2 + 1.2, -w / 4), 0.1, d / 2 - 0.8]}>
          <Box size={[1.6, 1.05, 0.6]} pos={[0, 0.525, 0]} color={WALL} />
          <Box size={[1.6, 0.9, 0.02]} pos={[0, 0.5, 0.31]} color={color} rough={0.5} />
          <Box size={[1.7, 0.04, 0.68]} pos={[0, 1.07, 0]} color="#FBFAF8" rough={0.4} />
        </group>
      )}

      {/* Toplantı alanı: yuvarlak masa ve üç sandalye */}
      {has("toplanti") && (
        <group position={[Math.min(w / 4, w / 2 - 1.1), 0.1, Math.min(d / 6, d / 2 - 1.1)]}>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.04, 40]} />
            <meshStandardMaterial color="#FBFAF8" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.37, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.72, 16]} />
            <meshStandardMaterial color="#2A2A2A" />
          </mesh>
          {[0, 2.1, 4.2].map((a) => (
            <group key={a} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]} rotation={[0, -a + Math.PI / 2, 0]}>
              <Box size={[0.45, 0.45, 0.45]} pos={[0, 0.225, 0]} color="#BDB8AE" />
              <Box size={[0.45, 0.4, 0.06]} pos={[0, 0.65, -0.2]} color="#BDB8AE" />
            </group>
          ))}
        </group>
      )}

      {/* Ürün rafları: sol duvar, yoksa arka duvarın sol tarafı */}
      {has("raf") && (
        <group
          position={left ? [xLeft + 0.2, 0.1, -d / 6] : back ? [-w / 2 + 1, 0.1, zBack + 0.2] : [-w / 4, 0.1, -d / 4]}
          rotation={[0, left ? Math.PI / 2 : 0, 0]}
        >
          {[0.5, 1.0, 1.5, 2.0].map((y) => (
            <Box key={y} size={[1.4, 0.03, 0.35]} pos={[0, y, 0]} color="#FBFAF8" rough={0.5} />
          ))}
          <Box size={[0.03, 2.1, 0.35]} pos={[-0.7, 1.05, 0]} color="#CFCAC1" />
          <Box size={[0.03, 2.1, 0.35]} pos={[0.7, 1.05, 0]} color="#CFCAC1" />
        </group>
      )}

      {/* Asma pano: standın üstünde halka */}
      {has("asma") && (
        <mesh position={[0, h + 1.3, 0]} castShadow>
          <cylinderGeometry args={[Math.min(w, d) * 0.28, Math.min(w, d) * 0.28, 0.9, 64, 1, true]} />
          <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Person x={w / 2 - 0.7} z={d / 2 - 0.5} />

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

function Room({ r, lang }: { r: RoomBrief; lang: string }) {
  const { w, l, h } = r;
  const floor = { sicak: "#C9AE8A", notr: "#C8C2B8", acik: "#E2DCD1", koyu: "#6E5B48" }[r.tone];
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
      <Person x={w / 4} z={l / 4} />
      <Label pos={[0, 0.05, l / 2 + 0.45]} text={fmt(w, lang)} />
      <Label pos={[w / 2 + 0.45, 0.05, 0]} text={fmt(l, lang)} />
      <Label pos={[-w / 2 - 0.25, h / 2, -l / 2 - 0.25]} text={fmt(h, lang)} />
    </group>
  );
}

// ---------------------------------------------------------------- Kamera ve görüntü alma
function Rig({ onReady, size }: { onReady: (api: SceneApi) => void; size: [number, number, number] }) {
  const { camera, gl, scene, invalidate } = useThree();
  const view = useRef<View>("persp");
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const [w, h, d] = size;

  useEffect(() => {
    const R = Math.max(w, d, h * 1.4) * 1.25 + 2.5;
    const target = new THREE.Vector3(0, h * 0.4, 0);
    const place = (v: View) => {
      view.current = v;
      const p = v === "top" ? [0, R * 1.7, 0.01] : v === "front" ? [0, h * 0.55, R * 1.2] : [R * 0.78, R * 0.62, R * 0.95];
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
  }, [w, h, d, camera, gl, scene, invalidate, onReady]);

  return <OrbitControls ref={controls} makeDefault enableDamping={false} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={2} maxDistance={80} />;
}

export default function StudioScene({
  mode,
  stand,
  room,
  lang,
  onReady,
}: {
  mode: Mode;
  stand: StandBrief;
  room: RoomBrief;
  lang: string;
  onReady: (api: SceneApi) => void;
}) {
  const size = useMemo<[number, number, number]>(() => (mode === "stand" ? [stand.w, stand.h, stand.d] : [room.w, room.h, room.l]), [mode, stand.w, stand.h, stand.d, room.w, room.h, room.l]);
  const span = Math.max(size[0], size[2]);

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
      {mode === "stand" ? <Stand b={stand} lang={lang} /> : <Room r={room} lang={lang} />}
      <Rig onReady={onReady} size={size} />
    </Canvas>
  );
}
