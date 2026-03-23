import React, { useState, useEffect } from "react";    
import "./forms.css";
 
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";   
import api from "../api/axiosInstance";

const LeadForm = () => {
  // id      = version-mode (/new-lead/:id)  — creates a child lead
  // editId  = edit-mode   (/edit-lead/:editId) — updates existing lead
  const { id, editId } = useParams();
  const isChildMode = Boolean(id);
  const isEditMode  = Boolean(editId);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const [agentName, setAgentName] = useState("");
  const [agentContact, setAgentContact] = useState("");
  const [agentAddress, setAgentAddress] = useState("");

  const [packageType, setPackageType] = useState("");
  const [pkgamount, setPkgAmount] = useState("")
  const [inclusion, setInclusion] = useState("");
  const [itineraries, setItineraries] = useState([]);
 const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencyRates, setCurrencyRates] = useState({});

   const [formData, setFormData] = useState({
    invoice_no: "",
    customer_name: "",
    custemail: "",
    custmobile: "",
    alternateno: "",
    contact_person: "",
    custaddress: "",
    adult: 0,
    child: 0,
    infant: 0,
    adult_price: "",
    child_price: "",
    infant_price: "",
    bank_charge: "",
    remark: "",
  });

   const generateChildInvoice = (parentInvoice) => {
    const versionMatch = parentInvoice.match(/^(.+)-v(\d+)$/);
    if (versionMatch) {
      const base    = versionMatch[1];
      const version = parseInt(versionMatch[2], 10) + 1;
      return `${base}-v${version}`;
    }
    return `${parentInvoice}-v2`;
  };

  // useEffect(()=>{
  //   if(!id) return;
  //   const fetchLead = async () =>{
  //     try{
  //       const res = await api.get(`/riya_dmclead/getInvoice/${id}`);
  //       const {lead, itineraries: existingItineraries } = res.data;
  //       setFormData({
  //         invoice_no:     generateChildInvoice(lead.invoice_no),
  //         customer_name: lead.customer_name || "",
  //         custemail: lead.email || "",
  //         custmobile : lead.mobile || "",
  //         alternateno : lead.alternate_contact || "",
  //         contact_person : lead.contact_person || "",
  //         custaddress : lead.address || "",
  //         bank_charge : lead.bank_charge || "",
  //         remark: lead.remark || "",

  //         adult: 0, child: 0, infant:0,
  //         adult_price:"", child_price:"", infant_price:""
  //       });
  //       setAgentName(lead.agent_name || "");
  //       setAgentContact(lead.agent_contact || "");
  //       setAgentAddress(lead.agent_address || "");

  //       setItineraries(existingItineraries.map(it => ({
  //         packageType: it.package_type,
  //         inclusion:   it.inclusions,
  //         adultCount:  it.adult_count,
  //         childCount:  it.child_count,
  //         infantCount: it.infant_count,
  //         adultTotal:  it.adult_total,
  //         childTotal:  it.child_total,
  //         infantTotal: it.infant_total,
  //         total:       it.total,
  //       })));
  //     }
  //     catch(err){
  //       console.error("Failed to fetch lead for editing:", err);
  //       alert("Could not load lead data. Please try again.");
  //     }
  //   }
  //   fetchLead();
  // }, [id]);

//    const convertAmount = (amount) => {
//   const rate = currencyRates?.[selectedCurrency]?.rate ?? 1;
//   return (parseFloat(amount || 0) * rate).toFixed(2);
// };

const CURRENCY_SYMBOLS = {
  USD: "$",
  THB: "฿",
  CAD: "C$",
};

const getCurrencySymbol = () => CURRENCY_SYMBOLS[selectedCurrency] || "$";


