import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getLeadConversation, sendLeadMessage } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const LeadConversation = () => {
  const { leadId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getLeadConversation(leadId);
        setMessages(data);
      } catch (err) {
        setError('Error loading messages');
        console.error('Load messages error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // Set up socket listener using existing socket connection
    const socket = window.socket;
    
    if (socket) {
      socket.on('new_message', (data) => {
        if (data.message.leadId === leadId) {
          setMessages(prev => [...prev, data.message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [leadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendLeadMessage(leadId, {
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (err) {
      setError('Error sending message');
      console.error('Send message error:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="conversation-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender._id === user._id ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{message.content}</p>
              <small className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="form-control"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default LeadConversation; 