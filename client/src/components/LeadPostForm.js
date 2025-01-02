import React, { useState, useEffect } from 'react';

function LeadPostForm() {
  // Initialize all state with safe defaults
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    subcategory: ''
  });

  // Wrap the fetch in a try-catch
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Safely get subcategories
  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.name === selectedCategory);
    return category?.subcategories || [];
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories: {error}</div>;

  return (
    <div className="lead-post-form">
      <form onSubmit={(e) => {
        e.preventDefault();
        // Add your submit logic here
      }}>
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
            {Array.isArray(categories) && categories.map(category => (
              <option key={category._id || category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <select
            value={formData.subcategory}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              subcategory: e.target.value
            }))}
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

        {/* Rest of your form fields */}
      </form>
    </div>
  );
}

export default LeadPostForm;
