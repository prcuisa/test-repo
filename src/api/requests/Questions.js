import Api from '../Api';
import questionsData from '../../config/questions.json';

export const listQuestions = async () => {
  // TEST MODE: Return questions from local JSON file with _id
  const testToken = localStorage.getItem('token');
  if (testToken && testToken.startsWith('test-jwt-token-mock-')) {
    const questionsWithId = questionsData.map((q, index) => ({
      ...q,
      _id: q._id || q.formName || `question-${index}`
    }));
    return { list: questionsWithId };
  }
  
  return await Api.http({
    method: 'get',
    url: '/questions',
  });
};

export const getQuestionById = async (data) => {
  // TEST MODE: Return question from local JSON file with _id
  const testToken = localStorage.getItem('token');
  if (testToken && testToken.startsWith('test-jwt-token-mock-')) {
    const questionsWithId = questionsData.map((q, index) => ({
      ...q,
      _id: q._id || q.formName || `question-${index}`
    }));
    const question = questionsWithId.find(q => q._id === data);
    if (question) {
      return { question };
    }
    return Promise.reject({ response: { data: { message: 'Question not found' } } });
  }
  
  return await Api.http({
    method: 'get',
    url: '/questions/'+data,
  });
};
