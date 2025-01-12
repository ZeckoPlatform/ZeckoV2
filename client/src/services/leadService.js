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
      console.log('Fetching user leads for:', userId); // Debug log
      const response = await api.get(endpoints.leads.list, {
        params: { userId }
      });
      console.log('User leads response:', response); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching user leads:', error);
      throw error;
    }
  },

  // Create a new lead
  createLead: async (leadData) => {
    try {
      const response = await api.post(endpoints.leads.create, leadData);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  // Update an existing lead
  updateLead: async (id, updateData) => {
    try {
      const response = await api.patch(endpoints.leads.update(id), updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  // Delete a lead
  deleteLead: async (id) => {
    try {
      const response = await api.delete(endpoints.leads.delete(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  // Submit a proposal for a lead
  submitProposal: async (leadId, proposalData) => {
    try {
      const response = await api.post(`${endpoints.leads.get(leadId)}/proposals`, proposalData);
      return response.data;
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw error;
    }
  },

  // Get latest leads for carousel
  getLatestLeads: async (limit = 5) => {
    try {
      console.log('Fetching latest leads...'); // Debug log
      const response = await api.get(endpoints.leads.latest, {
        params: {
          limit,
          status: 'active',
          sort: '-createdAt'
        }
      });
      console.log('Latest leads response:', response); // Debug log
      return Array.isArray(response.data) ? response.data : 
             response.data?.leads ? response.data.leads : [];
    } catch (error) {
      console.error('Error fetching latest leads:', error);
      throw error;
    }
  }
};

export default leadService; 