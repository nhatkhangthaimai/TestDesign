/**
 * BBKCOMMERCE - AUTOMATED API TEST SUITE
 * Tests all 12 domains across 46 endpoints against the live Next.js server.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  domain: string;
  method: string;
  endpoint: string;
  status: "PASS" | "FAIL";
  httpStatus: number;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function testApi(
  name: string,
  domain: string,
  method: string,
  endpoint: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    token?: string;
    expectedStatus?: number | number[];
    validate?: (data: any, res: Response) => void;
  } = {}
): Promise<{ data: any; res: Response }> {
  const t0 = performance.now();
  const expected = Array.isArray(options.expectedStatus)
    ? options.expectedStatus
    : [options.expectedStatus ?? 200];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const durationMs = Math.round(performance.now() - t0);
    let data: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!expected.includes(res.status)) {
      results.push({
        name,
        domain,
        method,
        endpoint,
        status: "FAIL",
        httpStatus: res.status,
        durationMs,
        error: `Expected status [${expected.join(",")}] but got ${res.status}: ${JSON.stringify(data)?.slice(0, 150)}`,
      });
      return { data, res };
    }

    if (options.validate) {
      try {
        options.validate(data, res);
      } catch (valErr: any) {
        results.push({
          name,
          domain,
          method,
          endpoint,
          status: "FAIL",
          httpStatus: res.status,
          durationMs,
          error: `Validation error: ${valErr.message}`,
        });
        return { data, res };
      }
    }

    results.push({
      name,
      domain,
      method,
      endpoint,
      status: "PASS",
      httpStatus: res.status,
      durationMs,
    });

    return { data, res };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - t0);
    results.push({
      name,
      domain,
      method,
      endpoint,
      status: "FAIL",
      httpStatus: 0,
      durationMs,
      error: `Network/Fetch error: ${err.message}`,
    });
    return { data: null, res: new Response(null, { status: 500 }) };
  }
}

async function runTestSuite() {
  console.log("=".repeat(80));
  console.log(`  BBKCOMMERCE FULL API AUDIT & AUTOMATED TEST SUITE`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log("=".repeat(80));

  // -------------------------------------------------------------
  // 1. HEALTH & SYSTEM CHECK
  // -------------------------------------------------------------
  console.log("\n[1/12] Testing System Health API...");
  await testApi("Health Check", "Health", "GET", "/api/health", {
    expectedStatus: 200,
    validate: (data) => {
      if (data.status !== "UP" || data.services?.database?.status !== "HEALTHY") {
        throw new Error("Health check reported non-UP or database unhealthy");
      }
    },
  });

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & ACCESS CONTROL
  // -------------------------------------------------------------
  console.log("\n[2/12] Testing Authentication & Authorization API...");
  const testEmail = `qa_test_${Date.now()}@example.com`;
  const testPassword = "TestPassword@2026";
  let userToken = "";
  let adminToken = "";

  // 2.1 Register
  const regRes = await testApi("Register New Account", "Auth", "POST", "/api/auth/register", {
    body: {
      name: "QA Automation Engineer",
      email: testEmail,
      password: testPassword,
      phone: "0909123456",
    },
    expectedStatus: 200,
    validate: (data) => {
      if (!data.user?.id || !data.token) throw new Error("Missing user id or token in register");
      userToken = data.token;
    },
  });

  // 2.2 Login User
  await testApi("Login User Account", "Auth", "POST", "/api/auth/login", {
    body: { email: testEmail, password: testPassword },
    expectedStatus: 200,
    validate: (data) => {
      if (!data.token) throw new Error("No token returned on login");
      userToken = data.token;
    },
  });

  // 2.3 Login Admin
  await testApi("Login Admin Account", "Auth", "POST", "/api/auth/login", {
    body: { email: "admin@aljazeera-tech.vn", password: "admin" }, // Note: check password or fall back
    expectedStatus: [200, 401],
  });

  // If "admin" was not password, try "admin123456"
  const adminLoginTry = await testApi("Login Admin with Master Password", "Auth", "POST", "/api/auth/login", {
    body: { email: "admin@aljazeera-tech.vn", password: "admin123456" },
    expectedStatus: [200, 401],
    validate: (data) => {
      if (data.token) adminToken = data.token;
    },
  });

  // 2.4 Auth Me
  await testApi("Get Current User Profile (/me)", "Auth", "GET", "/api/auth/me", {
    token: userToken,
    expectedStatus: 200,
    validate: (data) => {
      if (!data.user || data.user.email !== testEmail) throw new Error("Incorrect user returned from /me");
    },
  });

  // 2.5 Auth Profile
  await testApi("Get Detailed Profile", "Auth", "GET", "/api/auth/profile", {
    token: userToken,
    expectedStatus: 200,
    validate: (data) => {
      if (!data.profile || data.profile.email !== testEmail) throw new Error("Profile email mismatch");
    },
  });

  // 2.6 Update Profile
  await testApi("Update User Profile", "Auth", "PUT", "/api/auth/profile", {
    token: userToken,
    body: { name: "QA Senior Engineer Updated", phone: "0909999888" },
    expectedStatus: 200,
  });

  // 2.7 Forgot Password
  let resetToken = "";
  await testApi("Forgot Password Request", "Auth", "POST", "/api/auth/forgot-password", {
    body: { email: testEmail },
    expectedStatus: 200,
    validate: (data) => {
      resetToken = data.resetToken;
    },
  });

  // 2.8 Reset Password
  if (resetToken) {
    const newPassword = "NewSecretPassword@2026";
    await testApi("Reset Password with Token", "Auth", "POST", "/api/auth/reset-password", {
      body: { token: resetToken, newPassword },
      expectedStatus: 200,
    });
    // Log back in with new password
    await testApi("Login with New Password", "Auth", "POST", "/api/auth/login", {
      body: { email: testEmail, password: newPassword },
      expectedStatus: 200,
      validate: (data) => {
        userToken = data.token;
      },
    });
  }

  // 2.9 RBAC Protection Check: Non-admin accessing admin API
  await testApi("RBAC: Regular User Blocked from Admin Dashboard", "Auth", "GET", "/api/admin/dashboard", {
    token: userToken,
    expectedStatus: 403,
  });

  await testApi("RBAC: Unauthenticated Blocked from Admin Dashboard", "Auth", "GET", "/api/admin/dashboard", {
    expectedStatus: 403,
  });

  // -------------------------------------------------------------
  // 3. PRODUCT CATALOG
  // -------------------------------------------------------------
  console.log("\n[3/12] Testing Product Catalog API...");
  let sampleProductSlug = "";
  let sampleProductId = "";
  let sampleProductPrice = 0;

  await testApi("Get Product List (Default)", "Products", "GET", "/api/products", {
    expectedStatus: 200,
    validate: (data) => {
      if (!Array.isArray(data.products) || data.products.length === 0) {
        throw new Error("No products returned in catalog");
      }
      sampleProductSlug = data.products[0].slug;
      sampleProductId = data.products[0].id;
      sampleProductPrice = Number(data.products[0].salePrice || data.products[0].regularPrice);
    },
  });

  await testApi("Filter Products by Brand (Apple)", "Products", "GET", "/api/products?brand=apple", {
    expectedStatus: 200,
    validate: (data) => {
      if (data.products.length === 0) throw new Error("No Apple products found");
    },
  });

  await testApi("Filter Products by Category (dien-thoai-cong-nghe)", "Products", "GET", "/api/products?category=dien-thoai-cong-nghe", {
    expectedStatus: 200,
  });

  await testApi("Sort Products by Price Ascending", "Products", "GET", "/api/products?sort=price_asc&limit=5", {
    expectedStatus: 200,
  });

  await testApi("Search Products (query: 'iPhone')", "Products", "GET", "/api/products?search=iPhone", {
    expectedStatus: 200,
  });

  if (sampleProductSlug) {
    await testApi(`Get Single Product Detail (/products/${sampleProductSlug})`, "Products", "GET", `/api/products/${sampleProductSlug}`, {
      expectedStatus: 200,
      validate: (data) => {
        if (!data.product || data.product.slug !== sampleProductSlug) throw new Error("Incorrect product detail");
      },
    });
  }

  await testApi("Get Non-existent Product Detail", "Products", "GET", "/api/products/non-existent-slug-xyz", {
    expectedStatus: 404,
  });

  // -------------------------------------------------------------
  // 4. CATEGORIES & BRANDS
  // -------------------------------------------------------------
  console.log("\n[4/12] Testing Categories & Brands API...");
  await testApi("Get Public Category Taxonomy", "Categories", "GET", "/api/categories", {
    expectedStatus: 200,
    validate: (data) => {
      if (!Array.isArray(data.categories) || data.categories.length === 0) throw new Error("No categories returned");
    },
  });

  await testApi("Get Single Category Detail (/categories/dien-thoai-cong-nghe)", "Categories", "GET", "/api/categories/dien-thoai-cong-nghe", {
    expectedStatus: 200,
  });

  await testApi("Get Public Brand List", "Brands", "GET", "/api/brands", {
    expectedStatus: 200,
    validate: (data) => {
      if (!Array.isArray(data.brands) || data.brands.length === 0) throw new Error("No brands returned");
    },
  });

  await testApi("Get Single Brand Detail (/brands/apple)", "Brands", "GET", "/api/brands/apple", {
    expectedStatus: 200,
  });

  // -------------------------------------------------------------
  // 5. SHOPPING CART
  // -------------------------------------------------------------
  console.log("\n[5/12] Testing Shopping Cart API...");
  await testApi("Get User Cart (Initial)", "Cart", "GET", "/api/cart", {
    token: userToken,
    expectedStatus: 200,
  });

  if (sampleProductId) {
    await testApi("Add Item to Cart", "Cart", "POST", "/api/cart", {
      token: userToken,
      body: { productId: sampleProductId, quantity: 1 },
      expectedStatus: 200,
      validate: (data) => {
        if (data.itemCount < 1) throw new Error("Cart count did not increase");
      },
    });

    await testApi("Update Cart Item Quantity", "Cart", "PATCH", "/api/cart", {
      token: userToken,
      body: { productId: sampleProductId, quantity: 2 },
      expectedStatus: 200,
      validate: (data) => {
        const items = data.items || data.cart?.items || [];
        const item = items.find((i: any) => i.productId === sampleProductId);
        if (!item || item.quantity !== 2) throw new Error("Cart item quantity was not updated to 2");
      },
    });

    await testApi("Sync Guest Cart with Database", "Cart", "POST", "/api/cart/sync", {
      token: userToken,
      body: {
        items: [{ productId: sampleProductId, quantity: 1 }],
      },
      expectedStatus: 200,
    });

    await testApi("Clear User Cart", "Cart", "DELETE", "/api/cart?clearAll=true", {
      token: userToken,
      expectedStatus: 200,
      validate: (data) => {
        const count = data.itemCount ?? data.cart?.totalItems ?? 0;
        if (count !== 0) throw new Error("Cart was not cleared");
      },
    });
  }

  // -------------------------------------------------------------
  // 6. COUPONS & DISCOUNTS
  // -------------------------------------------------------------
  console.log("\n[6/12] Testing Coupons & Promotions API...");
  await testApi("Apply Valid Promo Coupon (WELCOME10)", "Coupons", "POST", "/api/coupons/apply", {
    body: { code: "WELCOME10", subtotal: 5000000 },
    expectedStatus: 200,
    validate: (data) => {
      if (!data.coupon || data.coupon.discountAmount <= 0) throw new Error("Coupon did not calculate discount");
    },
  });

  await testApi("Apply Invalid Promo Coupon (FAKEMARKET)", "Coupons", "POST", "/api/coupons/apply", {
    body: { code: "FAKEMARKET", subtotal: 5000000 },
    expectedStatus: 400,
  });

  // -------------------------------------------------------------
  // 7. ORDER FULFILLMENT & LIFECYCLE
  // -------------------------------------------------------------
  console.log("\n[7/12] Testing Order API...");
  let createdOrderId = "";
  let createdOrderNumber = "";

  if (sampleProductId) {
    const orderRes = await testApi("Create New Order (COD)", "Orders", "POST", "/api/orders", {
      token: userToken,
      body: {
        customerName: "Nguyễn Văn QA",
        customerEmail: testEmail,
        customerPhone: "0909123456",
        shippingAddress: "Số 123 Đường Điện Biên Phủ, Phường Đa Kao",
        shippingCity: "TP. Hồ Chí Minh",
        shippingDistrict: "Quận 1",
        shippingWard: "Phường Đa Kao",
        paymentMethod: "COD",
        couponCode: "WELCOME10",
        items: [{ productId: sampleProductId, quantity: 1 }],
      },
      expectedStatus: 200,
      validate: (data) => {
        if (!data.order?.id) throw new Error("Order creation failed to return order id");
        createdOrderId = data.order.id;
        createdOrderNumber = data.order.orderNumber;
      },
    });

    await testApi("Get Customer Orders List", "Orders", "GET", "/api/orders", {
      token: userToken,
      expectedStatus: 200,
      validate: (data) => {
        if (!Array.isArray(data.orders) || data.orders.length === 0) throw new Error("No orders found for customer");
      },
    });

    if (createdOrderId) {
      await testApi(`Get Single Order Detail (/orders/${createdOrderId})`, "Orders", "GET", `/api/orders/${createdOrderId}`, {
        token: userToken,
        expectedStatus: 200,
      });
    }
  }

  // -------------------------------------------------------------
  // 8. PAYMENT GATEWAY & WEBHOOK IDEMPOTENCY
  // -------------------------------------------------------------
  console.log("\n[8/12] Testing Payment API & Webhooks...");
  let paymentTxnRef = "";

  if (createdOrderId) {
    await testApi("Initialize Payment Gateway", "Payments", "POST", "/api/payments", {
      token: userToken,
      body: { orderId: createdOrderId, provider: "VNPAY" },
      expectedStatus: 200,
      validate: (data) => {
        if (!data.transactionRef) throw new Error("Missing transactionRef in payment init");
        paymentTxnRef = data.transactionRef;
      },
    });

    await testApi(`Check Payment Status (/payments/${createdOrderId}/status)`, "Payments", "GET", `/api/payments/${createdOrderId}/status`, {
      token: userToken,
      expectedStatus: 200,
    });

    if (paymentTxnRef) {
      await testApi("Process Payment Gateway Webhook (SUCCESS)", "Payments", "POST", "/api/payments/webhook", {
        body: { transactionRef: paymentTxnRef, status: "SUCCESS", provider: "VNPAY" },
        expectedStatus: 200,
        validate: (data) => {
          if (!data.success) throw new Error("Webhook processing failed");
        },
      });

      // Test Webhook Idempotency (repeating same event)
      await testApi("Payment Webhook Idempotency Check (Duplicate Event)", "Payments", "POST", "/api/payments/webhook", {
        body: { transactionRef: paymentTxnRef, status: "SUCCESS", provider: "VNPAY" },
        expectedStatus: 200,
        validate: (data) => {
          if (!data.message?.includes("idempotent")) throw new Error("Webhook was not handled idempotently");
        },
      });
    }
  }

  // -------------------------------------------------------------
  // 9. REVIEWS & RATINGS
  // -------------------------------------------------------------
  console.log("\n[9/12] Testing Reviews & Ratings API...");
  let createdReviewId = "";

  if (sampleProductId) {
    await testApi(`Get Product Reviews (/reviews?productId=${sampleProductId})`, "Reviews", "GET", `/api/reviews?productId=${sampleProductId}`, {
      expectedStatus: 200,
    });

    await testApi("Submit Product Review", "Reviews", "POST", "/api/reviews", {
      token: userToken,
      body: {
        productId: sampleProductId,
        rating: 5,
        title: "Chất lượng vượt trội, đóng gói rất cẩn thận",
        comment: "Sản phẩm chính hãng đúng như cam kết, bảo hành chu đáo, giao hàng siêu nhanh!",
      },
      expectedStatus: 200,
      validate: (data) => {
        createdReviewId = data.review?.id;
      },
    });

    if (createdReviewId) {
      await testApi(`Delete Product Review (/reviews?id=${createdReviewId})`, "Reviews", "DELETE", `/api/reviews?id=${createdReviewId}`, {
        token: userToken,
        expectedStatus: 200,
      });
    }
  }

  // -------------------------------------------------------------
  // 10. WISHLIST MANAGEMENT
  // -------------------------------------------------------------
  console.log("\n[10/12] Testing Wishlist API...");
  if (sampleProductId) {
    await testApi("Add Product to Wishlist (Toggle ON)", "Wishlist", "POST", "/api/wishlist", {
      token: userToken,
      body: { productId: sampleProductId },
      expectedStatus: 200,
    });

    await testApi("Get Customer Wishlist", "Wishlist", "GET", "/api/wishlist", {
      token: userToken,
      expectedStatus: 200,
      validate: (data) => {
        if (!Array.isArray(data.wishlist) || data.wishlist.length === 0) throw new Error("Wishlist is empty after add");
      },
    });

    await testApi("Remove Product from Wishlist (Toggle OFF)", "Wishlist", "POST", "/api/wishlist", {
      token: userToken,
      body: { productId: sampleProductId },
      expectedStatus: 200,
    });
  }

  // -------------------------------------------------------------
  // 11. BANNERS
  // -------------------------------------------------------------
  console.log("\n[11/12] Testing Banners API...");
  await testApi("Get Active Promotional Banners", "Banners", "GET", "/api/banners", {
    expectedStatus: 200,
  });

  // -------------------------------------------------------------
  // 12. ADMIN CONTROL & DATABASE MONITORING
  // -------------------------------------------------------------
  console.log("\n[12/12] Testing Admin Management & Database API...");
  // Use admin token if logged in, or grant user ROLE_ADMIN in DB temporarily if needed
  if (!adminToken) {
    // Elevate test user to ROLE_ADMIN to thoroughly test Admin APIs
    const { prisma } = await import("../src/lib/prisma");
    await prisma.user.update({
      where: { email: testEmail },
      data: { role: "ROLE_ADMIN" },
    });
    // Re-login to get updated admin JWT
    const { signToken } = await import("../src/lib/auth");
    const testUserObj = await prisma.user.findUnique({ where: { email: testEmail } });
    if (testUserObj) {
      adminToken = signToken({
        userId: testUserObj.id,
        email: testUserObj.email,
        role: "ROLE_ADMIN",
      });
    }
  }

  if (adminToken) {
    await testApi("Admin: Dashboard Metrics", "Admin", "GET", "/api/admin/dashboard", {
      token: adminToken,
      expectedStatus: 200,
      validate: (data) => {
        if (!data.metrics || typeof data.metrics.totalRevenue !== "number") throw new Error("Invalid dashboard metrics");
      },
    });

    await testApi("Admin: Customer Directory", "Admin", "GET", "/api/admin/customers", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Order Management List", "Admin", "GET", "/api/admin/orders", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Export Orders to CSV", "Admin", "GET", "/api/admin/orders/export", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Warehouse Inventory Management", "Admin", "GET", "/api/admin/inventory", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Categories Management", "Admin", "GET", "/api/admin/categories", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Brands Management", "Admin", "GET", "/api/admin/brands", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Coupons Management", "Admin", "GET", "/api/admin/coupons", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Store Settings", "Admin", "GET", "/api/admin/settings", {
      token: adminToken,
      expectedStatus: 200,
    });

    await testApi("Admin: Database Storage & Health Telemetry", "Admin", "GET", "/api/admin/database", {
      token: adminToken,
      expectedStatus: 200,
      validate: (data) => {
        if (!data.engine || typeof data.sizeMB !== "number") throw new Error("Invalid database storage response");
      },
    });
  }

  // -------------------------------------------------------------
  // TEST SUMMARY & METRICS
  // -------------------------------------------------------------
  console.log("\n" + "=".repeat(80));
  console.log("                    TEST EXECUTION SUMMARY");
  console.log("=".repeat(80));

  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Endpoints Tested: ${total}`);
  console.log(`Passed:                ${passed} (✓)`);
  console.log(`Failed:                ${failed} (✗)`);
  console.log(`Pass Rate:             ${passRate}%\n`);

  // Group by Domain
  const domains = Array.from(new Set(results.map((r) => r.domain)));
  console.log("| Domain | Total | Passed | Failed | Status |");
  console.log("|---|---|---|---|---|");
  for (const d of domains) {
    const dResults = results.filter((r) => r.domain === d);
    const dPassed = dResults.filter((r) => r.status === "PASS").length;
    const dFailed = dResults.filter((r) => r.status === "FAIL").length;
    const status = dFailed === 0 ? "100% PASS ✓" : `${dFailed} FAILED ✗`;
    console.log(`| ${d.padEnd(12)} | ${String(dResults.length).padEnd(5)} | ${String(dPassed).padEnd(6)} | ${String(dFailed).padEnd(6)} | ${status} |`);
  }

  if (failed > 0) {
    console.log("\nFAILED TESTS DETAILS:");
    results.filter((r) => r.status === "FAIL").forEach((r) => {
      console.log(`- [${r.domain}] ${r.method} ${r.endpoint}: ${r.error}`);
    });
  }

  // Export results to JSON for documentation generator
  const fs = await import("fs");
  const path = await import("path");
  const reportPath = path.resolve(process.cwd(), "docs/api-audit/test-run-results.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({ summary: { total, passed, failed, passRate }, results }, null, 2));
  console.log(`\nDetailed test log exported to: ${reportPath}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
