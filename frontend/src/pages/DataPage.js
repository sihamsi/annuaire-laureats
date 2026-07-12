import React, { useState, useEffect } from 'react';
import './DataPage.css';

const DataPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Exemple de données - à remplacer par un appel API
  useEffect(() => {
    setLoading(true);
    // Simuler un chargement de données
    setTimeout(() => {
      setData([
        { id: 1, name: 'Point A', lat: 33.5731, lng: -7.5898, type: 'Ville', date: '2024-01-15' },
        { id: 2, name: 'Point B', lat: 34.0209, lng: -6.8416, type: 'Ville', date: '2024-01-16' },
        { id: 3, name: 'Point C', lat: 31.6295, lng: -7.9811, type: 'Site', date: '2024-01-17' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="data-page">
      <div className="container">
        <h1>Gestion des données</h1>
        
        <div className="data-actions">
          <button className="btn btn-primary">Importer des données</button>
          <button className="btn btn-secondary">Exporter les données</button>
        </div>

        {loading ? (
          <div className="loading">Chargement des données...</div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.lat}</td>
                      <td>{item.lng}</td>
                      <td><span className="badge">{item.type}</span></td>
                      <td>{item.date}</td>
                      <td>
                        <button className="btn-small btn-edit">Modifier</button>
                        <button className="btn-small btn-delete">Supprimer</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPage;



