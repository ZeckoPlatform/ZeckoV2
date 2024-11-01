import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import JobListing from './JobListing';

// Mock fetch function
global.fetch = jest.fn();

describe('JobListing', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    render(<JobListing />);
    expect(screen.getByLabelText('Loading jobs')).toBeInTheDocument();
  });

  it('renders jobs when fetch is successful', async () => {
    const mockJobs = [
      { _id: '1', title: 'Job 1', description: 'Description 1', budget: 100, createdAt: new Date().toISOString() },
      { _id: '2', title: 'Job 2', description: 'Description 2', budget: 200, createdAt: new Date().toISOString() },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    render(<JobListing />);

    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText('Job 2')).toBeInTheDocument();
    });
  });

  it('renders error message when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<JobListing />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('calls handleJobDetails when View Details button is clicked', async () => {
    const mockJobs = [
      { _id: '1', title: 'Job 1', description: 'Description 1', budget: 100, createdAt: new Date().toISOString() },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockJobs,
    });

    const consoleSpy = jest.spyOn(console, 'log');

    render(<JobListing />);

    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
    });

    userEvent.click(screen.getByText('View Details'));

    expect(consoleSpy).toHaveBeenCalledWith('View details for job 1');

    consoleSpy.mockRestore();
  });
});
