
export const compressData = async <T>(data: T): Promise<string> => {
  // Simple base64 compression simulation
  // In a real implementation, you might use actual compression algorithms
  return btoa(JSON.stringify(data));
};

export const decompressData = async <T>(compressedData: string): Promise<T> => {
  try {
    return JSON.parse(atob(compressedData));
  } catch (error) {
    console.error('Failed to decompress data:', error);
    throw error;
  }
};

export const estimateMemoryUsage = (cache: Map<string, any>): number => {
  let totalSize = 0;
  
  for (const entry of cache.values()) {
    totalSize += new Blob([JSON.stringify(entry)]).size;
  }
  
  return totalSize / 1024 / 1024; // Convert to MB
};

export const shouldCompress = (data: any, threshold: number = 1024): boolean => {
  const size = new Blob([JSON.stringify(data)]).size;
  return size > threshold;
};
