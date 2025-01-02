import React, { useState, useEffect, createContext, useContext } from 'react';

const CategoryContext = createContext({
  categories: [],
  isLoading: true,
  error: null
});

function CategoryProvider({ children }) {
  const [state, setState] = useState({
    categories: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        
        if (isMounted) {
          setState(prev => ({
            ...prev,
            categories: Array.isArray(data) ? data : [],
            isLoading: false
          }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: err.message,
            isLoading: false
          }));
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  return (
    <CategoryContext.Provider value={state}>
      {children}
    </CategoryContext.Provider>
  );
}

function LeadPostFormContent() {
  const { categories, isLoading, error } = useContext(CategoryContext);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    subcategory: ''
  });

  const getSubcategories = () => {
    try {
      if (!selectedCategory) return [];
      const category = categories.find(cat => cat?.name === selectedCategory);
      return Array.isArray(category?.subcategories) ? category.subcategories : [];
    } catch {
      return [];
    }
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!categories.length) return <div>No categories available</div>;

  return (
    <div className="lead-post-form">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <select
            value={selectedCategory}
            onChange={(e) => {
              const newCategory = e.target.value;
              setSelectedCategory(newCategory);
              setFormData(prev => ({
                ...prev,
                category: newCategory,
                subcategory: ''
              }));
            }}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category._id || category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            value={formData.subcategory}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                subcategory: e.target.value
              }));
            }}
            disabled={!selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {getSubcategories().map(sub => (
              <option key={sub._id || sub.name} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
}

function LeadPostForm() {
  return (
    <CategoryProvider>
      <LeadPostFormContent />
    </CategoryProvider>
  );
}

export default LeadPostForm;
