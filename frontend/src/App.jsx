import { useState } from "react";

function App() {
  // =========================
  // REGISTER
  // =========================
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });

  // =========================
  // LOGIN
  // =========================
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // =========================
  // JOB
  // =========================
  const [jobForm, setJobForm] = useState({
    client_id: 1,
    title: "",
    description: "",
    budget: "",
  });

  const [jobs, setJobs] = useState([]);

  // =========================
  // PROPOSAL
  // =========================
  const [proposalForm, setProposalForm] = useState({
    freelancer_id: 2,
    job_id: "",
    cover_letter: "",
    proposed_budget: "",
  });

  const [proposals, setProposals] = useState([]);

  const [message, setMessage] = useState("");

  // =========================
  // REGISTER HANDLERS
  // =========================
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");

        setRegisterForm({
          full_name: "",
          email: "",
          password: "",
          role: "client",
        });
      } else {
        setMessage(data.detail || "Registration failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  // =========================
  // LOGIN HANDLERS
  // =========================
  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);

        setMessage("Login successful! JWT token generated.");
      } else {
        setMessage(data.detail || "Login failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  // =========================
  // JOB HANDLERS
  // =========================
  const handleJobChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jobForm,
          budget: Number(jobForm.budget),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Job created successfully!");

        setJobForm({
          client_id: 1,
          title: "",
          description: "",
          budget: "",
        });

        fetchJobs();
      } else {
        setMessage(data.detail || "Job creation failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/jobs/");

      const data = await response.json();

      if (response.ok) {
        setJobs(data);
        setMessage("Jobs loaded successfully!");
      } else {
        setMessage("Failed to load jobs");
      }
    } catch (error) {
      setMessage("Failed to load jobs");
    }
  };

  // =========================
  // PROPOSAL HANDLERS
  // =========================
  const handleProposalChange = (e) => {
    setProposalForm({
      ...proposalForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/proposals/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancer_id: Number(proposalForm.freelancer_id),
          job_id: Number(proposalForm.job_id),
          cover_letter: proposalForm.cover_letter,
          proposed_budget: Number(proposalForm.proposed_budget),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Proposal submitted successfully!");

        setProposalForm({
          freelancer_id: 2,
          job_id: "",
          cover_letter: "",
          proposed_budget: "",
        });

        fetchProposals();
      } else {
        setMessage(data.detail || "Proposal submission failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/proposals/");

      const data = await response.json();

      if (response.ok) {
        setProposals(data);
        setMessage("Proposals loaded successfully!");
      } else {
        setMessage("Failed to load proposals");
      }
    } catch (error) {
      setMessage("Failed to load proposals");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h1>TrustHire AI</h1>

      {/* =========================
          REGISTER
      ========================= */}
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={registerForm.full_name}
          onChange={handleRegisterChange}
          required
        />

        <br />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={handleRegisterChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={registerForm.password}
          onChange={handleRegisterChange}
          required
        />

        <br />
        <br />

        <select
          name="role"
          value={registerForm.role}
          onChange={handleRegisterChange}
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <br />
        <br />

        <button type="submit">Register</button>
      </form>

      <hr />

      {/* =========================
          LOGIN
      ========================= */}
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginForm.email}
          onChange={handleLoginChange}
          required
        />

        <br />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={handleLoginChange}
          required
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      <hr />

      {/* =========================
          JOB MANAGEMENT
      ========================= */}
      <h2>Job Management</h2>

      <h3>Post a Job</h3>

      <form onSubmit={handleCreateJob}>
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={jobForm.title}
          onChange={handleJobChange}
          required
        />

        <br />
        <br />

        <textarea
          name="description"
          placeholder="Job Description"
          value={jobForm.description}
          onChange={handleJobChange}
          required
        />

        <br />
        <br />

        <input
          type="number"
          name="budget"
          placeholder="Budget"
          value={jobForm.budget}
          onChange={handleJobChange}
          required
        />

        <br />
        <br />

        <button type="submit">Post Job</button>
      </form>

      <br />

      <button onClick={fetchJobs}>View Jobs</button>

      <h3>Available Jobs</h3>

      {jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id}>
            <h4>{job.title}</h4>
            <p>{job.description}</p>
            <p>Budget: ₹{job.budget}</p>
            <p>Status: {job.status}</p>
            <hr />
          </div>
        ))
      )}

      <hr />

      {/* =========================
          PROPOSAL MANAGEMENT
      ========================= */}
      <h2>Proposal Management</h2>

      <h3>Submit a Proposal</h3>

      <form onSubmit={handleCreateProposal}>
        <input
          type="number"
          name="freelancer_id"
          placeholder="Freelancer ID"
          value={proposalForm.freelancer_id}
          onChange={handleProposalChange}
          required
        />

        <br />
        <br />

        <input
          type="number"
          name="job_id"
          placeholder="Job ID"
          value={proposalForm.job_id}
          onChange={handleProposalChange}
          required
        />

        <br />
        <br />

        <textarea
          name="cover_letter"
          placeholder="Cover Letter"
          value={proposalForm.cover_letter}
          onChange={handleProposalChange}
          required
        />

        <br />
        <br />

        <input
          type="number"
          name="proposed_budget"
          placeholder="Proposed Budget"
          value={proposalForm.proposed_budget}
          onChange={handleProposalChange}
          required
        />

        <br />
        <br />

        <button type="submit">Submit Proposal</button>
      </form>

      <br />

      <button onClick={fetchProposals}>View Proposals</button>

      <h3>Proposals</h3>

      {proposals.length === 0 ? (
        <p>No proposals available.</p>
      ) : (
        proposals.map((proposal) => (
          <div key={proposal.id}>
            <p>
              <strong>Job ID:</strong> {proposal.job_id}
            </p>

            <p>
              <strong>Freelancer ID:</strong> {proposal.freelancer_id}
            </p>

            <p>
              <strong>Cover Letter:</strong> {proposal.cover_letter}
            </p>

            <p>
              <strong>Proposed Budget:</strong> ₹
              {proposal.proposed_budget}
            </p>

            <p>
              <strong>Status:</strong> {proposal.status}
            </p>

            <hr />
          </div>
        ))
      )}

      {/* =========================
          MESSAGE
      ========================= */}
      <p>{message}</p>
    </div>
  );
}

export default App;