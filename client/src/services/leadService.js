import api, { endpoints } from './api';

export const leadService = {
  // Get all leads with optional filters
  getLeads: async (filters = {}) => {
    try {
      const response = await api.get(endpoints.leads.list, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  // Get a single lead by ID
  getLead: async (id) => {
    try {
      const response = await api.get(endpoints.leads.get(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  },

  // Get leads for a specific user
  getUserLeads: async (userId) => {
    try {
      const response = await api.get(endpoints.leads.list, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user leads:', error);
      throw error;
    }
  },

  // Create a new lead
  createLead: async (leadData) => {
    try {
      const response = await api.post('/api/leads', leadData);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  // Update an existing lead
  updateLead: async (id, updateData) => {
    try {
      const response = await api.patch(`/api/leads/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  // Delete a lead
  deleteLead: async (id) => {
    try {
      const response = await api.delete(`/api/leads/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  // Submit a proposal for a lead
  submitProposal: async (leadId, proposalData) => {
    try {
      const response = await api.post(`/api/leads/${leadId}/proposals`, proposalData);
      return response.data;
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw error;
    }
  },

  // Get latest leads for carousel
  getLatestLeads: async (limit = 5) => {
    try {
      const response = await api.get(endpoints.leads.latest, {
        params: {
          limit,
          status: 'active',
          sort: '-createdAt'
        }
      });
      return Array.isArray(response.data) ? response.data : 
             response.data?.leads ? response.data.leads : [];
    } catch (error) {
      console.error('Error fetching latest leads:', error);
      throw error;
    }
  }
};

export default leadService; 