import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ApiAxios } from '../api/Api';

export const getInitialCounts = createAsyncThunk(
  'dashboard/counts',
  async ({}, { getState, rejectWithValue }) => {
    const { auth, nft, campaign } = getState();

    // If no user, return initial counts
    if (!auth.value.user?._id) {
      return {
        campaigns: { draft: 0, live: 0, whitelisted: 0, total: 0 },
        nfts: { draft: 0, live: 0, burned: 0, total: 0 },
        kyb: { total: 0 },
        users: { total: 0 },
        leads: { total: 0 },
        reports: { total: 0 }
      };
    }

    // TEST MODE: Calculate counts from Redux state for test user
    if (auth.value.user?._id === 'test-user-123') {
      // Calculate NFT counts from actual NFTs
      const allNFTs = Array.isArray(nft.nfts) ? nft.nfts : [];
      const nftDraft = allNFTs.filter(n => n.status !== 'live' && n.status !== 'ended').length;
      const nftLive = allNFTs.filter(n => n.status === 'live').length;
      const nftBurned = allNFTs.filter(n => n.status === 'ended').length;
      
      // Calculate campaign counts from actual campaigns
      const allCampaigns = Array.isArray(campaign.campaigns) ? campaign.campaigns : [];
      const campaignDraft = allCampaigns.filter(c => c.status !== 'live').length;
      const campaignLive = allCampaigns.filter(c => c.status === 'live').length;
      
      const result = {
        campaigns: {
          draft: campaignDraft,
          live: campaignLive,
          whitelisted: 0,
          total: allCampaigns.length
        },
        nfts: {
          draft: nftDraft,
          live: nftLive,
          burned: nftBurned,
          total: allNFTs.length
        },
        kyb: {
          total: 0
        },
        users: {
          total: 0
        },
        leads: {
          total: 0
        },
        reports: {
          total: 0
        }
      };
      
      return result;
    }

    try {
      const { data } = await ApiAxios.get(`/dashboard/counts`, {
        params: {
          user_id: auth.value.user?._id
        }
      });

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const initialState = {
  counts: {
    campaigns: {
      draft: 0,
      live: 0,
      whitelisted: 0,
      total: 0
    },
    nfts: {
      draft: 0,
      live: 0,
      burned: 0,
      total: 0
    }
  }
};

const DashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getInitialCounts.fulfilled, (state, { payload }) => {
      state.counts = payload;
    });
  }
});

export default DashboardSlice.reducer;