import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import { MESSAGES, SEARCH_CONFIG } from '../../utils/constants';
import styles from './RecherchePage.module.css';

const RecherchePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    promotion: '',
    specialite: '',
    annee: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return;
    }

    setIsLoading(true);
    // TODO: Implémenter l'appel API
    setTimeout(() => {
      setResults([]);
      setIsLoading(false);
    }, 500);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      promotion: '',
      specialite: '',
      annee: '',
    });
  };

  return (
    <div className={styles.recherchePage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Rechercher un lauréat</h1>

        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <Input
                type="text"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={MESSAGES.SEARCH_PLACEHOLDER}
                className={styles.searchInput}
              />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </form>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterToggle}
          >
            <Filter size={18} />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <Card className={styles.filtersCard}>
            <div className={styles.filtersHeader}>
              <h3>Filtres de recherche</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={16} />
                Réinitialiser
              </Button>
            </div>
            <div className={styles.filtersGrid}>
              <Input
                label="Promotion"
                name="promotion"
                value={filters.promotion}
                onChange={(e) => handleFilterChange('promotion', e.target.value)}
                placeholder="Ex: 2020"
              />
              <Input
                label="Spécialité"
                name="specialite"
                value={filters.specialite}
                onChange={(e) => handleFilterChange('specialite', e.target.value)}
                placeholder="Ex: Génie Civil"
              />
              <Input
                label="Année"
                name="annee"
                type="number"
                value={filters.annee}
                onChange={(e) => handleFilterChange('annee', e.target.value)}
                placeholder="Ex: 2020"
              />
            </div>
          </Card>
        )}

        <div className={styles.resultsSection}>
          {isLoading ? (
            <div className={styles.loading}>{MESSAGES.LOADING}</div>
          ) : results.length === 0 && searchQuery ? (
            <div className={styles.noResults}>
              <p>{MESSAGES.NO_DATA}</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {results.map((result) => (
                <Card key={result.id} className={styles.resultCard}>
                  <h3>{result.nom}</h3>
                  <p>{result.promotion}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecherchePage;

