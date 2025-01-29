import React, { useState, useEffect } from 'react';

function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const conversationsData = await response.json();
        setConversations(conversationsData);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/messages/${selectedConversation._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const startNewConversation = async (recipientId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId })
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [...prev, newConversation]);
        setSelectedConversation(newConversation);
      } else {
        throw new Error('Failed to start new conversation');
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
      alert('Failed to start new conversation. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="messaging-container">
      <div className="conversations-list">
        <h3>Conversations</h3>
        {conversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation._id}
                onClick={() => setSelectedConversation(conversation)}
                className={selectedConversation?._id === conversation._id ? 'selected' : ''}
              >
                {conversation.participants.find(p => p._id !== localStorage.getItem('userId')).username}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedConversation && (
        <div className="messages-section">
          <h3>Messages with {selectedConversation.participants.find(p => p._id !== localStorage.getItem('userId')).username}</h3>
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message._id}
                className={`message ${message.sender === localStorage.getItem('userId') ? 'sent' : 'received'}`}
              >
                <p>{message.content}</p>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Messaging;
