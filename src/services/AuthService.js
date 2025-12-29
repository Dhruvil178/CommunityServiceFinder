// Simulating authentication
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          id: '1',
          name: 'John Smith',
          email,
          avatar: 'https://i.pravatar.cc/150?img=1',
          joinDate: '2024-01-15',
          eventsCompleted: 12,
          hoursServed: 48,
          certificates: 3,
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

export const registerUser = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...userData, id: '2' }), 1500);
  });
};
