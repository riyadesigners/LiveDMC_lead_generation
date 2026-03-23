// const { ca } = require("date-fns/locale");
const pool = require("../config/db");
 
// insert lead
exports.createLead = async (req, res) => {
    const client = await pool.connect();
    try{
        await client.query("BEGIN");
        const created_by = req.user?.user_id || null; // from JWT middleware
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
             currency,
            parent_lead_id = null,
        } = req.body;

        const existingInvoice = await client.query(
            'SELECT invoice_no FROM custleads WHERE invoice_no = $1',[invoice_no] 
        );
        if(existingInvoice.rows.length > 0){
        await client.query("ROLLBACK");
        return res.status(400).json({
            message: "Invoice number already exists",
            error : "DUPLICATE_INVOICE"
        });
        }

    // Convert empty strings to null for numeric columns
    const toNum = (val) => (val === "" || val === null || val === undefined) ? null : Number(val);

    const leadResult = await client.query(
      `INSERT INTO custleads 
        (invoice_no, customer_name, email, mobile, alternate_contact, contact_person, 
            address, agent_name, agent_contact, agent_address, grand_total, bank_charge, remark, parent_lead_id, currency, created_by
            )  
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING id`,
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
                toNum(grand_total),
                toNum(bank_charge),
                remark,
                parent_lead_id,
                currency,
                created_by
            ],
       );

    const leadId = leadResult.rows[0].id;
        for(let i = 0; i < itineraries.length; i++){
           await client.query(
             `INSERT INTO lead_itineraries
        (lead_id, package_type, inclusions,
         adult_count, child_count, infant_count,
         adult_total, child_total, infant_total, total)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          leadId,
          itineraries[i].packageType,
          itineraries[i].inclusion,
          toNum(itineraries[i].adultCount),
          toNum(itineraries[i].childCount),
          toNum(itineraries[i].infantCount),
          toNum(itineraries[i].adultTotal),
          toNum(itineraries[i].childTotal),
          toNum(itineraries[i].infantTotal),
          toNum(itineraries[i].totalUSD)
        ]
           ); 
    }
    await client.query("COMMIT");
        res.status(201).json({ message: "Lead created successfully", leadId });
    }
    catch(err) {
        await client.query("ROLLBACK");
        console.error("Error creating lead:", err);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: err.message 
        });
    } finally {
        client.release();
    }
}
//check invoic number for duplicates 
exports.checkInvoice = async (req, res) => {
    try {
        const { invoiceNo } = req.params;
        
        const result = await pool.query(
            `SELECT invoice_no FROM custleads WHERE UPPER(invoice_no) = UPPER($1)`,
            [invoiceNo]
        );
        
        res.status(200).json({ 
            exists: result.rows.length > 0 
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
        const requestingUserId = req.user?.user_id;
        const requestingRole   = req.user?.role;

        console.log("getLeadList -> req.user:", req.user); // debug

        const isRestricted = requestingRole === "user";

        const selectCols = `
              SELECT
                c.id, c.parent_lead_id, c.invoice_no, c.customer_name,
                c.email, c.mobile, c.alternate_contact, c.contact_person,
                c.address, c.agent_name, c.agent_contact, c.agent_address,
                c.bank_charge, c.remark, c.grand_total AS total_price,
                c.currency, c.created_at, c.created_by,
                STRING_AGG(DISTINCT li.package_type, ', ') AS package_types,
                SUM(li.adult_count)  AS total_adults,
                SUM(li.child_count)  AS total_children,
                SUM(li.infant_count) AS total_infants
              FROM custleads c
              LEFT JOIN lead_itineraries li ON c.id = li.lead_id`;

        let result;
        if (isRestricted) {
            result = await pool.query(
                selectCols + ` WHERE c.created_by = $1 GROUP BY c.id ORDER BY c.created_at DESC`,
                [requestingUserId]
            );
        } else {
            result = await pool.query(
                selectCols + ` GROUP BY c.id ORDER BY c.created_at DESC`
            );
        }

        res.status(200).json(result.rows);

    } catch (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};




// update existing lead
exports.updateLead = async (req, res) => {
    const client = await pool.connect();
    try {
         await client.query("BEGIN");
        const { id } = req.params;

     
        const existing = await client.query(
            `SELECT * FROM custleads WHERE id = $1`, [id]
        );

        if (existing.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Lead not found" });
        }

        const originalLead = existing.rows[0];

        //  Find latest version (parent + children)
        const latest = await client.query(
            `
            SELECT invoice_no 
            FROM custleads
            WHERE id = $1 OR parent_lead_id = $1
            ORDER BY id DESC
            LIMIT 1
            `,
            [id]
        );

        const latestInvoice = latest.rows[0].invoice_no;

        // Generate next version
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

        const created_by = req.user?.user_id || null; // from JWT middleware
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
            currency,
        } = req.body;

        const toNum = (val) => (val === "" || val === null || val === undefined) ? null : Number(val);

        //Insert NEW lead (child)
        const leadResult = await client.query(
            `INSERT INTO custleads
            (invoice_no, customer_name, email, mobile, alternate_contact,
             contact_person, address, agent_name, agent_contact,
             agent_address, grand_total, bank_charge, remark, parent_lead_id, currency, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
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
                toNum(grand_total),
                toNum(bank_charge),
                remark,
                originalLead.parent_lead_id || originalLead.id,
                currency,
                created_by
            ]
        );

        const newLeadId = leadResult.rows[0].id;

        // Insert itineraries
        for (let i = 0; i < itineraries.length; i++) {
            await client.query(
                `INSERT INTO lead_itineraries
                (lead_id, package_type, inclusions,
                 adult_count, child_count, infant_count,
                 adult_total, child_total, infant_total, total)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    newLeadId,
                    itineraries[i].packageType,
                    itineraries[i].inclusion,
                    toNum(itineraries[i].adultCount),
                    toNum(itineraries[i].childCount),
                    toNum(itineraries[i].infantCount),
                    toNum(itineraries[i].adultTotal),
                    toNum(itineraries[i].childTotal),
                    toNum(itineraries[i].infantTotal),
                    toNum(itineraries[i].totalUSD),
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "New lead version created successfully",
            newLeadId,
            newInvoice
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error creating new lead version:", err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    } finally {
        client.release();
    }
};


exports.getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Fetching invoice for lead ID:", id);

        const leadResult = await pool.query(
            `SELECT * FROM custleads WHERE id = $1`, [id]
        );
        if (leadResult.rows.length === 0) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const itinerariesResult = await pool.query(
            `SELECT * FROM lead_itineraries WHERE lead_id = $1 ORDER BY id`, [id]
        );

        res.status(200).json({
             lead: leadResult.rows[0],
              itineraries: itinerariesResult.rows });
    } catch (err) {
        console.error("Error fetching invoice details:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;

    const result = await pool.query(
      `
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
        STRING_AGG(DISTINCT li.package_type, ', ') AS package_types,
        COALESCE(SUM(li.adult_count), 0)  AS total_adults,
        COALESCE(SUM(li.child_count), 0)  AS total_children,
        COALESCE(SUM(li.infant_count), 0) AS total_infants
      FROM custleads c
      LEFT JOIN lead_itineraries li ON c.id = li.lead_id
      WHERE c.id = $1
      GROUP BY c.id
      `,
      [leadId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching lead:", err);

    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};