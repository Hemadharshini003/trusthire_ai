import { useState } from "react";

function App() {
  // =====================================================
  // USER / NAVIGATION
  // =====================================================

  const [activeSection, setActiveSection] = useState(
    localStorage.getItem("role") ? "dashboard" : "register"
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || ""
  );

  const [userId, setUserId] = useState(
    localStorage.getItem("user_id") || ""
  );

  const [message, setMessage] = useState("");

  // =====================================================
  // REGISTER
  // =====================================================

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });

  // =====================================================
  // LOGIN
  // =====================================================

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // =====================================================
  // JOB
  // =====================================================

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    budget: "",
  });

  const [jobs, setJobs] = useState([]);

  // Job filters
  const [searchTerm, setSearchTerm] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // =====================================================
  // PROPOSAL
  // =====================================================

  const [proposalForm, setProposalForm] = useState({
    freelancer_id: "",
    job_id: "",
    cover_letter: "",
    proposed_budget: "",
  });

  const [proposals, setProposals] = useState([]);

  // =====================================================
  // HELPER - JWT HEADERS
  // =====================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");

        setLoginForm({
          email: registerForm.email,
          password: "",
        });

        setRegisterForm({
          full_name: "",
          email: "",
          password: "",
          role: "client",
        });

        setActiveSection("login");
      } else {
        setMessage(
          `Registration failed: ${
            data.detail || "Unknown error"
          }`
        );
      }
    } catch (error) {
      setMessage("Backend connection failed.");
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "token",
          data.access_token
        );

        localStorage.setItem(
          "role",
          data.role
        );

        localStorage.setItem(
          "user_id",
          data.user_id
        );

        setUserRole(data.role);
        setUserId(data.user_id);

        setMessage(
          `Login successful! Welcome ${data.role}.`
        );

        setActiveSection("dashboard");

        setLoginForm({
          email: "",
          password: "",
        });
      } else {
        setMessage(
          data.detail || "Login failed"
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    setUserRole("");
    setUserId("");

    setJobs([]);
    setProposals([]);

    setMessage("Logged out successfully.");

    setActiveSection("login");
  };

  // =====================================================
  // JOB FORM
  // =====================================================

  const handleJobChange = (e) => {
    const { name, value } = e.target;

    setJobForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE JOB - JWT PROTECTED
  // =====================================================

  const handleCreateJob = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/jobs/",
        {
          method: "POST",
          headers: getAuthHeaders(),

          // IMPORTANT:
          // client_id is NOT sent anymore.
          // Backend gets it from JWT.
          body: JSON.stringify({
            title: jobForm.title,
            description: jobForm.description,
            budget: Number(jobForm.budget),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Job created successfully!"
        );

        setJobForm({
          title: "",
          description: "",
          budget: "",
        });

        fetchJobs();
      } else {
        setMessage(
          `Job creation failed: ${
            data.detail || "Unknown error"
          }`
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // FETCH JOBS - JWT PROTECTED
  // =====================================================

  const fetchJobs = async () => {
    try {
      let url =
        "http://127.0.0.1:8000/jobs/";

      // Client gets only their own jobs
      if (userRole === "client") {
        url = `http://127.0.0.1:8000/jobs/client/${userId}`;
      }

      const response = await fetch(
        url,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setJobs(data);
      } else {
        setMessage(
          data.detail ||
            "Failed to load jobs."
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // COMPLETE JOB - JWT PROTECTED
  // =====================================================

  const completeJob = async (jobId) => {
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/jobs/${jobId}/complete`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Job completed successfully!"
        );

        fetchJobs();
      } else {
        setMessage(
          data.detail ||
            "Failed to complete job."
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // FILTER JOBS
  // =====================================================

  const filteredJobs = jobs.filter((job) => {
    const title =
      job.title?.toLowerCase() || "";

    const search =
      searchTerm.toLowerCase();

    const matchesSearch =
      title.includes(search);

    const budget = Number(job.budget);

    const matchesMinBudget =
      minBudget === "" ||
      budget >= Number(minBudget);

    const matchesMaxBudget =
      maxBudget === "" ||
      budget <= Number(maxBudget);

    return (
      matchesSearch &&
      matchesMinBudget &&
      matchesMaxBudget
    );
  });

  // =====================================================
  // PROPOSAL FORM
  // =====================================================

  const handleProposalChange = (e) => {
    const { name, value } = e.target;

    setProposalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE PROPOSAL
  // =====================================================

  const handleCreateProposal = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/proposals/",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            
            job_id: Number(
              proposalForm.job_id
            ),
            cover_letter:
              proposalForm.cover_letter,
            proposed_budget: Number(
              proposalForm.proposed_budget
            ),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Proposal submitted successfully!"
        );

        setProposalForm({
          freelancer_id: "",
          job_id: "",
          cover_letter: "",
          proposed_budget: "",
        });

        fetchProposals();
      } else {
        setMessage(
          `Proposal submission failed: ${
            data.detail ||
            "Unknown error"
          }`
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // FETCH PROPOSALS
  // =====================================================

  const fetchProposals = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/proposals/",
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProposals(data);
      } else {
        setMessage(
          data.detail ||
            "Failed to load proposals."
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // ACCEPT / REJECT PROPOSAL
  // =====================================================

  const updateProposalStatus = async (
    proposalId,
    action
  ) => {
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/proposals/${proposalId}/${action}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          action === "accept"
            ? "Proposal accepted successfully!"
            : "Proposal rejected successfully!"
        );

        fetchProposals();

        // Job status changes when
        // proposal is accepted.
        fetchJobs();
      } else {
        setMessage(
          data.detail ||
            "Failed to update proposal"
        );
      }
    } catch (error) {
      setMessage(
        "Backend connection failed."
      );
    }
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const goToSection = (section) => {
    setActiveSection(section);
    setMessage("");
  };

  // =====================================================
  // JOB STATUS DISPLAY
  // =====================================================

  const getStatusText = (status) => {
    if (status === "open") {
      return "🟢 OPEN";
    }

    if (status === "assigned") {
      return "🟡 ASSIGNED";
    }

    if (status === "completed") {
      return "🔵 COMPLETED";
    }

    return status;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "auto",
        fontFamily:
          "Arial, sans-serif",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <h1>TrustHire AI</h1>

      <p>
        AI-Powered Freelance Job Marketplace
      </p>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {!userRole && (
          <>
            <button
              onClick={() =>
                goToSection("register")
              }
            >
              Register
            </button>

            <button
              onClick={() =>
                goToSection("login")
              }
            >
              Login
            </button>
          </>
        )}

        {userRole && (
          <>
            <button
              onClick={() =>
                goToSection("dashboard")
              }
            >
              Dashboard
            </button>

            {userRole === "client" && (
              <button
                onClick={() => {
                  goToSection("jobs");
                  fetchJobs();
                }}
              >
                My Jobs
              </button>
            )}

            {userRole === "freelancer" && (
              <button
                onClick={() => {
                  goToSection("jobs");
                  fetchJobs();
                }}
              >
                Available Jobs
              </button>
            )}

            <button
              onClick={() => {
                goToSection("proposals");
                fetchProposals();
              }}
            >
              Proposals
            </button>

            <button
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>

      <hr />

      {/* =================================================
          REGISTER
      ================================================= */}

      {activeSection === "register" && (
        <section
          style={{
            maxWidth: "450px",
            margin: "30px auto",
          }}
        >
          <h2>Create Account</h2>

          <form
            onSubmit={handleRegister}
          >
            <label>
              Full Name
            </label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={
                registerForm.full_name
              }
              onChange={
                handleRegisterChange
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                margin:
                  "8px 0 15px",
                boxSizing:
                  "border-box",
              }}
            />

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={
                registerForm.email
              }
              onChange={
                handleRegisterChange
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                margin:
                  "8px 0 15px",
                boxSizing:
                  "border-box",
              }}
            />

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={
                registerForm.password
              }
              onChange={
                handleRegisterChange
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                margin:
                  "8px 0 15px",
                boxSizing:
                  "border-box",
              }}
            />

            <label>
              Account Type
            </label>

            <select
              name="role"
              value={
                registerForm.role
              }
              onChange={
                handleRegisterChange
              }
              style={{
                width: "100%",
                padding: "12px",
                margin:
                  "8px 0 20px",
              }}
            >
              <option value="client">
                Client
              </option>

              <option value="freelancer">
                Freelancer
              </option>
            </select>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </form>
        </section>
      )}

      {/* =================================================
          LOGIN
      ================================================= */}

      {activeSection === "login" && (
        <section
          style={{
            maxWidth: "400px",
            margin: "40px auto",
            padding: "30px",
            border:
              "1px solid #ddd",
            borderRadius:
              "12px",
            backgroundColor:
              "#f9f9f9",
          }}
        >
          <h2
            style={{
              textAlign: "center",
            }}
          >
            Login
          </h2>

          <form
            onSubmit={handleLogin}
          >
            <label
              style={{
                display: "block",
                marginBottom:
                  "8px",
                fontWeight:
                  "bold",
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={
                loginForm.email
              }
              onChange={
                handleLoginChange
              }
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom:
                  "20px",
                border:
                  "1px solid #aaa",
                borderRadius:
                  "6px",
                boxSizing:
                  "border-box",
                fontSize: "15px",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom:
                  "8px",
                fontWeight:
                  "bold",
              }}
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={
                loginForm.password
              }
              onChange={
                handleLoginChange
              }
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom:
                  "20px",
                border:
                  "1px solid #aaa",
                borderRadius:
                  "6px",
                boxSizing:
                  "border-box",
                fontSize: "15px",
                backgroundColor:
                  "white",
                color: "black",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor:
                  "#2563eb",
                color: "white",
                border: "none",
                borderRadius:
                  "6px",
                cursor:
                  "pointer",
                fontSize: "16px",
                fontWeight:
                  "bold",
              }}
            >
              Login
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop:
                  "20px",
                textAlign:
                  "center",
                fontWeight:
                  "bold",
              }}
            >
              {message}
            </p>
          )}
        </section>
      )}

      {/* =================================================
          DASHBOARD
      ================================================= */}

      {activeSection ===
        "dashboard" &&
        userRole && (
          <section>

            <h2>
              Welcome to TrustHire AI 👋
            </h2>

            <p>
              Logged in as:{" "}
              <strong>
                {userRole}
              </strong>
            </p>

            <p>
              User ID:{" "}
              <strong>
                {userId}
              </strong>
            </p>

            <hr />

            {/* CLIENT */}

            {userRole === "client" && (
              <div>

                <h2>
                  Client Dashboard
                </h2>

                <p>
                  Post jobs and manage
                  freelancer proposals.
                </p>

                <button
                  onClick={() => {
                    setActiveSection(
                      "jobs"
                    );
                    fetchJobs();
                  }}
                >
                  Post / View Jobs
                </button>

                {" "}

                <button
                  onClick={() => {
                    setActiveSection(
                      "proposals"
                    );
                    fetchProposals();
                  }}
                >
                  View Proposals
                </button>

              </div>
            )}

            {/* FREELANCER */}

            {userRole ===
              "freelancer" && (
              <div>

                <h2>
                  Freelancer Dashboard
                </h2>

                <p>
                  Find suitable jobs
                  and submit proposals.
                </p>

                <button
                  onClick={() => {
                    setActiveSection(
                      "jobs"
                    );
                    fetchJobs();
                  }}
                >
                  View Available Jobs
                </button>

                {" "}

                <button
                  onClick={() => {
                    setActiveSection(
                      "proposals"
                    );
                    fetchProposals();
                  }}
                >
                  My Proposals
                </button>

              </div>
            )}

          </section>
        )}

      {/* =================================================
          JOBS
      ================================================= */}

      {activeSection === "jobs" &&
        userRole && (
          <section>

            <h2>
              {userRole === "client"
                ? "My Jobs"
                : "Available Jobs"}
            </h2>

            {/* CLIENT POST JOB */}

            {userRole === "client" && (
              <div
                style={{
                  padding: "20px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "25px",
                }}
              >

                <h3>
                  Post a New Job
                </h3>

                <form
                  onSubmit={
                    handleCreateJob
                  }
                >

                  <input
                    type="text"
                    name="title"
                    placeholder="Job Title"
                    value={
                      jobForm.title
                    }
                    onChange={
                      handleJobChange
                    }
                    required
                    style={{
                      width: "100%",
                      padding:
                        "10px",
                      marginBottom:
                        "10px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={
                      jobForm.description
                    }
                    onChange={
                      handleJobChange
                    }
                    rows="5"
                    required
                    style={{
                      width: "100%",
                      padding:
                        "10px",
                      marginBottom:
                        "10px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <input
                    type="number"
                    name="budget"
                    placeholder="Budget"
                    value={
                      jobForm.budget
                    }
                    onChange={
                      handleJobChange
                    }
                    required
                    min="1"
                    style={{
                      width: "100%",
                      padding:
                        "10px",
                      marginBottom:
                        "15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <button
                    type="submit"
                  >
                    Post Job
                  </button>

                </form>
              </div>
            )}

            {/* SEARCH / FILTER */}

            <div
              style={{
                padding: "15px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "10px",
                marginBottom:
                  "20px",
              }}
            >

              <h3>
                🔍 Find Jobs
              </h3>

              <div
                style={{
                  display:
                    "flex",
                  gap: "10px",
                  flexWrap:
                    "wrap",
                }}
              >

                <input
                  type="text"
                  placeholder="Search by job title..."
                  value={
                    searchTerm
                  }
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  style={{
                    padding:
                      "10px",
                    minWidth:
                      "220px",
                  }}
                />

                <input
                  type="number"
                  placeholder="Min Budget"
                  value={
                    minBudget
                  }
                  onChange={(e) =>
                    setMinBudget(
                      e.target.value
                    )
                  }
                  style={{
                    padding:
                      "10px",
                    width:
                      "140px",
                  }}
                />

                <input
                  type="number"
                  placeholder="Max Budget"
                  value={
                    maxBudget
                  }
                  onChange={(e) =>
                    setMaxBudget(
                      e.target.value
                    )
                  }
                  style={{
                    padding:
                      "10px",
                    width:
                      "140px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setMinBudget("");
                    setMaxBudget("");
                  }}
                >
                  Clear Filters
                </button>

              </div>
            </div>

            {/* REFRESH */}

            <button
              onClick={fetchJobs}
            >
              🔄 Refresh Jobs
            </button>

            <h3>
              {userRole === "client"
                ? "Your Posted Jobs"
                : "Available Jobs"}
            </h3>

            {/* NO JOBS */}

            {jobs.length === 0 && (
              <p>
                No jobs available.
              </p>
            )}

            {/* NO FILTER RESULT */}

            {jobs.length > 0 &&
              filteredJobs.length ===
                0 && (
                <p>
                  No jobs match your
                  search/filter.
                </p>
              )}

            {/* JOB CARDS */}

            {filteredJobs.map(
              (job) => (
                <div
                  key={job.id}
                  style={{
                    border:
                      "1px solid #ddd",
                    borderRadius:
                      "10px",
                    padding:
                      "20px",
                    marginTop:
                      "15px",
                  }}
                >

                  <h3>
                    {job.title}
                  </h3>

                  <p>
                    <strong>
                      Job ID:
                    </strong>{" "}
                    {job.id}
                  </p>

                  <p>
                    <strong>
                      Client ID:
                    </strong>{" "}
                    {job.client_id}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>
                  </p>

                  <p>
                    {job.description}
                  </p>

                  <p>
                    <strong>
                      Budget:
                    </strong>{" "}
                    ₹{job.budget}
                  </p>

                  {/* STATUS */}

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}

                    <span
                      style={{
                        fontWeight:
                          "bold",
                      }}
                    >
                      {getStatusText(
                        job.status
                      )}
                    </span>
                  </p>

                  {/* CLIENT COMPLETE */}

                  {userRole ===
                    "client" &&
                    job.status ===
                      "assigned" && (
                      <button
                        type="button"
                        onClick={() =>
                          completeJob(
                            job.id
                          )
                        }
                        style={{
                          marginTop:
                            "10px",
                          padding:
                            "10px 15px",
                          cursor:
                            "pointer",
                        }}
                      >
                        ✅ Mark Job Completed
                      </button>
                    )}

                  {/* FREELANCER APPLY */}

                  {userRole ===
                    "freelancer" &&
                    job.status ===
                      "open" && (
                      <button
                        type="button"
                        onClick={() => {
                          setProposalForm(
                            (prev) => ({
                              ...prev,
                              freelancer_id:
                                userId,
                              job_id:
                                job.id,
                            })
                          );

                          setActiveSection(
                            "proposals"
                          );
                        }}
                      >
                        Apply Now
                      </button>
                    )}

                </div>
              )
            )}

          </section>
        )}

      {/* =================================================
          PROPOSALS
      ================================================= */}

      {activeSection ===
        "proposals" &&
        userRole && (
          <section>

            <h2>
              Proposal Management
            </h2>

            {/* FREELANCER SUBMIT */}

            {userRole ===
              "freelancer" && (
              <div
                style={{
                  padding: "20px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "25px",
                }}
              >

                <h3>
                  Submit a Proposal
                </h3>

                <form
                  onSubmit={
                    handleCreateProposal
                  }
                >

                  <label>
                    Job ID
                  </label>

                  <input
                    type="number"
                    name="job_id"
                    placeholder="Enter Job ID"
                    value={
                      proposalForm.job_id
                    }
                    onChange={
                      handleProposalChange
                    }
                    required
                    style={{
                      display:
                        "block",
                      width:
                        "100%",
                      padding:
                        "10px",
                      margin:
                        "8px 0 15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <label>
                    Cover Letter
                  </label>

                  <textarea
                    name="cover_letter"
                    placeholder="Write your proposal..."
                    value={
                      proposalForm.cover_letter
                    }
                    onChange={
                      handleProposalChange
                    }
                    rows="6"
                    required
                    style={{
                      display:
                        "block",
                      width:
                        "100%",
                      padding:
                        "10px",
                      margin:
                        "8px 0 15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <label>
                    Proposed Budget
                  </label>

                  <input
                    type="number"
                    name="proposed_budget"
                    placeholder="Enter your proposed budget"
                    value={
                      proposalForm.proposed_budget
                    }
                    onChange={
                      handleProposalChange
                    }
                    required
                    min="1"
                    style={{
                      display:
                        "block",
                      width:
                        "100%",
                      padding:
                        "10px",
                      margin:
                        "8px 0 15px",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <button
                    type="submit"
                  >
                    Submit Proposal
                  </button>

                </form>
              </div>
            )}

            {/* REFRESH */}

            <button
              onClick={
                fetchProposals
              }
            >
              🔄 Refresh Proposals
            </button>

            <h3>
              Proposals
            </h3>

            {proposals.length ===
            0 ? (
              <p>
                No proposals available.
              </p>
            ) : (
              proposals.map(
                (proposal) => (
                  <div
                    key={
                      proposal.id
                    }
                    style={{
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "10px",
                      padding:
                        "20px",
                      marginTop:
                        "15px",
                    }}
                  >

                    <h3>
                      Proposal #
                      {
                        proposal.id
                      }
                    </h3>

                    <p>
                      <strong>
                        Job ID:
                      </strong>{" "}
                      {
                        proposal.job_id
                      }
                    </p>

                    <p>
                      <strong>
                        Freelancer ID:
                      </strong>{" "}
                      {
                        proposal.freelancer_id
                      }
                    </p>

                    <p>
                      <strong>
                        Cover Letter:
                      </strong>
                    </p>

                    <p>
                      {
                        proposal.cover_letter
                      }
                    </p>

                    <p>
                      <strong>
                        Proposed Budget:
                      </strong>{" "}
                      ₹
                      {
                        proposal.proposed_budget
                      }
                    </p>

                    <p>
                      <strong>
                        Status:
                      </strong>{" "}
                      {
                        proposal.status
                      }
                    </p>

                    {/* CLIENT ACTIONS */}

                    {userRole ===
                      "client" &&
                      proposal.status ===
                        "pending" && (
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "10px",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              updateProposalStatus(
                                proposal.id,
                                "accept"
                              )
                            }
                          >
                            ✅ Accept
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateProposalStatus(
                                proposal.id,
                                "reject"
                              )
                            }
                          >
                            ❌ Reject
                          </button>

                        </div>
                      )}

                  </div>
                )
              )
            )}

          </section>
        )}

      {/* =================================================
          GLOBAL MESSAGE
      ================================================= */}

      {message && (
        <p
          style={{
            marginTop:
              "25px",
            fontWeight:
              "bold",
          }}
        >
          {message}
        </p>
      )}

    </div>
  );
}

export default App;