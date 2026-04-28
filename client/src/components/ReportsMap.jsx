import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const getCenterFromReports = (reports) => {
  const validPoints = reports
    .map((report) => report?.location?.coordinates)
    .filter((coords) => Array.isArray(coords) && coords.length === 2)
    .map(([lng, lat]) => [lat, lng]);

  if (validPoints.length === 0) {
    return [20, 0];
  }

  const sums = validPoints.reduce(
    (acc, [lat, lng]) => ({ lat: acc.lat + lat, lng: acc.lng + lng }),
    { lat: 0, lng: 0 }
  );

  return [sums.lat / validPoints.length, sums.lng / validPoints.length];
};

const ReportsMap = ({ reports, onReportSelect }) => {
  const [mapInstance, setMapInstance] = useState(null);

  const markers = useMemo(
    () =>
      reports
        .filter((report) => Array.isArray(report?.location?.coordinates) && report.location.coordinates.length === 2)
        .map((report) => {
          const [lng, lat] = report.location.coordinates;
          return { ...report, lat, lng };
        }),
    [reports]
  );

  const center = useMemo(() => getCenterFromReports(reports), [reports]);

  useEffect(() => {
    if (!mapInstance || markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      mapInstance.setView([markers[0].lat, markers[0].lng], 11);
      return;
    }

    const bounds = L.latLngBounds(markers.map((item) => [item.lat, item.lng]));
    mapInstance.fitBounds(bounds, { padding: [30, 30] });
  }, [mapInstance, markers]);

  return (
    <div className="map-shell map-shell-large">
      <MapContainer
        center={center}
        zoom={5}
        className="leaflet-map"
        whenReady={(event) => setMapInstance(event.target)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((report) => (
          <Marker
            key={report._id}
            position={[report.lat, report.lng]}
            eventHandlers={{
              click: () => onReportSelect?.(report._id),
            }}
          >
            <Popup>
              <div>
                <strong>{report.disasterType}</strong>
                <p>{report.description || 'No description'}</p>
                <p>Status: {report.status}</p>
                <p>Urgency: {report.urgencyLevel}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReportsMap;
