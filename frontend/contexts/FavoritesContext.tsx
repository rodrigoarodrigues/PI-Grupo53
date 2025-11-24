import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (gameUuid: string) => void;
  removeFavorite: (gameUuid: string) => void;
  isFavorite: (gameUuid: string) => boolean;
  toggleFavorite: (gameUuid: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = '@sakura_arcade_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
    }
  };

  const addFavorite = (gameUuid: string) => {
    if (!favorites.includes(gameUuid)) {
      saveFavorites([...favorites, gameUuid]);
    }
  };

  const removeFavorite = (gameUuid: string) => {
    saveFavorites(favorites.filter((uuid) => uuid !== gameUuid));
  };

  const isFavorite = (gameUuid: string) => {
    return favorites.includes(gameUuid);
  };

  const toggleFavorite = (gameUuid: string) => {
    if (isFavorite(gameUuid)) {
      removeFavorite(gameUuid);
    } else {
      addFavorite(gameUuid);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

