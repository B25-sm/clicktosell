import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  category?: string;
}

interface ListingsState {
  items: Listing[];
  favorites: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  items: [],
  favorites: [],
  isLoading: false,
  error: null,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Listing[]>) => {
      state.items = action.payload;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter((id) => id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setListings, addFavorite, removeFavorite, setLoading, setError } =
  listingsSlice.actions;
export default listingsSlice.reducer;

