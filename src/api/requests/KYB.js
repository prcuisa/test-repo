import Api from "../Api";

/**
 * Only admin users can access this endpoint
 * @returns array of users
 */
export const getAllKYB = async () =>
  await Api.http({
    method: 'get',
    url: '/kyb/all',
  });

export const getUserKYB = async () => {
  // TEST MODE: Return mock KYB data for test user
  const testToken = localStorage.getItem('token');
  if (testToken && testToken.startsWith('test-jwt-token-mock-')) {
    return {
      kyb: {
        _id: 'test-kyb-123',
        state: 'rejected', // Set to 'rejected' to show the form, or 'new'/'approved' to hide it
        company_name: 'Test Company',
        company_location: 'United States',
        industry: 'technology',
        registration_number: 'TEST-123456',
        tax_id: 'TAX-123456',
        established_date: '2020-01-01',
        company_website: 'https://test.com'
      }
    };
  }

  return await Api.http({
    method: 'get',
    url: '/kyb',
  });
};

export const storeKYB = async (data) =>
  await Api.http({
    method: 'post',
    url: '/kyb',
    body: data
  });

export const kybApproval = async (id, data) =>
  await Api.http({
    method: 'post',
    url: `/kyb/approval/${id}`,
    body: data
  });