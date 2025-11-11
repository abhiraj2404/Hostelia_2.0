import React from "react";


function About({ loggedIn = false }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      

      <header className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">HOSTELIA</h1>
          <p className="mt-2">Revolutionizing Hostel Management with Innovation</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <section className="bg-white rounded shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p>
            At <strong className="text-blue-600">Hostelia</strong>, we simplify
            hostel management to improve communication, security, and
            administration for students, wardens, and admins.
          </p>
        </section>

        <section className="bg-white rounded shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">About The Project</h2>
          <p>
            A user-friendly hostel management app where students can report
            issues, pay fees, and access policies; wardens manage attendance
            and complaints; admins oversee room allocation and fee tracking.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Core Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li className="bg-white p-4 rounded shadow-sm">Secure Authentication (OTP / College Email)</li>
            <li className="bg-white p-4 rounded shadow-sm">Role-Based Dashboards</li>
            <li className="bg-white p-4 rounded shadow-sm">Problem Tracking with Upvotes</li>
            <li className="bg-white p-4 rounded shadow-sm">Email Integration (Gmail API)</li>
          </ul>
        </section>

        <section className="bg-white rounded shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Technology Stack</h2>
          <p>Node.js, Express, MongoDB, Socket.io, EJS, Tailwind CSS, Gmail API</p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Users & Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-medium">Hostel Office (Admin)</h3>
              <p className="text-sm mt-1">Oversee operations, room allocation, fee tracking</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-medium">Hostel Wardens</h3>
              <p className="text-sm mt-1">Manage complaints, announcements, mess updates</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-medium">Students</h3>
              <p className="text-sm mt-1">Report issues, upvote problems, pay fees</p>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

export default About;
