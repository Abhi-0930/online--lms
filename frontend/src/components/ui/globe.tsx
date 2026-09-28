"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: { lat: number; lng: number };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

export interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}


export function Globe({ globeConfig, data }: WorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [countriesData, setCountriesData] = useState<any>(null);

  useEffect(() => {
    fetch("/data/globe.json")
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) => console.error("Error loading globe geojson:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 300);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = globeConfig.autoRotate ?? true;
    controls.autoRotateSpeed = globeConfig.autoRotateSpeed ?? 0.6;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI - Math.PI / 3.5;

    // ThreeGlobe Instance
    const globe = new ThreeGlobe()
      .showAtmosphere(globeConfig.showAtmosphere ?? true)
      .atmosphereColor(globeConfig.atmosphereColor ?? "#FFFFFF")
      .atmosphereAltitude(globeConfig.atmosphereAltitude ?? 0.1)
      .arcsData(data)
      .arcColor((e: any) => e.color)
      .arcAltitude((e: any) => e.arcAlt)
      .arcStroke(() => 0.4)
      .arcDashLength(globeConfig.arcLength ?? 0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(globeConfig.arcTime ?? 1000)
      .arcsTransitionDuration(1000);

    // Configure globe material
    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
    globeMaterial.color = new THREE.Color(globeConfig.globeColor ?? "#062056");
    globeMaterial.emissive = new THREE.Color(globeConfig.emissive ?? "#062056");
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity ?? 0.1;
    globeMaterial.shininess = globeConfig.shininess ?? 0.9;

    // Hex Polygons (Countries)
    if (countriesData && countriesData.features) {
      globe
        .hexPolygonsData(countriesData.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .hexPolygonColor(() => globeConfig.polygonColor || "rgba(255, 255, 255, 0.7)");
    }

    // Rings & Points on Arc Start/End
    const points: Array<{ lat: number; lng: number; color: string }> = [];
    data.forEach((arc) => {
      points.push({ lat: arc.startLat, lng: arc.startLng, color: arc.color });
      points.push({ lat: arc.endLat, lng: arc.endLng, color: arc.color });
    });

    const rings = points.slice(0, 16).map((pt) => ({
      lat: pt.lat,
      lng: pt.lng,
      color: (t: number) => {
        const c = new THREE.Color(pt.color);
        return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${1 - t})`;
      },
    }));

    globe
      .ringsData(rings)
      .ringColor((e: any) => (t: any) => e.color(t))
      .ringMaxRadius(globeConfig.maxRings ?? 3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod((globeConfig.arcTime ?? 1000) / 2);

    scene.add(globe);

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      globeConfig.ambientLight ?? "#38bdf8",
      1.2
    );
    scene.add(ambientLight);

    const dirLightLeft = new THREE.DirectionalLight(
      globeConfig.directionalLeftLight ?? "#ffffff",
      1.5
    );
    dirLightLeft.position.set(-200, 300, 200);
    scene.add(dirLightLeft);

    const dirLightTop = new THREE.DirectionalLight(
      globeConfig.directionalTopLight ?? "#ffffff",
      1.5
    );
    dirLightTop.position.set(200, 400, 200);
    scene.add(dirLightTop);

    const pointLight = new THREE.PointLight(
      globeConfig.pointLight ?? "#ffffff",
      1.8
    );
    pointLight.position.set(-100, 200, 150);
    scene.add(pointLight);

    // Initial orientation
    if (globeConfig.initialPosition) {
      const phi = (90 - globeConfig.initialPosition.lat) * (Math.PI / 180);
      const theta = (globeConfig.initialPosition.lng + 180) * (Math.PI / 180);
      globe.rotation.y = -theta;
      globe.rotation.x = phi - Math.PI / 2;
    }

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Viewport Visibility Observer (pause render loop when offscreen to save GPU/CPU)
    let isVisible = true;
    let animationFrameId: number;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          animate();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Render loop
    const animate = () => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [countriesData]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

export function World(props: WorldProps) {
  return <Globe {...props} />;
}

