import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInitialCampaigns } from './campaignSlice';
import { toast } from 'react-toastify';
import { getInitialCounts } from './dashboardSlice';
import { ApiAxios } from '../api/Api';

// Helper function to save NFTs to localStorage
const saveNFTsToLocalStorage = (nfts) => {
  try {
    localStorage.setItem('test-nfts', JSON.stringify(nfts));
  } catch (error) {
    console.error('Error saving NFTs to localStorage:', error);
  }
};

export const getInitialNft = createAsyncThunk(
  'nft/get',
  async ({}, { getState, rejectWithValue }) => {
    const { auth } = getState();
    
    // TEST MODE: Load NFTs from localStorage for test user
    if (auth.value.user?._id === 'test-user-123') {
      try {
        const savedNFTs = localStorage.getItem('test-nfts');
        if (savedNFTs) {
          const parsedNFTs = JSON.parse(savedNFTs);
          return { nfts: parsedNFTs };
        }
        return { nfts: [] };
      } catch (error) {
        console.error('Error loading NFTs from localStorage:', error);
        return { nfts: [] };
      }
    }

    try {
      const { data } = await ApiAxios.get('/nfts');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateFreshNft = createAsyncThunk('nft/updateFreshNft', async (nfts, { dispatch }) => {
  await dispatch(getInitialCounts({}));

  return nfts;
});

export const deleteNFT = createAsyncThunk(
  'nft/delete',
  async (id, { getState, rejectWithValue, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock NFT deletion
    if (auth.value.user?._id === 'test-user-123') {
      return { _id: id, message: 'NFT deleted successfully' };
    }
    
    try {
      const { data } = await ApiAxios.delete(`/nfts/${id}`);

      await dispatch(updateFreshNft(data.nfts));

      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateNFT = createAsyncThunk(
  'nft/update',
  async (nft, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock NFT update
    if (auth.value.user?._id === 'test-user-123') {
      // Convert File object to data URL if needed
      let imageUrl = nft.image;
      if (nft.image instanceof File) {
        try {
          imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(nft.image);
          });
        } catch (error) {
          console.error('Error converting image to data URL:', error);
          imageUrl = nft.image; // Keep original if conversion fails
        }
      }
      
      const mockNFT = {
        ...nft,
        updated_at: new Date().toISOString(),
        image: imageUrl // Use serializable image URL
      };
      return { nft: mockNFT };
    }
    
    try {
      const { data } = await ApiAxios.patch(`/nfts/${nft._id}`, nft, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createNFT = createAsyncThunk(
  'nft/create',
  async (nft, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock NFT creation
    if (auth.value.user?._id === 'test-user-123') {
      // Convert File object to data URL to make it serializable
      let imageUrl = null;
      if (nft.image instanceof File) {
        try {
          // Convert File to base64 data URL
          imageUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(nft.image);
          });
        } catch (error) {
          console.error('Error converting image to data URL:', error);
          imageUrl = null;
        }
      } else if (typeof nft.image === 'string') {
        // Already a string (URL or data URL)
        imageUrl = nft.image;
      }
      
      const mockNFT = {
        ...nft,
        _id: 'test-nft-' + Date.now(),
        status: nft.status || 'draft',
        user_id: 'test-user-123',
        created_at: new Date().toISOString(),
        image: imageUrl // Replace File with serializable data URL
      };
      return { nft: mockNFT };
    }
    
    try {
      const { data } = await ApiAxios.post(
        `/nfts`,
        {
          ...nft
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await dispatch(updateFreshNft(data.nfts));

      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addToCampaign = createAsyncThunk(
  'nft/add-to-campaign',
  async ({ campaignId, nftId }, { rejectWithValue, dispatch, getState }) => {
    const { auth, nft } = getState();
    
    // TEST MODE: Mock add to campaign
    if (auth.value.user?._id === 'test-user-123') {
      // Find the NFT and update it
      const nfts = nft.nfts.map(n => 
        n._id === nftId ? { ...n, status: 'ready', campaign_id: campaignId } : n
      );
      await dispatch(updateFreshNft(nfts));
      await dispatch(getInitialCampaigns({}));
      return { success: true };
    }
    
    try {
      const { data } = await ApiAxios.patch(`/nfts/${nftId}`, {
        status: 'ready',
        campaign_id: campaignId
      });
      await dispatch(updateFreshNft(data.nfts));
      await dispatch(getInitialCampaigns({}));
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const removeFromCampaign = createAsyncThunk(
  'nft/remove-from-campaign',
  async ({ campaignId, nftId }, { rejectWithValue, dispatch, getState }) => {
    const { auth, nft } = getState();
    
    // TEST MODE: Mock remove from campaign
    if (auth.value.user?._id === 'test-user-123') {
      // Find the NFT and update it
      const nfts = nft.nfts.map(n => 
        n._id === nftId ? { ...n, status: 'ready', campaign_id: null } : n
      );
      await dispatch(updateFreshNft(nfts));
      await dispatch(getInitialCampaigns({}));
      return { success: true };
    }
    
    try {
      const { data } = await ApiAxios.patch(`/nfts/${nftId}`, {
        status: 'ready',
        campaign_id: null
      });
      await dispatch(updateFreshNft(data.nfts));
      await dispatch(getInitialCampaigns({}));
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const NFTSlice = createSlice({
  name: 'nft',
  initialState: {
    nfts: [],
    totalCount: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getInitialNft.fulfilled, (state, { payload }) => {
      state.nfts = payload.nfts || payload;
      state.totalCount = (payload.nfts || payload).length;
    });
    builder.addCase(getInitialNft.pending, (state) => {
      // Don't save on pending, wait for fulfilled
    });
    builder.addCase(updateFreshNft.fulfilled, (state, { payload }) => {
      state.nfts = Array.isArray(payload) ? payload : [];
      state.totalCount = Array.isArray(payload) ? payload.length : 0;
      
      // Save to localStorage for persistence
      if (Array.isArray(payload)) {
        saveNFTsToLocalStorage(payload);
      }
    });
    builder.addCase(getInitialNft.rejected, ({ payload }) => {
      toast.error(payload?.error, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(createNFT.fulfilled, (state, { payload }) => {
      // Add the newly created NFT to the Redux state
      const newNFT = payload.nft || payload;
      state.nfts = [...state.nfts, newNFT];
      state.totalCount = state.nfts.length;
      
      // Save to localStorage for persistence
      saveNFTsToLocalStorage(state.nfts);
      
      toast.success(`Successfully created NFT`, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(deleteNFT.fulfilled, (state, { payload }) => {
      // Remove the deleted NFT from Redux state
      // Note: The payload from deleteNFT includes the message, not the deleted NFT
      // We need to check if payload includes the NFT ID or we handle it differently
      if (payload?._id) {
        state.nfts = state.nfts.filter(nft => nft._id !== payload._id);
        state.totalCount = state.nfts.length;
        
        // Save to localStorage for persistence
        saveNFTsToLocalStorage(state.nfts);
      }
      toast.success(`Successfully deleted`, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(deleteNFT.rejected, ({ payload }) => {
      toast.error(payload.error, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(updateNFT.fulfilled, (state, { payload }) => {
      // Update the NFT in the Redux state
      const updatedNFT = payload.nft || payload;
      state.nfts = state.nfts.map(nft => 
        nft._id === updatedNFT._id ? updatedNFT : nft
      );
      state.totalCount = state.nfts.length;
      
      // Save to localStorage for persistence
      saveNFTsToLocalStorage(state.nfts);
      
      toast.success(`Successfully updated NFT`, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(updateNFT.rejected, ({ payload }) => {
      toast.error(payload.error, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(createNFT.rejected, ({ payload }) => {
      toast.error(payload.error, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(addToCampaign.fulfilled, (state, { payload }) => {
      toast.success(`Successfully added to campaign`, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(removeFromCampaign.fulfilled, (state, { payload }) => {
      toast.success(`Successfully removed from campaign`, {
        position: toast.POSITION.TOP_RIGHT
      });
    });
  }
});

export default NFTSlice.reducer;
