// const pool = require("../config/db");

// module.exports =  async (req, res, next) => {
//   const conn = await pool.getConnection();
//   try {
//     // const [last] = await conn.query(
//     const [[row]] = await conn.query(
//       "SELECT max(id) FROM students_details ORDER BY id DESC LIMIT 1"
//     );
//     // const nextId = last.length ? last[0].id + 1 : 1;
//       const nextId = row?.id ? row.id + 1 : 1;
//     req.studentCode = `RIH${String(nextId).padStart(3, "0")}`;
//     next();
//   } catch (err) {
//     next(err);
//   } finally {
//     conn.release();
//   }
// };
const pool = require("../config/db");

module.exports = async (req, res, next) => {
  const conn = await pool.getConnection();

  try {
    const [[row]] = await conn.query(
      `
      SELECT 
        MAX(CAST(SUBSTRING(student_id, 4) AS UNSIGNED)) AS maxId
      FROM students_details
      `
    );

    const nextNumber = (row.maxId || 0) + 1;

    req.studentCode = `RIH${String(nextNumber).padStart(3, "0")}`;

    next();
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
};
