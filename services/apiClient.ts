// services/apiClient.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
// API URLs for different environments:
// - Web Browser: http://localhost:7135
// - Android Emulator: http://10.0.2.2:7135
// - iOS Simulator: http://127.0.0.1:7135
// - Physical Device: http://YOUR_LOCAL_IP:7135 (e.g., http://192.168.1.100:7135)
//const API_URL = 'https://192.168.0.182:7135';
const API_URL = 'https://vibequeue-api-service.azurewebsites.net';

//let authToken =
/*'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyIjoie1wiSWRcIjoyLFwiVXNlcm5hbWVcIjpcInVzZXIxXCIsXCJQYXNzd29yZEhhc2hcIjpcIk90Rk1BbC9qaDdVTmdZWDhzcEVOMjgzNk5Hc1dZdkx5XCIsXCJTYWx0XCI6XCJ2eUpuancycEU1QTBIUT09XCIsXCJDb2RlXCI6XCIjVFRQNzNcIixcIkNyZWF0aW9uVGltZVwiOlwiMjAyNS0wNS0wM1QxMTo0MzoyMC44MzYzOTA5XCIsXCJFdmVudHNcIjpudWxsfSIsImV4cCI6MTc0NjMwMTQyNn0.0sDFqpwfLQjNAEbfXff1tT9ri8lHM9Kj-0BB10dcCuU';*/

/*export const setAuthToken = (token: string) => {
  authToken = token;
};*/

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const fullUrl = `${API_URL}${endpoint}`;
  const authToken = await AsyncStorage.getItem('AccessToken');

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    Authorization: `Bearer ${authToken}`,
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  console.log('➡️ API Request:', {
    url: fullUrl,
    method: options.method || 'GET',
    headers,
    body: isFormData
      ? '[FormData]'
      : options.body
      ? JSON.parse(options.body.toString())
      : undefined,
  });

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const text = await response.text();
  console.log('Response text:', text);

  if (!response.ok) {
    let errorMessage = 'API Error';
    try {
      if (text) {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || text;
      }
    } catch {
      errorMessage = text || 'Unknown error occurred';
    }
    throw new Error(errorMessage);
  }

  return text ? JSON.parse(text) : {};
};
