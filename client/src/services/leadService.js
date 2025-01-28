import api, { endpoints } from './api';

const RETRY_ATTEMPTS = 3;
const TIMEOUT = 30000; // Increased to 30 seconds for large payloads

// Add chunk size constant for pagination
const CHUNK_SIZE = 100;

const withRetry = async (operation, attempts = RETRY_ATTEMPTS) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === attempts - 1) throw error;
      if (error.response?.status === 429 || error.code === 'ECONNABORTED') {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};

export const leadService = {
  // Get all leads with optional filters
  getLeads: async (filters = {}) => {
    return withRetry(() => api.get(endpoints.leads.list, {
      params: filters,
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Get a single lead by ID
  getLead: async (id) => {
    return withRetry(() => api.get(endpoints.leads.get(id), {
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Get leads for a specific user
  getUserLeads: async (userId) => {
    return withRetry(() => api.get(endpoints.leads.list, {
      params: { userId },
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Create a new lead
  createLead: async (leadData) => {
    return withRetry(() => api.post(endpoints.leads.create, leadData, {
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Update an existing lead
  updateLead: async (id, updateData) => {
    return withRetry(() => api.patch(endpoints.leads.update(id), updateData, {
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Delete a lead
  deleteLead: async (id) => {
    return withRetry(() => api.delete(endpoints.leads.delete(id), {
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Submit a proposal for a lead
  submitProposal: async (leadId, proposalData) => {
    return withRetry(() => api.post(`${endpoints.leads.get(leadId)}/proposals`, proposalData, {
      timeout: TIMEOUT
    })).then(response => response.data);
  },

  // Get latest leads for carousel
  getLatestLeads: async (limit = 5) => {
    return withRetry(() => api.get(endpoints.leads.latest, {
      params: {
        limit,
        status: 'active',
        sort: '-createdAt'
      },
      timeout: TIMEOUT
    })).then(response => {
      const data = response.data;
      return Array.isArray(data) ? data : data?.leads ? data.leads : [];
    });
  },

  // Add pagination support for large datasets
  getAllLeadsWithPagination: async (filters = {}) => {
    let allLeads = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await withRetry(() => api.get(endpoints.leads.list, {
        params: {
          ...filters,
          page,
          limit: CHUNK_SIZE
        },
        timeout: TIMEOUT
      }));

      const { leads, totalPages } = response.data;
      allLeads = [...allLeads, ...leads];
      
      hasMore = page < totalPages;
      page++;
    }

    return allLeads;
  },

  // Update file upload method to handle large files
  uploadLeadAttachments: async (leadId, files) => {
    const formData = new FormData();
    
    // Add each file to form data
    for (const file of files) {
      // Check file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
      }
      formData.append('files', file);
    }

    return withRetry(() => api.post(
      endpoints.leads.attachments(leadId), 
      formData,
      {
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can emit this progress to your UI
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      }
    ));
  },

  // Add method for streaming large data downloads
  downloadLeadReport: async (filters = {}) => {
    return withRetry(() => api.get(endpoints.leads.report, {
      params: filters,
      responseType: 'blob',
      timeout: TIMEOUT
    })).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  }
};

export default leadService; 