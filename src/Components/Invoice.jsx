import React, { useEffect, useState }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
import "./invoice.css";
import api from "../api/axiosInstance";
import Riyalogo from '../assets/logo.png'


const numberToWords = (num, currencyName = 'US DOLLARS') => {
  if (num === 0) return `ZERO ${currencyName} ONLY`;
  
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  
  const convertHundreds = (n) => {
    if (n === 0) return '';
    
    let result = '';
    
    // Hundreds place
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' HUNDRED';
      n %= 100;
      if (n > 0) result += ' ';
    }
    
    // Tens and ones place
    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      if (n % 10 > 0) result += ' ' + ones[n % 10];
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }
    
    return result;
  };
  
  // Split into dollars and cents
  const [dollars, cents] = num.toFixed(2).split('.').map(Number);
  
  let result = '';
  let remaining = dollars;
  
  // Billions
  if (remaining >= 1000000000) {
    result += convertHundreds(Math.floor(remaining / 1000000000)) + ' BILLION ';
    remaining %= 1000000000;
  }
  
  // Millions
  if (remaining >= 1000000) {
    result += convertHundreds(Math.floor(remaining / 1000000)) + ' MILLION ';
    remaining %= 1000000;
  }
  
  // Thousands
  if (remaining >= 1000) {
    result += convertHundreds(Math.floor(remaining / 1000)) + ' THOUSAND ';
    remaining %= 1000;
  }
  
  // Hundreds, tens, and ones
  if (remaining > 0) {
    result += convertHundreds(remaining);
  }
  
  result = result.trim() + ` ${currencyName}`;
  
  // Add cents if present
  if (cents > 0) {
    result += ' AND ' + convertHundreds(cents) + ' CENTS';
  }
  
  return result + ' ONLY';
};
const Invoice = () => {
  const {id} = useParams();
  const navigate = useNavigate();
 
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('');


  //  const currencyRates = {
  //   USD: { rate: 1, symbol: '$', name: 'US DOLLARS' },
  //   THB: { rate: 34.50, symbol: '฿', name: 'BAHT' },
  //   CAD: { rate: 1.35, symbol: 'C$', name: 'CANADIAN DOLLARS' },
   
  // };
  
const CURRENCY_SYMBOLS = { USD: "$", THB: "฿", CAD: "C$" };
const CURRENCY_NAMES   = { USD: "US DOLLARS", THB: "BAHT", CAD: "CANADIAN DOLLARS" };

const getCurrencySymbol = () => CURRENCY_SYMBOLS[selectedCurrency] || "$";
const getCurrencyName   = () => CURRENCY_NAMES[selectedCurrency]   || "US DOLLARS";
const convertAmount     = (amount) => parseFloat(amount || 0).toFixed(2);
  useEffect(() => {
    const fetchInvoiceData = async () => {
        try{
           const res = await api.get(`/riya_dmclead/getInvoice/${id}`);
            setInvoiceData(res.data);
            // Set currency from saved lead data, default to USD
            if (res.data?.lead?.currency) {
              setSelectedCurrency(res.data.lead.currency);
            } else {
              setSelectedCurrency('USD');
            }
            setLoading(false);
        }
        catch(err){
            setError("Failed to fetch invoice data");;
            alert("Failed to fetch invoice data");
            navigate("/leadlist");
        }
    };
    fetchInvoiceData();
  },[id, navigate]);

 
  const handleDownloadPDF = () => {
  // Set dynamic document title for PDF filename
  const originalTitle = document.title;
  
  if (invoiceData && invoiceData.lead) {
    const { customer_name, invoice_no } = invoiceData.lead;
    const { itineraries } = invoiceData;
    
     
    const packageNames = itineraries
      .map(item => item.package_type)
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '')  
      .substring(0, 30);  
    
    
    const cleanCustomerName = customer_name.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanInvoiceNo = invoice_no.replace(/[^a-zA-Z0-9]/g, '_');
    
    document.title = `Invoice_${cleanInvoiceNo}_${cleanCustomerName}_${packageNames}`;
  }
  
  document.body.classList.add('printing-invoice');
  
  setTimeout(() => {
    window.print();
    document.body.classList.remove('printing-invoice');
    // Restore original title
    document.title = originalTitle;
  }, 100);
}
 

  if(loading){
    return (
        <div className="invoice-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  if(!invoiceData){
    return <div className='invoice-error'>Invoice Not found</div>
  }

  const {lead, itineraries} = invoiceData;
  return (
    <div className="invoice-container">
      {/* Header Actions */}
      <div className="invoice-header-actions">
        <button className="btn-back" onClick={() => navigate("/leadlist")}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="invoice-actions">
           {/* <select 
            className="currency-selector no-print selctCurrency" 
            value={selectedCurrency} 
            onChange={(e) => setSelectedCurrency(e.target.value)}
            
          >
            <option value="USD">USD ($)</option>
            <option value="THB">THB (฿)</option>
            <option value="CAD">CAD (C$)</option>
          
          </select> */}
          
          <select 
            className="currency-selector no-print selctCurrency" 
            value={selectedCurrency} 
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="THB">THB (฿)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
          
          <button className="btn-download" onClick={handleDownloadPDF}>
            <i className="fas fa-download"></i> Download PDF
          </button>
          {/* <button className="btn-send" onClick={() => alert("Invoice sent successfully!")}>
            <i className="fas fa-paper-plane"></i> Send Invoice
          </button> */}
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-content">
        {/* Header Section */}
        <div className="invoice-header-section">
          <div className="company-info">
            <div className="company-logo">
              {/* <img src="/logo-riya.png" alt="" /> */}
                 <img src={Riyalogo} alt="Riya Travel" className='img-fluid'  />
              
            </div>
            <div className="dmc-badge">
              <h2>DMC</h2>
              <p>THAILAND</p>
            </div>
          </div>

          <div className="invoice-meta">
            {/* <span className="paid-badge">PAID</span> */}
            <div className="invoice-number">
              Invoice No: <strong>{lead.invoice_no}</strong>
            </div>
            <div className="invoice-date">
              {new Date(lead.created_at).toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        {/* Business Details Section */}
        <div className="details-section">
          <div className="business-details">
            <h4>BUSINESS DETAILS</h4>
            <h3>RIYA TOURS & TRAVEL </h3>
            <p>24th Floor, 968/58 ITF SILOM PALACE, SILOM ROAD,</p>
            <p>SURIYAWONG, BANG RAK, BANGKOK 10500, THAILAND</p>
            <div className="tax-info">
              <span>TAX ID</span>
              <span className="tax-number">0105561124505</span>
            </div>
          </div>

          <div className="agent-details">
            <h4>TRAVEL AGENT</h4>
            <p className="agent-name">{lead.agent_name || "The Tourist"}</p>
            <p className="agent-location">{lead.agent_address || ""}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-section">
          <div className="customer-info">
            <h5>CUSTOMER NAME</h5>
            <div className="customer-name">
              <i className="fas fa-user"></i>
              <span>{lead.customer_name}</span>
            </div>
          </div>

          <div className="contact-info">
            <h5>CONTACT DETAILS</h5>
            <div className="contact-person">
             <i className="fas fa-solid fa-envelope"></i>
              <span>{lead.mobile} / {lead.email}</span>
            </div>
          </div>

          <div className="billing-info">
            <h5>BILLING ADDRESS</h5>
            <div className="billing-address">
              <i className="fas fa-map-marker-alt"></i>
              <span>{lead.address || "-"}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-table">
          <table>
            <thead>
              <tr>
                <th>SR NO</th>
                <th>DESCRIPTION</th>
                <th>QTY</th>
                <th>PCS PAX</th>
                <th>TOTAL USD</th>
              </tr>
            </thead>
            <tbody>
              {/* Package Items */}
              <tr className="package-header">
                <td>01</td>
                <td colSpan="2" style={{textAlign:'left !important'}}>
                  <strong>PACKAGE NAME (LAND)</strong>
                </td>
                <td colSpan="2"></td>
              </tr>

              {itineraries.map((item, index) => (
                <tr key={index} className="package-item">
                  <td></td>
                  <td className="item-description">
                    <i className="fas fa-circle item-bullet"></i>
                    {item.package_type}
                  </td>
                  <td>{item.adult_count + item.child_count + item.infant_count}</td>
                  <td>{(() => { const qty = item.adult_count + item.child_count + item.infant_count; return qty > 0 ? `${getCurrencySymbol()} ${convertAmount(item.total / qty)}` : '-'; })()}</td>
                  <td>{getCurrencySymbol()}{convertAmount(item.total)}</td>
                </tr>
              ))}

              {/* Bank Charges */}
              <tr className="package-header">
                <td>02 </td>
                <td> <strong>Bank Charges</strong>  <span className="item-subtitle">Processing Fee</span>
                </td>
                 <td>1</td>
                <td>{getCurrencySymbol()}{convertAmount(lead.bank_charge || 0)}</td>
                <td>{getCurrencySymbol()}{convertAmount(lead.bank_charge || 0)}</td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Banking Information & Total */}
        <div className="footer-section">
          <div className="banking-info">
            <h4>
              <i className="fas fa-university"></i> BANKING INFORMATION
            </h4>
            <div className="bank-details">
              <div className="bank-item">
                <span className="bank-label">ACCOUNT NAME</span>
                <span className="bank-value">RIYA TRAVEL & TOURS CO LTD</span>
              </div>
              <div className="bank-item">
                <span className="bank-label">CURRENT A/C NO</span>
                <span className="bank-value">153 - 1 - 30036 - 3</span>
              </div>
              <div className="bank-item">
                <span className="bank-label">BANK / BRANCH</span>
                <span className="bank-value">Kasikorn Bank (Silom Main Branch)</span>
              </div>
              <div className="bank-item">
                <span className="bank-label">SWIFT NO</span>
                <span className="bank-value">KASITHBK</span>
              </div>
            </div>
          </div>

          <div className="total-section">
            <div className="total-box">
              <div className="total-label">
                <i className="fas fa-calculator"></i> TOTAL AMOUNT
              </div>
             
               <div className="total-amount">{getCurrencySymbol()}{convertAmount(Number(lead.grand_total) + Number(lead.bank_charge || 0))}</div>
              <div className="total-note">
                {numberToWords(Number(convertAmount(Number(lead.grand_total) + Number(lead.bank_charge || 0))), getCurrencyName())}
              </div>
              <div className="payment-info">
                Name dynamically as per total - Riya Travel Invoice for travel services to customer
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="invoice-footer-note">
          <i className="fas fa-info-circle"></i>
          This is a computer generated invoice and does not require a signature.
        </div>

        {/* Copyright */}
        <div className="invoice-copyright">
           © {new Date().getFullYear()} Riya Travel & Tours Co Ltd. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default Invoice