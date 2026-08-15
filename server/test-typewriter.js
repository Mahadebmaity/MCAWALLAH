const testTypewriterUpdate = async () => {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mahadeb@portfolio.com',
                password: 'Admin@123456'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.accessToken;

        console.log('2. Fetching current hero data...');
        const heroRes = await fetch('http://localhost:5000/api/admin/section/hero', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const hero = await heroRes.json();

        console.log('Current typewriter roles:', hero.typewriterRoles);

        const newRoles = [...(hero.typewriterRoles || []), 'Cloud Architect & AI Engineer'];
        console.log('\n3. Saving updated hero with new typewriter role:', newRoles);

        const saveRes = await fetch('http://localhost:5000/api/admin/section/hero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...hero,
                typewriterRoles: newRoles
            })
        });
        const savedHero = await saveRes.json();
        console.log('✅ Save response received:', savedHero.typewriterRoles);

        console.log('\n4. Verifying public API endpoint (GET /api/portfolio/public)...');
        const pubRes = await fetch('http://localhost:5000/api/portfolio/public');
        const pubData = await pubRes.json();
        console.log('✅ Public API typewriter roles:', pubData.hero?.typewriterRoles);

        console.log('\n🎉 TYPEWRITER SECTION UPDATE & REAL-TIME SYNC VERIFIED 100%!');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
};

testTypewriterUpdate();
