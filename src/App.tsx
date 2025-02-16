import "./App.css";
import { FlyToInterpolator, MapViewState } from "@deck.gl/core";
import { Map } from "react-map-gl/mapbox";
import DeckGL from "deck.gl";
import { useEffect, useState } from "react";
import { usePulsingLocationLayers } from "./usePulsingLocationLayers";
import "mapbox-gl/dist/mapbox-gl.css";

// The Firefly office! :)
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -73.99042116071794,
  latitude: 40.74318017210629,
  zoom: 15,
};

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";

function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  // Store the current location of the user, or null if not available
  const [currentLocation, setCurrentLocation] =
    useState<GeolocationCoordinates | null>(null);

  const [loading, setLoading] = useState(true);

  // Stores the layers to be rendered (for displaying dot)
  const layers = usePulsingLocationLayers(currentLocation);

  // On mount, we request the user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onRecieveLocation, onError);
    }
  }, []);

  function onRecieveLocation(pos: GeolocationPosition) {
    setCurrentLocation(pos.coords);

    // Once we have the location, we update the view state to center on it
    setViewState({
      zoom: 16,
      longitude: pos.coords.longitude,
      latitude: pos.coords.latitude,
      transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
      transitionDuration: "auto",
    });
    setLoading(false);
  }

  function onError(err: GeolocationPositionError) {
    console.warn(`ERROR (${err.code}): ${err.message}`);
    setLoading(false);
  }

  return loading ? (
    <div className="modal">Loading...</div>
  ) : (
    <DeckGL initialViewState={viewState} controller layers={layers}>
      <Map mapStyle={MAP_STYLE} mapboxAccessToken={MAPBOX_TOKEN} />
      {!currentLocation && (
        <div className="modal">
          <h1>Location access denied</h1>
          <p>
            Please enable location access in your browser settings to use this
            app.
          </p>
        </div>
      )}
    </DeckGL>
  );
}

export default App;