useEffect(() => {
    if (!id) return;
    const fetchLeadById = async () => {
      try {
        const res = await api.get(`/riya_dmclead/getInvoice/${id}`);
        const { lead, itineraries: existingItineraries } = res.data;

        // Map backend field names to formData keys
        setFormData({
          invoice_no:     generateChildInvoice(lead.invoice_no),
          customer_name:  lead.customer_name     || "",
          custemail:      lead.email             || "",
          custmobile:     lead.mobile            || "",
          alternateno:    lead.alternate_contact || "",
          contact_person: lead.contact_person    || "",
          custaddress:    lead.address           || "",
          bank_charge:    lead.bank_charge       || "",
          remark:         lead.remark            || "",
          adult: 0, child: 0, infant: 0,
          adult_price: "", child_price: "", infant_price: "",
        });

        // Agent fields are separate state variables
        setAgentName(lead.agent_name     || "");
        setAgentContact(lead.agent_contact || "");
        setAgentAddress(lead.agent_address || "");

        // Populate itineraries table
        setItineraries(existingItineraries.map(it => ({
          packageType: it.package_type,
          pkgamount : it.pkgamount,
          inclusion:   it.inclusions,
          adultCount:  it.adult_count,
          childCount:  it.child_count,
          infantCount: it.infant_count,
          adultTotal:  it.adult_total,
          childTotal:  it.child_total,
          infantTotal: it.infant_total,
          totalUSD: it.total,
          currency: selectedCurrency   
        })));
      } catch (error) {
        console.error("Error fetching lead:", error);
        alert("Could not load lead data. Please try again.");
      }
    };
    fetchLeadById();
  }, [id]);

  
// useEffect(() => {
//   const fetchRates = async () => {
//     const res = await fetch("https://open.er-api.com/v6/latest/USD");
//     const data = await res.json();

//     setCurrencyRates({
//       USD: { rate: 1, symbol: "$", name: "US DOLLARS" },
//       THB: { rate: data.rates.THB, symbol: "฿", name: "BAHT" },
//       CAD: { rate: data.rates.CAD, symbol: "C$", name: "CANADIAN DOLLARS" },
//     });
//   };

