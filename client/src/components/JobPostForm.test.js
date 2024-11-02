import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import JobPostForm from './JobPostForm';

// Mock fetch function
global.fetch = jest.fn();

describe('JobPostForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the form correctly', () => {
    render(<JobPostForm onJobPosted={() => {}} />);
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Job Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Post Job' })).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    const mockOnJobPosted = jest.fn();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', title: 'Test Job' }),
    });

    render(<JobPostForm onJobPosted={mockOnJobPosted} />);

    userEvent.type(screen.getByLabelText('Job Title'), 'Test Job');
    userEvent.type(screen.getByLabelText('Job Description'), 'This is a test job');
    userEvent.type(screen.getByLabelText('Budget'), '100');

    userEvent.click(screen.getByRole('button', { name: 'Post Job' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/jobs', expect.any(Object));
      expect(mockOnJobPosted).toHaveBeenCalledWith({ id: '1', title: 'Test Job' });
    });
  });

  it('displays an error message when job posting fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to post job'));

    render(<JobPostForm onJobPosted={() => {}} />);

    userEvent.type(screen.getByLabelText('Job Title'), 'Test Job');
    userEvent.type(screen.getByLabelText('Job Description'), 'This is a test job');
    userEvent.type(screen.getByLabelText('Budget'), '100');

    userEvent.click(screen.getByRole('button', { name: 'Post Job' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to post job')).toBeInTheDocument();
    });
  });
});
