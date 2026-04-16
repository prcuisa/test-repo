import Api from '../Api';

export const listKeywords = async (data) =>
  await Api.http({
    method: 'get',
    url: '/keywords',
    query: data,
  });

export const getKeywordById = async (data) => {
  // TEST MODE: Return mock keyword data for test user
  const testToken = localStorage.getItem('token');
  if (testToken && testToken.startsWith('test-jwt-token-mock-')) {
    // Mock keywords map - in production, this would come from an API
    const mockKeywords = {
      'keyword-1': { word: 'Blockchain' },
      'keyword-2': { word: 'NFT' },
      'keyword-3': { word: 'Crypto' },
      'keyword-4': { word: 'Web3' },
    };
    
    const keyword = mockKeywords[data];
    if (keyword) {
      return { keyword };
    }
    return Promise.reject({ response: { data: { message: 'Keyword not found' } } });
  }
  
  return await Api.http({
    method: 'get',
    url: '/keywords/'+data,
  });
};
