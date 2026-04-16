import Api from '../Api';

export const getAuthUser = async () => {
  if (!localStorage.getItem('token')) {
    return;
  }

  // TEST MODE: If using test token, return mock user
  const testToken = localStorage.getItem('token');
  if (testToken && testToken.startsWith('test-jwt-token-mock-')) {
    return {
      user: {
        _id: 'test-user-123',
        email: 'mtngtest@chain.biz',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        company: 'Test Company',
        job_title: 'CEO',
        phone: '+1234567890',
        company_location: 'United States',
        company_website: 'https://test.com',
        confirmed: true,
        wallet: null,
        is_superadmin: false,
        kyb_passed: false, // Set to false to show KYB warning banner
        keyword_ids: [], // Empty keywords array to avoid errors
      }
    };
  }

  return await Api.http({
    method: 'get',
    url: '/profile',
  });
};

export const validateUserCompany = async (data) =>
  await Api.http({
    method: 'post',
    url: '/validate-user-company',
    body: data,
  });

export const registerUser = async (data) =>
  await Api.http({
    method: 'post',
    url: '/register',
    body: data,
  }).then((res) => {
    return res;
  });

export const registerWallet = async (data) =>
  await Api.http({
    method: 'post',
    url: '/register-user',
    body: data,
  }).then((res) => {
    localStorage.setItem('token', res.token);

    return res;
  });

export const updateWallet = async (data) =>
  await Api.http({
    method: 'post',
    url: '/update-user',
    body: data,
  });

export const registerNewCampaignUser = async (data) =>
  await Api.http({
    method: 'post',
    url: '/leads',
    body: data,
  });

/**
 * @param {Object.<string, *>} data
 * @returns
 */
export const loginAuthUser = async (data) => {
  // TEST MODE: Hardcoded test credentials for local development
  const TEST_EMAIL = 'mtngtest@chain.biz';
  const TEST_PASSWORD = 'testpassword';
  
  // Check if this is the test account
  if (data.email === TEST_EMAIL && data.password === TEST_PASSWORD) {
    const mockResponse = {
      user: {
        _id: 'test-user-123',
        email: TEST_EMAIL,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        company: 'Test Company',
        job_title: 'CEO',
        phone: '+1234567890',
        company_location: 'United States',
        company_website: 'https://test.com',
        confirmed: true,
        wallet: null,
        is_superadmin: false,
        kyb_passed: false, // Set to false to show KYB warning banner
        keyword_ids: [], // Empty keywords array to avoid errors
      },
      token: 'test-jwt-token-mock-' + Date.now(),
    };
    localStorage.setItem('token', mockResponse.token);
    return mockResponse;
  }
  
  // Otherwise, proceed with normal API call
  return await Api.http({
    method: 'post',
    url: '/login',
    body: data,
  }).then((res) => {
    localStorage.setItem('token', res.token);
    return res;
  });
};

/**
 * @param {Object.<string, *>} data
 * @returns
 */
export const loginLeadAndAssignCampaign = async (data) =>
  await Api.http({
    method: 'post',
    url: '/login-lead-and-assign-campaign',
    body: data,
  }).then((res) => {
    localStorage.setItem('token', res.token);

    return res;
  });

export const updatePassword = async (data) =>
  await Api.http({
    method: 'post',
    url: '/update-password',
    body: data,
  });

/**
 * @param {Object} data
 * @param {String} data.email
 * @returns
 */
export const userForgotPassword = async (data) =>
  await Api.http({
    method: 'post',
    url: '/forgot-password',
    body: data,
  });

export const userResetPassword = async (data) =>
  await Api.http({
    method: 'post',
    url: '/reset-password',
    body: data,
  });

export const userSendOtpRequest = async (data) =>
  await Api.http({
    method: 'post',
    url: '/check-otp',
    body: data,
  });