//   fetchRates();
// }, []);
  // ── EDIT mode: bind existing lead data (invoice_no unchanged) ───────────────
  useEffect(() => {
    if (!editId) return;
    const fetchForEdit = async () => {
      try {
        const res = await api.get(`/riya_dmclead/getInvoice/${editId}`);
        const { lead, itineraries: existingItineraries } = res.data;

        setFormData({
          invoice_no:     lead.invoice_no        || "",   // keep original
          customer_name:  lead.customer_name     || "",
          custemail:      lead.email             || "",
          custmobile:     lead.mobile            || "",
          alternateno:    lead.alternate_contact || "",
          contact_person: lead.contact_person    || "",
          custaddress:    lead.address           || "",
          bank_charge:    lead.bank_charge       || "",
          remark:         lead.remark            || "",
          adult: 0, child: 0, infant: 0,
          adult_price: "", child_price: "", infant_price: "",
        });

        setAgentName(lead.agent_name     || "");
        setAgentContact(lead.agent_contact || "");
        setAgentAddress(lead.agent_address || "");

        setItineraries(existingItineraries.map(it => ({
          packageType: it.package_type,
          pkgamount : it.pkgamount,
          inclusion:   it.inclusions,
          adultCount:  it.adult_count,
          childCount:  it.child_count,
          infantCount: it.infant_count,
          adultTotal:  it.adult_total,
          childTotal:  it.child_total,
          infantTotal: it.infant_total,
          totalUSD: it.total,   
          currency: selectedCurrency   
        })));
      } catch (error) {
        console.error("Error fetching lead for edit:", error);
        alert("Could not load lead data. Please try again.");
      }
    };
    fetchForEdit();
  }, [editId]);

  const handleAddItinerary = async () => {
    if (!packageType) return; // optional validation
    const adultTotal = Number(formData.adult) * Number(formData.adult_price || 0);
    const childTotal = Number(formData.child) * Number(formData.child_price || 0);
    const infantTotal = Number(formData.infant) * Number(formData.infant_price || 0);
    const calculatedTotal = adultTotal + childTotal + infantTotal;

    const finalTotal = pkgamount ? Number(pkgamount) :calculatedTotal;
    console.log(finalTotal);
    const newItem = {
      packageType,
      pkgamount,
      inclusion,
      adultCount: formData.adult,
      childCount: formData.child,
      infantCount: formData.infant,
      adultTotal,
      childTotal,
      infantTotal,
      totalUSD: finalTotal,
      currency: selectedCurrency 
    };
   
    setItineraries([...itineraries, newItem]);

    // Reset fields
    setPackageType("");
    setPkgAmount("");
    setInclusion("");
    setFormData((prev) => ({
      ...prev,
      adult: 0, child: 0, infant: 0,
      adult_price: "", child_price: "", infant_price: "",
    }));
  };

 

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //check invoice number already exists or not
  const checkInvoiceExists = async (invoiceNo) => {
    if (!invoiceNo || !invoiceNo.trim()) return false;
    try {
      const response = await api.get(`/riya_dmclead/checkInvoice/${invoiceNo}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking invoice:", error);
      return false;
    }
  };
  // handler for real time validation of invoice number
  const handleInvoiceChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, invoice_no: "" }));
    if (!isChildMode && value.trim()) {
      const exists = await checkInvoiceExists(value.toUpperCase());
      if (exists) setErrors(prev => ({ ...prev, invoice_no: "Invoice number already exists" }));
    }
  };

  const validateLeadForm = () => {
    const newErrors = {};
    if (!formData.invoice_no?.trim())
      newErrors.invoice_no = "Invoice number is required";

    if (!formData.customer_name || !formData.customer_name?.trim()) {
      newErrors.customer_name = "Customer name is required";
    }
    if (!formData.custemail?.trim()) newErrors.custemail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.custemail))
      newErrors.custemail = "Invalid email";

    // if (!formData.custmobile?.trim())
    //   newErrors.custmobile = "Mobile number is required";

    // if (formData.adult < 1) newErrors.adult = "At least 1 adult is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateLeadForm()) return;
    if (errors.invoice_no) {
      alert("Please fix the errors before submitting.");
      return;
    }
    const payload = {
      invoice_no:       formData.invoice_no,
      customer_name:    formData.customer_name,
      email:            formData.custemail,
      mobile:           formData.custmobile,
      alternate_mobile: formData.alternateno,
      contact_person:   formData.contact_person,
      address:          formData.custaddress,
      agent_name:       agentName,
      agent_contact:    agentContact,
      agent_address:    agentAddress,
      bank_charge:      formData.bank_charge,
      remark:           formData.remark,
      grand_total:      grandTotalUSD,
      currency: selectedCurrency,
      itineraries,
      adult:            formData.adult,
      child:            formData.child,
      infant:           formData.infant,
      parent_lead_id:   isChildMode ? Number(id) : null,   
    };

    try {
      if (isEditMode) {
        await api.put(`/riya_dmclead/updateLead/${editId}`, payload);
        alert("Lead updated successfully!");
      } else {
        await api.post("/riya_dmclead/createLead", payload);
        alert(isChildMode ? "New version created successfully!" : "Lead saved successfully!");
      }
      navigate("/Leadlist");
    } catch (error) {
      console.error("Error saving lead:", error);
      if (error.response?.data?.error === "DUPLICATE_INVOICE") {
        setErrors({ invoice_no: "Invoice number already exists" });
        alert(
          "Invoice number already exists. Please use a different invoice number.",
        );
      } else {
        alert("Failed to save lead. Please try again.");
      }
    }
  };

  function PassengerCounter({ label, value, setValue }) {
    return (
      <div className="counter   modern-input">
        <span>{label}</span>
        {/* <span style={{width:'60%'}}> */}
        <button type="button" onClick={() => setValue(Math.max(0, value - 1))}>
          -
        </button>
        <span className="count">{value}</span>
        <button type="button" onClick={() => setValue(value + 1)}>
          +
        </button>
        {/* </span> */}
      </div>
    );
  }

  const grandTotalUSD = itineraries.reduce(
  (sum, item) => sum + Number(item.totalUSD || 0),
  0,
);

  return (
    <div className="container-fluid mb-5">
      <div className=" ">
        <div className="d-flex justify-content-between align-items-center ">
          <h3 className="text-primary-new">
            {isEditMode ? "Edit Lead" : isChildMode ? "New Version of Lead" : "Add New Proforma "}
          </h3>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/Leadlist")}
          >
            View All Proforma
          </button>
        </div>
 {isChildMode && (
          <div className="alert alert-info mt-2 mb-0" style={{ fontSize: "13px" }}>
            📋 Pre-filled from parent lead. A new version will be created — the original is unchanged.
            Invoice number has been auto-generated.
          </div>
        )}
        {isEditMode && (
          <div className="alert alert-warning mt-2 mb-0" style={{ fontSize: "13px" }}>
            ✏️ Editing existing lead — changes will update the current record.
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="lead-form-container shadow-lg rounded-4"
        >
          <div className="lead-page">
              <div className="lead-card">
              {/* CUSTOMER INFO */}
              <h3 className="section-title">Customer / Booking Information</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Invoice No *</label>
                  <input
                    placeholder="Enter Invoice No"
                    className="form-control modern-input"
                    value={formData.invoice_no}
                    onChange={handleInvoiceChange}
                    name="invoice_no"
                    readOnly={isChildMode || isEditMode}
                    style={(isChildMode || isEditMode) ? { background: "#f0f4ff", cursor: "not-allowed" } : {}}
                  />
                  {isChildMode && (
                    <small className="text-muted">Auto-generated from parent invoice</small>
                  )}
                  {errors.invoice_no && (
                    <small className="text-danger">{errors.invoice_no}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    placeholder="Enter Name"
                    className="form-control modern-input"
                    value={formData.customer_name || ""}
                    onChange={handleChange}
                    name="customer_name"
                  />
                  {errors.customer_name && (
                    <small className="text-danger">{errors.customer_name}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    placeholder="Enter Email Address"
                    className="form-control modern-input"
                    value={formData.custemail || ""}
                    onChange={handleChange}
                    name="custemail"
                  />
                  {errors.custemail && (
                    <small className="text-danger">{errors.custemail}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Mobile Number </label>
                  <input
                    placeholder="Enter Mobile Number"
                    className="form-control modern-input"
                    value={formData.custmobile || ""}
                    onChange={handleChange}
                    name="custmobile"
                  />
                  {errors.custmobile && (
                    <small className="text-danger">{errors.custmobile}</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Additional Contact Number</label>
                  <input
                    placeholder="Additional Contact Number"
                    className="form-control modern-input"
                    value={formData.alternateno || ""}
                    onChange={handleChange}
                    name="alternateno"
                  />
                </div>

                <div className="form-group">
                  <label>Reference Person's Name </label>
                  <input
                    placeholder="Contact Person Name"
                    className="form-control modern-input"
                    name="contact_person"
                    value={formData.contact_person || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full">
                  <label>Customer Address </label>
                  <input
                    placeholder="Enter Address"
                    className="form-control modern-input"
                    name="custaddress"
                   value={formData.custaddress || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h3 className="section-title mt-3">Agent Information</h3>
              <div className="form-grid three">
                <div className="form-group">
                  <label>Agent Name</label>
                  <input
                    className="form-control modern-input"
                    placeholder="Enter Agent Name"
                    value={agentName}
                    name="agentName"
                    onChange={(e) => setAgentName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Agent Contact No</label>
                  <input
                    className="form-control modern-input"
                    placeholder="Enter Agent Contact No"
                    value={agentContact}
                    name="agentContact"
                    onChange={(e) => setAgentContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Agent Address</label>
                  <input
                    className="form-control modern-input"
                    placeholder="Enter Agent Address"
                    value={agentAddress}
                    name="agentAddress"
                    onChange={(e) => setAgentAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* TRAVEL INFO */}
              <h3 className="section-title mt-3">Travel / Package Details</h3>

              <div className="form-grid three">
                <div className="form-group">
                  <label >Package Type *</label>
                  <input
                    className="form-control modern-input"
                    placeholder="Land / Hotel / Tour etc."
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                  />
                </div>
                   <div className="form-group">
                  <label>Package Value</label>
                  <div className="inline-input">
                   <input type="text" className="form-control modern-input"
                      placeholder="Enter Amount" value={pkgamount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setPkgAmount(value);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Add Inclusions (Optional)</label>
                  <div className="inline-input">
                    <input
                      className="form-control modern-input"
                      placeholder="Add Inclusions"
                      value={inclusion}
                      onChange={(e) => setInclusion(e.target.value)}
                    />
                  </div>
                </div>

              

                <div className="form-group">
                  <div className="passenger-box">
                    <PassengerCounter
                      label="Adult"
                      value={formData.adult}
                      setValue={(value) => setFormData({ ...formData, adult: value })}
                    />
                    <input
                      type="text"
                      className="form-control modern-input"
                      placeholder="Enter price"
                      disabled={!!pkgamount}
                      value={formData.adult_price}
                      onChange={(e) => setFormData({ ...formData, adult_price: e.target.value.replace(/[^0-9]/g, "") })}
                    />
                  </div>
                  {errors.adult && <small className="text-danger">{errors.adult}</small>}
                </div>

                <div className="form-group">
                  <div className="passenger-box">
                    <PassengerCounter
                      label="Child"
                      value={formData.child}
                      setValue={(value) => setFormData({ ...formData, child: value })}
                    />
                    {errors.child && <small className="text-danger">{errors.child}</small>}
                    <input
                      type="text"
                      className="form-control modern-input"
                      placeholder="Enter price"
                      disabled={!!pkgamount}
                      value={formData.child_price}
                      onChange={(e) => setFormData({ ...formData, child_price: e.target.value.replace(/[^0-9]/g, "") })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="passenger-box">
                    <PassengerCounter
                      label="infant"
                      value={formData.infant}
                      setValue={(value) => setFormData({ ...formData, infant: value })}
                    />
                    {errors.infant && <small className="text-danger">{errors.infant}</small>}
                    <input
                      type="text"
                      className="form-control modern-input"
                      placeholder="Enter price"
                      disabled={!!pkgamount}
                      value={formData.infant_price}
                      onChange={(e) => setFormData({ ...formData, infant_price: e.target.value })}
                    />
                  </div>
                </div>
                  <div className="form-group">
                    <label>Select Currency</label>
                    <select className="form-select currency-selector no-print selctCurrency modern-input" 
                      value={selectedCurrency} 
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      
                    >
                      <option value="USD">USD ($)</option>
                      <option value="THB">THB (฿)</option>
                      <option value="CAD">CAD (C$)</option>
                    
                    </select>
                  </div>
                  <div className="form-group">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-success btn-add"
                    onClick={handleAddItinerary}
                  >
                    <i className="fas fa-plus" aria-hidden="true"></i> Add Package
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <h4 className="sub-title">Itinerary Details</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Sr. No</th>
                      <th>Packages Type</th>
                      <th>Inclusions</th>
                      <th>Per Pax (Adult)</th>
                      <th>Per Pax (Child)</th>
                      <th>Per Pax (Infant)</th>
                      <th>Total USD</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itineraries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-row"></td>
                      </tr>
                    ) : (
                      itineraries.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.packageType}</td>
                          <td>{item.inclusion || "-"}</td>
                          <td>{item.adultCount  > 0 ? `${item.adultTotal} (${item.adultCount} Adult)`    : 0}</td>
                          <td>{item.childCount  > 0 ? `${item.childTotal} (${item.childCount} Child)`    : 0}</td>
                          <td>{item.infantCount > 0 ? `${item.infantTotal} (${item.infantCount} Infant)` : 0}</td>
                          <td>  {getCurrencySymbol()} {Number(item.totalUSD || 0).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn-delete"
                              type="button"
                              onClick={() => setItineraries(itineraries.filter((_, i) => i !== index))}
                            >
                              <i className="fas fa-trash" aria-hidden="true"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {itineraries.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan="6" style={{ textAlign: "right", fontWeight: "bold" }}>
                          Grand Total
                        </td>
                        <td style={{ fontWeight: "bold" }}> {getCurrencySymbol()} {Number(grandTotalUSD || 0).toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* FOOTER */}
              <div className="form-footer">
                <span className="note">
                  <div className="form-group" style={{ display: "inline-block" }}>
                    <label>Bank Charge *</label>
                    <input
                      placeholder="Enter Bank Charge"
                      className="form-control modern-input"
                      name="bank_charge"
                      value={formData.bank_charge || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div
                    className="form-group"
                    style={{ display: "inline-block", width: "60%", marginLeft: "20px" }}
                  >
                    <label>Remark (If any)</label>
                    <input
                      placeholder="Enter Remark"
                      className="form-control modern-input"
                      name="remark"
                     value={formData.remark || ""}
                      onChange={handleChange}
                    />
                  </div>
                </span>
                <div className="actions">
                  <button className="btn-discard" type="button" onClick={() => navigate("/Leadlist")}>
                    Discard
                  </button>
                  <button type="submit" className="btn-save">
                    {isEditMode ? "Update Lead" : isChildMode ? "Save New Version" : "Add Lead"}
                  </button>
                </div>
              </div>

            </div>
          </div>
         
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
