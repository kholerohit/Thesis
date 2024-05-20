import React from 'react';

function NotificationPage({ location }) {
    const { acceptedScholarships } = location.state;
    
    return (
        <div className="notification-container">
            <h1>Notification Page</h1>
            <h2>Accepted Scholarships</h2>
            <div>
                {acceptedScholarships.map((scholarship) => (
                    <div key={scholarship.Id} className="scholarship-details">
                        {/* Display scholarship details */}
                        Scholarship ID: {scholarship[0].toString()} <br />
                        Provider Address:{scholarship[1]} <br />
                        Company Name: {scholarship[2]} <br />
                        Scholarship Amount: {scholarship[3].toString()} <br />
                        Eligibility: {scholarship[4]} <br />
                        <hr className="divider" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NotificationPage;
