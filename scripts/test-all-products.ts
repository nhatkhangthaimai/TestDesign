import { prisma } from "../src/lib/prisma";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface AuditResult {
  index: number;
  id: string;
  title: string;
  slug: string;
  apiStatus: number;
  pageStatus: number;
  priceType: string;
  ratingsAvgType: string;
  hasImages: boolean;
  status: "PASS" | "FAIL";
  error?: string;
}

async function runProductsAudit() {
  console.log("=".repeat(80));
  console.log("  BBK COMMERCE - 100% PRODUCT DETAIL AUTOMATED AUDIT & VALIDATION");
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log("=".repeat(80));

  // 1. Fetch all products
  const products = await prisma.product.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nFound ${products.length} products in catalog to verify.\n`);

  const results: AuditResult[] = [];
  const concurrency = 5;

  for (let i = 0; i < products.length; i += concurrency) {
    const chunk = products.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (p, idx) => {
        const itemIdx = i + idx + 1;
        const resObj: AuditResult = {
          index: itemIdx,
          id: p.id,
          title: p.title,
          slug: p.slug,
          apiStatus: 0,
          pageStatus: 0,
          priceType: "",
          ratingsAvgType: "",
          hasImages: false,
          status: "PASS",
        };

        try {
          // 1. Check API endpoint
          const apiRes = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(p.slug)}`);
          resObj.apiStatus = apiRes.status;

          if (!apiRes.ok) {
            resObj.status = "FAIL";
            resObj.error = `API returned HTTP ${apiRes.status}`;
            results.push(resObj);
            return;
          }

          const data = await apiRes.json();
          if (!data.product) {
            resObj.status = "FAIL";
            resObj.error = "API returned no product object";
            results.push(resObj);
            return;
          }

          resObj.priceType = typeof data.product.regularPrice;
          resObj.ratingsAvgType = typeof data.product.ratingsAvg;
          resObj.hasImages = Array.isArray(data.product.images) && data.product.images.length > 0;

          if (typeof data.product.regularPrice !== "number") {
            resObj.status = "FAIL";
            resObj.error = `regularPrice is ${typeof data.product.regularPrice}, expected number`;
          }
          if (typeof data.product.ratingsAvg !== "number") {
            resObj.status = "FAIL";
            resObj.error = `ratingsAvg is ${typeof data.product.ratingsAvg}, expected number`;
          }

          // 2. Check HTML Page rendering
          const pageRes = await fetch(`${BASE_URL}/products/${encodeURIComponent(p.slug)}`);
          resObj.pageStatus = pageRes.status;
          const html = await pageRes.text();

          if (!pageRes.ok) {
            resObj.status = "FAIL";
            resObj.error = `HTML page returned HTTP ${pageRes.status}`;
          } else if (html.includes("This page couldn't load") || html.includes("500 Internal Server Error")) {
            resObj.status = "FAIL";
            resObj.error = "Page rendered unhandled error boundary";
          }

          results.push(resObj);
        } catch (err: any) {
          resObj.status = "FAIL";
          resObj.error = `Fetch error: ${err.message}`;
          results.push(resObj);
        }
      })
    );

    const doneCount = Math.min(i + concurrency, products.length);
    process.stdout.write(`\rProgress: ${doneCount}/${products.length} products audited...`);
  }

  console.log("\n\n" + "=".repeat(80));
  console.log("                    AUDIT EXECUTION SUMMARY");
  console.log("=".repeat(80));

  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Products Audited: ${total}`);
  console.log(`Passed:                 ${passed} (✓)`);
  console.log(`Failed:                 ${failed} (✗)`);
  console.log(`Pass Rate:              ${passRate}%`);

  if (failed > 0) {
    console.log("\nFAILED PRODUCTS:");
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(`- [#${r.index}] ${r.slug}: ${r.error}`);
      });
  } else {
    console.log("\n✓ 100% of products passed API data verification and Page rendering!");
  }

  // Export report
  const fs = await import("fs");
  const path = await import("path");
  const outPath = path.resolve(process.cwd(), "docs/api-audit/PRODUCT_DETAIL_AUDIT.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ summary: { total, passed, failed, passRate }, results }, null, 2));
  console.log(`\nDetailed report written to: ${outPath}`);

  if (failed > 0) process.exit(1);
}

runProductsAudit().catch((err) => {
  console.error("Audit runner error:", err);
  process.exit(1);
});

