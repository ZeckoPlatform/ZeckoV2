import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText 
} from '@mui/material';
import { jobCategories } from '../../data/leadCategories';

const CategorySelect = ({ 
  category, 
  subcategory, 
  onCategoryChange, 
  onSubcategoryChange,
  error,
  helperText
}) => {
  const categories = Object.entries(jobCategories);
  const subcategories = category ? jobCategories[category]?.subcategories || [] : [];

  return (
    <>
      <FormControl fullWidth error={error} sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          label="Category"
        >
          {categories.map(([id, cat]) => (
            <MenuItem key={id} value={id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {category && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={subcategory || ''}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            label="Subcategory"
          >
            {subcategories.map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
};

export default CategorySelect; 