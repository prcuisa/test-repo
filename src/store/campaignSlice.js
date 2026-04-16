import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getInitialNft } from './nftSlice';
import { toast } from 'react-toastify';
import { getInitialCounts } from './dashboardSlice';
import { ApiAxios } from '../api/Api';

// Helper function to save campaigns to localStorage
const saveCampaignsToLocalStorage = (campaigns) => {
  try {
    localStorage.setItem('test-campaigns', JSON.stringify(campaigns));
  } catch (error) {
    console.error('Error saving campaigns to localStorage:', error);
  }
};

export const getInitialCampaigns = createAsyncThunk(
  'campaign/get',
  async ({}, { getState, rejectWithValue }) => {
    const { auth } = getState();
    
    // TEST MODE: Load campaigns from localStorage for test user
    if (auth.value.user?._id === 'test-user-123') {
      try {
        const savedCampaigns = localStorage.getItem('test-campaigns');
        if (savedCampaigns) {
          const parsedCampaigns = JSON.parse(savedCampaigns);
          return { campaigns: parsedCampaigns };
        }
        return { campaigns: [] };
      } catch (error) {
        console.error('Error loading campaigns from localStorage:', error);
        return { campaigns: [] };
      }
    }
    
    try {
      const { data } = await ApiAxios.get(`/campaigns`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateFreshCampaigns = createAsyncThunk(
  'campaign/updateFreshCampaigns',
  async (campaigns, { dispatch }) => {
    await dispatch(getInitialCounts({}));

    return campaigns;
  }
);

export const getSuperUserCampaigns = createAsyncThunk(
  'campaign/get/superuser',
  async ({}, { getState, rejectWithValue }) => {
    try {
      const { data } = await ApiAxios.get(`/campaigns/superuser`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateSuperuserCampaigns = createAsyncThunk(
  'campaign/updateSuperuserCampaigns',
  async (campaigns, { dispatch }) => {
    await dispatch(getInitialCounts({}));

    return campaigns;
  }
);

export const deleteCampaign = createAsyncThunk(
  'campaign/delete',
  async ({ campaign, type }, { getState, rejectWithValue, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock campaign deletion
    if (auth.value.user?._id === 'test-user-123') {
      return { type, data: { message: 'Campaign deleted successfully' } };
    }
    
    try {
      const { data } = await ApiAxios.delete(`/campaigns/${campaign._id}`);

      await dispatch(updateFreshCampaigns(data.campaigns));

      return {
        type,
        data
      };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaign/update',
  async ({ campaign, type, rejectMessage }, { getState, rejectWithValue, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock campaign update
    if (auth.value.user?._id === 'test-user-123') {
      // Convert File objects to data URLs to make them serializable
      let coverUrl = campaign.cover;
      let logoUrl = campaign.logo;
      
      if (campaign.cover instanceof File) {
        try {
          coverUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(campaign.cover);
          });
        } catch (error) {
          console.error('Error converting cover to data URL:', error);
          coverUrl = campaign.cover;
        }
      }
      
      if (campaign.logo instanceof File) {
        try {
          logoUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(campaign.logo);
          });
        } catch (error) {
          console.error('Error converting logo to data URL:', error);
          logoUrl = campaign.logo;
        }
      }
      
      let newStatus = campaign.status;
      
      // Handle different campaign types
      if (type === 'live') {
        newStatus = 'live';
      } else if (type === 'adminApproval') {
        newStatus = 'adminApproval';
      } else if (type === 'cancel') {
        newStatus = 'draft';
      }
      
      const mockCampaign = {
        ...campaign,
        cover: coverUrl,
        logo: logoUrl,
        updated_at: new Date().toISOString(),
        status: newStatus
      };
      
      // Update campaigns in localStorage to persist changes
      try {
        const savedCampaigns = localStorage.getItem('test-campaigns');
        const existingCampaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
        const updatedCampaigns = existingCampaigns.map(c => 
          c._id === campaign._id ? mockCampaign : c
        );
        dispatch(updateFreshCampaigns(updatedCampaigns));
      } catch (error) {
        console.error('Error updating campaigns in localStorage:', error);
      }
      
      return { campaign: mockCampaign };
    }
    
    try {
      if (type === 'draft') {
        const { data } = await ApiAxios.patch(
          `/campaigns/${campaign._id}`,
          {
            ...campaign
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        await dispatch(updateFreshCampaigns(data.campaigns));
        return data;
      }
      if (campaign.nft_id) {
        getInitialNft({});
      }
      if (type === 'adminApproval' && campaign.nft_id) {
        const { data } = await ApiAxios.patch(`/campaigns/${campaign._id}`, {
          ...campaign,
          status: 'adminApproval'
        });
        await dispatch(updateFreshCampaigns(data.campaigns));
        return data;
      }
      if (type === 'live' && campaign.nft_id) {
        const { data } = await ApiAxios.patch(`/campaigns/${campaign._id}`, {
          ...campaign,
          status: 'live',
          started_at: new Date()
        });
        await dispatch(updateFreshCampaigns(data.campaigns));
        return data;
      }
      if (type === 'cancel' && campaign.nft_id) {
        const { data } = await ApiAxios.patch(`/campaigns/${campaign._id}`, {
          ...campaign,
          status: 'draft',
          canceled_at: new Date()
        });
        await dispatch(updateFreshCampaigns(data.campaigns));
        return data;
      }
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaign/create',
  async ({ campaign }, { getState, dispatch }) => {
    const { auth } = getState();
    
    // TEST MODE: Mock campaign creation
    if (auth.value.user?._id === 'test-user-123') {
      // Convert File objects to data URLs to make them serializable
      let coverUrl = null;
      let logoUrl = null;
      
      if (campaign.cover instanceof File) {
        try {
          coverUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(campaign.cover);
          });
        } catch (error) {
          console.error('Error converting cover to data URL:', error);
          coverUrl = null;
        }
      } else if (typeof campaign.cover === 'string') {
        coverUrl = campaign.cover;
      }
      
      if (campaign.logo instanceof File) {
        try {
          logoUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(campaign.logo);
          });
        } catch (error) {
          console.error('Error converting logo to data URL:', error);
          logoUrl = null;
        }
      } else if (typeof campaign.logo === 'string') {
        logoUrl = campaign.logo;
      }
      
      const mockCampaign = {
        ...campaign,
        cover: coverUrl, // Replace File with serializable data URL
        logo: logoUrl, // Replace File with serializable data URL
        _id: 'test-campaign-' + Date.now(),
        status: campaign.status || 'draft',
        user_id: 'test-user-123',
        created_at: new Date().toISOString()
      };
      
      // Load existing campaigns from localStorage and add the new one
      try {
        const savedCampaigns = localStorage.getItem('test-campaigns');
        const existingCampaigns = savedCampaigns ? JSON.parse(savedCampaigns) : [];
        const updatedCampaigns = Array.isArray(existingCampaigns) 
          ? [...existingCampaigns, mockCampaign]
          : [mockCampaign];
        dispatch(updateFreshCampaigns(updatedCampaigns));
      } catch (error) {
        console.error('Error updating campaigns in localStorage:', error);
        dispatch(updateFreshCampaigns([mockCampaign]));
      }
      
      return { campaign: mockCampaign };
    }
    
    try {
      const { data } = await ApiAxios.post(`/campaigns`, campaign, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await dispatch(updateFreshCampaigns(data.campaigns));

      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const approveCampaign = createAsyncThunk(
  'campaign/approve',
  async ({ campaign }, { dispatch, getState }) => {
    try {
      const { data } = await ApiAxios.post(`/campaigns/${campaign._id}/approve`, {
        id: campaign._id
      });
      await dispatch(updateSuperuserCampaigns(data.superuserCampaigns));
      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

export const refuseCampaign = createAsyncThunk(
  'campaign/refuse',
  async ({ campaign, refusalMessage }, { dispatch, getState }) => {
    try {
      const { data } = await ApiAxios.post(`/campaigns/${campaign._id}/refuse`, {
        id: campaign._id,
        refusalMessage
      });
      await dispatch(updateSuperuserCampaigns(data.superuserCampaigns));
      return data;
    } catch (err) {
      console.log(err);
    }
  }
);

const campaignBuilder = (state, { payload }) => {
  const draftCampaigns = [];
  const adminApprovalCampaigns = [];
  const adminApprovedCampaigns = [];
  const adminRefusedCampaigns = [];
  const liveCampaigns = [];
  const finishedCampaigns = [];
  
  // Extract campaigns array from payload
  const campaigns = Array.isArray(payload) ? payload : (payload?.campaigns || []);
  
  campaigns.forEach((campaign) => {
    if (campaign.status === 'draft') draftCampaigns.push(campaign);
    if (campaign.status === 'adminApproval') adminApprovalCampaigns.push(campaign);
    if (campaign.status === 'adminApproved') adminApprovedCampaigns.push(campaign);
    if (campaign.status === 'ready') adminApprovedCampaigns.push(campaign);
    if (campaign.status === 'adminRefused') adminRefusedCampaigns.push(campaign);
    if (campaign.status === 'live') liveCampaigns.push(campaign);
    if (campaign.status === 'finished' || campaign.status === 'ended') finishedCampaigns.push(campaign);
  });
  
  state.draft = [
    ...adminApprovedCampaigns,
    ...adminRefusedCampaigns,
    ...adminApprovalCampaigns,
    ...draftCampaigns
  ];
  state.live = liveCampaigns;
  state.whitelisted = finishedCampaigns;
  state.totalCount = campaigns.length;
  
  // Save to localStorage for persistence
  saveCampaignsToLocalStorage(campaigns);
};

const CampaignSlice = createSlice({
  name: 'campaign',
  initialState: {
    draft: [],
    whitelisted: [],
    live: [],
    superUser: [],
    totalCount: 0
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getInitialCampaigns.fulfilled, campaignBuilder);
    builder.addCase(updateFreshCampaigns.fulfilled, campaignBuilder);
    builder.addCase(getSuperUserCampaigns.fulfilled, (state, { payload }) => {
      const campaigns = Array.isArray(payload) ? payload : (payload?.superuserCampaigns || []);
      state.superUser = campaigns;
      state.totalCount = campaigns.length;
    });
    builder.addCase(updateSuperuserCampaigns.fulfilled, (state, { payload }) => {
      const campaigns = Array.isArray(payload) ? payload : (payload?.superuserCampaigns || []);
      state.superUser = campaigns;
      state.totalCount = campaigns.length;
    });
    builder.addCase(deleteCampaign.fulfilled, (state, { payload }) => {
      toast.success('Successfully deleted campaign!', {
        position: toast.POSITION.TOP_RIGHT
      });
    });
    builder.addCase(updateCampaign.fulfilled, (state, { payload }) => {
      console.log(state, payload);

      toast.success('Successfully updated campaign!', {
        position: toast.POSITION.TOP_RIGHT
      });
    });
  }
});

export default CampaignSlice.reducer;
