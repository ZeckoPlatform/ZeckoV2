import React, { useState, useEffect, createContext, useContext } from 'react';

const CategoryContext = createContext({
  categories: [],
  isLoading: true,
  error: null
});

function CategoryProvider({ children }) {
  const [state, setState] = useState(() => ({
    categories: [],
    isLoading: true,
    error: null
  }));

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        console.log('Fetched categories:', data);
        
        if (isMounted) {
          const safeData = Array.isArray(data) ? data : [];
          setState({
            categories: safeData,
            isLoading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (isMounted) {
          setState({
            categories: [],
            isLoading: false,
            error: err.message
          });
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const value = {
    ...state,
    categories: state.categories || []
  };

  return (
    <CategoryContext.Provider value={value}>
      {state.isLoading ? (
        <div>Loading categories...</div>
      ) : state.error ? (
        <div>Error loading categories: {state.error}</div>
      ) : (
        children
      )}
    </CategoryContext.Provider>
  );
}

function LeadPostFormContent() {
  const context = useContext(CategoryContext);
  
  if (!context) {
    console.error('LeadPostFormContent must be used within a CategoryProvider');
    return <div>Error: Category context not available</div>;
  }

  const { categories = [] } = context;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    subcategory: ''
  });

  const safeCategories = Array.isArray(categories) ? categories : [];

  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = safeCategories.find(cat => cat?.name === selectedCategory);
    return Array.isArray(category?.subcategories) ? category.subcategories : [];
  };

  if (context.isLoading) {
    return <div>Loading categories...</div>;
  }

  if (context.error) {
    return <div>Error loading categories: {context.error}</div>;
  }

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
            {safeCategories.map(category => (
              <option 
                key={category?._id || category?.name || 'default'} 
                value={category?.name || ''}
              >
                {category?.name || 'Unnamed Category'}
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
              <option 
                key={sub?._id || sub?.name || 'default'} 
                value={sub?.name || ''}
              >
                {sub?.name || 'Unnamed Subcategory'}
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
