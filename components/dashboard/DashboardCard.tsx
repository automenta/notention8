import React from 'react';
import { Card, CardProps } from '../common/Card';

// Wrapper for backward compatibility, but effectively re-implementing using generic Card
export const DashboardCard: React.FC<CardProps> = (props) => {
  return <Card {...props} />;
};
