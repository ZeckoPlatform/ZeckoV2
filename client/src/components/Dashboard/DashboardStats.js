import React from 'react';
import { StatCard, StatsGrid } from '../../styles/dashboard';
import { Typography } from '@mui/material';

const DashboardStats = ({ stats }) => {
  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="stat-icon">{stat.icon}</div>
          <Typography variant="subtitle2" color="textSecondary">
            {stat.label}
          </Typography>
          <Typography variant="h4">
            {stat.value}
            {stat.change && (
              <Typography
                component="span"
                variant="caption"
                color={stat.change > 0 ? "success" : "error"}
                sx={{ ml: 1 }}
              >
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </Typography>
            )}
          </Typography>
        </StatCard>
      ))}
    </StatsGrid>
  );
};

export default DashboardStats; 