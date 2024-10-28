
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-US', options as any);
}

export const isUUID = (inputString: string) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(inputString);
}


export const isCuid = (str: string): boolean => {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(str);
}

// Function to generate a random code
export const generateRandomCode = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
};


const colors = [
  "#FF6384", // Pink
  "#36A2EB", // Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  "#FF9F40", // Orange
  "#FF5733", // Coral
  "#C70039", // Crimson
  "#900C3F", // Dark Red
  "#581845", // Dark Purple
];

// Helper function to get a random color from the colors array
export const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
