import React, { useState } from 'react';
import MapView from '../components/MapView';
import './MapPage.css';

const MapPage = () => {
  const [markers, setMarkers] = useState([
    {
      position: [33.5731, -7.5898],
      title: 'Casablanca',
      description: 'Ville principale du Maroc'
    }
  ]);

  const [newMarker, setNewMarker] = useState({ lat: '', lng: '', title: '', description: '' });

  const handleAddMarker = (e) => {
    e.preventDefault();
    if (newMarker.lat && newMarker.lng) {
      setMarkers([
        ...markers,
        {
          position: [parseFloat(newMarker.lat), parseFloat(newMarker.lng)],
          title: newMarker.title || 'Nouveau point',
          description: newMarker.description || ''
        }
      ]);
      setNewMarker({ lat: '', lng: '', title: '', description: '' });
    }
  };

  return (
    <div className="map-page">
      <div className="container">
        <h1>Carte interactive</h1>
        <div className="map-page-content">
          <div className="map-section">
            <MapView 
              center={[33.5731, -7.5898]} 
              zoom={6}
              markers={markers}
            />
          </div>
          <div className="map-controls">
            <h2>Ajouter un point</h2>
            <form onSubmit={handleAddMarker} className="marker-form">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={newMarker.lat}
                  onChange={(e) => setNewMarker({ ...newMarker, lat: e.target.value })}
                  placeholder="33.5731"
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={newMarker.lng}
                  onChange={(e) => setNewMarker({ ...newMarker, lng: e.target.value })}
                  placeholder="-7.5898"
                  required
                />
              </div>
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={newMarker.title}
                  onChange={(e) => setNewMarker({ ...newMarker, title: e.target.value })}
                  placeholder="Nom du point"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newMarker.description}
                  onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
                  placeholder="Description du point"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Ajouter le point
              </button>
            </form>
            <div className="markers-list">
              <h3>Points sur la carte ({markers.length})</h3>
              <ul>
                {markers.map((marker, index) => (
                  <li key={index}>
                    <strong>{marker.title}</strong>
                    {marker.description && <p>{marker.description}</p>}
                    <small>{marker.position[0]}, {marker.position[1]}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;



