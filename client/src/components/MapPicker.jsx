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
    <div style={{ position: 'absolute', top: '10px', left: '50px', zIndex: 1000 }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          style={{
            padding: '8px',
            width: '250px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button type="submit" style={{ padding: '8px', marginLeft: '5px' }}>
          Search
        </button>
      </form>
      {suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '0',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1001
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => {
                setSearchText(suggestion);
                setSuggestions([]);
              }}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MapPicker = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef(null);

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
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 13);
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
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button
          type="button"
          onClick={getCurrentLocation}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          📍 Use My Current Location
        </button>
        <span style={{ fontSize: '0.9em', color: '#666' }}>
          Or click on the map to place a marker
        </span>
      </div>

      <div style={{ position: 'relative', height: '400px', marginBottom: '20px' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
          {mapRef.current && (
            <SearchControl 
              map={mapRef.current} 
              onLocationSelect={handleLocationSelect}
            />
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f4fd',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <div><strong>Coordinates:</strong> {selectedLocation.coordinates[1].toFixed(4)}°N, {selectedLocation.coordinates[0].toFixed(4)}°E</div>
          <div style={{ marginTop: '5px' }}>
            <strong>Location (approx.):</strong> {loadingAddress ? 'Loading...' : address}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPicker;