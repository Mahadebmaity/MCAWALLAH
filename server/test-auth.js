const testAuth = async () => {
    try {
        const testUser = {
            name: 'Test Visitor',
            email: `visitor_${Date.now()}@example.com`,
            password: 'Password@123'
        };

        console.log('1. Testing Sign Up (Register)...');
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${regData.message}`);
        console.log('✅ Sign Up successful:', regData.user);

        console.log('\n2. Testing Sign In (Login)...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.message}`);
        console.log('✅ Sign In successful:', loginData.user);

        console.log('\n3. Testing Admin Sign In...');
        const adminRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mahadeb@portfolio.com',
                password: 'Admin@123456'
            })
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(`Admin login failed: ${adminData.message}`);
        console.log('✅ Admin Sign In successful:', adminData.user);

        console.log('\n🎉 ALL SIGN IN & SIGN UP ENDPOINTS WORKING 100%!');
    } catch (err) {
        console.error('❌ Auth test error:', err.message);
    }
};

testAuth();
