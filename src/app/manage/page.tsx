import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Map from "@/src/lib/components/map";

export default function Manage() {
  return (
    <div className="w-full h-screen">
      <>Manage </>
      <div className="w-full h-full border-2 border-red-500">
        <Map />
      </div>
    </div>
  );
}
