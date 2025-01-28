import React from 'react';

const JobList = ({ jobs, onApply }) => {
  return (
    <ul>
      {jobs.map((job) => (
        <li key={job._id}>
          <h4>{job.title}</h4>
          <p>{job.description}</p>
          <p>Budget: ${job.budget}</p>
          <p>Posted by: {job.postedBy.username}</p>
          <button onClick={() => onApply(job._id)}>Apply</button>
        </li>
      ))}
    </ul>
  );
};

export default JobList; 