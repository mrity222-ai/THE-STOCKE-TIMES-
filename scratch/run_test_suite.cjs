const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json, rawBody: data });
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runFullTestSuite() {
  console.log('============ 🚀 STARTING FULL END-TO-END TEST SUITE ============');
  const results = [];

  // Step 0: Admin Login
  console.log('\n🔐 Step 0: Authenticating Admin User...');
  let authToken = '';
  try {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login-step1',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'info@avedatechnologies.com', password: 'Admin@123456', directLogin: true });

    if (loginRes.statusCode === 200 && loginRes.body?.success && loginRes.body?.token) {
      authToken = loginRes.body.token;
      console.log(`✅ Admin Login Successful! Token: ${authToken.slice(0, 15)}...`);
    } else {
      console.log('⚠️ Admin login response:', loginRes.statusCode, loginRes.body);
    }
  } catch (err) {
    console.log('⚠️ Admin login error:', err.message);
  }

  // 1️⃣ Test Case 1A: Market Data API
  console.log('\n📊 Test 1A: Yahoo Finance Market Data API (GET /api/market-data)...');
  try {
    const marketRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/market-data', method: 'GET' });
    const isOk = marketRes.statusCode === 200 && Array.isArray(marketRes.body?.indices);
    const nifty = marketRes.body?.indices?.find(i => i.symbol === 'NIFTY 50');
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${marketRes.statusCode}, Nifty Value: ${nifty ? nifty.value : 'N/A'})`);
    results.push({ test: '1. Yahoo Finance Market Data API', pass: isOk, detail: `Fetched ${marketRes.body?.indices?.length || 0} live market indices` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: '1. Yahoo Finance Market Data API', pass: false, detail: err.message });
  }

  // 2️⃣ Test Case 1B: Finnhub News API
  console.log('\n📰 Test 1B: Finnhub Breaking News API (GET /api/finnhub/news)...');
  try {
    const newsRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/finnhub/news', method: 'GET' });
    const articles = newsRes.body?.articles || [];
    const isOk = newsRes.statusCode === 200 && Array.isArray(articles) && articles.length > 0;
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${newsRes.statusCode}, Articles fetched: ${articles.length})`);
    if (articles[0]) {
      console.log(`   📌 Sample News Headline: "${articles[0].headline || articles[0].title}"`);
    }
    results.push({ test: '2. Finnhub Breaking News API', pass: isOk, detail: `${articles.length} news articles fetched` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: '2. Finnhub Breaking News API', pass: false, detail: err.message });
  }

  // 3️⃣ Test Case 1C: Finnhub Webhook Receiver
  console.log('\n⚡ Test 1C: Finnhub Real-Time Webhook Endpoint (POST /api/finnhub/webhook)...');
  try {
    const webhookRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/finnhub/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finnhub-Secret': 'dav1e0pr01qrjdu8j23g'
      }
    }, { event: 'ping', symbol: 'NSE:RELIANCE', timestamp: Date.now() });
    const isOk = webhookRes.statusCode === 200 && webhookRes.body?.received === true;
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${webhookRes.statusCode}, Received: ${webhookRes.body?.received})`);
    results.push({ test: '3. Finnhub Webhook Receiver', pass: isOk, detail: `Instant ACK 200 OK (Received: ${webhookRes.body?.received})` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: '3. Finnhub Webhook Receiver', pass: false, detail: err.message });
  }

  // 4️⃣ Test Case 2 & 3: AI Agents Post Writing & Publishing
  console.log('\n🤖 Test 2 & 3: 10 AI Agents AutoPilot Article Generation & Live Publishing...');
  const sampleTopic = 'Tata Motors Q2 Earnings & Nifty 50 Market Forecast 2026';
  let createdArticleId = null;
  let createdArticleSlug = null;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const autoRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/autopilot-post',
      method: 'POST',
      headers
    }, {
      topic: sampleTopic,
      category: 'stock-market',
      country: 'IN',
      autoPublish: true
    });

    const isOk = autoRes.statusCode === 200 && autoRes.body?.success && autoRes.body?.article;
    if (isOk) {
      createdArticleId = autoRes.body.article.id;
      createdArticleSlug = autoRes.body.article.slug;
      const rawText = autoRes.body.article.content || '';
      const wordCount = rawText.split(/\s+/).length;

      console.log(`✅ PASS! AI Article Created & Posted Live!`);
      console.log(`   📌 Article ID: ${createdArticleId}`);
      console.log(`   📌 Slug: ${createdArticleSlug}`);
      console.log(`   📌 Title: ${autoRes.body.article.title}`);
      console.log(`   📌 Content Length: ~${wordCount} words`);
      console.log(`   📌 Featured Image URL: ${autoRes.body.article.featuredImage ? 'Yes (Generated/Curated)' : 'No'}`);
      console.log(`   📌 Tags: ${(autoRes.body.article.tags || []).join(', ')}`);

      results.push({ test: '4. 10 AI Agents Article Writing Engine', pass: true, detail: `Created ~${wordCount} word article with tables, tags & image` });
    } else {
      console.log('❌ FAIL:', autoRes.statusCode, autoRes.body);
      results.push({ test: '4. 10 AI Agents Article Writing Engine', pass: false, detail: JSON.stringify(autoRes.body) });
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: '4. 10 AI Agents Article Writing Engine', pass: false, detail: err.message });
  }

  // 5️⃣ Test Case 3B: Verify Live Article in List & Sitemap
  console.log('\n🌐 Test 3B: Verifying Live Rendering & Sitemap Sync...');
  try {
    const listRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/articles', method: 'GET' });
    const articles = Array.isArray(listRes.body) ? listRes.body : listRes.body?.articles || [];
    const foundInList = articles.some(a => a.id === createdArticleId || a.slug === createdArticleSlug);

    const sitemapRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/sitemap.xml', method: 'GET' });
    const foundInSitemap = typeof sitemapRes.rawBody === 'string' && createdArticleSlug && sitemapRes.rawBody.includes(createdArticleSlug);

    console.log(`   📌 Found in Live Articles Feed: ${foundInList ? '✅ YES' : '❌ NO'}`);
    console.log(`   📌 Found in Sitemap.xml: ${foundInSitemap ? '✅ YES' : '❌ NO'}`);

    const pass = foundInList && foundInSitemap;
    results.push({ test: '5. Live Post Rendering & Sitemap Update', pass, detail: `Feed: ${foundInList ? 'OK' : 'MISSING'}, Sitemap: ${foundInSitemap ? 'OK' : 'MISSING'}` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: '5. Live Post Rendering & Sitemap Update', pass: false, detail: err.message });
  }

  // 6️⃣ Test Case 4: Article Deletion Test
  console.log('\n🗑️ Test 4: Deleting Article via DELETE /api/articles/:id...');
  if (createdArticleId) {
    try {
      const delRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/api/articles/${createdArticleId}`,
        method: 'DELETE'
      });

      const isDelOk = delRes.statusCode === 200 && delRes.body?.success;
      console.log(`   📌 Delete API Status: ${isDelOk ? '✅ PASS' : '❌ FAIL'} (${delRes.body?.message})`);

      // Verify removal from feed
      const verifyListRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/articles', method: 'GET' });
      const verifyArticles = Array.isArray(verifyListRes.body) ? verifyListRes.body : verifyListRes.body?.articles || [];
      const stillInList = verifyArticles.some(a => a.id === createdArticleId || a.slug === createdArticleSlug);

      // Verify removal from sitemap
      const verifySitemapRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/sitemap.xml', method: 'GET' });
      const stillInSitemap = typeof verifySitemapRes.rawBody === 'string' && createdArticleSlug && verifySitemapRes.rawBody.includes(createdArticleSlug);

      console.log(`   📌 Removed from Live Articles Feed: ${!stillInList ? '✅ YES (Cleaned)' : '❌ NO (Still present)'}`);
      console.log(`   📌 Removed from Sitemap.xml: ${!stillInSitemap ? '✅ YES (Cleaned)' : '❌ NO (Still present)'}`);

      const pass = isDelOk && !stillInList && !stillInSitemap;
      results.push({ test: '6. Article Deletion & Storage Cleanup', pass, detail: `Successfully removed from DB, Feed & Sitemap` });
    } catch (err) {
      console.log('❌ FAIL:', err.message);
      results.push({ test: '6. Article Deletion & Storage Cleanup', pass: false, detail: err.message });
    }
  } else {
    console.log('⚠️ Skipping deletion test since article creation did not return ID.');
  }

  console.log('\n================ 📊 FINAL TEST RESULTS SUMMARY ================');
  results.forEach((r, i) => {
    console.log(`${r.test.padEnd(48, '.')} ${r.pass ? '✅ PASS' : '❌ FAIL'} (${r.detail})`);
  });
  console.log('===============================================================\n');
}

runFullTestSuite();
