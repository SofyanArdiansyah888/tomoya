// Test script untuk memastikan API dapat diakses dari frontend
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/pengeluaran', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Test Success:', data);
    return data;
  } catch (error) {
    console.error('API Test Error:', error);
    throw error;
  }
};

// Export untuk digunakan di browser console
window.testAPI = testAPI;
