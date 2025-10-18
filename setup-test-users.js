// Test kullanıcıları oluşturmak için script
// Bu dosyayı console'da çalıştırarak test kullanıcıları oluşturabilirsiniz

function createTestUsers() {
    console.log('🧪 Test kullanıcıları oluşturuluyor...');
    
    // Test kullanıcıları
    const testUsers = [
        {
            email: 'test@example.com',
            username: 'testuser',
            password: '123456'
        },
        {
            email: 'demo@filmalisa.com',
            username: 'demo',
            password: 'demo123'
        },
        {
            email: 'admin@filmalisa.com',
            username: 'admin',
            password: 'admin123'
        }
    ];
    
    testUsers.forEach(user => {
        const mockUser = {
            id: Date.now() + Math.random(),
            username: user.username,
            email: user.email,
            password: user.password, // Gerçek uygulamada şifrelenmeli
            createdAt: new Date().toISOString(),
            isTestUser: true
        };
        
        // Mock user data'yı localStorage'a kaydet
        localStorage.setItem('mock_user_' + user.email, JSON.stringify(mockUser));
        
        console.log(`✅ Test kullanıcısı oluşturuldu: ${user.email}`);
    });
    
    console.log('🎉 Tüm test kullanıcıları oluşturuldu!');
    console.log('📧 Test kullanıcıları:');
    testUsers.forEach(user => {
        console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });
}

function clearTestUsers() {
    console.log('🧹 Test kullanıcıları temizleniyor...');
    
    const keys = Object.keys(localStorage);
    const mockKeys = keys.filter(key => key.startsWith('mock_user_'));
    
    mockKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    console.log(`✅ ${mockKeys.length} test kullanıcısı temizlendi`);
}

function listTestUsers() {
    console.log('📋 Mevcut test kullanıcıları:');
    
    const keys = Object.keys(localStorage);
    const mockKeys = keys.filter(key => key.startsWith('mock_user_'));
    
    if (mockKeys.length === 0) {
        console.log('   Hiç test kullanıcısı bulunamadı');
        return;
    }
    
    mockKeys.forEach(key => {
        const userData = JSON.parse(localStorage.getItem(key));
        console.log(`   📧 ${userData.email} (${userData.username})`);
    });
}

// Global fonksiyonlar olarak tanımla
window.createTestUsers = createTestUsers;
window.clearTestUsers = clearTestUsers;
window.listTestUsers = listTestUsers;

console.log('🔧 Test kullanıcı yardımcıları yüklendi!');
console.log('Komutlar:');
console.log('  createTestUsers() - Test kullanıcıları oluştur');
console.log('  clearTestUsers() - Test kullanıcılarını temizle');
console.log('  listTestUsers() - Mevcut test kullanıcılarını listele');
