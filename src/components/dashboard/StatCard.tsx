import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { StatCardData } from '../../types';

export const StatCard: React.FC<StatCardData> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
}) => {
  const isPositive = change && change > 0;
  const colorClasses = {
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent>
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="h6" className="text-gray-600 font-medium">
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-800 mt-1">
              {value}
            </Typography>
            {change !== undefined && (
              <Box className="flex items-center mt-2">
                {isPositive ? (
                  <TrendingUp className="text-green-500 mr-1" fontSize="small" />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  className={`font-medium ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body2" className="text-gray-500 ml-1">
                  vs mese scorso
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            className={`${colorClasses[color]} text-white w-16 h-16`}
            sx={{ bgcolor: color }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};
