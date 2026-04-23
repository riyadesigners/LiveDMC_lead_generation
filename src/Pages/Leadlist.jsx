import React, { useEffect, useState } from "react";
import "./forms.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/axiosInstance";
 

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);
  const [expandedIds, setExpandedIds] = useState(new Set());  
  const [activeFilter, setActiveFilter] = useState("ALL");

    const userRole = JSON.parse(localStorage.getItem("riya_user"))?.role || "";
  const canDelete = userRole === "superadmin" || userRole === "admin";

 const statusFilters = [
    { key: "ALL",         label: "All Leads",   count: leads.filter(l => !l.parent_lead_id).length },
    { key: "NEW",         label: "New" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "CONVERTED",   label: "Converted" },
    { key: "DISCARDED",   label: "Discarded" },
  ];
const filteredLeads =
  activeFilter === "ALL"
    ? leads
    : leads.filter(l => l.status === activeFilter);

 
useEffect(() => {
  const fetchLeads = async () => {
    try {
      const res = await api.get("/getLeadList"); // MUST MATCH BACKEND
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to fetch leads", err);
    }
  };
  fetchLeads();
}, []);

const parentLeads = leads.filter(l => !l.parent_lead_id);
  const childrenOf  = (parentId) => leads.filter(l => l.parent_lead_id === parentId);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredParents =
    activeFilter === "ALL"
      ? parentLeads
      : parentLeads.filter(l => l.status === activeFilter);

      const renderRow = (lead, isChild = false) => {
    const totalPassengers =
      (Number(lead.total_adults)   || 0) +
      (Number(lead.total_children) || 0) +
      (Number(lead.total_infants)  || 0);

    const children    = childrenOf(lead.id);
    const hasChildren = children.length > 0;
    const isExpanded  = expandedIds.has(lead.id);
    return (
      <React.Fragment key={lead.id}>
        <tr className={isChild ? "child-row" : "parent-row"}>

          {/* invoice — indented for children, with expand toggle for parents */}
          <td className="text-muted">
            <div style={{ display: "flex", alignItems: "center", gap: "6px",
                          paddingLeft: isChild ? "28px" : "0" }}>
              {/* expand/collapse button only on parent rows that have children */}
              {!isChild && hasChildren && (
                <button
                  className="btn-expand"
                  type="button"
                  title={isExpanded ? "Collapse versions" : "Expand versions"}
                  onClick={() => toggleExpand(lead.id)}
                  style={{
                    background: "none", border: "1px solid #ccc",
                    borderRadius: "4px", cursor: "pointer",
                    width: "20px", height: "20px", fontSize: "15px",
                    lineHeight: "1", padding: "0", flexShrink: 0
                  }}
                >
                  {isExpanded ? "▾" : "▸"}
                </button>
              )}
              {/* version badge on child rows */}
              {isChild && (
                <span style={{
                  fontSize: "10px", background: "#e8f0fe", color: "#1a56db",
                  borderRadius: "3px", padding: "1px 5px", whiteSpace: "nowrap"
                }}>
                  ver
                </span>
              )}
              #{lead.invoice_no}
              {/* child count badge on parent */}
              {!isChild && hasChildren && (
                <span style={{
                  fontSize: "10px", background: "#fef3c7", color: "#92400e",
                  borderRadius: "10px", padding: "1px 7px", whiteSpace: "nowrap"
                }}>
                  {children.length} version{children.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </td>

          <td>{new Date(lead.created_at).toLocaleDateString("en-GB")}</td>
          <td className="lead-name">{lead.customer_name}</td>
          <td><div className="contact-email">{lead.email}</div></td>
          <td><div className="contact-mobile">{lead.mobile}</div></td>
          <td className="package-type">{lead.agent_name    || "-"}</td>
          <td className="package-type">{lead.package_types || "-"}</td>
          <td className="price">
            {lead.currency === 'THB' ? '฿' : lead.currency === 'CAD' ? 'C$' : '$'}
            {Number(lead.total_price || 0).toLocaleString()}
            {lead.currency && lead.currency !== 'USD' && (
              <small className="text-muted"> {lead.currency}</small>
            )}
          </td>
          <td>
            {totalPassengers}
            <small className="text-muted">
              &nbsp;(A:{lead.total_adults || 0}, C:{lead.total_children || 0}, I:{lead.total_infants || 0})
            </small>
          </td>

          <td className="actions">
            <i
              className="fas fa-file-invoice invoice-btn"
              title="View Invoice"
              onClick={() => navigate(`/invoice/${lead.id}`)}
              style={{ cursor: "pointer", marginRight: "10px", color: "#4285f4" }}
            ></i>
            <i
              className="fas fa-pen edit"
              title="Edit Lead"
              onClick={() => navigate(`/edit-lead/${lead.id}`)}
              style={{ cursor: "pointer" }}
            ></i>
            {canDelete && (<i
              className="fas fa-trash delete"
              title="Delete Lead"
              style={{ cursor: "pointer" }}
              onClick={() => handleDelete(lead.id)}
            ></i>
            )}
          </td>
        </tr>

        {/* render children when parent is expanded */}
        {!isChild && isExpanded && children.map(child => renderRow(child, true))}
      </React.Fragment>
    );
  };

//Delete Hndler
const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await api.delete(`/deleteLead/${id}`);
        alert("Lead deleted successfully");
        setLeads(prev => prev.filter(l => l.id !== id));   
      } catch (err) {
        console.error("Failed to delete lead", err);
        alert("Failed to delete lead. Please try again.");
      }
    }
  };
 
  return (
    <div className="container-fluid mt-4 mb-5 frontload">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary-new">All Proforma Invoice</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/new-lead")}
        >
          + Add New Proforma
        </button>
      </div>

      <div className="lead-filters">
  {statusFilters.map(f => (
    <button
      key={f.key}
      className={`filter-pill ${activeFilter === f.key ? "active" : ""}`}
      onClick={() => setActiveFilter(f.key)}
    >
      {f.label}
      {f.count !== undefined && <span>{f.count}</span>}
    </button>
  ))}
</div>

<div className="lead-card">
  <table className="lead-table">
    <thead>
      <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Contact No</th>
              <th>Agent Name</th>
              <th>Package Type</th>
              <th>Total Price</th>
              <th>Passengers</th>
              {/* <th>Status</th> */}
              <th>Action</th>
      </tr>
    </thead>

    <tbody>
            {filteredParents.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-danger" style={{ padding: "20px" }}>
                  No Lead found
                </td>
              </tr>
            ) : (
              filteredParents.map(lead => renderRow(lead, false))
            )}
          </tbody>
  </table>

  <div className="table-footer">
    Showing 1–{filteredLeads.length} of {leads.length} leads
  </div>
</div>


 
    </div>
  );
};

export default LeadList;
