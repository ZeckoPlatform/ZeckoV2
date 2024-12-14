// Import all page components
import Home from '../pages/Home';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserProfile from '../pages/UserProfile';
import Checkout from '../pages/Checkout';
import BusinessDirectory from '../pages/BusinessDirectory';
import JobBoard from '../pages/LeadBoard';
import Shop from '../pages/Shop';

// Log each component to verify it's a valid function
const components = {
  Home,
  ProductList,
  ProductDetails,
  Cart,
  Login,
  Register,
  UserProfile,
  Checkout,
  BusinessDirectory,
  JobBoard,
  Shop
};

Object.entries(components).forEach(([name, component]) => {
  console.log(`${name} is type:`, typeof component);
  if (typeof component !== 'function') {
    console.error(`Warning: ${name} is not a function component!`);
  }
});
