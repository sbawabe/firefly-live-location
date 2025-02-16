import { LayersList, ScatterplotLayer } from "deck.gl";
import { useEffect, useState, useMemo } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 1.3;
const SCALE_INCREMENT = 0.0045; // Dictates speed of pulsing

/**
 * Returns a list of layers to be rendered on the map.
 * @param location The current location of the user.
 */
export const usePulsingLocationLayers = (
  location: GeolocationCoordinates | null
): LayersList => {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    let growing = true;

    /**
     * Animation function for the pulsing of the inner blue dot.
     */
    function animate() {
      setScale((prevScale) => {
        if (prevScale >= MAX_SCALE) growing = false; // If max scale is reached, start shrinking
        if (prevScale <= MIN_SCALE) growing = true; // If min scale is reached, start growing
        return prevScale + (growing ? SCALE_INCREMENT : -SCALE_INCREMENT);
      });
      requestAnimationFrame(animate);
    }

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return useMemo(() => {
    if (!location) return [];

    return [
      // Low-opacity blue circle
      new ScatterplotLayer({
        id: "base-location",
        data: [location],
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: [0, 128, 255],
        getRadius: 24,
        radiusUnits: "pixels",
        opacity: 0.05,
      }),
      // White circle
      new ScatterplotLayer({
        id: "base-location",
        data: [location],
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: [255, 255, 255],
        getRadius: 12,
        radiusUnits: "pixels",
        opacity: 1,
      }),
      // Pulsing blue circle
      new ScatterplotLayer({
        id: "pulse-location",
        data: [location],
        getPosition: (d) => [d.longitude, d.latitude],
        getFillColor: [0, 128, 255],
        getRadius: 6 * scale,
        radiusUnits: "pixels",
        opacity: 1,
        updateTriggers: {
          getRadius: scale,
        },
      }),
    ];
  }, [location, scale]);
};
