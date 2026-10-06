import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [userId, setUserId] = useState(
    localStorage.getItem("userId") || ""
  );

  const [workouts, setWorkouts] = useState([]);
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [workout, setWorkout] = useState({
    workoutName: "",
    category: "",
    duration: "",
    caloriesBurned: "",
    workoutDate: "",
  });

  const [aiForm, setAiForm] = useState({
    age: "",
    fitnessGoal: "",
    experienceLevel: "",
  });

  // =========================
  // FORM HANDLERS
  // =========================

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleWorkout = (e) => {
    setWorkout({
      ...workout,
      [e.target.name]: e.target.value,
    });
  };

  const handleAIForm = (e) => {
    setAiForm({
      ...aiForm,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      alert("Registration successful! Please login.");

      setForm({
        name: "",
        email: "",
        password: "",
      });

      setPage("login");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  // =========================
  // LOGIN
  // =========================

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API}/login`,
        {
          email: form.email,
          password: form.password,
        }
      );

      const receivedToken =
        response.data.token ||
        response.data.accessToken;

      if (!receivedToken) {
        alert("Token was not received.");
        return;
      }

      setToken(receivedToken);

      localStorage.setItem(
        "token",
        receivedToken
      );

      const receivedUserId =
        response.data.user?._id ||
        response.data.user?.id ||
        response.data.userId ||
        "";

      if (receivedUserId) {
        setUserId(receivedUserId);

        localStorage.setItem(
          "userId",
          receivedUserId
        );
      }

      setPage("dashboard");

      alert("Login successful!");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  // =========================
  // ADD WORKOUT
  // =========================

  const addWorkout = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login first.");
      setPage("login");
      return;
    }

    try {
      await axios.post(
        `${API}/workouts`,
        {
          workoutName: workout.workoutName,
          category: workout.category,
          duration: Number(workout.duration),
          caloriesBurned: Number(
            workout.caloriesBurned
          ),
          workoutDate: workout.workoutDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Workout added successfully!");

      setWorkout({
        workoutName: "",
        category: "",
        duration: "",
        caloriesBurned: "",
        workoutDate: "",
      });

      setPage("dashboard");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to add workout"
      );
    }
  };

  // =========================
  // GET ALL WORKOUTS
  // =========================

  const getWorkouts = async () => {
    if (!token) {
      alert("Please login first.");
      setPage("login");
      return;
    }

    if (!userId) {
      alert(
        "User ID not available. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/workouts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkouts(
        response.data.workouts || []
      );

      setPage("history");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to get workouts"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH WORKOUT
  // =========================

  const searchWorkout = async () => {
    const search = window.prompt(
      "Enter workout name or category:"
    );

    if (!search) return;

    if (!userId) {
      alert(
        "User ID not available. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/workouts/search/${userId}?name=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkouts(
        response.data.workouts || []
      );

      setPage("history");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Search failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE WORKOUT
  // =========================

  const deleteWorkout = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this workout?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API}/workouts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Workout deleted successfully!");

      getWorkouts();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete workout"
      );
    }
  };

  // =========================
  // UPDATE WORKOUT
  // =========================

  const updateWorkout = async (id, item) => {
    const workoutName = window.prompt(
      "Workout Name:",
      item.workoutName
    );

    if (!workoutName) return;

    const category = window.prompt(
      "Category:",
      item.category
    );

    if (!category) return;

    const duration = window.prompt(
      "Duration in minutes:",
      item.duration
    );

    if (!duration) return;

    const caloriesBurned = window.prompt(
      "Calories Burned:",
      item.caloriesBurned
    );

    if (!caloriesBurned) return;

    try {
      await axios.put(
        `${API}/workouts/${id}`,
        {
          workoutName,
          category,
          duration: Number(duration),
          caloriesBurned: Number(
            caloriesBurned
          ),
          workoutDate: item.workoutDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Workout updated successfully!");

      getWorkouts();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update workout"
      );
    }
  };

  // =========================
  // AI RECOMMENDATION
  // =========================

  const generateRecommendation = async () => {
    if (!aiForm.age) {
      alert("Please enter your age.");
      return;
    }

    if (!aiForm.fitnessGoal) {
      alert("Please select your fitness goal.");
      return;
    }

    if (!aiForm.experienceLevel) {
      alert(
        "Please select your experience level."
      );
      return;
    }

    try {
      setLoading(true);
      setAiResult("");

      const response = await axios.post(
        `${API}/ai/recommend-workout`,
        {
          age: Number(aiForm.age),
          fitnessGoal: aiForm.fitnessGoal,
          experienceLevel:
            aiForm.experienceLevel,
        }
      );

      setAiResult(
        response.data.recommendation ||
          "No recommendation received."
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "AI recommendation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // AI FITNESS INSIGHTS
  // =========================

  const generateInsights = async () => {
    if (!token) {
      alert("Please login first.");
      setPage("login");
      return;
    }

    if (!userId) {
      alert(
        "User ID not available. Please login again."
      );
      return;
    }

    try {
      setLoading(true);
      setAiResult("");

      // Get latest workouts
      const response = await axios.get(
        `${API}/workouts/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const currentWorkouts =
        response.data.workouts || [];

      setWorkouts(currentWorkouts);

      if (currentWorkouts.length === 0) {
        setAiResult(
          "No workout data available. Add workouts first."
        );
        return;
      }

      const totalWorkouts =
        currentWorkouts.length;

      const totalDuration =
        currentWorkouts.reduce(
          (sum, item) =>
            sum + Number(item.duration || 0),
          0
        );

      const totalCalories =
        currentWorkouts.reduce(
          (sum, item) =>
            sum +
            Number(
              item.caloriesBurned || 0
            ),
          0
        );

      const averageDuration =
        totalDuration / totalWorkouts;

      const aiResponse = await axios.post(
        `${API}/ai/fitness-insights`,
        {
          totalWorkouts,
          averageDuration,
          caloriesBurned: totalCalories,
        }
      );

      setAiResult(
        aiResponse.data.insights ||
          "No fitness insights received."
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "AI fitness insights failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    setToken("");
    setUserId("");
    setWorkouts([]);
    setAiResult("");

    setPage("login");
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (page === "login") {
    return (
      <div className="app">
        <div className="card">
          <h1>🏋️ AI FitTrack</h1>

          <p>
            Personalized Fitness
            Recommendations powered by AI
          </p>

          <h2>Login</h2>

          <form onSubmit={login}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleForm}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={handleForm}
              required
            />

            <button type="submit">
              Login
            </button>
          </form>

          <p className="switchText">
            Don't have an account?
          </p>

          <button
            className="linkButton"
            onClick={() =>
              setPage("register")
            }
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // REGISTER PAGE
  // =========================

  if (page === "register") {
    return (
      <div className="app">
        <div className="card">
          <h1>🏋️ AI FitTrack</h1>

          <h2>Create Account</h2>

          <form onSubmit={register}>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={form.name}
              onChange={handleForm}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleForm}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleForm}
              required
            />

            <button type="submit">
              Register
            </button>
          </form>

          <p className="switchText">
            Already have an account?
          </p>

          <button
            className="linkButton"
            onClick={() =>
              setPage("login")
            }
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  if (page === "dashboard") {
    return (
      <div className="dashboard">
        <nav>
          <h2>🏋️ AI FitTrack</h2>

          <button
            onClick={() =>
              setPage("dashboard")
            }
          >
            Home
          </button>

          <button
            onClick={() =>
              setPage("add")
            }
          >
            Add Workout
          </button>

          <button onClick={getWorkouts}>
            Workout History
          </button>

          <button
            onClick={() =>
              setPage("ai")
            }
          >
            AI Assistant
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </nav>

        <div className="content">
          <h1>
            Welcome to AI FitTrack 👋
          </h1>

          <p>
            Track your workouts and get
            personalized fitness guidance.
          </p>

          <div className="cards">
            <div className="feature">
              <h3>
                🏋️ Workout Management
              </h3>

              <p>
                Add and manage your workout
                records.
              </p>

              <button
                onClick={() =>
                  setPage("add")
                }
              >
                Add Workout
              </button>
            </div>

            <div className="feature">
              <h3>
                📋 Workout History
              </h3>

              <p>
                View, search, edit and delete
                your workouts.
              </p>

              <button
                onClick={getWorkouts}
              >
                View History
              </button>
            </div>

            <div className="feature">
              <h3>🤖 AI Assistant</h3>

              <p>
                Get personalized AI fitness
                recommendations.
              </p>

              <button
                onClick={() =>
                  setPage("ai")
                }
              >
                Open AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ADD WORKOUT
  // =========================

  if (page === "add") {
    return (
      <div className="dashboard">
        <nav>
          <h2>🏋️ AI FitTrack</h2>

          <button
            onClick={() =>
              setPage("dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={getWorkouts}
          >
            History
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </nav>

        <div className="content">
          <h1>➕ Add Workout</h1>

          <form
            className="workoutForm"
            onSubmit={addWorkout}
          >
            <input
              name="workoutName"
              placeholder="Workout Name"
              value={
                workout.workoutName
              }
              onChange={handleWorkout}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={workout.category}
              onChange={handleWorkout}
              required
            />

            <input
              type="number"
              name="duration"
              placeholder="Duration (minutes)"
              value={workout.duration}
              onChange={handleWorkout}
              required
            />

            <input
              type="number"
              name="caloriesBurned"
              placeholder="Calories Burned"
              value={
                workout.caloriesBurned
              }
              onChange={handleWorkout}
              required
            />

            <input
              type="date"
              name="workoutDate"
              value={
                workout.workoutDate
              }
              onChange={handleWorkout}
              required
            />

            <button type="submit">
              Save Workout
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================
  // WORKOUT HISTORY
  // =========================

  if (page === "history") {
    return (
      <div className="dashboard">
        <nav>
          <h2>🏋️ AI FitTrack</h2>

          <button
            onClick={() =>
              setPage("dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              setPage("add")
            }
          >
            Add Workout
          </button>

          <button onClick={searchWorkout}>
            🔍 Search
          </button>

          <button onClick={getWorkouts}>
            🔄 Refresh
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </nav>

        <div className="content">
          <h1>📋 Workout History</h1>

          {loading ? (
            <div className="loading">
              <h3>Loading workouts...</h3>
            </div>
          ) : workouts.length === 0 ? (
            <div className="emptyBox">
              <h3>
                No workouts found
              </h3>

              <button
                onClick={() =>
                  setPage("add")
                }
              >
                Add Your First Workout
              </button>
            </div>
          ) : (
            <div className="workoutList">
              {workouts.map(
                (item) => (
                  <div
                    className="workoutItem"
                    key={item._id}
                  >
                    <h3>
                      🏋️{" "}
                      {item.workoutName}
                    </h3>

                    <p>
                      <b>
                        Category:
                      </b>{" "}
                      {item.category}
                    </p>

                    <p>
                      <b>
                        Duration:
                      </b>{" "}
                      {item.duration} minutes
                    </p>

                    <p>
                      <b>
                        Calories:
                      </b>{" "}
                      {
                        item.caloriesBurned
                      }
                    </p>

                    <p>
                      <b>Date:</b>{" "}
                      {new Date(
                        item.workoutDate
                      ).toLocaleDateString()}
                    </p>

                    <div className="workoutButtons">
                      <button
                        onClick={() =>
                          updateWorkout(
                            item._id,
                            item
                          )
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="deleteButton"
                        onClick={() =>
                          deleteWorkout(
                            item._id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // AI PAGE
  // =========================

  if (page === "ai") {
    return (
      <div className="dashboard">
        <nav>
          <h2>🏋️ AI FitTrack</h2>

          <button
            onClick={() =>
              setPage("dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              setPage("add")
            }
          >
            Add Workout
          </button>

          <button onClick={getWorkouts}>
            Workout History
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </nav>

        <div className="content">
          <h1>
            🤖 AI Fitness Assistant
          </h1>

          <p>
            Get personalized workout
            recommendations and fitness
            insights.
          </p>

          {/* AI Recommendation */}

          <div className="aiBox">
            <h2>
              🏋️ Workout Recommendation
            </h2>

            <input
              type="number"
              name="age"
              placeholder="Enter Age"
              value={aiForm.age}
              onChange={handleAIForm}
            />

            <select
              name="fitnessGoal"
              value={
                aiForm.fitnessGoal
              }
              onChange={handleAIForm}
            >
              <option value="">
                Select Fitness Goal
              </option>

              <option value="Weight Loss">
                Weight Loss
              </option>

              <option value="Weight Management">
                Weight Management
              </option>

              <option value="Muscle Building">
                Muscle Building
              </option>

              <option value="General Fitness">
                General Fitness
              </option>
            </select>

            <select
              name="experienceLevel"
              value={
                aiForm.experienceLevel
              }
              onChange={handleAIForm}
            >
              <option value="">
                Select Experience Level
              </option>

              <option value="Beginner">
                Beginner
              </option>

              <option value="Intermediate">
                Intermediate
              </option>

              <option value="Advanced">
                Advanced
              </option>
            </select>

            <button
              onClick={
                generateRecommendation
              }
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "Generate Recommendation"}
            </button>
          </div>

          {/* AI Insights */}

          <div className="aiBox">
            <h2>
              📊 Fitness Insights
            </h2>

            <p>
              Analyze your recorded
              workouts and generate
              AI-powered fitness insights.
            </p>

            <button
              onClick={
                generateInsights
              }
              disabled={loading}
            >
              {loading
                ? "Generating..."
                : "Generate Insights"}
            </button>
          </div>

          {/* AI Result */}

          {aiResult && (
            <div className="aiResult">
              <h2>
                ✨ AI Result
              </h2>

              <p>
                {aiResult}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default App;