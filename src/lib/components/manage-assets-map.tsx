import React, { ReactElement, useEffect, useRef } from "react";
import maplibregl, { LngLat, LngLatBounds } from "maplibre-gl";

// const STYLE = 'https://storage.googleapis.com/hellopvt3/charted-territory.json'
const STYLE = `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`;
// const STYLE = 'https://basemaps-api.arcgis.com/arcgis/rest/services/styles/ArcGIS:ChartedTerritory?type=style&token=AAPK2b935e8bbf564ef581ca3c6fcaa5f2a71ZH84cPqqFvyz3KplFRHP8HyAwJJkh6cnpcQ-qkWh5aiyDQsGJbsXglGx0QM2cPm'

// 2.1.9 is what esri is using

export type MapInfo = {
  bounds: LngLatBounds;
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
};

interface MapProps {
  children?: ReactElement | ReactElement[];
  onInit: (map: maplibregl.Map) => void;
  onMove: (info: MapInfo) => void;
}

export default function ManageAssetsMap({
  children,
  onInit,
  onMove,
}: MapProps) {
  const mapContainerRef = useRef<any>(null);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE,
      center: [-104.692, 40.376],
      zoom: 14,
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right"
    );

    map.on("move", () =>
      onMove({
        bounds: map.getBounds(),
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      })
    );

    onInit(map);

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div className="flex flex-col w-full h-full" ref={mapContainerRef}>
      <div className="">{children}</div>
    </div>
  );
}
