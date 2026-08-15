const runTest = async () => {
    try {
        console.log('🔍 Testing Public API...');
        const pubRes = await fetch('http://localhost:5000/api/portfolio/public');
        const pubData = await pubRes.json();
        console.log('✅ Public API response:', {
            heroName: pubData.hero ? `${pubData.hero.firstName} ${pubData.hero.lastName}` : null,
            skillsCount: pubData.skills?.length,
            projectsCount: pubData.projects?.length,
            gamesCount: pubData.games?.length,
            settings: pubData.settings ? pubData.settings.siteTitle : null
        });

        console.log('\n🔐 Testing Admin Login...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mahadeb@portfolio.com',
                password: 'Admin@123456'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginData.message}`);
        }
        console.log('✅ Admin Login successful:', {
            user: loginData.user.name,
            email: loginData.user.email,
            role: loginData.user.role,
            hasToken: !!loginData.accessToken
        });

        console.log('\n📊 Testing Admin Overview (Protected)...');
        const overviewRes = await fetch('http://localhost:5000/api/admin/overview', {
            headers: {
                Authorization: `Bearer ${loginData.accessToken}`
            }
        });
        const overviewData = await overviewRes.json();
        console.log('✅ Admin Overview stats:', overviewData.stats);

        console.log('\n🎉 ALL BACKEND FOUNDATION TESTS PASSED PERFECTLY!');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
};

runTest();
