import React, { useEffect, useState } from "react";
import "./forms.css";
import "../Components/layout.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
// import Footer from "../Components/Footer"
 
 
const MiniBar = ({ value, max, color }) => (
  <div className="mini-bar">
    <div
      className="mini-bar-fill"
      style={{
        width: `${max ? Math.min((value / max) * 100, 100) : 0}%`,
        background: color,
      }}
    />
  </div>
);
 
const StatCard = ({ label, value, icon, accent, sub, barValue, barMax }) => (
  <div className="stat-card" style={{ borderTop: `4px solid ${accent}` }}>
  <div className="stat-glow" style={{ background: accent }} />

  <div className="stat-header">
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>

    <div className="stat-icon" style={{ background: accent + "18" }}>
      {icon}
    </div>
  </div>

  {barMax != null && (
    <MiniBar value={barValue ?? 0} max={barMax} color={accent} />
  )}
</div>
);

 
const RecentRow = ({ lead, index, navigate }) => {
  const total =
    (Number(lead.total_adults) || 0) +
    (Number(lead.total_children) || 0) +
    (Number(lead.total_infants) || 0);

  return (
    <tr
      className="parent-row"
      style={{ cursor: "pointer", transition: "background .15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f9fbff")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      onClick={() => navigate(`/invoice/${lead.id}`)}
    >
      <td style={{ padding: "11px 14px", color: "#aaa", fontSize: 13 }}>{index + 1}</td>
      <td style={{ padding: "11px 8px" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, background: "#dde9f4",
          color: "var(--color-ocean)", borderRadius: 5, padding: "2px 8px",
        }}>
          #{lead.invoice_no}
        </span>
      </td>
      <td style={{ padding: "11px 8px" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#2d2d2d" }}>{lead.customer_name}</div>
        <div style={{ fontSize: 12, color: "#aaa" }}>{lead.email}</div>
      </td>
      <td style={{ padding: "11px 8px", fontSize: 13, color: "#555" }}>{lead.agent_name || "—"}</td>
      <td style={{ padding: "11px 8px" }}>
        <span style={{
          background: "#dde9f4", color: "var(--color-ocean)",
          borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 600,
        }}>
          {lead.package_types || "—"}
        </span>
      </td>
      <td style={{ padding: "11px 8px", fontWeight: 700, color: "var(--color-ocean)", fontSize: 13 }}>
        ${Number(lead.total_price || 0).toLocaleString()}
      </td>
      <td style={{ padding: "11px 8px", fontSize: 13, color: "#666" }}>
        {total}<small style={{ color: "#aaa" }}> pax</small>
      </td>
    </tr>
  );
};
 
 
const Dashboard = () => {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("riya_user") || "{}");
  const userRole = userData?.role?.toLowerCase() || "";
  const isUser = userRole === "user";

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get("/getLeadList");
        setLeads(res.data);
      } catch (err) {
        console.error("Failed to fetch leads", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  /* ── derived stats ── */
  const parents      = leads.filter(l => !l.parent_lead_id);
  const totalLeads   = parents.length;
  const countOf      = (s) => parents.filter(l => l.status === s).length;
  const totalRevenue = leads.reduce((sum, l) => sum + Number(l.total_price || 0), 0);
  const totalPax     = leads.reduce((sum, l) =>
    sum + (Number(l.total_adults) || 0) + (Number(l.total_children) || 0) + (Number(l.total_infants) || 0), 0
  );

  /* top agents */
  const agentMap = {};
  parents.forEach(l => {
    const a = l.agent_name || "Unknown";
    agentMap[a] = (agentMap[a] || 0) + 1;
  });
  const topAgents = Object.entries(agentMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* package breakdown */
  const pkgMap = {};
  leads.forEach(l => {
    if (l.package_types) {
      l.package_types.split(", ").forEach(p => {
        pkgMap[p.trim()] = (pkgMap[p.trim()] || 0) + 1;
      });
    }
  });
  const topPkgs = Object.entries(pkgMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  /* filter pills */
  const filters = [
    { key: "ALL",         label: "All Leads",   count: totalLeads,             color: "var(--color-ocean)" },
    { key: "NEW",         label: "New",         count: countOf("NEW"),         color: "var(--color-steel)" },
    { key: "IN_PROGRESS", label: "In Progress", count: countOf("IN_PROGRESS"), color: "#e8a838" },
    { key: "CONVERTED",   label: "Converted",   count: countOf("CONVERTED"),   color: "var(--color-sage)" },
    { key: "DISCARDED",   label: "Discarded",   count: countOf("DISCARDED"),   color: "#d95c5c" },
  ];

  const filteredLeads = activeFilter === "ALL"
    ? parents
    : parents.filter(l => l.status === activeFilter);

  /* theme accent colours */
  const C = {
    total:     "#2e8fb5",
    new:       "#8fbb9a",
    progress:  "#e8a838",
    converted: "#8fbb9a",
    discarded: "#d95c5c",
    revenue:   "#2e8fb5",
    pax:       "#8fb5c8",
  };

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320, fontFamily: "Poppins, sans-serif" }}>
      <div style={{ textAlign: "center", color: "var(--color-ocean)" }}>
        <div style={{ fontSize: 38, marginBottom: 10 }}>🔄</div>
        <p style={{ fontWeight: 600 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    // <div className="frontload" style={{ fontFamily: "Poppins, sans-serif", background: "#f7fafc", minHeight: "100vh" }}>
<div className="frontload" >
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h2 className="text-primary-new">Dashboard</h2>
          <p style={{ margin: "3px 0 0", color: "#888", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/new-lead")}
          
        >
          + New Proforma
        </button>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Leads"   value={totalLeads}                          icon="📋" accent={C.total}     sub="unique proformas"    barValue={totalLeads}             barMax={totalLeads || 1} />
        <StatCard label="New"           value={countOf("NEW")}                      icon="🆕" accent={C.new}       sub="awaiting action"     barValue={countOf("NEW")}         barMax={totalLeads || 1} />
        <StatCard label="In Progress"   value={countOf("IN_PROGRESS")}              icon="⚙️" accent={C.progress}  sub="being worked on"     barValue={countOf("IN_PROGRESS")} barMax={totalLeads || 1} />
        <StatCard label="Converted"     value={countOf("CONVERTED")}                icon="✅" accent={C.converted} sub="closed & won"        barValue={countOf("CONVERTED")}   barMax={totalLeads || 1} />
        <StatCard label="Discarded"     value={countOf("DISCARDED")}                icon="🗑️" accent={C.discarded} sub="closed / lost"       barValue={countOf("DISCARDED")}   barMax={totalLeads || 1} />
        {!isUser && (<StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="💰" accent={C.revenue}  sub="across all versions" />)}
        <StatCard label="Total Pax"     value={totalPax.toLocaleString()}           icon="👥" accent={C.pax}      sub="adults + children + infants" />
      </div>

      {/* ── FILTER PILLS ────────────────────────────────────────── */}
      <div className="lead-filters" style={{ marginBottom: 22 }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              background:  activeFilter === f.key ? f.color : "#fff",
              color:       activeFilter === f.key ? "#fff"  : "#555",
              border:      `2px solid ${activeFilter === f.key ? f.color : "#e5e7eb"}`,
              borderRadius: 25,
              padding: "6px 16px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all .2s",
              boxShadow: activeFilter === f.key ? `0 4px 12px ${f.color}40` : "none",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {f.label}
            <span style={{
              background: activeFilter === f.key ? "rgba(255,255,255,.25)" : f.color + "20",
              color:      activeFilter === f.key ? "#fff" : f.color,
              borderRadius: 99, padding: "0 7px", fontSize: 12, fontWeight: 700,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>

        {/* ── RECENT PROFORMAS TABLE ───────────────────────────── */}
        <div className="lead-card" style={{ flex: "2 1 480px", overflow: "hidden", borderRadius: 12 }}>
          <div style={{
            padding: "15px 20px",
            borderBottom: "1px solid #eef2f7",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h4 className="section-title" style={{ margin: 0, border: "none", paddingBottom: 0, fontSize: 15 }}>
              Recent Proformas
              <span style={{
                marginLeft: 10, fontSize: 11, background: "#dde9f4",
                color: "var(--color-ocean)", borderRadius: 5, padding: "2px 8px", fontWeight: 700,
              }}>
                {filteredLeads.length}
              </span>
            </h4>
            <button
              onClick={() => navigate("/lead-list")}
              style={{
                background: "none", border: "1px solid #e5e7eb", borderRadius: 25,
                padding: "5px 14px", fontSize: 12, color: "var(--color-ocean)",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              View All →
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="lead-table">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Invoice", "Customer", "Agent", "Package", "Value", "Pax"].map(h => (
                    <th key={h} style={{ fontSize: 11, color: "#7f8c8d", textTransform: "uppercase", letterSpacing: ".07em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#aaa", fontSize: 13 }}>
                      No leads in this category
                    </td>
                  </tr>
                ) : (
                  filteredLeads.slice(0, 6).map((lead, i) => (
                    <RecentRow key={lead.id} lead={lead} index={i} navigate={navigate} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {Math.min(filteredLeads.length, 6)} of {filteredLeads.length} leads
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 16, minWidth: 220 }}>

          {/* TOP AGENTS */}
          <div className="lead-card" style={{ padding: "18px 20px", borderRadius: 12 }}>
            <h4 className="section-title" style={{ fontSize: 14 }}>🏆 Top Agents</h4>
            {topAgents.length === 0
              ? <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>No data yet</p>
              : topAgents.map(([name, count], i) => (
                <div key={name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#2d2d2d" }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  "}&nbsp;{name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ocean)" }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "#eef2f7", borderRadius: 99 }}>
                    <div style={{
                      height: "100%",
                      width: `${(count / (topAgents[0]?.[1] || 1)) * 100}%`,
                      background: i === 0 ? "#0d6efd" : i === 1 ? "#4C92A9" : "#2aadee",
                      borderRadius: 99, transition: "width 1.2s",
                    }} />
                  </div>
                </div>
              ))
            }
          </div>

          {/* PACKAGE TYPES */}
          {/* <div className="lead-card" style={{ padding: "18px 20px", borderRadius: 12 }}>
            <h4 className="section-title" style={{ fontSize: 14 }}>📦 Package Types</h4>
            {topPkgs.length === 0
              ? <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>No data yet</p>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {topPkgs.map(([name, count]) => (
                    <div key={name} style={{
                      background: "#dde9f4", borderRadius: 8,
                      padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--color-ocean)",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {name}
                      <span style={{
                        background: "#0d6efd", color: "#fff",
                        borderRadius: 99, padding: "0 7px", fontSize: 11, fontWeight: 700,
                      }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div> */}

          {/* REVENUE SUMMARY */}
          {!isUser && (
          <div className="lead-card" style={{ padding: "16px 20px", borderRadius: 12 }}>
            <h4 className="section-title" style={{ fontSize: 14 }}>📊 Revenue Summary</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`,  color: "var(--color-ocean)" },
                { label: "Total Pax",     value: `${totalPax} pax`,                     color: "var(--color-steel)" },
                { label: "Avg per Lead",  value: totalLeads ? `$${Math.round(totalRevenue / totalLeads).toLocaleString()}` : "—", color: "var(--color-steel)" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", background: "#f7fafc", borderRadius: 8,
                }}>
                  <span style={{ fontSize: 13, color: "#555" }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* QUICK ACTIONS */}
          <div style={{
            background: "linear-gradient(135deg, var(--color-ocean) 0%, var(--color-steel) 100%)",
            borderRadius: 12, padding: "18px 20px", color: "#fff",
            boxShadow: "0 8px 24px rgba(46,143,181,0.25)",
          }}>
            <h4 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14 }}>⚡ Quick Actions</h4>
            {[
              { label: "Add New Proforma", icon: "➕", path: "/new-lead" },
              { label: "View All Leads",   icon: "📋", path: "/lead-list" },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.3)", borderRadius: 25,
                  padding: "9px 14px", color: "#fff", fontWeight: 600,
                  fontSize: 13, cursor: "pointer", marginBottom: 8,
                  transition: "background .2s", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.28)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
              >
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>

        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;
