// src/services/CertificateService.js
export const generateCertificate = async (eventData, userData) => {
  const certificateData = {
    id: generateUniqueId(),
    title: `${eventData.category} Volunteer`,
    description: `Completed ${eventData.title}`,
    dateEarned: new Date().toISOString(),
    issuer: eventData.organizer,
    hoursCompleted: parseInt(eventData.duration),
    verificationCode: generateVerificationCode(),
    userInfo: {
      name: userData.name,
      email: userData.email,
    },
  };
  
  return certificateData;
};
