// src/components/ParentComponent.js
import React, { useState, useEffect } from 'react';
import StudentList from './StudentList';
import { getAppliedStudents } from './scholarshipService'; // Assuming you have a service for fetching data
import './ParentComponent.css'; // Import CSS file

const ParentComponent = () => {
  const [appliedStudents, setAppliedStudents] = useState([]);

  useEffect(() => {
    // Fetch applied students from the blockchain or any other data source
    const fetchAppliedStudents = async () => {
      const students = await getAppliedStudents();
      setAppliedStudents(students);
    };

    fetchAppliedStudents();
  }, []);

  return (
    <div className="parent-component"> {/* Apply parent-component class */}
      <h1>Student Management</h1>
      <StudentList appliedStudents={appliedStudents} />
    </div>
  );
};

export default ParentComponent;
