import React from 'react';
import { Card, CardProps } from '../common/Card';
import { EmptyState, EmptyStateProps } from '../common/EmptyState';

export interface DashboardWidgetProps extends CardProps {
  isEmpty?: boolean;
  emptyState?: Omit<EmptyStateProps, 'className'> & { className?: string };
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  isEmpty,
  emptyState,
  children,
  ...cardProps
}) => {
  return (
    <Card {...cardProps}>
      {isEmpty && emptyState ? (
        <EmptyState
          {...emptyState}
          className={`py-6 ${emptyState.className || ''}`}
        />
      ) : (
        children
      )}
    </Card>
  );
};
