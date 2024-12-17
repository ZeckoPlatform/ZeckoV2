import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({
        items: [],
        total: 0
    });

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.items.find(item => item.productId === product._id);
            
            if (existingItem) {
                return {
                    ...prevCart,
                    items: prevCart.items.map(item =>
                        item.productId === product._id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                    total: prevCart.total + (product.price.sale || product.price.regular) * quantity
                };
            }

            return {
                ...prevCart,
                items: [...prevCart.items, {
                    productId: product._id,
                    name: product.name,
                    price: product.price.sale || product.price.regular,
                    image: product.images[0]?.url,
                    quantity
                }],
                total: prevCart.total + (product.price.sale || product.price.regular) * quantity
            };
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.filter(item => item.productId !== productId),
            total: prevCart.items.reduce((total, item) => 
                item.productId !== productId ? total : total - (item.price * item.quantity), prevCart.total)
        }));
    };

    const updateQuantity = (productId, quantity) => {
        setCart(prevCart => ({
            ...prevCart,
            items: prevCart.items.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ),
            total: prevCart.items.reduce((total, item) =>
                total + (item.productId === productId ? item.price * quantity : item.price * item.quantity), 0)
        }));
    };

    const clearCart = () => {
        setCart({
            items: [],
            total: 0
        });
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 