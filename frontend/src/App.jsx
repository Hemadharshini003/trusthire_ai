import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
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
  const [loading, setLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    budget: "",
  });

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [proposalForm, setProposalForm] = useState({
    job_id: "",
    cover_letter: "",
    proposed_budget: "",
  });

  const [proposals, setProposals] = useState([]);

  const [trustScore, setTrustScore] = useState(null);

  const [selectedRiskJob, setSelectedRiskJob] = useState(null);
  const [selectedRiskProposal, setSelectedRiskProposal] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    freelancer_id: "",
    job_id: "",
    rating: 5,
    comment: "",
  });

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const notify = (text) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const navigate = (section) => {
    setActiveSection(section);
    setMessage("");

    if (section === "dashboard") {
      fetchJobs();
      fetchProposals();
      fetchTrustScore();
    }

    if (section === "jobs") {
      fetchJobs();
    }

    if (section === "proposals") {
      fetchProposals();
    }

    if (section === "trust") {
      fetchTrustScore();
    }

    if (section === "reviews") {
      fetchReviews();
    }
  };

  const registerChange = (e) => {
    const { name, value } = e.target;

    setRegisterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const loginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const jobChange = (e) => {
    const { name, value } = e.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const proposalChange = (e) => {
    const { name, value } = e.target;

    setProposalForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const reviewChange = (e) => {
    const { name, value } = e.target;

    setReviewForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Registration failed.");
        return;
      }

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

      notify("Account created successfully.");
      setActiveSection("login");
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", data.user_id);

      setUserRole(data.role);
      setUserId(data.user_id);

      setLoginForm({
        email: "",
        password: "",
      });

      setActiveSection("dashboard");

      notify(`Welcome back. Signed in as ${data.role}.`);
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    setUserRole("");
    setUserId("");
    setJobs([]);
    setProposals([]);
    setTrustScore(null);
    setReviews([]);
    setSelectedRiskJob(null);
    setSelectedRiskProposal(null);

    setActiveSection("login");
    notify("You have been signed out.");
  };

  const createJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/jobs/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          title: jobForm.title,
          description: jobForm.description,
          budget: Number(jobForm.budget),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not create job.");
        return;
      }

      setJobForm({
        title: "",
        description: "",
        budget: "",
      });

      notify("Job published successfully.");
      await fetchJobs();
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    if (!userRole || !userId) return;

    try {
      const url =
        userRole === "client"
          ? `${API}/jobs/client/${userId}`
          : `${API}/jobs/`;

      const res = await fetch(url, {
        headers: headers(),
      });

      const data = await res.json();

      if (res.ok) {
        setJobs(data);
      } else {
        notify(data.detail || "Could not load jobs.");
      }
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const updateJob = async (jobId) => {
    const job = jobs.find((item) => item.id === jobId);

    if (!job) return;

    const title = window.prompt("Job title", job.title);
    if (title === null) return;

    const description = window.prompt(
      "Job description",
      job.description
    );
    if (description === null) return;

    const budget = window.prompt("Budget", job.budget);
    if (budget === null) return;

    try {
      const res = await fetch(`${API}/jobs/${jobId}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({
          title,
          description,
          budget: Number(budget),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not update job.");
        return;
      }

      notify("Job updated successfully.");
      fetchJobs();
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const cancelJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this job?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/jobs/${jobId}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not cancel job.");
        return;
      }

      notify("Job cancelled successfully.");
      fetchJobs();
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const completeJob = async (jobId) => {
    const confirmed = window.confirm(
      "Mark this assigned job as completed?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/jobs/${jobId}/complete`, {
        method: "PUT",
        headers: headers(),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not complete the job.");
        return;
      }

      notify("Job marked as completed.");
      fetchJobs();
      fetchTrustScore();
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const createProposal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/proposals/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          job_id: Number(proposalForm.job_id),
          cover_letter: proposalForm.cover_letter,
          proposed_budget: Number(proposalForm.proposed_budget),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not submit proposal.");
        return;
      }

      setProposalForm({
        job_id: "",
        cover_letter: "",
        proposed_budget: "",
      });

      notify("Proposal submitted successfully.");
      fetchProposals();
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    if (!userRole) return;

    try {
      const res = await fetch(`${API}/proposals/`, {
        headers: headers(),
      });

      const data = await res.json();

      if (res.ok) {
        setProposals(data);
      } else {
        notify(data.detail || "Could not load proposals.");
      }
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const updateProposal = async (proposalId, action) => {
    try {
      const res = await fetch(
        `${API}/proposals/${proposalId}/${action}`,
        {
          method: "PUT",
          headers: headers(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not update proposal.");
        return;
      }

      notify(
        action === "accept"
          ? "Proposal accepted successfully."
          : "Proposal rejected successfully."
      );

      fetchProposals();
      fetchJobs();
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const fetchTrustScore = async () => {
    if (!userRole) return;

    try {
      const res = await fetch(`${API}/users/trust-score`, {
        headers: headers(),
      });

      const data = await res.json();

      if (res.ok) {
        setTrustScore(data);
      } else {
        notify(data.detail || "Could not load trust score.");
      }
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const analyzeJobRisk = async (jobId) => {
    setRiskLoading(true);

    try {
      const res = await fetch(`${API}/risk/job/${jobId}`, {
        headers: headers(),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not analyze job risk.");
        return;
      }

      setSelectedRiskJob(data);
      setActiveSection("risk");
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setRiskLoading(false);
    }
  };

  const analyzeProposalRisk = async (proposalId) => {
    setRiskLoading(true);

    try {
      const res = await fetch(
        `${API}/risk/proposal/${proposalId}`,
        {
          headers: headers(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not analyze proposal risk.");
        return;
      }

      setSelectedRiskProposal(data);
      setActiveSection("risk");
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setRiskLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!userRole) return;

    try {
      if (userRole === "freelancer") {
        const res = await fetch(
          `${API}/reviews/freelancer/${userId}`,
          {
            headers: headers(),
          }
        );

        const data = await res.json();

        if (res.ok) {
          setReviews(data);
        } else {
          notify(data.detail || "Could not load reviews.");
        }
      } else {
        setReviews([]);
      }
    } catch {
      notify("Unable to connect to the backend.");
    }
  };

  const createReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/reviews/`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          freelancer_id: Number(reviewForm.freelancer_id),
          job_id: Number(reviewForm.job_id),
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.detail || "Could not create review.");
        return;
      }

      setReviewForm({
        freelancer_id: "",
        job_id: "",
        rating: 5,
        comment: "",
      });

      notify("Review submitted successfully.");
      fetchTrustScore();
    } catch {
      notify("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userRole) return;

    fetchJobs();
    fetchProposals();
    fetchTrustScore();

    if (userRole === "freelancer") {
      fetchReviews();
    }
  }, [userRole, userId]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const budget = Number(job.budget);

      return (
        title.includes(searchTerm.toLowerCase()) &&
        (minBudget === "" || budget >= Number(minBudget)) &&
        (maxBudget === "" || budget <= Number(maxBudget))
      );
    });
  }, [jobs, searchTerm, minBudget, maxBudget]);

  const statusClass = (status) => {
    if (status === "open") return "badge open";
    if (status === "assigned") return "badge assigned";
    if (status === "completed") return "badge completed";
    if (status === "accepted") return "badge accepted";
    if (status === "rejected") return "badge rejected";
    if (status === "cancelled") return "badge cancelled";
    return "badge pending";
  };

  const riskClass = (level) => {
    if (level === "HIGH") return "risk-badge high";
    if (level === "MEDIUM") return "risk-badge medium";
    return "risk-badge low";
  };

  const totalOpen = jobs.filter((job) => job.status === "open").length;
  const totalAssigned = jobs.filter(
    (job) => job.status === "assigned"
  ).length;

  const totalCompleted = jobs.filter(
    (job) => job.status === "completed"
  ).length;

  const pendingProposals = proposals.filter(
    (proposal) => proposal.status === "pending"
  ).length;

  const acceptedProposals = proposals.filter(
    (proposal) => proposal.status === "accepted"
  ).length;

  if (!userRole && activeSection === "register") {
    return (
      <div className="public-page">
        <header className="public-nav">
          <button
            className="logo"
            onClick={() => setActiveSection("register")}
          >
            <span className="logo-mark">T</span>
            <span>
              TrustHire <em>AI</em>
            </span>
          </button>

          <button
            className="ghost-btn"
            onClick={() => setActiveSection("login")}
          >
            Sign in
          </button>
        </header>

        <main className="landing">
          <section className="landing-copy">
            <span className="overline">
              CYBER-TRUST FREELANCE PLATFORM
            </span>

            <h1>
              Work with people.
              <br />
              <span>Trust the process.</span>
            </h1>

            <p>
              TrustHire AI brings secure authentication, protected
              hiring workflows and cyber-trust intelligence into one
              professional marketplace.
            </p>

            <div className="landing-points">
              <div>
                <b>01</b>
                <span>
                  <strong>Secure accounts</strong>
                  <small>JWT protected access</small>
                </span>
              </div>

              <div>
                <b>02</b>
                <span>
                  <strong>Role-based hiring</strong>
                  <small>Client and freelancer workflows</small>
                </span>
              </div>

              <div>
                <b>03</b>
                <span>
                  <strong>Trust intelligence</strong>
                  <small>Risk and reputation signals</small>
                </span>
              </div>
            </div>
          </section>

          <section className="auth-box">
            <span className="overline">GET STARTED</span>
            <h2>Create your account</h2>

            <p>
              Choose your role and enter the TrustHire workspace.
            </p>

            <form onSubmit={handleRegister}>
              <label>Full name</label>

              <input
                className="field-input"
                name="full_name"
                value={registerForm.full_name}
                onChange={registerChange}
                placeholder="Your full name"
                required
              />

              <label>Email address</label>

              <input
                className="field-input"
                type="email"
                name="email"
                value={registerForm.email}
                onChange={registerChange}
                placeholder="you@example.com"
                required
              />

              <label>Password</label>

              <input
                className="field-input"
                type="password"
                name="password"
                value={registerForm.password}
                onChange={registerChange}
                placeholder="Create a password"
                required
              />

              <label>Account type</label>

              <select
                className="field-input"
                name="role"
                value={registerForm.role}
                onChange={registerChange}
              >
                <option value="client">
                  Client — hire talent
                </option>

                <option value="freelancer">
                  Freelancer — find work
                </option>
              </select>

              <button
                className="primary-btn wide-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create account"}
                <span>→</span>
              </button>
            </form>

            <div className="form-foot">
              Already have an account?

              <button onClick={() => setActiveSection("login")}>
                Sign in
              </button>
            </div>

            {message && (
              <div className="inline-message">
                {message}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  if (!userRole && activeSection === "login") {
    return (
      <div className="public-page">
        <header className="public-nav">
          <button
            className="logo"
            onClick={() => setActiveSection("register")}
          >
            <span className="logo-mark">T</span>
            <span>
              TrustHire <em>AI</em>
            </span>
          </button>

          <button
            className="ghost-btn"
            onClick={() => setActiveSection("register")}
          >
            Create account
          </button>
        </header>

        <main className="login-landing">
          <section className="login-message">
            <span className="overline">
              TRUSTHIRE AI / SECURE ACCESS
            </span>

            <h1>
              Welcome
              <br />
              <span>back.</span>
            </h1>

            <p>
              Continue to your secure freelance workspace.
            </p>

            <div className="status-line">
              <i />
              All systems protected
            </div>
          </section>

          <section className="auth-box">
            <span className="overline">SIGN IN</span>

            <h2>Access your workspace</h2>

            <p>
              Use the credentials associated with your account.
            </p>

            <form onSubmit={handleLogin}>
              <label>Email address</label>

              <input
                className="field-input"
                type="email"
                name="email"
                value={loginForm.email}
                onChange={loginChange}
                placeholder="you@example.com"
                required
              />

              <label>Password</label>

              <input
                className="field-input"
                type="password"
                name="password"
                value={loginForm.password}
                onChange={loginChange}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />

              <button
                className="primary-btn wide-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
                <span>→</span>
              </button>
            </form>

            <div className="form-foot">
              New to TrustHire?

              <button
                onClick={() => setActiveSection("register")}
              >
                Create account
              </button>
            </div>

            {message && (
              <div className="inline-message">
                {message}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <button
          className="side-logo"
          onClick={() => navigate("dashboard")}
        >
          <span className="logo-mark">T</span>

          <span>
            TrustHire <em>AI</em>
          </span>
        </button>

        <div className="workspace-label">
          WORKSPACE
        </div>

        <nav>
          <button
            className={
              activeSection === "dashboard"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("dashboard")}
          >
            <span className="side-icon">⌂</span>
            Overview
          </button>

          <button
            className={
              activeSection === "jobs"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("jobs")}
          >
            <span className="side-icon">□</span>
            {userRole === "client" ? "My jobs" : "Find jobs"}
          </button>

          <button
            className={
              activeSection === "proposals"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("proposals")}
          >
            <span className="side-icon">◇</span>
            Proposals
          </button>

          <button
            className={
              activeSection === "trust"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("trust")}
          >
            <span className="side-icon">◎</span>
            Trust score
          </button>

          <button
            className={
              activeSection === "risk"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("risk")}
          >
            <span className="side-icon">△</span>
            AI risk
          </button>

          <button
            className={
              activeSection === "reviews"
                ? "side-link active"
                : "side-link"
            }
            onClick={() => navigate("reviews")}
          >
            <span className="side-icon">☆</span>
            Reviews
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="account-mini">
            <div className="account-avatar">
              {userRole === "client" ? "C" : "F"}
            </div>

            <div>
              <strong>
                {userRole === "client"
                  ? "Client"
                  : "Freelancer"}
              </strong>

              <small>
                Account #{userId}
              </small>
            </div>
          </div>

          <button
            className="signout"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="crumb">
              TRUSTHIRE AI /{" "}
              {activeSection.toUpperCase()}
            </span>

            <h2>
              {activeSection === "dashboard" &&
                "Overview"}

              {activeSection === "jobs" &&
                (userRole === "client"
                  ? "My jobs"
                  : "Find jobs")}

              {activeSection === "proposals" &&
                "Proposals"}

              {activeSection === "trust" &&
                "Trust score"}

              {activeSection === "risk" &&
                "AI risk analysis"}

              {activeSection === "reviews" &&
                "Reviews"}
            </h2>
          </div>

          <div className="top-user">
            <span className="live-dot" />

            {userRole === "client"
              ? "Client workspace"
              : "Freelancer workspace"}
          </div>
        </header>

        {message && (
          <div className="toast">
            <span className="toast-dot" />

            {message}

            <button
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <div className="content">
          {/* DASHBOARD */}

          {activeSection === "dashboard" && (
            <section>
              <div className="hero-card">
                <div>
                  <span className="overline">
                    SECURE WORKSPACE
                  </span>

                  <h1>
                    {userRole === "client" ? (
                      <>
                        Build your next project
                        <br />
                        <span>with confidence.</span>
                      </>
                    ) : (
                      <>
                        Find better work.
                        <br />
                        <span>Build more trust.</span>
                      </>
                    )}
                  </h1>

                  <p>
                    {userRole === "client"
                      ? "Post projects, evaluate proposals and manage trusted freelancer relationships."
                      : "Discover projects, submit proposals and grow your professional reputation."}
                  </p>

                  <button
                    className="primary-btn"
                    onClick={() =>
                      navigate("jobs")
                    }
                  >
                    {userRole === "client"
                      ? "Create a job"
                      : "Explore jobs"}

                    <span>→</span>
                  </button>
                </div>

                <div className="hero-graphic">
                  <div className="graphic-ring ring-one" />
                  <div className="graphic-ring ring-two" />
                  <div className="graphic-core">
                    T
                  </div>
                </div>
              </div>

              <div className="stat-grid">
                <div className="stat">
                  <span>JOBS IN VIEW</span>
                  <strong>{jobs.length}</strong>
                  <small>Current workspace</small>
                </div>

                <div className="stat">
                  <span>
                    {userRole === "client"
                      ? "OPEN PROJECTS"
                      : "OPEN OPPORTUNITIES"}
                  </span>

                  <strong>{totalOpen}</strong>

                  <small>
                    Ready for action
                  </small>
                </div>

                <div className="stat">
                  <span>
                    {userRole === "client"
                      ? "PENDING PROPOSALS"
                      : "MY PROPOSALS"}
                  </span>

                  <strong>
                    {userRole === "client"
                      ? pendingProposals
                      : proposals.length}
                  </strong>

                  <small>
                    Proposal activity
                  </small>
                </div>

                <div className="stat accent-stat">
                  <span>TRUST SCORE</span>

                  <strong>
                    {trustScore
                      ? trustScore.trust_score
                      : "--"}
                  </strong>

                  <small>
                    {trustScore
                      ? trustScore.trust_level
                      : "Loading"}
                  </small>
                </div>
              </div>

              <div className="dashboard-columns">
                <div className="content-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        QUICK ACTIONS
                      </span>

                      <h3>
                        Workspace shortcuts
                      </h3>
                    </div>
                  </div>

                  <div className="shortcut-grid">
                    <button
                      onClick={() =>
                        navigate("jobs")
                      }
                    >
                      <span>01</span>

                      <strong>
                        {userRole === "client"
                          ? "Manage projects"
                          : "Browse projects"}
                      </strong>

                      <small>
                        {userRole === "client"
                          ? "Post and track your jobs"
                          : "Search available opportunities"}
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        navigate("proposals")
                      }
                    >
                      <span>02</span>

                      <strong>
                        {userRole === "client"
                          ? "Review proposals"
                          : "Track proposals"}
                      </strong>

                      <small>
                        {userRole === "client"
                          ? "Evaluate freelancer submissions"
                          : "See your application status"}
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        navigate("trust")
                      }
                    >
                      <span>03</span>

                      <strong>
                        Trust score
                      </strong>

                      <small>
                        View your current trust level
                      </small>
                    </button>

                    <button
                      onClick={() =>
                        navigate("risk")
                      }
                    >
                      <span>04</span>

                      <strong>
                        AI risk analysis
                      </strong>

                      <small>
                        Inspect cyber-risk signals
                      </small>
                    </button>
                  </div>
                </div>

                <div className="content-card security-card">
                  <span className="overline">
                    CYBER TRUST
                  </span>

                  <div className="security-score">
                    <b>01</b>
                    <span>ACTIVE</span>
                  </div>

                  <h3>
                    Trust is built into the workflow.
                  </h3>

                  <p>
                    Authentication, authorization,
                    reputation and cyber-risk
                    intelligence work together behind
                    every marketplace action.
                  </p>
                </div>
              </div>

              <div className="dashboard-columns">
                <div className="content-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        JOB STATUS
                      </span>

                      <h3>
                        Workspace overview
                      </h3>
                    </div>
                  </div>

                  <div className="mini-stat-grid">
                    <div>
                      <strong>{totalOpen}</strong>
                      <span>Open</span>
                    </div>

                    <div>
                      <strong>{totalAssigned}</strong>
                      <span>Assigned</span>
                    </div>

                    <div>
                      <strong>{totalCompleted}</strong>
                      <span>Completed</span>
                    </div>

                    <div>
                      <strong>
                        {acceptedProposals}
                      </strong>
                      <span>Accepted</span>
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        TRUST SIGNAL
                      </span>

                      <h3>
                        Your reputation
                      </h3>
                    </div>
                  </div>

                  <div className="trust-inline">
                    <div className="trust-circle">
                      {trustScore
                        ? trustScore.trust_score
                        : "--"}
                    </div>

                    <div>
                      <strong>
                        {trustScore
                          ? trustScore.trust_level
                          : "Loading"}
                      </strong>

                      <p>
                        Trust score reflects successful
                        project outcomes and reviews.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {jobs.length > 0 && (
                <div className="content-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        ACTIVITY
                      </span>

                      <h3>
                        Recent workspace data
                      </h3>
                    </div>

                    <button
                      className="text-link"
                      onClick={() =>
                        navigate("jobs")
                      }
                    >
                      View all →
                    </button>
                  </div>

                  <div className="activity-list">
                    {jobs.slice(0, 5).map((job) => (
                      <div
                        className="activity-row"
                        key={job.id}
                      >
                        <span className="activity-type">
                          JOB
                        </span>

                        <div>
                          <strong>
                            {job.title}
                          </strong>

                          <small>
                            ₹{job.budget} · Job #
                            {job.id}
                          </small>
                        </div>

                        <span
                          className={statusClass(
                            job.status
                          )}
                        >
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* JOBS */}

          {activeSection === "jobs" && (
            <section>
              <div className="page-title">
                <div>
                  <span className="overline">
                    PROJECTS
                  </span>

                  <h1>
                    {userRole === "client"
                      ? "My jobs"
                      : "Find your next project"}
                  </h1>

                  <p>
                    {userRole === "client"
                      ? "Create, monitor and complete your freelance projects."
                      : "Search available projects and submit a proposal when you find the right fit."}
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={fetchJobs}
                >
                  Refresh
                </button>
              </div>

              {userRole === "client" && (
                <div className="content-card create-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        NEW PROJECT
                      </span>

                      <h3>
                        Post a job
                      </h3>
                    </div>

                    <span className="number-label">
                      01
                    </span>
                  </div>

                  <form onSubmit={createJob}>
                    <div className="form-row">
                      <div className="form-group grow">
                        <label>Job title</label>

                        <input
                          className="field-input"
                          name="title"
                          value={jobForm.title}
                          onChange={jobChange}
                          placeholder="e.g. Security audit for web application"
                          required
                        />
                      </div>

                      <div className="form-group budget-field">
                        <label>Budget (₹)</label>

                        <input
                          className="field-input"
                          type="number"
                          name="budget"
                          value={jobForm.budget}
                          onChange={jobChange}
                          placeholder="5000"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Project description
                      </label>

                      <textarea
                        className="field-input textarea"
                        name="description"
                        value={jobForm.description}
                        onChange={jobChange}
                        placeholder="Describe requirements, deliverables and expectations..."
                        rows="5"
                        required
                      />
                    </div>

                    <button
                      className="primary-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Publishing..."
                        : "Publish job"}

                      <span>→</span>
                    </button>
                  </form>
                </div>
              )}

              <div className="filter-card">
                <div className="search">
                  <span>⌕</span>

                  <input
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    placeholder="Search jobs by title..."
                  />
                </div>

                <input
                  className="mini-input"
                  type="number"
                  value={minBudget}
                  onChange={(e) =>
                    setMinBudget(
                      e.target.value
                    )
                  }
                  placeholder="Min ₹"
                />

                <input
                  className="mini-input"
                  type="number"
                  value={maxBudget}
                  onChange={(e) =>
                    setMaxBudget(
                      e.target.value
                    )
                  }
                  placeholder="Max ₹"
                />

                <button
                  className="clear-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setMinBudget("");
                    setMaxBudget("");
                  }}
                >
                  Clear
                </button>
              </div>

              <div className="list-heading">
                <span>
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "PROJECT"
                    : "PROJECTS"}
                </span>

                <small>
                  Updated from your workspace
                </small>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <span>—</span>

                  <h3>
                    No projects found
                  </h3>

                  <p>
                    Try a different search or
                    create a new job.
                  </p>
                </div>
              ) : (
                <div className="job-list">
                  {filteredJobs.map((job) => (
                    <article
                      className="job-item"
                      key={job.id}
                    >
                      <div className="job-main">
                        <div className="job-title-line">
                          <span className="job-number">
                            #
                            {String(job.id).padStart(
                              3,
                              "0"
                            )}
                          </span>

                          <span
                            className={statusClass(
                              job.status
                            )}
                          >
                            {job.status}
                          </span>
                        </div>

                        <h3>
                          {job.title}
                        </h3>

                        <p>
                          {job.description}
                        </p>

                        <div className="job-details">
                          <div>
                            <small>BUDGET</small>
                            <strong>
                              ₹{job.budget}
                            </strong>
                          </div>

                          <div>
                            <small>CLIENT</small>
                            <strong>
                              #{job.client_id}
                            </strong>
                          </div>

                          {job.freelancer_id && (
                            <div>
                              <small>
                                FREELANCER
                              </small>

                              <strong>
                                #{job.freelancer_id}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="job-action">
                        {userRole === "freelancer" &&
                          job.status === "open" && (
                            <button
                              className="primary-btn small"
                              onClick={() => {
                                setProposalForm({
                                  job_id: job.id,
                                  cover_letter: "",
                                  proposed_budget:
                                    job.budget,
                                });

                                navigate(
                                  "proposals"
                                );
                              }}
                            >
                              Apply now →
                            </button>
                          )}

                        {userRole === "client" &&
                          job.status === "open" && (
                            <div className="action-stack">
                              <button
                                className="secondary-btn small"
                                onClick={() =>
                                  updateJob(job.id)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="danger-btn"
                                onClick={() =>
                                  cancelJob(job.id)
                                }
                              >
                                Cancel
                              </button>

                              <button
                                className="secondary-btn small"
                                onClick={() =>
                                  analyzeJobRisk(
                                    job.id
                                  )
                                }
                                disabled={riskLoading}
                              >
                                Analyze risk
                              </button>
                            </div>
                          )}

                        {userRole === "client" &&
                          job.status === "assigned" && (
                            <div className="action-stack">
                              <button
                                className="success-btn"
                                onClick={() =>
                                  completeJob(
                                    job.id
                                  )
                                }
                              >
                                Mark completed
                              </button>

                              <button
                                className="secondary-btn small"
                                onClick={() =>
                                  analyzeJobRisk(
                                    job.id
                                  )
                                }
                              >
                                Risk analysis
                              </button>
                            </div>
                          )}

                        {job.status ===
                          "completed" && (
                          <button
                            className="secondary-btn small"
                            onClick={() =>
                              analyzeJobRisk(
                                job.id
                              )
                            }
                          >
                            View risk
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PROPOSALS */}

          {activeSection === "proposals" && (
            <section>
              <div className="page-title">
                <div>
                  <span className="overline">
                    COLLABORATION
                  </span>

                  <h1>
                    {userRole === "client"
                      ? "Review proposals"
                      : "My proposals"}
                  </h1>

                  <p>
                    {userRole === "client"
                      ? "Evaluate submissions and choose the right freelancer for each project."
                      : "Track your submitted proposals and their outcomes."}
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={fetchProposals}
                >
                  Refresh
                </button>
              </div>

              {userRole === "freelancer" && (
                <div className="content-card create-card">
                  <div className="card-heading">
                    <div>
                      <span className="overline">
                        SUBMISSION
                      </span>

                      <h3>
                        Send a proposal
                      </h3>
                    </div>

                    <span className="number-label">
                      01
                    </span>
                  </div>

                  <form onSubmit={createProposal}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Job ID</label>

                        <input
                          className="field-input"
                          type="number"
                          name="job_id"
                          value={
                            proposalForm.job_id
                          }
                          onChange={proposalChange}
                          placeholder="Enter job ID"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Your proposed budget (₹)
                        </label>

                        <input
                          className="field-input"
                          type="number"
                          name="proposed_budget"
                          value={
                            proposalForm.proposed_budget
                          }
                          onChange={proposalChange}
                          placeholder="Your quote"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Cover letter
                      </label>

                      <textarea
                        className="field-input textarea"
                        name="cover_letter"
                        value={
                          proposalForm.cover_letter
                        }
                        onChange={proposalChange}
                        placeholder="Explain your approach, relevant experience and expected delivery..."
                        rows="6"
                        required
                      />
                    </div>

                    <button
                      className="primary-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading
                        ? "Submitting..."
                        : "Submit proposal"}

                      <span>→</span>
                    </button>
                  </form>
                </div>
              )}

              <div className="list-heading">
                <span>
                  {proposals.length} PROPOSAL
                  {proposals.length === 1
                    ? ""
                    : "S"}
                </span>

                <small>
                  {pendingProposals} pending review
                </small>
              </div>

              {proposals.length === 0 ? (
                <div className="empty-state">
                  <span>—</span>

                  <h3>
                    No proposals yet
                  </h3>

                  <p>
                    Your proposal activity will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="proposal-list">
                  {proposals.map((proposal) => (
                    <article
                      className="proposal-item"
                      key={proposal.id}
                    >
                      <div className="proposal-top">
                        <div>
                          <span className="job-number">
                            PROPOSAL #
                            {proposal.id}
                          </span>

                          <h3>
                            Job #{proposal.job_id}
                          </h3>
                        </div>

                        <span
                          className={statusClass(
                            proposal.status
                          )}
                        >
                          {proposal.status}
                        </span>
                      </div>

                      <p className="proposal-letter">
                        {proposal.cover_letter}
                      </p>

                      <div className="proposal-bottom">
                        <div>
                          <small>
                            FREELANCER
                          </small>

                          <strong>
                            #{proposal.freelancer_id}
                          </strong>
                        </div>

                        <div>
                          <small>
                            PROPOSED BUDGET
                          </small>

                          <strong>
                            ₹
                            {
                              proposal.proposed_budget
                            }
                          </strong>
                        </div>

                        {userRole === "client" &&
                          proposal.status ===
                            "pending" && (
                            <div className="proposal-actions">
                              <button
                                className="success-btn"
                                onClick={() =>
                                  updateProposal(
                                    proposal.id,
                                    "accept"
                                  )
                                }
                              >
                                Accept
                              </button>

                              <button
                                className="danger-btn"
                                onClick={() =>
                                  updateProposal(
                                    proposal.id,
                                    "reject"
                                  )
                                }
                              >
                                Reject
                              </button>

                              <button
                                className="secondary-btn small"
                                onClick={() =>
                                  analyzeProposalRisk(
                                    proposal.id
                                  )
                                }
                              >
                                AI risk
                              </button>
                            </div>
                          )}

                        {userRole === "client" &&
                          proposal.status !==
                            "pending" && (
                            <button
                              className="secondary-btn small"
                              onClick={() =>
                                analyzeProposalRisk(
                                  proposal.id
                                )
                              }
                            >
                              View AI risk
                            </button>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TRUST SCORE */}

          {activeSection === "trust" && (
            <section>
              <div className="page-title">
                <div>
                  <span className="overline">
                    REPUTATION
                  </span>

                  <h1>
                    Trust score
                  </h1>

                  <p>
                    Your TrustHire reputation based on
                    completed work and reviews.
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={fetchTrustScore}
                >
                  Refresh
                </button>
              </div>

              <div className="trust-layout">
                <div className="trust-main-card">
                  <div className="trust-circle large">
                    {trustScore
                      ? trustScore.trust_score
                      : "--"}
                  </div>

                  <span className="overline">
                    CURRENT TRUST SCORE
                  </span>

                  <h2>
                    {trustScore
                      ? trustScore.trust_level
                      : "Loading"}
                  </h2>

                  <p>
                    Trust scores range from 0 to 100.
                    Strong project outcomes and positive
                    reviews increase reputation.
                  </p>
                </div>

                <div className="content-card">
                  <span className="overline">
                    SCORE GUIDE
                  </span>

                  <h3>
                    Trust levels
                  </h3>

                  <div className="score-guide">
                    <div>
                      <span className="guide-dot high-dot" />
                      <strong>
                        High
                      </strong>
                      <small>
                        80–100
                      </small>
                    </div>

                    <div>
                      <span className="guide-dot medium-dot" />
                      <strong>
                        Medium
                      </strong>
                      <small>
                        60–79
                      </small>
                    </div>

                    <div>
                      <span className="guide-dot low-dot" />
                      <strong>
                        Low
                      </strong>
                      <small>
                        0–59
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-columns">
                <div className="content-card">
                  <span className="overline">
                    PROJECT PERFORMANCE
                  </span>

                  <h3>
                    Completed projects
                  </h3>

                  <strong className="big-number">
                    {totalCompleted}
                  </strong>

                  <p>
                    Successfully completed projects
                    contribute to a stronger TrustHire
                    reputation.
                  </p>
                </div>

                <div className="content-card">
                  <span className="overline">
                    PROPOSAL PERFORMANCE
                  </span>

                  <h3>
                    Accepted proposals
                  </h3>

                  <strong className="big-number">
                    {acceptedProposals}
                  </strong>

                  <p>
                    Accepted proposals show successful
                    collaboration with clients.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* AI RISK */}

          {activeSection === "risk" && (
            <section>
              <div className="page-title">
                <div>
                  <span className="overline">
                    CYBER INTELLIGENCE
                  </span>

                  <h1>
                    AI risk analysis
                  </h1>

                  <p>
                    Analyze jobs and proposals for
                    suspicious cyber-risk signals.
                  </p>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setSelectedRiskJob(null);
                    setSelectedRiskProposal(null);
                  }}
                >
                  Clear analysis
                </button>
              </div>

              <div className="risk-grid">
                <div className="content-card">
                  <span className="overline">
                    JOB ANALYSIS
                  </span>

                  <h3>
                    Analyze a job
                  </h3>

                  <p>
                    Enter a job ID to calculate its
                    cyber-risk score.
                  </p>

                  <div className="risk-input-row">
                    <input
                      className="field-input"
                      type="number"
                      placeholder="Job ID"
                      id="risk-job-id"
                    />

                    <button
                      className="primary-btn"
                      onClick={() => {
                        const value =
                          document.getElementById(
                            "risk-job-id"
                          ).value;

                        if (!value) {
                          notify(
                            "Enter a job ID."
                          );
                          return;
                        }

                        analyzeJobRisk(
                          Number(value)
                        );
                      }}
                    >
                      Analyze
                    </button>
                  </div>
                </div>

                {userRole === "client" && (
                  <div className="content-card">
                    <span className="overline">
                      PROPOSAL ANALYSIS
                    </span>

                    <h3>
                      Analyze a proposal
                    </h3>

                    <p>
                      Enter a proposal ID to inspect
                      cyber-risk signals.
                    </p>

                    <div className="risk-input-row">
                      <input
                        className="field-input"
                        type="number"
                        placeholder="Proposal ID"
                        id="risk-proposal-id"
                      />

                      <button
                        className="primary-btn"
                        onClick={() => {
                          const value =
                            document.getElementById(
                              "risk-proposal-id"
                            ).value;

                          if (!value) {
                            notify(
                              "Enter a proposal ID."
                            );
                            return;
                          }

                          analyzeProposalRisk(
                            Number(value)
                          );
                        }}
                      >
                        Analyze
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedRiskJob && (
                <div className="risk-result-card">
                  <div className="risk-result-top">
                    <div>
                      <span className="overline">
                        JOB RISK RESULT
                      </span>

                      <h2>
                        {selectedRiskJob.title}
                      </h2>

                      <small>
                        Job #
                        {selectedRiskJob.job_id}
                      </small>
                    </div>

                    <div className="risk-score-box">
                      <strong>
                        {selectedRiskJob.risk_score}
                      </strong>

                      <span
                        className={riskClass(
                          selectedRiskJob.risk_level
                        )}
                      >
                        {selectedRiskJob.risk_level}
                      </span>
                    </div>
                  </div>

                  <div className="risk-progress">
                    <div
                      style={{
                        width: `${Math.min(
                          selectedRiskJob.risk_score,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="reason-list">
                    <span className="overline">
                      DETECTION REASONS
                    </span>

                    {selectedRiskJob.reasons?.length >
                    0 ? (
                      selectedRiskJob.reasons.map(
                        (reason, index) => (
                          <div
                            className="reason-row"
                            key={index}
                          >
                            <span>
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <p>{reason}</p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="safe-message">
                        No significant risk signals
                        detected.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedRiskProposal && (
                <div className="risk-result-card">
                  <div className="risk-result-top">
                    <div>
                      <span className="overline">
                        PROPOSAL RISK RESULT
                      </span>

                      <h2>
                        Proposal #
                        {
                          selectedRiskProposal.proposal_id
                        }
                      </h2>

                      <small>
                        Freelancer #
                        {
                          selectedRiskProposal.freelancer_id
                        }
                      </small>
                    </div>

                    <div className="risk-score-box">
                      <strong>
                        {
                          selectedRiskProposal.risk_score
                        }
                      </strong>

                      <span
                        className={riskClass(
                          selectedRiskProposal.risk_level
                        )}
                      >
                        {
                          selectedRiskProposal.risk_level
                        }
                      </span>
                    </div>
                  </div>

                  <div className="risk-progress">
                    <div
                      style={{
                        width: `${Math.min(
                          selectedRiskProposal.risk_score,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="reason-list">
                    <span className="overline">
                      DETECTION REASONS
                    </span>

                    {selectedRiskProposal.reasons
                      ?.length > 0 ? (
                      selectedRiskProposal.reasons.map(
                        (reason, index) => (
                          <div
                            className="reason-row"
                            key={index}
                          >
                            <span>
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <p>{reason}</p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="safe-message">
                        No significant risk signals
                        detected.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!selectedRiskJob &&
                !selectedRiskProposal && (
                  <div className="empty-state">
                    <span>AI</span>

                    <h3>
                      No analysis selected
                    </h3>

                    <p>
                      Enter a job or proposal ID above
                      to start a cyber-risk assessment.
                    </p>
                  </div>
                )}
            </section>
          )}

          {/* REVIEWS */}

          {activeSection === "reviews" && (
            <section>
              <div className="page-title">
                <div>
                  <span className="overline">
                    REPUTATION
                  </span>

                  <h1>
                    Reviews
                  </h1>

                  <p>
                    Manage freelancer feedback and
                    professional reputation.
                  </p>
                </div>

                {userRole === "freelancer" && (
                  <button
                    className="secondary-btn"
                    onClick={fetchReviews}
                  >
                    Refresh
                  </button>
                )}
              </div>

              {userRole === "client" ? (
                <>
                  <div className="content-card create-card">
                    <div className="card-heading">
                      <div>
                        <span className="overline">
                          FEEDBACK
                        </span>

                        <h3>
                          Review a freelancer
                        </h3>
                      </div>

                      <span className="number-label">
                        01
                      </span>
                    </div>

                    <form onSubmit={createReview}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            Freelancer ID
                          </label>

                          <input
                            className="field-input"
                            type="number"
                            name="freelancer_id"
                            value={
                              reviewForm.freelancer_id
                            }
                            onChange={reviewChange}
                            placeholder="17"
                            min="1"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Completed Job ID
                          </label>

                          <input
                            className="field-input"
                            type="number"
                            name="job_id"
                            value={
                              reviewForm.job_id
                            }
                            onChange={reviewChange}
                            placeholder="9"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>
                          Rating
                        </label>

                        <select
                          className="field-input"
                          name="rating"
                          value={
                            reviewForm.rating
                          }
                          onChange={reviewChange}
                        >
                          <option value="5">
                            5 — Excellent
                          </option>

                          <option value="4">
                            4 — Very good
                          </option>

                          <option value="3">
                            3 — Good
                          </option>

                          <option value="2">
                            2 — Needs improvement
                          </option>

                          <option value="1">
                            1 — Poor
                          </option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          Comment
                        </label>

                        <textarea
                          className="field-input textarea"
                          name="comment"
                          value={
                            reviewForm.comment
                          }
                          onChange={reviewChange}
                          placeholder="Describe your experience..."
                          rows="5"
                        />
                      </div>

                      <button
                        className="primary-btn"
                        type="submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Submitting..."
                          : "Submit review"}

                        <span>→</span>
                      </button>
                    </form>
                  </div>

                  <div className="content-card">
                    <span className="overline">
                      REVIEW POLICY
                    </span>

                    <h3>
                      Reviews strengthen trust
                    </h3>

                    <p>
                      Reviews can only be submitted for
                      completed jobs and the reviewer must
                      own the job. This protects the
                      integrity of the TrustHire reputation
                      system.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="review-summary">
                    <div className="content-card">
                      <span className="overline">
                        YOUR TRUST
                      </span>

                      <div className="review-score">
                        {trustScore
                          ? trustScore.trust_score
                          : "--"}
                      </div>

                      <strong>
                        {trustScore
                          ? trustScore.trust_level
                          : "Loading"}
                      </strong>
                    </div>

                    <div className="content-card">
                      <span className="overline">
                        TOTAL REVIEWS
                      </span>

                      <div className="review-score">
                        {reviews.length}
                      </div>

                      <strong>
                        Client feedback
                      </strong>
                    </div>
                  </div>

                  <div className="list-heading">
                    <span>
                      {reviews.length} REVIEW
                      {reviews.length === 1
                        ? ""
                        : "S"}
                    </span>

                    <small>
                      Feedback received
                    </small>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="empty-state">
                      <span>☆</span>

                      <h3>
                        No reviews yet
                      </h3>

                      <p>
                        Completed project feedback will
                        appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="review-list">
                      {reviews.map((review) => (
                        <article
                          className="review-item"
                          key={review.id}
                        >
                          <div className="review-item-top">
                            <div>
                              <span className="job-number">
                                REVIEW #
                                {review.id}
                              </span>

                              <h3>
                                Job #
                                {review.job_id}
                              </h3>
                            </div>

                            <div className="rating">
                              {"★".repeat(
                                review.rating
                              )}
                              {"☆".repeat(
                                5 - review.rating
                              )}
                            </div>
                          </div>

                          <p>
                            {review.comment ||
                              "No comment provided."}
                          </p>

                          <div className="review-meta">
                            Freelancer #
                            {review.freelancer_id}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;