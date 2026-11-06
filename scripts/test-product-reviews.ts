import mysql from "mysql2/promise";

const tidbConfig = {
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "iY15LFk8kgKVgVn.root",
  password: "m22dorl92xShU1H8",
  database: "test",
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false },
};

async function test() {
  const conn = await mysql.createConnection(tidbConfig);

  const [products]: any = await conn.query(`
    SELECT id, title, slug, ratingsAvg, ratingsCount
    FROM products
    WHERE title LIKE '%Bàn Phím%' OR title LIKE '%Sony%'
    LIMIT 2
  `);

  console.log("KEYBOARD & SONY PRODUCTS & THEIR REVIEWS IN TIDB:");
  for (const p of products) {
    console.log(`\n======================================================`);
    console.log(`Sản phẩm: ${p.title}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Điểm TB: ${p.ratingsAvg} ⭐ | Số đánh giá: ${p.ratingsCount} reviews`);

    const [reviews]: any = await conn.query(`
      SELECT r.rating, r.title, r.comment, r.createdAt, u.name as reviewer
      FROM reviews r
      JOIN users u ON r.userId = u.id
      WHERE r.productId = ?
      ORDER BY r.createdAt DESC
      LIMIT 3
    `, [p.id]);

    console.log(`Các đánh giá gần nhất:`);
    for (const r of reviews) {
      console.log(`  * [${r.rating}⭐] ${r.reviewer}: "${r.title}" - ${r.comment}`);
    }
  }

  await conn.end();
}

test().catch(console.error);
