import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Simple coordinate-based cache for BigDataCloud (round to ~100m)
const addressCache = new Map();
const getCacheKey = (lat, lng) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

// Reverse geocode using BigDataCloud (keyless, fast, with IP fallback)
const reverseGeocodeBigDataCloud = async (latitude, longitude) => {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  if (latitude && longitude) {
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
  }
  url.searchParams.set('localityLanguage', 'en');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    const city = data.city || data.locality || '';
    const region = data.principalSubdivision || '';
    const country = data.countryName || '';
    return [city, region, country].filter(Boolean).join(', ') || 'Address not found';
  } catch (error) {
    console.error('BigDataCloud error:', error);
    return 'Could not load address';
  }
};

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onLocationSelect({ type: 'Point', coordinates: [lng, lat] });
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        setPosition({ lat, lng });
        onLocationSelect({ type: 'Point', coordinates: [lng, lat] });
      }
    },
  };

  return position === null ? null : (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function SearchControl({ map, onLocationSelect }) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const provider = new OpenStreetMapProvider();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    const results = await provider.search({ query: searchText });
    if (results.length > 0) {
      const { x, y, label } = results[0];
      const latLng = { lat: y, lng: x };
      map.setView(latLng, 13);
      onLocationSelect({ type: 'Point', coordinates: [x, y] });
      setSearchText('');
      setSuggestions([]);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value.length > 2) {
      const results = await provider.search({ query: value });
      setSuggestions(results.map(r => r.label));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="map-search-wrap">
      <form onSubmit={handleSearch} className="map-search-form">
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          className="map-search-input"
        />
        <button type="submit" className="btn btn-secondary map-search-btn">
          Search
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="map-search-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                setSearchText(suggestion);
                setSuggestions([]);
              }}
              className="map-search-suggestion"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MapPicker = ({ onLocationSelect, initialCenter = [20, 0], initialZoom = 2 }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // BigDataCloud + cache wrapper
  const updateAddress = useCallback(async (lat, lng) => {
    const key = getCacheKey(lat, lng);
    if (addressCache.has(key)) {
      setAddress(addressCache.get(key));
      return;
    }
    setLoadingAddress(true);
    const addr = await reverseGeocodeBigDataCloud(lat, lng);
    addressCache.set(key, addr);
    setAddress(addr);
    setLoadingAddress(false);
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    onLocationSelect(location);
    const [lng, lat] = location.coordinates;
    updateAddress(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      // Fallback: try BigDataCloud IP-based (no coordinates)
      updateAddress();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { type: 'Point', coordinates: [longitude, latitude] };
        handleLocationSelect(loc);
        if (mapInstance) {
          mapInstance.setView([latitude, longitude], 13);
        }
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
        // Still try to get an approximate location via IP
        updateAddress(); // no lat/lng → BigDataCloud uses IP fallback
      }
    );
  };

  return (
    <div className="map-picker-root">
      <div className="map-toolbar">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="btn btn-primary"
        >
          Use My Current Location
        </button>
        <span className="map-toolbar-note">
          Or click on the map to place a marker
        </span>
      </div>

      <div className="map-shell">
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          className="leaflet-map"
          whenReady={(event) => setMapInstance(event.target)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
          {mapInstance && (
            <SearchControl 
              map={mapInstance} 
              onLocationSelect={handleLocationSelect}
            />
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="map-selection-details">
          <div><strong>Coordinates:</strong> {selectedLocation.coordinates[1].toFixed(4)}°N, {selectedLocation.coordinates[0].toFixed(4)}°E</div>
          <div className="map-address-line">
            <strong>Location (approx.):</strong> {loadingAddress ? 'Loading...' : address}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;