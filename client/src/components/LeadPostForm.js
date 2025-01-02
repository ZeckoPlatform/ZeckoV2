import React, { useState, useEffect } from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

function LeadPostFormContent() {
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

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        
        if (isMounted) {
          if (!Array.isArray(data)) {
            console.error('Invalid categories data:', data);
            setCategories([]);
          } else {
            setCategories(data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (isMounted) {
          setError(err.message);
          setCategories([]);
          setIsLoading(false);
        }
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  const getSubcategories = () => {
    try {
      if (!selectedCategory || !Array.isArray(categories)) return [];
      const category = categories.find(cat => cat?.name === selectedCategory);
      return Array.isArray(category?.subcategories) ? category.subcategories : [];
    } catch (err) {
      console.error('Error getting subcategories:', err);
      return [];
    }
  };

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!Array.isArray(categories)) return <div>No categories available</div>;

  return (
    <div className="lead-post-form">
      <form onSubmit={(e) => {
        e.preventDefault();
      }}>
        <div className="form-group">
          <select
            value={selectedCategory}
            onChange={(e) => {
              try {
                const newCategory = e.target.value;
                setSelectedCategory(newCategory);
                setFormData(prev => ({
                  ...prev,
                  category: newCategory,
                  subcategory: ''
                }));
              } catch (err) {
                console.error('Error handling category change:', err);
              }
            }}
          >
            <option value="">Select Category</option>
            {categories.map(category => 
              category?.name ? (
                <option key={category._id || category.name} value={category.name}>
                  {category.name}
                </option>
              ) : null
            )}
          </select>
        </div>

        <div className="form-group">
          <select
            value={formData.subcategory}
            onChange={(e) => {
              try {
                setFormData(prev => ({
                  ...prev,
                  subcategory: e.target.value
                }));
              } catch (err) {
                console.error('Error handling subcategory change:', err);
              }
            }}
            disabled={!selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {getSubcategories().map(sub => 
              sub?.name ? (
                <option key={sub._id || sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ) : null
            )}
          </select>
        </div>
      </form>
    </div>
  );
}

function LeadPostForm() {
  return (
    <ErrorBoundary>
      <LeadPostFormContent />
    </ErrorBoundary>
  );
}

export default LeadPostForm;
