// Native fetch is available in Node 18+

async function testSignup() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    const full_name = 'Debug User';
    const phone = '1234567890';

    console.log('Attempting signup with:', email);

    try {
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name, phone })
        });

        const status = response.status;
        const text = await response.text();

        console.log('Status:', status);
        console.log('Response:', text);

        if (!response.ok) {
            console.error('Signup Failed!');
        } else {
            console.log('Signup Success!');
        }

    } catch (error) {
        console.error('Network/Script Error:', error);
    }
}

testSignup();
