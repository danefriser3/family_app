import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { DataTableProps } from '../../types';

export const DataTable: React.FC<DataTableProps> = ({ title, data, columns }) => {
  return (
    <Card className="h-full">
      <CardHeader
        title={
          <Typography variant="h6" className="font-semibold text-gray-800">
            {title}
          </Typography>
        }
        action={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent className="pt-0">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} className="font-semibold text-gray-700">
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => {
                const rowKey = row.id ?? columns.map((col) => row[col.id]).join('-') ?? index;
                return (
                  <TableRow
                    key={rowKey}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.format ? column.format(row[column.id]) : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
