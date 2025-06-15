
export const getHealthColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'text-green-400 bg-green-400/20';
    case 'warning': return 'text-yellow-400 bg-yellow-400/20';
    case 'critical': return 'text-red-400 bg-red-400/20';
    default: return 'text-gray-400 bg-gray-400/20';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': return 'CheckCircle';
    case 'warning': return 'AlertTriangle';
    case 'critical': return 'XCircle';
    default: return 'Activity';
  }
};

export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return 'TrendingUp';
    case 'down': return 'TrendingDown';
    default: return 'Activity';
  }
};
