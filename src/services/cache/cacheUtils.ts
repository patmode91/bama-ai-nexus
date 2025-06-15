
export const compressData = async <T>(data: T): Promise<string> => {
  // Simple compression simulation (in real app, use actual compression)
  return JSON.stringify(data);
};

export const decompressData = async <T>(compressedData: string): Promise<T> => {
  // Simple decompression simulation
  return JSON.parse(compressedData);
};

export const estimateMemoryUsage = (cache: Map<string, any>): number => {
  let memoryUsage = 0;
  for (const item of cache.values()) {
    memoryUsage += JSON.stringify(item).length;
  }
  return memoryUsage / 1024 / 1024; // Convert to MB
};
