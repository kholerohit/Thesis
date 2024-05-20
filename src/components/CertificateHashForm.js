import React, { useState } from 'react';

function CertificateHashForm({ onSubmit }) {
  const [certificateHash, setCertificateHash] = useState('');
  const [certificateHash1, setCertificateHash1] = useState('');
  const [certificateHash2, setCertificateHash2] = useState('');
  const [certificateHash3, setCertificateHash3] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(certificateHash, certificateHash1,certificateHash2, certificateHash3);
  };

  return (
    <div className="CertificateHashForm">
      <h2>Fill Certificate Hashes</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Certificate Hash:</label>
          <input type="text" value={certificateHash} onChange={(e) => setCertificateHash(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Certificate Hash1:</label>
          <input type="text" value={certificateHash1} onChange={(e) => setCertificateHash1(e.target.value)} required />
        </div>
      <div className="form-group">
          <label>Certificate Hash2:</label>
          <input type="text" value={certificateHash2} onChange={(e) => setCertificateHash2(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Certificate Hash3:</label>
          <input type="text" value={certificateHash3} onChange={(e) => setCertificateHash3(e.target.value)} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CertificateHashForm;
