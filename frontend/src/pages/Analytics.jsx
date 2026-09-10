import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
} from "lucide-react";
import "./Analytics.css";

function Analytics() {
  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>Project Analytics</h1>
          <p>
            Monitor infrastructure performance, risks and project trends.
          </p>
        </div>

        <select className="analytics-filter">
          <option>All Projects</option>
          <option>High Risk Projects</option>
          <option>Delayed Projects</option>
          <option>Completed Projects</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="analytics-stats">

        <div className="analytics-stat-card">
          <div className="stat-icon blue">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Total Projects</span>
            <h2>1,981</h2>
            <small className="positive">
              <TrendingUp size={13} /> 8.4% this month
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon green">
            <CheckCircle size={22} />
          </div>

          <div>
            <span>On Track</span>
            <h2>1,245</h2>
            <small className="positive">
              62.8% of projects
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon orange">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>At Risk</span>
            <h2>436</h2>
            <small className="warning-text">
              Requires attention
            </small>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="stat-icon purple">
            <Clock size={22} />
          </div>

          <div>
            <span>Delayed</span>
            <h2>300</h2>
            <small className="danger-text">
              Needs intervention
            </small>
          </div>
        </div>

      </div>

      {/* Main Charts */}
      <div className="analytics-grid">

        {/* Project Progress */}
        <div className="analytics-card large">
          <div className="card-header">
            <div>
              <h3>Project Progress Trend</h3>
              <p>Average physical progress over time</p>
            </div>

            <span className="chart-period">2026</span>
          </div>

          <div className="fake-chart">

            <div className="y-labels">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="chart-area">

              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>

              <svg
                className="trend-line"
                viewBox="0 0 700 250"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,205 100,180 200,165 300,140 400,125 500,85 600,70 700,45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />

                <circle cx="0" cy="205" r="5" />
                <circle cx="100" cy="180" r="5" />
                <circle cx="200" cy="165" r="5" />
                <circle cx="300" cy="140" r="5" />
                <circle cx="400" cy="125" r="5" />
                <circle cx="500" cy="85" r="5" />
                <circle cx="600" cy="70" r="5" />
                <circle cx="700" cy="45" r="5" />
              </svg>

              <div className="x-labels">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>

            </div>

          </div>
        </div>


        {/* Risk Distribution */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h3>Risk Distribution</h3>
              <p>Current project risk levels</p>
            </div>
          </div>

          <div className="risk-chart">

            <div className="donut">
              <div className="donut-inner">
                <strong>1,981</strong>
                <span>Projects</span>
              </div>
            </div>

            <div className="risk-legend">

              <div>
                <span className="legend-dot low"></span>
                <label>Low Risk</label>
                <strong>58%</strong>
              </div>

              <div>
                <span className="legend-dot medium"></span>
                <label>Medium</label>
                <strong>22%</strong>
              </div>

              <div>
                <span className="legend-dot high"></span>
                <label>High</label>
                <strong>14%</strong>
              </div>

              <div>
                <span className="legend-dot critical"></span>
                <label>Critical</label>
                <strong>6%</strong>
              </div>

            </div>
          </div>
        </div>


        {/* Cost Analysis */}
        <div className="analytics-card">
          <div className="card-header">
            <div>
              <h3>Cost Performance</h3>
              <p>Approved vs actual expenditure</p>
            </div>

            <IndianRupee size={20} />
          </div>

          <div className="cost-bars">

            <div className="cost-row">
              <div>
                <span>Approved Cost</span>
                <strong>₹ 4,850 Cr</strong>
              </div>

              <div className="bar-background">
                <div className="bar approved"></div>
              </div>
            </div>

            <div className="cost-row">
              <div>
                <span>Actual Expenditure</span>
                <strong>₹ 3,720 Cr</strong>
              </div>

              <div className="bar-background">
                <div className="bar actual"></div>
              </div>
            </div>

            <div className="cost-row">
              <div>
                <span>Projected Cost</span>
                <strong>₹ 5,210 Cr</strong>
              </div>

              <div className="bar-background">
                <div className="bar projected"></div>
              </div>
            </div>

          </div>
        </div>


        {/* ML Prediction Overview */}
        <div className="analytics-card large">
          <div className="card-header">
            <div>
              <h3>AI Prediction Overview</h3>
              <p>Projects requiring early intervention</p>
            </div>

            <span className="ai-badge">AI POWERED</span>
          </div>

          <div className="prediction-list">

            <div className="prediction-row">
              <div className="prediction-project">
                <div className="project-avatar">NH</div>

                <div>
                  <strong>NH-44 Widening Phase II</strong>
                  <span>Nagpur, Maharashtra</span>
                </div>
              </div>

              <div className="prediction-risk high">
                <span>Cost Risk</span>
                <strong>82%</strong>
              </div>

              <div className="prediction-risk high">
                <span>Delay Risk</span>
                <strong>74%</strong>
              </div>

              <span className="risk-badge high">HIGH</span>
            </div>


            <div className="prediction-row">
              <div className="prediction-project">
                <div className="project-avatar">GR</div>

                <div>
                  <strong>Godavari River Bridge</strong>
                  <span>Rajahmundry, Andhra Pradesh</span>
                </div>
              </div>

              <div className="prediction-risk medium">
                <span>Cost Risk</span>
                <strong>61%</strong>
              </div>

              <div className="prediction-risk high">
                <span>Delay Risk</span>
                <strong>79%</strong>
              </div>

              <span className="risk-badge high">HIGH</span>
            </div>


            <div className="prediction-row">
              <div className="prediction-project">
                <div className="project-avatar">MC</div>

                <div>
                  <strong>Metro Corridor Extension</strong>
                  <span>Hyderabad, Telangana</span>
                </div>
              </div>

              <div className="prediction-risk low">
                <span>Cost Risk</span>
                <strong>21%</strong>
              </div>

              <div className="prediction-risk low">
                <span>Delay Risk</span>
                <strong>18%</strong>
              </div>

              <span className="risk-badge low">LOW</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;