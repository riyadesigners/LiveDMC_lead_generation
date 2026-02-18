// const { ca } = require("date-fns/locale");
const pool = require("../config/db");
 
// insert lead
exports.createLead = async (req, res) => {
    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();
        // const parsed = JSON.parse(req.body.data);
        // const  {customer_name, email, mobile, contact_person} = parsed;

                const {
                 invoice_no,
                    customer_name,
                    email,
                    mobile,
                    alternate_mobile,  
                    contact_person,
                    address,
                    agent_name,
                    agent_contact,
                    agent_address,
                    bank_charge,
                    remark,
                    grand_total,
                    itineraries,
                     parent_lead_id = null,
            } = req.body;

            const [existingInvoice] = await conn.query(
                'Select invoice_no from custleads where invoice_no = ?',[invoice_no] 
            );
            if(existingInvoice.length > 0){
            await conn.rollback();
            return res.status(400).json({
                message: "Invoice number already exists",
                error : "DUPLICATE_INVOICE"
            });
            }

    const [leadResult] = await conn.query(
        `INSERT INTO custleads 
(invoice_no, customer_name, email, mobile, alternate_contact, contact_person, 
     address, agent_name, agent_contact, agent_address, grand_total, bank_charge, remark, parent_lead_id
    )  
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            invoice_no,
            customer_name,
            email,
            mobile,
            alternate_mobile,
            contact_person,
            address,
            agent_name,
            agent_contact,
            agent_address,
            grand_total,
            bank_charge,
            remark,
            parent_lead_id || null,
        ]
    );

    const leadId = leadResult.insertId;
        for(let i = 0; i < itineraries.length; i++){
           await conn.query(
             `INSERT INTO lead_itineraries
        (lead_id, package_type, inclusions,
         adult_count, child_count, infant_count,
         adult_total, child_total, infant_total, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          leadId,
          itineraries[i].packageType,
          itineraries[i].inclusion,
          itineraries[i].adultCount,
          itineraries[i].childCount,
          itineraries[i].infantCount,
          itineraries[i].adultTotal,
          itineraries[i].childTotal,
          itineraries[i].infantTotal,
          itineraries[i].total
        ]
           ); 
    }
    await conn.commit();
    res.status(201).json({ message: "Lead created successfully", leadId: leadId });
           

    }
    catch(err) {
        await conn.rollback();
        console.error("Error creating lead:", err);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: err.message 
        });
    } finally {
        conn.release();
    }
}
//check invoic number for duplicates 
exports.checkInvoice = async (req, res) => {
    try {
        const { invoiceNo } = req.params;
        
        const [result] = await pool.query(
            `SELECT invoice_no FROM custleads WHERE invoice_no = ?`,
            [invoiceNo]
        );
        
        res.status(200).json({ 
            exists: result.length > 0 
        });
    } catch (err) {
        console.error("Error checking invoice:", err);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: err.message 
        });
    }
};
//get all leads
exports.getLeadList = async (req, res) => {
    try {
        const [leads] = await pool.query(`
            SELECT
                c.id,
                c.parent_lead_id,                          -- ← returned so frontend knows hierarchy
                c.invoice_no,
                c.customer_name,
                c.email,
                c.mobile,
                c.alternate_contact,
                c.contact_person,
                c.address,
                c.agent_name,
                c.agent_contact,
                c.agent_address,
                c.bank_charge,
                c.remark,
                c.grand_total AS total_price,
                c.adult,
                c.child,
                c.infant,
                c.created_at,
                GROUP_CONCAT(DISTINCT li.package_type SEPARATOR ', ') AS package_types,
                SUM(li.adult_count)  AS total_adults,
                SUM(li.child_count)  AS total_children,
                SUM(li.infant_count) AS total_infants
            FROM custleads c
            LEFT JOIN lead_itineraries li ON c.id = li.lead_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};




// update existing lead
exports.updateLead = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;

        // 1️⃣ Get original lead
        const [existing] = await conn.query(
            `SELECT * FROM custleads WHERE id = ?`, [id]
        );

        if (existing.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        const originalLead = existing[0];

        // 2️⃣ Find latest version (parent + children)
        const [latest] = await conn.query(
            `
            SELECT invoice_no 
            FROM custleads
            WHERE id = ? OR parent_lead_id = ?
            ORDER BY id DESC
            LIMIT 1
            `,
            [id, id]
        );

        const latestInvoice = latest[0].invoice_no;

        // 3️⃣ Generate next version
        const generateChildInvoice = (parentInvoice) => {
            const versionMatch = parentInvoice.match(/^(.+)-v(\d+)$/);
            if (versionMatch) {
                const base = versionMatch[1];
                const version = parseInt(versionMatch[2], 10) + 1;
                return `${base}-v${version}`;
            }
            return `${parentInvoice}-v2`;
        };

        const newInvoice = generateChildInvoice(latestInvoice);

        const {
            customer_name,
            email,
            mobile,
            alternate_mobile,
            contact_person,
            address,
            agent_name,
            agent_contact,
            agent_address,
            bank_charge,
            remark,
            grand_total,
            itineraries,
        } = req.body;

        // 4️⃣ Insert NEW lead (child)
        const [leadResult] = await conn.query(
            `INSERT INTO custleads
            (invoice_no, customer_name, email, mobile, alternate_contact,
             contact_person, address, agent_name, agent_contact,
             agent_address, grand_total, bank_charge, remark, parent_lead_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newInvoice,
                customer_name,
                email,
                mobile,
                alternate_mobile,
                contact_person,
                address,
                agent_name,
                agent_contact,
                agent_address,
                grand_total,
                bank_charge,
                remark,
                originalLead.parent_lead_id || originalLead.id
            ]
        );

        const newLeadId = leadResult.insertId;

        // 5️⃣ Insert itineraries
        for (let i = 0; i < itineraries.length; i++) {
            await conn.query(
                `INSERT INTO lead_itineraries
                (lead_id, package_type, inclusions,
                 adult_count, child_count, infant_count,
                 adult_total, child_total, infant_total, total)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newLeadId,
                    itineraries[i].packageType,
                    itineraries[i].inclusion,
                    itineraries[i].adultCount,
                    itineraries[i].childCount,
                    itineraries[i].infantCount,
                    itineraries[i].adultTotal,
                    itineraries[i].childTotal,
                    itineraries[i].infantTotal,
                    itineraries[i].total,
                ]
            );
        }

        await conn.commit();

        res.status(201).json({
            message: "New lead version created successfully",
            newLeadId,
            newInvoice
        });

    } catch (err) {
        await conn.rollback();
        console.error("Error creating new lead version:", err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    } finally {
        conn.release();
    }
};


exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Fetching invoice for lead ID:", id);

        const [leads] = await pool.query(
            `SELECT * FROM custleads WHERE id = ?`, [id]
        );
        if (leads.length === 0) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const [itineraries] = await pool.query(
            `SELECT * FROM lead_itineraries WHERE lead_id = ? ORDER BY id`, [id]
        );

        res.status(200).json({ lead: leads[0], itineraries });
    } catch (err) {
        console.error("Error fetching invoice details:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const leadId = req.params.id;

        const [lead] = await pool.query(`
            SELECT
                c.id,
                c.parent_lead_id,
                c.invoice_no,
                c.customer_name,
                c.email,
                c.mobile,
                c.alternate_contact,
                c.contact_person,
                c.address,
                c.agent_name,
                c.agent_contact,
                c.agent_address,
                c.bank_charge,
                c.remark,
                c.grand_total AS total_price,
                c.adult,
                c.child,
                c.infant,
                c.created_at,
                GROUP_CONCAT(DISTINCT li.package_type SEPARATOR ', ') AS package_types,
                SUM(li.adult_count)  AS total_adults,
                SUM(li.child_count)  AS total_children,
                SUM(li.infant_count) AS total_infants
            FROM custleads c
            LEFT JOIN lead_itineraries li ON c.id = li.lead_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [leadId]);

        if (lead.length === 0) {
            return res.status(404).json({ message: "Lead not found" });
        }

        res.status(200).json(lead[0]);

    } catch (err) {
        console.error("Error fetching lead:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
