
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComponentProps } from '@/types/common';

interface ComposableCardProps extends ComponentProps {
  title?: string;
  subtitle?: string;
  tags?: string[];
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

const ComposableCard: React.FC<ComposableCardProps> = ({
  title,
  subtitle,
  tags = [],
  actions,
  variant = 'default',
  size = 'md',
  loading = false,
  error,
  onRetry,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    default: 'border-gray-200',
    outlined: 'border-2 border-gray-300',
    elevated: 'shadow-lg border-0'
  };

  if (loading) {
    return (
      <Card className={`animate-pulse ${variantClasses[variant]} ${className}`} {...props}>
        <CardHeader className={sizeClasses[size]}>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent className={sizeClasses[size]}>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`} {...props}>
        <CardContent className={`${sizeClasses[size]} text-center`}>
          <div className="text-red-600 mb-2">Error loading content</div>
          <div className="text-sm text-red-500 mb-4">{error}</div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${variantClasses[variant]} ${className}`} {...props}>
      {(title || subtitle || tags.length > 0 || actions) && (
        <CardHeader className={sizeClasses[size]}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {actions && <div className="ml-4">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={sizeClasses[size]}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ComposableCard;
