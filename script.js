// 데이터 저장소 (실제로는 데이터베이스 사용해야 합니다)
let hospitals = JSON.parse(localStorage.getItem('hospitals')) || [];
let parts = JSON.parse(localStorage.getItem('parts')) || [];
let warehouse = JSON.parse(localStorage.getItem('warehouse')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let currentParts = JSON.parse(localStorage.getItem('currentParts')) || []; // 현재 장착된 부품
let inoutHistory = JSON.parse(localStorage.getItem('inoutHistory')) || []; // 입출고 히스토리
let coils = JSON.parse(localStorage.getItem('coils')) || []; // 코일 재고
let accounts = JSON.parse(localStorage.getItem('accounts')) || [
    // 기본 관리자 계정
    {
        id: '1',
        name: '관리자',
        username: 'admin',
        password: 'admin',
        role: 'admin'
    }
];



// 계정 데이터가 없으면 기본 관리자 계정 저장
if (!localStorage.getItem('accounts')) {
    localStorage.setItem('accounts', JSON.stringify(accounts));
} else {
    // 기존 계정 데이터 확인 및 관리자 계정 복원
    const savedAccounts = JSON.parse(localStorage.getItem('accounts'));
    const adminExists = savedAccounts.find(acc => acc.username === 'admin');
    
    if (!adminExists) {
        // 관리자 계정이 없으면 추가
        const adminAccount = {
            id: Date.now().toString(),
            name: '관리자',
            username: 'admin',
            password: 'admin',
            role: 'admin'
        };
        savedAccounts.push(adminAccount);
        localStorage.setItem('accounts', JSON.stringify(savedAccounts));
        accounts = savedAccounts;
    } else {
        accounts = savedAccounts;
    }
}

// 현재 선택된 병원 ID
let currentHospitalId = null;

// 로그인 상태
let isLoggedIn = false;
let currentUser = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 계정 데이터 다시 로드
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
        accounts = JSON.parse(savedAccounts);
    }
    
    // 출고부품 데이터 초기화
    const savedOutboundParts = localStorage.getItem('outboundParts');
    if (savedOutboundParts) {
        window.outboundParts = JSON.parse(savedOutboundParts);
    }
    
    // 출고 히스토리 데이터 초기화
    const savedOutboundHistory = localStorage.getItem('outboundHistory');
    if (savedOutboundHistory) {
        window.outboundHistory = JSON.parse(savedOutboundHistory);
    }
    
    console.log('페이지 로드 시 계정 데이터:', accounts);
    console.log('페이지 로드 시 출고부품 데이터:', window.outboundParts);
    console.log('페이지 로드 시 출고 히스토리 데이터:', window.outboundHistory);
    
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 관리자 권한 자동 복원
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.role === 'admin') {
            currentUser = parsedUser;
            isLoggedIn = true;
            console.log('관리자 권한 자동 복원:', currentUser);
        }
    }
    
    // 로그인 폼 이벤트 리스너
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    // 로그인된 경우에만 시스템 초기화
    if (isLoggedIn) {
        initializeSystem();
    }
    
    // 관리자 권한 강제 활성화 (조용히)
    if (currentUser && currentUser.username === 'admin') {
        console.log('관리자 계정 감지, 권한 강제 활성화');
        // forceAdminMode(); // 자동 실행 제거
    }
});

// 로그인 상태 확인
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        showMainSystem();
        initializeSystem();
    } else {
        showLoginPage();
    }
}

// 로그인 페이지 표시
function showLoginPage() {
    document.getElementById('login').classList.add('active');
    document.getElementById('main-system').classList.remove('active');
    isLoggedIn = false;
    currentUser = null;
}

// 메인 시스템 표시
function showMainSystem() {
    document.getElementById('login').classList.remove('active');
    document.getElementById('main-system').classList.add('active');
    document.getElementById('current-user').textContent = currentUser ? currentUser.name : '관리자';
    
    // 계정관리 버튼은 관리자만 볼 수 있음
    const accountsBtn = document.querySelector('.nav-btn[onclick="showSection(\'accounts\')"]');
    if (accountsBtn) {
        accountsBtn.style.display = isAdmin() ? 'inline-block' : 'none';
    }
    
    // 부품 추가 버튼은 모든 사용자가 볼 수 있음
    const addPartBtn = document.querySelector('.add-part-btn');
    if (addPartBtn) {
        addPartBtn.style.display = 'inline-block';
    }
}

// 시스템 초기화
function initializeSystem() {
    loadHospitals();
    loadHospitalList();
    loadParts();
    loadWarehouse('');
    loadHistory();
    loadInoutHistory('');
    loadAccounts();
    loadOutboundParts();
    loadOutboundHistory();
    loadCoils('');
    loadCoilHistory(1, '');
    updateSelects();
}

// 로그인 함수
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('로그인 시도:', { username, password });
    console.log('등록된 계정들:', accounts);
    
    // 계정 데이터베이스에서 사용자 찾기
    const user = accounts.find(account => 
        account.username === username && account.password === password
    );
    
    console.log('찾은 사용자:', user);
    
    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        };
        
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        console.log('로그인 성공:', currentUser);
        console.log('관리자 여부:', isAdmin());
        
        showMainSystem();
        initializeSystem();
        
        alert('로그인되었습니다!');
    } else {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
}

// 데모 로그인
function demoLogin() {
    document.getElementById('username').value = 'admin';
    document.getElementById('password').value = 'admin';
    login();
}

// 관리자 권한 체크 함수
function isAdmin() {
    // localStorage에서 다시 확인
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && (parsedUser.role === 'admin' || parsedUser.username === 'admin')) {
            currentUser = parsedUser;
            isLoggedIn = true;
            // 관리자 권한 강제 설정
            if (parsedUser.username === 'admin' && parsedUser.role !== 'admin') {
                parsedUser.role = 'admin';
                currentUser.role = 'admin';
                localStorage.setItem('currentUser', JSON.stringify(parsedUser));
            }
        }
    }
    
    const isAdminUser = isLoggedIn && currentUser && (currentUser.role === 'admin' || currentUser.username === 'admin');
    console.log('isAdmin 체크:', {
        isLoggedIn,
        currentUser,
        userRole: currentUser ? currentUser.role : 'none',
        username: currentUser ? currentUser.username : 'none',
        isAdminUser,
        savedUser: localStorage.getItem('currentUser')
    });
    return isAdminUser;
}

// 관리자 권한 확인 및 알림
function checkAdminPermission() {
    const hasPermission = isAdmin();
    console.log('checkAdminPermission:', hasPermission);
    if (!hasPermission) {
        alert('관리자만 수정할 수 있습니다.');
        return false;
    }
    return true;
}

// 로그아웃 함수
function logout() {
    if (confirm('정말로 로그아웃하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        isLoggedIn = false;
        currentUser = null;
        showLoginPage();
    }
}

// 섹션 전환 함수 (로그인된 경우에만 작동)
function showSection(sectionId) {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    // 계정관리 페이지는 관리자만 접근 가능
    if (sectionId === 'accounts' && !isAdmin()) {
        alert('관리자만 접근할 수 있습니다.');
        return;
    }
    
    // 모든 섹션 숨기기
    document.querySelectorAll('#main-system .section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 네비게이션 버튼 비활성화
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 섹션과 버튼 활성화
    document.getElementById(sectionId).classList.add('active');
    
    // 병원상세 버튼은 조건부로 활성화
    if (sectionId === 'hospital-detail') {
        document.getElementById('hospital-detail-btn').classList.add('active');
    } else {
        document.getElementById('hospital-detail-btn').style.display = 'none';
    }
}

// 병원관리로 돌아가기
function backToHospitals() {
    if (!isLoggedIn) return;
    showSection('hospitals');
    document.getElementById('hospital-detail-btn').style.display = 'none';
    currentHospitalId = null;
}

// 병원 관리
function loadHospitals(searchTerm = '', currentPage = 1) {
    if (!isLoggedIn) return;
    
    console.log('loadHospitals - 관리자 권한 확인:', {
        isLoggedIn,
        currentUser,
        isAdmin: isAdmin()
    });
    
    const container = document.getElementById('hospitals-list');
    const paginationContainer = document.getElementById('hospitals-pagination');
    container.innerHTML = '';
    
    if (hospitals.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">등록된 병원이 없습니다. 위의 폼에서 병원을 추가해주세요.</td></tr>';
        return;
    }
    
    // 검색어가 있으면 필터링
    const filteredHospitals = searchTerm 
        ? hospitals.filter(hospital => 
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (hospital.modality && hospital.modality.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.systemId && hospital.systemId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.equipment && hospital.equipment.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.softwareVersion && hospital.softwareVersion.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : hospitals;
    
    if (filteredHospitals.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    // 페이지네이션 설정
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHospitals = filteredHospitals.slice(startIndex, endIndex);
    
    // 테이블 행 생성
    paginatedHospitals.forEach(hospital => {
        const row = document.createElement('tr');
        // 관리자만 수정/삭제 버튼 표시
        const adminButtons = isAdmin() ? `
            <button class="btn-edit" onclick="editHospital('${hospital.id}')">수정</button>
            <button class="btn-delete" onclick="deleteHospital('${hospital.id}')">삭제</button>
        ` : '';
        
        row.innerHTML = `
            <td>${hospital.name}</td>
            <td>${hospital.modality || '미등록'}</td>
            <td>${hospital.systemId || '미등록'}</td>
            <td>${hospital.equipment || '미등록'}</td>
            <td>${hospital.softwareVersion || '미등록'}</td>
            <td>${hospital.address}</td>
            <td>${hospital.phone}</td>
            <td>
                <div class="flex gap-2">
                    <button class="btn-view" onclick="viewHospitalDetail('${hospital.id}')">상세보기</button>
                    ${adminButtons}
                </div>
            </td>
        `;
        container.appendChild(row);
    });
    
    // 페이지네이션 컨트롤 생성
    if (totalPages > 1) {
        let paginationHTML = '';
        
        // 이전 버튼
        if (currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" onclick="loadHospitals('${searchTerm}', ${currentPage - 1})">◀ 이전</button>`;
        }
        
        // 페이지 번호
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadHospitals('${searchTerm}', ${i})">${i}</button>`;
        }
        
        // 다음 버튼
        if (currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" onclick="loadHospitals('${searchTerm}', ${currentPage + 1})">다음 ▶</button>`;
        }
        
        // 페이지 정보
        paginationHTML += `<span class="pagination-info">${filteredHospitals.length}개 중 ${startIndex + 1}-${Math.min(endIndex, filteredHospitals.length)}개</span>`;
        
        paginationContainer.innerHTML = paginationHTML;
    } else {
        paginationContainer.innerHTML = '';
    }
}

function loadHospitalList(searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('hospital-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (hospitals.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 병원이 없습니다.</p>';
        return;
    }
    
    // 검색어가 있으면 필터링
    const filteredHospitals = searchTerm 
        ? hospitals.filter(hospital => 
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (hospital.modality && hospital.modality.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.systemId && hospital.systemId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.equipment && hospital.equipment.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (hospital.softwareVersion && hospital.softwareVersion.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : hospitals;
    
    if (filteredHospitals.length === 0) {
        container.innerHTML = '<p class="no-data">검색 결과가 없습니다.</p>';
        return;
    }
    
    filteredHospitals.forEach(hospital => {
        const hospitalDiv = document.createElement('div');
        hospitalDiv.className = 'item-card';
        // 관리자만 수정/삭제 버튼 표시
        const adminButtons = isAdmin() ? `
            <button class="btn-edit" onclick="editHospital('${hospital.id}')">수정</button>
            <button class="btn-delete" onclick="deleteHospital('${hospital.id}')">삭제</button>
        ` : '';
        
        hospitalDiv.innerHTML = `
            <h4>${hospital.name}</h4>
            <p><strong>Modality:</strong> ${hospital.modality || '미등록'}</p>
            <p><strong>System ID:</strong> ${hospital.systemId || '미등록'}</p>
            <p><strong>장비명:</strong> ${hospital.equipment || '미등록'}</p>
            <p><strong>Software Version:</strong> ${hospital.softwareVersion || '미등록'}</p>
            <p><strong>주소:</strong> ${hospital.address}</p>
            <p><strong>연락처:</strong> ${hospital.phone}</p>
            <div class="item-actions">
                <button class="btn-view" onclick="viewHospitalDetail('${hospital.id}')">상세보기</button>
                ${adminButtons}
            </div>
        `;
        container.appendChild(hospitalDiv);
    });
}



// 병원 상세보기 (새 페이지로 이동)
function viewHospitalDetail(hospitalId) {
    if (!isLoggedIn) return;
    
    currentHospitalId = hospitalId;
    const hospital = hospitals.find(h => h.id === hospitalId);
    
    if (!hospital) return;
    
    // 병원상세 버튼 표시
    document.getElementById('hospital-detail-btn').style.display = 'inline-block';
    
    // 병원 이름 설정
    document.getElementById('detail-hospital-name').textContent = `${hospital.name} 상세정보`;
    
    // 기본 정보 표시
    const basicInfo = document.getElementById('hospital-basic-info');
    basicInfo.innerHTML = `
        <p><strong>병원명:</strong> ${hospital.name}</p>
        <p><strong>Modality:</strong> ${hospital.modality || '미등록'}</p>
        <p><strong>System ID:</strong> ${hospital.systemId || '미등록'}</p>
        <p><strong>장비명:</strong> ${hospital.equipment || '미등록'}</p>
        <p><strong>Software Version:</strong> ${hospital.softwareVersion || '미등록'}</p>
        <p><strong>주소:</strong> ${hospital.address}</p>
        <p><strong>연락처:</strong> ${hospital.phone}</p>
    `;
    
    // 현재 장착된 부품 로드
    loadCurrentParts(hospitalId);
    
    // 교체된 부품 시트 로드
    loadReplacedPartsSheet(hospitalId);
    
    // Site INFO 검색 기능 초기화
    setTimeout(() => {
        initializeSiteInfoSearch();
    }, 100);
    
    // 부품 추가 버튼 표시 설정
    const addPartBtn = document.querySelector('.add-part-btn');
    if (addPartBtn) {
        addPartBtn.style.display = 'inline-block';
    }
    
    // 상세 페이지로 이동
    showSection('hospital-detail');
}

// 최근 장착된 부품 로드 (최근 5개만 표시)
function loadCurrentParts(hospitalId, currentPage = 1) {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('current-parts-list');
    const paginationContainer = document.getElementById('current-parts-pagination');
    container.innerHTML = '';
    paginationContainer.innerHTML = '';
    
    const hospitalCurrentParts = currentParts.filter(cp => cp.hospitalId === hospitalId);
    
    if (hospitalCurrentParts.length === 0) {
        container.innerHTML = '<p class="no-data">최근 장착된 부품이 없습니다.</p>';
        return;
    }
    
    // 최근 교체된 부품 5개만 표시 (교체일 기준 내림차순 정렬)
    const sortedParts = hospitalCurrentParts.sort((a, b) => new Date(b.installDate) - new Date(a.installDate));
    const recentParts = sortedParts.slice(0, 5);
    
    // 페이지네이션 설정 (최대 5개이므로 페이지네이션 불필요)
    const itemsPerPage = 5;
    const totalPages = Math.ceil(recentParts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = recentParts.slice(startIndex, endIndex);
    
    // 현재 페이지 아이템들 표시
    currentPageItems.forEach(currentPart => {
        const partDiv = document.createElement('div');
        partDiv.className = 'item-card current-part-card';
        
        // 액션 버튼들 생성
        const actionButtons = [];
        if (isAdmin()) {
            actionButtons.push(`<button class="btn-edit" onclick="editCurrentPart('${currentPart.id}')">수정</button>`);
        }
        actionButtons.push(`<button class="btn-view" onclick="replaceCurrentPart('${currentPart.id}')">교체</button>`);
        if (isAdmin()) {
            actionButtons.push(`<button class="btn-delete" onclick="removeCurrentPart('${currentPart.id}')">제거</button>`);
        }
        
        const actionsHtml = actionButtons.join(' ');
        
        partDiv.innerHTML = `
            <h4>${currentPart.partName}</h4>
            <p><strong>부품번호:</strong> ${currentPart.partNumber || '미등록'}</p>
            <p><strong>시리얼번호:</strong> ${currentPart.serialNumber || '미등록'}</p>
            <p><strong>교체일:</strong> ${currentPart.installDate}</p>
            <p><strong>작업자:</strong> ${currentPart.worker || '미등록'}</p>
            ${currentPart.errorNotes ? `<p><strong>에러 내용:</strong> ${currentPart.errorNotes}</p>` : ''}
            <div class="item-actions">
                ${actionsHtml}
            </div>
        `;
        container.appendChild(partDiv);
    });
    
    // 최근 5개만 표시하므로 페이지네이션 불필요
    // 페이지네이션 컨테이너 비우기
    paginationContainer.innerHTML = '';
}

// 최근 장착된 부품 페이지네이션 생성 (사용하지 않음)
function createCurrentPartsPagination(totalPages, currentPage, hospitalId) {
    const paginationContainer = document.getElementById('current-parts-pagination');
    
    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => loadCurrentParts(hospitalId, currentPage - 1);
    paginationContainer.appendChild(prevButton);
    
    // 페이지 번호 버튼들
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.onclick = () => loadCurrentParts(hospitalId, i);
        paginationContainer.appendChild(pageButton);
    }
    
    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => loadCurrentParts(hospitalId, currentPage + 1);
    paginationContainer.appendChild(nextButton);
}



// 교체된 부품 시트 로드
function loadReplacedPartsSheet(hospitalId, searchTerm = '') {
    if (!isLoggedIn) return;
    
    const tbody = document.getElementById('replaced-parts-list');
    tbody.innerHTML = '';
    
    // 해당 병원의 교체 히스토리와 Site INFO 항목들 필터링
    const hospitalHistory = history.filter(h => h.hospitalId === hospitalId);
    
    if (hospitalHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">현재 장착된 부품이 없습니다.</td></tr>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...hospitalHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 중복된 부품명 제거 (최신 것만 유지) - Site INFO 전용 항목은 별도 처리
    const uniqueParts = [];
    const seenParts = new Set();
    const siteInfoOnlyItems = [];
    
    sortedHistory.forEach(item => {
        if (item.isSiteInfoOnly) {
            // Site INFO 전용 항목은 별도로 추가
            siteInfoOnlyItems.push(item);
        } else {
            // 일반 교체 히스토리 항목은 중복 제거
            if (!seenParts.has(item.partName)) {
                seenParts.add(item.partName);
                uniqueParts.push(item);
            }
        }
    });
    
    // 모든 항목을 합치고 날짜순으로 정렬
    let allItems = [...uniqueParts, ...siteInfoOnlyItems].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        allItems = allItems.filter(item => 
            (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.worker && item.worker.toLowerCase().includes(searchLower))
        );
    }
    
    if (allItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    allItems.forEach(item => {
        const row = document.createElement('tr');
        
        // 교체일 표시 (YYYY-MM-DD 형식)
        const installDate = item.date || '미등록';
        
        // 관리자만 수정/삭제 버튼 표시
        const actionButtons = isAdmin() ? `
            <div class="action-buttons">
                <button class="edit-btn" onclick="editSiteInfoItem('${item.id}')">수정</button>
                <button class="delete-btn" onclick="deleteSiteInfoItem('${item.id}')">삭제</button>
            </div>
        ` : '';
        
        row.innerHTML = `
            <td>${item.partName}</td>
            <td>${item.partNumber || '미등록'}</td>
            <td>${item.serialNumber || '미등록'}</td>
            <td>${installDate}</td>
            <td>${item.worker || '미등록'}</td>
            <td>${actionButtons}</td>
        `;
        tbody.appendChild(row);
    });
    
    // 현재 필터링된 히스토리를 전역 변수에 저장 (엑셀 추출용)
    window.currentFilteredHistory = allItems;
}

// Site INFO 검색 기능
function initializeSiteInfoSearch() {
    const searchInput = document.getElementById('site-info-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadReplacedPartsSheet(currentHospitalId, searchTerm);
        });
    }
}

// 병원 교체 히스토리 로드
function loadHospitalHistory(hospitalId) {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('hospital-history-list');
    container.innerHTML = '';
    
    // 해당 병원의 교체 히스토리만 필터링
    const hospitalHistory = history.filter(h => h.hospitalId === hospitalId);
    
    if (hospitalHistory.length === 0) {
        container.innerHTML = '<p class="no-data">교체 히스토리가 없습니다.</p>';
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...hospitalHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedHistory.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'item-card history-item-card';
        
        // 자동 생성된 기록인지 표시
        const autoGeneratedBadge = item.isAutoGenerated ? '<span class="auto-badge">자동생성</span>' : '';
        
        // 관리자만 삭제 버튼 표시
        const deleteButton = isAdmin() ? `<button class="btn-delete" onclick="deleteHistoryItem('${item.id}')">삭제</button>` : '';
        
        historyDiv.innerHTML = `
            <h4>${item.partName} ${autoGeneratedBadge}</h4>
            <p><strong>부품번호:</strong> ${item.partNumber || '미등록'}</p>
            <p><strong>시리얼번호:</strong> ${item.serialNumber || '미등록'}</p>
            <p><strong>교체일:</strong> ${item.date}</p>
            <p><strong>작업자:</strong> ${item.worker || '미등록'}</p>
            <div class="item-actions">
                ${deleteButton}
            </div>
        `;
        container.appendChild(historyDiv);
    });
}

// Site INFO 항목 수정
function editSiteInfoItem(historyId) {
    if (!isLoggedIn || !checkAdminPermission()) return;
    
    const historyItem = history.find(h => h.id === historyId);
    if (!historyItem) return;
    
    const formHtml = `
        <div class="add-part-form">
            <h4>Site INFO 항목 수정</h4>
            <form id="edit-site-info-form">
                <input type="text" id="edit-site-part-name" placeholder="부품명" value="${historyItem.partName}" required>
                <input type="text" id="edit-site-part-number" placeholder="부품번호" value="${historyItem.partNumber || ''}" required>
                <input type="text" id="edit-site-serial-number" placeholder="시리얼번호" value="${historyItem.serialNumber || ''}" required>
                <input type="date" id="edit-site-date" value="${historyItem.date}" required>
                <input type="text" id="edit-site-worker" placeholder="작업자" value="${historyItem.worker || ''}" required>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    document.getElementById('edit-site-info-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPartName = document.getElementById('edit-site-part-name').value.trim();
        const newPartNumber = document.getElementById('edit-site-part-number').value.trim();
        const newSerialNumber = document.getElementById('edit-site-serial-number').value.trim();
        const newDate = document.getElementById('edit-site-date').value;
        const newWorker = document.getElementById('edit-site-worker').value.trim();
        
        if (newPartName && newDate) {
            // Site INFO 항목만 수정 (교체 히스토리나 현재 장착된 부품에는 영향 없음)
            historyItem.partName = newPartName;
            historyItem.partNumber = newPartNumber;
            historyItem.serialNumber = newSerialNumber;
            historyItem.date = newDate;
            historyItem.worker = newWorker;
            
            localStorage.setItem('history', JSON.stringify(history));
            
            // Site INFO 테이블만 새로고침
            loadReplacedPartsSheet(currentHospitalId);
            closeModal();
            
            alert('Site INFO 항목이 성공적으로 수정되었습니다!');
        } else {
            alert('필수 항목을 모두 입력해주세요.');
        }
    });
}

// Site INFO 항목 삭제
function deleteSiteInfoItem(historyId) {
    if (!isLoggedIn || !checkAdminPermission()) return;
    
    if (confirm('이 Site INFO 항목을 삭제하시겠습니까?')) {
        // Site INFO 항목만 삭제 (교체 히스토리나 현재 장착된 부품에는 영향 없음)
        const index = history.findIndex(h => h.id === historyId);
        if (index !== -1) {
            history.splice(index, 1);
            localStorage.setItem('history', JSON.stringify(history));
            
            // Site INFO 테이블만 새로고침
            loadReplacedPartsSheet(currentHospitalId);
            
            alert('Site INFO 항목이 삭제되었습니다!');
        }
    }
}

// Site INFO 추가 폼 표시
function showAddSiteInfoForm() {
    if (!isLoggedIn || !currentHospitalId) return;
    
    const formHtml = `
        <div class="add-part-form">
            <h4>Site INFO 추가</h4>
            <form id="add-site-info-form">
                <input type="text" id="site-info-part-name" placeholder="부품명" required>
                <input type="text" id="site-info-part-number" placeholder="부품번호" required>
                <input type="text" id="site-info-serial-number" placeholder="시리얼번호" required>
                <input type="date" id="site-info-date" required>
                <input type="text" id="site-info-worker" placeholder="작업자" required>
                <div class="form-buttons">
                    <button type="submit">추가</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    document.getElementById('add-site-info-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const partName = document.getElementById('site-info-part-name').value.trim();
        const partNumber = document.getElementById('site-info-part-number').value.trim();
        const serialNumber = document.getElementById('site-info-serial-number').value.trim();
        const date = document.getElementById('site-info-date').value;
        const worker = document.getElementById('site-info-worker').value.trim();
        
        if (partName && date) {
            // Site INFO 전용 데이터 구조 생성 (교체 히스토리나 현재 장착된 부품과 독립적)
            const siteInfoItem = {
                id: 'site-info-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                hospitalId: currentHospitalId,
                partName: partName,
                partNumber: partNumber,
                serialNumber: serialNumber,
                date: date,
                worker: worker,
                isSiteInfoOnly: true, // Site INFO 전용 항목임을 표시
                createdAt: new Date().toISOString()
            };
            
            // history 배열에 추가 (하지만 isSiteInfoOnly 플래그로 구분)
            history.push(siteInfoItem);
            localStorage.setItem('history', JSON.stringify(history));
            
            // Site INFO 테이블만 새로고침
            loadReplacedPartsSheet(currentHospitalId);
            closeModal();
            
            alert('Site INFO 항목이 성공적으로 추가되었습니다!');
        } else {
            alert('필수 항목을 모두 입력해주세요.');
        }
    });
}

// 부품 추가 폼 표시
function showAddPartForm() {
    if (!isLoggedIn || !currentHospitalId) return;
    
    const formHtml = `
        <div class="add-part-form">
            <h4>부품 교체</h4>
            <form id="add-current-part-form">
                <input type="text" id="current-part-name" placeholder="부품명을 입력하세요" required>
                <input type="text" id="part-number" placeholder="부품번호" required>
                <input type="text" id="serial-number" placeholder="시리얼번호" required>
                <input type="date" id="install-date" placeholder="교체일" required>
                <input type="text" id="worker-name" placeholder="작업자명" required>
                <textarea id="error-notes" placeholder="에러 내용을 입력하세요 (필수)" rows="3" required></textarea>
                <div class="form-buttons">
                    <button type="submit">교체</button>
                    <button type="button" onclick="closeAddPartForm()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('add-current-part-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const partName = document.getElementById('current-part-name').value;
        const partNumber = document.getElementById('part-number').value;
        const serialNumber = document.getElementById('serial-number').value;
        const installDate = document.getElementById('install-date').value;
        const worker = document.getElementById('worker-name').value;
        const errorNotes = document.getElementById('error-notes').value;
        
        // 에러 내용이 공란인지 확인
        if (!errorNotes.trim()) {
            alert('에러내용은 필수 입력 항목입니다.');
            return;
        }
        
        const currentPart = {
            id: Date.now().toString(),
            hospitalId: currentHospitalId,
            partName: partName,
            partNumber: partNumber,
            serialNumber: serialNumber,
            installDate: installDate,
            worker: worker,
            errorNotes: errorNotes
        };
        
        currentParts.push(currentPart);
        localStorage.setItem('currentParts', JSON.stringify(currentParts));
        
        // 최근 3년치 교체 히스토리 자동 생성
        generateReplacementHistory(currentHospitalId, partName, partNumber, serialNumber, installDate, worker, errorNotes);
        
        loadCurrentParts(currentHospitalId, 1);
        loadReplacedPartsSheet(currentHospitalId);
        closeModal();
        
        alert('부품이 성공적으로 교체되었습니다! 교체 히스토리가 자동으로 생성되었습니다.');
    });
}

// 최근 3년치 교체 히스토리 생성
function generateReplacementHistory(hospitalId, partName, partNumber, serialNumber, installDate, worker, errorNotes = '') {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) return;
    
    // 교체 사유 배열
    const reasons = [
        '정기 교체',
        '고장으로 인한 교체',
        '성능 개선',
        '부품 마모',
        '예방 정비',
        '업그레이드'
    ];
    
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    
    // 장착일을 교체일로 사용하여 하나의 히스토리만 생성
    const historyItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        hospitalId: hospitalId,
        partName: partName,
        partNumber: partNumber,
        serialNumber: serialNumber,
        quantity: 1,
        date: installDate,
        notes: errorNotes || randomReason,
        worker: worker,
        isAutoGenerated: true // 자동 생성된 기록임을 표시
    };
    
    history.push(historyItem);
    
    localStorage.setItem('history', JSON.stringify(history));
}



// 부품 추가 폼 닫기
function closeAddPartForm() {
    closeModal();
}

// 현재 부품 수정
function editCurrentPart(currentPartId) {
    if (!isLoggedIn) return;
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const currentPart = currentParts.find(cp => cp.id === currentPartId);
    if (!currentPart) return;
    
    // 모달 폼 표시
    const formHtml = `
        <div class="add-part-form">
            <h4>부품 정보 수정</h4>
            <form id="edit-current-part-form">
                <input type="text" id="edit-part-name" placeholder="부품명" value="${currentPart.partName}" required>
                <input type="text" id="edit-part-number" placeholder="부품번호" value="${currentPart.partNumber || ''}" required>
                <input type="text" id="edit-serial-number" placeholder="시리얼번호" value="${currentPart.serialNumber}" required>
                <input type="date" id="edit-install-date" value="${currentPart.installDate}" required>
                <input type="text" id="edit-worker" placeholder="작업자" value="${currentPart.worker || ''}" required>
                <input type="text" id="edit-modifier" placeholder="수정한 사람 이름" value="${currentPart.modifier || (currentUser ? currentUser.name : '')}" required>
                <textarea id="edit-error-notes" placeholder="에러 내용을 입력하세요 (선택사항)">${currentPart.errorNotes || ''}</textarea>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('edit-current-part-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPartName = document.getElementById('edit-part-name').value.trim();
        const newPartNumber = document.getElementById('edit-part-number').value.trim();
        const newSerialNumber = document.getElementById('edit-serial-number').value.trim();
        const newInstallDate = document.getElementById('edit-install-date').value;
        const newWorker = document.getElementById('edit-worker').value.trim();
        const modifier = document.getElementById('edit-modifier').value.trim();
        const newErrorNotes = document.getElementById('edit-error-notes').value.trim();
        
        if (newPartName && newSerialNumber && newInstallDate) {
            // 부품 정보 업데이트
            currentPart.partName = newPartName;
            currentPart.partNumber = newPartNumber;
            currentPart.serialNumber = newSerialNumber;
            currentPart.installDate = newInstallDate;
            currentPart.worker = newWorker;
            currentPart.modifier = modifier;
            currentPart.errorNotes = newErrorNotes;
            
            localStorage.setItem('currentParts', JSON.stringify(currentParts));
            loadCurrentParts(currentHospitalId, 1);
            closeModal();
            
            alert('부품 정보가 성공적으로 수정되었습니다!');
        } else {
            alert('필수 항목을 모두 입력해주세요.');
        }
    });
}

// 현재 부품 제거
function removeCurrentPart(currentPartId) {
    if (!isLoggedIn) return;
    
    if (!checkAdminPermission()) {
        return;
    }
    
    if (!confirm('정말로 이 부품을 제거하시겠습니까?')) {
        return;
    }
    
    currentParts = currentParts.filter(cp => cp.id !== currentPartId);
    localStorage.setItem('currentParts', JSON.stringify(currentParts));
    loadCurrentParts(currentHospitalId, 1);
}

// 현재 부품 교체
function replaceCurrentPart(currentPartId) {
    if (!isLoggedIn) return;
    
    const currentPart = currentParts.find(cp => cp.id === currentPartId);
    if (!currentPart) return;
    
    // 교체 폼 표시
    const formHtml = `
        <div class="add-part-form">
            <h4>부품 교체</h4>
            <form id="replace-current-part-form">
                <input type="text" id="replace-part-name" placeholder="새 부품명을 입력하세요" value="${currentPart.partName}" required>
                <input type="text" id="replace-part-number" placeholder="새 부품번호" required>
                <input type="text" id="replace-serial-number" placeholder="새 시리얼번호" required>
                <input type="date" id="replace-install-date" placeholder="교체일" required>
                <input type="text" id="replace-worker" placeholder="작업자 이름" required>
                <div class="form-buttons">
                    <button type="submit">교체</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('replace-current-part-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPartName = document.getElementById('replace-part-name').value;
        const newPartNumber = document.getElementById('replace-part-number').value;
        const newSerialNumber = document.getElementById('replace-serial-number').value;
        const newInstallDate = document.getElementById('replace-install-date').value;
        const worker = document.getElementById('replace-worker').value;
        
        // 기존 부품 제거
        currentParts = currentParts.filter(cp => cp.id !== currentPartId);
        
        // 새 부품 추가
        const newCurrentPart = {
            id: Date.now().toString(),
            hospitalId: currentHospitalId,
            partName: newPartName,
            partNumber: newPartNumber,
            serialNumber: newSerialNumber,
            installDate: newInstallDate
        };
        
        currentParts.push(newCurrentPart);
        localStorage.setItem('currentParts', JSON.stringify(currentParts));
        
        // 교체 히스토리 생성
        generateReplacementHistory(currentHospitalId, newPartName, newPartNumber, newSerialNumber, newInstallDate, worker);
        
        loadCurrentParts(currentHospitalId, 1);
        loadReplacedPartsSheet(currentHospitalId);
        closeModal();
        
        alert('부품이 성공적으로 교체되었습니다! 교체 히스토리가 자동으로 생성되었습니다.');
    });
}

// 병원 추가
document.getElementById('hospital-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const hospitalName = document.getElementById('hospital-name').value.trim();
    
    // 중복 병원명 체크
    if (hospitals.some(h => h.name.toLowerCase() === hospitalName.toLowerCase())) {
        alert('이미 등록된 병원명입니다.');
        return;
    }
    
    const hospital = {
        id: Date.now().toString(),
        name: hospitalName,
        modality: document.getElementById('hospital-modality').value,
        systemId: document.getElementById('hospital-system-id').value,
        equipment: document.getElementById('hospital-equipment').value,
        softwareVersion: document.getElementById('hospital-software-version').value,
        address: document.getElementById('hospital-address').value,
        phone: document.getElementById('hospital-phone').value
    };
    
    hospitals.push(hospital);
    localStorage.setItem('hospitals', JSON.stringify(hospitals));
    
    loadHospitals();
    loadHospitalList();
    updateSelects();
    this.reset();
    
    alert('병원이 성공적으로 추가되었습니다!');
});

// 부품 관리
function loadParts() {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('parts-list');
    container.innerHTML = '';
    
    if (parts.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 부품이 없습니다. 위의 폼에서 부품을 추가해주세요.</p>';
        return;
    }
    
    parts.forEach(part => {
        const partDiv = document.createElement('div');
        partDiv.className = 'item-card';
        partDiv.innerHTML = `
            <h4>${part.name}</h4>
            <p>부품코드: ${part.code}</p>
            <p>카테고리: ${part.category}</p>
            <p>가격: ${part.price.toLocaleString()}원</p>
            <div class="item-actions">
                <button class="btn-edit" onclick="editPart('${part.id}')">수정</button>
                <button class="btn-delete" onclick="deletePart('${part.id}')">삭제</button>
            </div>
        `;
        container.appendChild(partDiv);
    });
}

// 출고부품 추가
document.getElementById('part-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const date = document.getElementById('part-date').value;
    const hospital = document.getElementById('part-hospital').value.trim();
    const partName = document.getElementById('part-name').value.trim();
    const partNumber = document.getElementById('part-number').value.trim();
    const serialNumber = document.getElementById('part-serial').value.trim();
    const worker = document.getElementById('part-worker').value.trim();
    const notes = document.getElementById('part-notes').value.trim();
    
    if (!date || !hospital || !partName || !partNumber || !serialNumber || !worker) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    const outboundPart = {
        id: Date.now().toString(),
        date: date,
        hospital: hospital,
        partName: partName,
        partNumber: partNumber,
        serialNumber: serialNumber,
        worker: worker,
        notes: notes,
        type: '출고',
        author: currentUser.name || currentUser.username // 작성자 정보 추가
    };
    
    // outboundParts 배열에 추가 (새로운 배열 생성)
    if (!window.outboundParts) {
        window.outboundParts = JSON.parse(localStorage.getItem('outboundParts')) || [];
    }
    
    window.outboundParts.push(outboundPart);
    localStorage.setItem('outboundParts', JSON.stringify(window.outboundParts));
    
    // 출고 히스토리에도 별도로 저장 (삭제되지 않도록)
    if (!window.outboundHistory) {
        window.outboundHistory = JSON.parse(localStorage.getItem('outboundHistory')) || [];
    }
    
    const historyItem = {
        id: Date.now().toString() + '_history',
        date: date,
        hospital: hospital,
        partName: partName,
        partNumber: partNumber,
        serialNumber: serialNumber,
        worker: worker,
        notes: notes,
        type: '출고',
        author: currentUser.name || currentUser.username
    };
    
    window.outboundHistory.push(historyItem);
    localStorage.setItem('outboundHistory', JSON.stringify(window.outboundHistory));
    
    loadOutboundParts();
    loadOutboundHistory();
    this.reset();
    
    alert('출고부품이 성공적으로 추가되었습니다!');
});

// 출고부품 목록 로드
function loadOutboundParts() {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('parts-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // localStorage에서 데이터 로드
    if (!window.outboundParts) {
        window.outboundParts = JSON.parse(localStorage.getItem('outboundParts')) || [];
    }
    
    if (window.outboundParts.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">등록된 출고부품이 없습니다.</td></tr>';
        return;
    }
    
    // 날짜 역순으로 정렬 (최신순)
    const sortedParts = window.outboundParts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedParts.forEach(part => {
        const partRow = document.createElement('tr');
        partRow.className = 'outbound-row';
        
        // 삭제 버튼 표시 조건: 관리자이거나 작성자인 경우
        const canDelete = isAdmin() || (part.author && part.author === (currentUser.name || currentUser.username));
        const deleteButton = canDelete ? `<button class="btn-delete" onclick="deleteOutboundPart('${part.id}')">삭제</button>` : '';
        
        partRow.innerHTML = `
            <td>${part.date}</td>
            <td>${part.hospital}</td>
            <td>${part.partName}</td>
            <td>${part.partNumber}</td>
            <td>${part.serialNumber}</td>
            <td>${part.worker}</td>
            <td>${part.notes || '-'}</td>
            <td class="action-buttons">
                ${deleteButton}
            </td>
        `;
        container.appendChild(partRow);
    });
}

// 출고부품 삭제
function deleteOutboundPart(partId) {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const part = window.outboundParts.find(p => p.id === partId);
    if (!part) {
        alert('해당 부품을 찾을 수 없습니다.');
        return;
    }
    
    // 권한 체크: 관리자이거나 작성자인 경우만 삭제 가능
    const canDelete = isAdmin() || (part.author && part.author === (currentUser.name || currentUser.username));
    if (!canDelete) {
        alert('작성자 또는 관리자만 삭제할 수 있습니다.');
        return;
    }
    
    if (!confirm('정말로 이 출고부품을 삭제하시겠습니까?')) {
        return;
    }
    
    const index = window.outboundParts.findIndex(p => p.id === partId);
    if (index === -1) {
        alert('해당 부품을 찾을 수 없습니다.');
        return;
    }
    
    window.outboundParts.splice(index, 1);
    localStorage.setItem('outboundParts', JSON.stringify(window.outboundParts));
    loadOutboundParts();
    // 히스토리는 삭제하지 않음 - loadOutboundHistory() 호출 제거
    alert('출고부품이 삭제되었습니다. (히스토리는 유지됩니다)');
}

// 출고 히스토리 로드
function loadOutboundHistory(searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('outbound-history-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 별도의 출고 히스토리 배열 사용
    if (!window.outboundHistory) {
        window.outboundHistory = JSON.parse(localStorage.getItem('outboundHistory')) || [];
    }
    
    if (window.outboundHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">출고 히스토리가 없습니다.</td></tr>';
        return;
    }
    
    // 날짜 역순으로 정렬 (최신순)
    let sortedHistory = window.outboundHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        sortedHistory = sortedHistory.filter(item =>
            (item.date && item.date.toLowerCase().includes(searchLower)) ||
            (item.hospital && item.hospital.toLowerCase().includes(searchLower)) ||
            (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.worker && item.worker.toLowerCase().includes(searchLower)) ||
            (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
            (item.author && item.author.toLowerCase().includes(searchLower))
        );
    }
    
    if (sortedHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    sortedHistory.forEach(item => {
        const historyRow = document.createElement('tr');
        historyRow.className = 'outbound-history-row';
        historyRow.innerHTML = `
            <td>${item.date}</td>
            <td>${item.hospital}</td>
            <td>${item.partName}</td>
            <td>${item.partNumber}</td>
            <td>${item.serialNumber}</td>
            <td>${item.worker}</td>
            <td>${item.notes || '-'}</td>
            <td>${item.author || '미등록'}</td>
        `;
        container.appendChild(historyRow);
    });
}

// 창고 관리
function loadWarehouse(searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('warehouse-list');
    container.innerHTML = '';
    
    if (warehouse.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">창고 재고가 없습니다. 위의 폼에서 재고를 추가해주세요.</td></tr>';
        return;
    }
    
    // 부품명 알파벳순 정렬, 같은 부품명은 입고일 오름차순 정렬 (빠른 순)
    let sortedWarehouse = warehouse.sort((a, b) => {
        // 먼저 부품명으로 알파벳순 정렬
        const nameComparison = a.partName.localeCompare(b.partName);
        if (nameComparison !== 0) {
            return nameComparison;
        }
        // 같은 부품명이면 입고일 오름차순 정렬 (빠른 순) - 빠른 것이 위에
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // 빠른(오래된 날짜)이 위에 오도록
    });
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        sortedWarehouse = sortedWarehouse.filter(item =>
            (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.location && item.location.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            (item.author && item.author.toLowerCase().includes(searchLower))
        );
    }
    
    if (sortedWarehouse.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    sortedWarehouse.forEach(item => {
        const warehouseRow = document.createElement('tr');
        warehouseRow.className = 'warehouse-row';
        
        // 상태별 배지 색상
        const statusBadge = getStatusBadge(item.status);
        
        warehouseRow.innerHTML = `
            <td>${item.partName}</td>
            <td>${item.partNumber || '미등록'}</td>
            <td>${item.serialNumber || '미등록'}</td>
            <td>${item.location || '미등록'}</td>
            <td>${item.date}</td>
            <td>${statusBadge}</td>
            <td>${item.description || '-'}</td>
            <td>${item.author || '미등록'}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editWarehouseItem('${item.id}')">수정</button>
                <button class="btn-out" onclick="showOutboundForm('${item.id}')" ${!item.author ? 'disabled' : ''}>출고</button>
            </td>
        `;
        container.appendChild(warehouseRow);
    });
}

// 상태별 배지 생성
function getStatusBadge(status) {
    const statusColors = {
        'Good': 'status-good',
        'Bad': 'status-bad',
        '수리입고': 'status-repair',
        '해외입고': 'status-overseas'
    };
    
    const colorClass = statusColors[status] || 'status-default';
    return `<span class="status-badge ${colorClass}">${status}</span>`;
}

// 창고 항목 수정
function editWarehouseItem(itemId) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const warehouseItem = warehouse.find(w => w.id === itemId);
    if (!warehouseItem) return;
    
    // 모달 폼 표시
    const formHtml = `
        <div class="add-part-form">
            <h4>창고 항목 수정</h4>
            <form id="edit-warehouse-form">
                <input type="text" id="edit-warehouse-part-name" placeholder="부품명" value="${warehouseItem.partName}" required>
                <input type="text" id="edit-warehouse-part-number" placeholder="부품번호" value="${warehouseItem.partNumber || ''}" required>
                <input type="text" id="edit-warehouse-serial-number" placeholder="시리얼번호" value="${warehouseItem.serialNumber || ''}" required>
                <input type="text" id="edit-warehouse-location" placeholder="위치" value="${warehouseItem.location || ''}" required>
                <input type="date" id="edit-warehouse-date" value="${warehouseItem.date}" required>
                <select id="edit-warehouse-status" required>
                    <option value="Good" ${warehouseItem.status === 'Good' ? 'selected' : ''}>Good</option>
                    <option value="Bad" ${warehouseItem.status === 'Bad' ? 'selected' : ''}>Bad</option>
                </select>
                <input type="text" id="edit-warehouse-author" placeholder="입고자 이름을 입력하세요" value="${warehouseItem.author || ''}" required>
                <div class="form-group">
                    <label for="edit-warehouse-description">입고내용</label>
                    <textarea id="edit-warehouse-description" placeholder="입고내용 (부품에 대한 설명이나 특이사항을 입력하세요)">${warehouseItem.description || ''}</textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 수정 모달에서 입고자 필드 유효성 검사
    const editWarehouseAuthorField = document.getElementById('edit-warehouse-author');
    if (editWarehouseAuthorField) {
        editWarehouseAuthorField.addEventListener('input', function() {
            // 입고자 이름이 입력되면 출고 버튼 활성화
            const outboundBtn = document.querySelector(`button[onclick="showOutboundForm('${itemId}')"]`);
            if (outboundBtn) {
                outboundBtn.disabled = !this.value.trim();
            }
        });
    }
    
    // 폼 제출 이벤트
    document.getElementById('edit-warehouse-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPartName = document.getElementById('edit-warehouse-part-name').value.trim();
        const newPartNumber = document.getElementById('edit-warehouse-part-number').value.trim();
        const newSerialNumber = document.getElementById('edit-warehouse-serial-number').value.trim();
        const newLocation = document.getElementById('edit-warehouse-location').value.trim();
        const newDate = document.getElementById('edit-warehouse-date').value;
        const newStatus = document.getElementById('edit-warehouse-status').value;
        const newDescription = document.getElementById('edit-warehouse-description').value.trim();
        const newAuthor = document.getElementById('edit-warehouse-author').value.trim();
        
        if (newPartName && newDate) {
            // 창고 항목 업데이트
            warehouseItem.partName = newPartName;
            warehouseItem.partNumber = newPartNumber;
            warehouseItem.serialNumber = newSerialNumber;
            warehouseItem.location = newLocation;
            warehouseItem.date = newDate;
            warehouseItem.status = newStatus;
            warehouseItem.description = newDescription;
            warehouseItem.author = newAuthor;
            
                    localStorage.setItem('warehouse', JSON.stringify(warehouse));
        loadWarehouse('');
        closeModal();
            alert('창고 항목이 수정되었습니다.');
        }
    });
}

// 창고 항목 삭제
function showOutboundForm(itemId) {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const warehouseItem = warehouse.find(item => item.id === itemId);
    if (!warehouseItem) {
        alert('항목을 찾을 수 없습니다.');
        return;
    }
    
    const modalContent = `
        <div class="modal-content">
            <h3>📦 부품 출고</h3>
            <div class="outbound-info">
                <p><strong>부품명:</strong> ${warehouseItem.partName}</p>
                <p><strong>부품번호:</strong> ${warehouseItem.partNumber || '미등록'}</p>
                <p><strong>시리얼번호:</strong> ${warehouseItem.serialNumber || '미등록'}</p>
                <p><strong>위치:</strong> ${warehouseItem.location || '미등록'}</p>
                <p><strong>입고자:</strong> ${warehouseItem.author || '미등록'}</p>
            </div>
            <form id="outbound-form">
                <div class="form-group">
                    <label for="outbound-hospital">출고 대상 병원</label>
                    <input type="text" id="outbound-hospital" placeholder="병원명을 입력하세요" required>
                </div>
                <div class="form-group">
                    <label for="outbound-author">출고자</label>
                    <input type="text" id="outbound-author" placeholder="출고자 이름을 입력하세요" required>
                </div>
                <div class="form-group">
                    <label for="outbound-date">출고 날짜</label>
                    <input type="date" id="outbound-date" required>
                </div>
                <div class="form-group">
                    <label for="outbound-notes">출고 사유 (선택사항)</label>
                    <textarea id="outbound-notes" placeholder="출고 사유를 입력하세요"></textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit">출고 확인</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    // 출고 날짜를 오늘 날짜로 자동 설정
    const outboundDateField = document.getElementById('outbound-date');
    if (outboundDateField) {
        const today = new Date().toISOString().split('T')[0];
        outboundDateField.value = today;
    }
    
    // 출고 폼 제출 처리
    document.getElementById('outbound-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const hospitalName = document.getElementById('outbound-hospital').value.trim();
        const outboundAuthor = document.getElementById('outbound-author').value.trim();
        const outboundDate = document.getElementById('outbound-date').value;
        const notes = document.getElementById('outbound-notes').value.trim();
        
        if (!hospitalName) {
            alert('병원명을 입력해주세요.');
            return;
        }
        
        if (!outboundAuthor) {
            alert('출고자 이름을 입력해주세요.');
            return;
        }
        
        if (!outboundDate) {
            alert('출고 날짜를 선택해주세요.');
            return;
        }
        
        // 입출고 히스토리 생성
        const inoutItem = {
            id: Date.now().toString(),
            date: outboundDate,
            partName: warehouseItem.partName,
            partNumber: warehouseItem.partNumber,
            serialNumber: warehouseItem.serialNumber,
            location: warehouseItem.location,
            type: '출고',
            status: warehouseItem.status,
            worker: currentUser ? currentUser.name : '관리자',
            hospital: hospitalName,
            notes: notes,
            description: warehouseItem.description,
            author: warehouseItem.author,
            outboundAuthor: outboundAuthor
        };
        
        // 창고에서 항목 제거
        const index = warehouse.findIndex(item => item.id === itemId);
        if (index !== -1) {
            warehouse.splice(index, 1);
            localStorage.setItem('warehouse', JSON.stringify(warehouse));
            
            // 입출고 히스토리에 추가
            inoutHistory.push(inoutItem);
            localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
            
            loadWarehouse('');
            loadInoutHistory('');
            closeModal();
            alert(`${warehouseItem.partName}이(가) ${hospitalName}으로 출고되었습니다.`);
        }
    });
}

function deleteWarehouseItem(itemId) {
    if (!isLoggedIn || !checkAdminPermission()) {
        alert('관리자만 삭제할 수 있습니다.');
        return;
    }
    
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
        const index = warehouse.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const deletedItem = warehouse[index];
            
            // 입출고 히스토리 생성
            const inoutItem = {
                id: Date.now().toString(),
                date: new Date().toISOString().split('T')[0],
                partName: deletedItem.partName,
                partNumber: deletedItem.partNumber,
                serialNumber: deletedItem.serialNumber,
                location: deletedItem.location,
                type: '삭제',
                status: deletedItem.status,
                worker: currentUser ? currentUser.name : '관리자'
            };
            
            inoutHistory.push(inoutItem);
            localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
            
            warehouse.splice(index, 1);
            localStorage.setItem('warehouse', JSON.stringify(warehouse));
            loadWarehouse('');
            loadInoutHistory('');
            alert('항목이 삭제되었습니다.');
        }
    }
}

    // 창고 검색 기능 초기화
    const warehouseSearchInput = document.getElementById('warehouse-search');
    if (warehouseSearchInput) {
        warehouseSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadWarehouse(searchTerm);
        });
    }
    
    // 입출고 히스토리 검색 기능 초기화
    const inoutSearchInput = document.getElementById('inout-search');
    if (inoutSearchInput) {
        inoutSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadInoutHistory(searchTerm);
        });
    }
    
    // 병원목록 검색 기능 초기화
    const hospitalListSearchInput = document.getElementById('hospital-list-search');
    if (hospitalListSearchInput) {
        hospitalListSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadHospitalList(searchTerm);
        });
    }
    
    // 출고 히스토리 검색 기능 초기화
    const outboundHistorySearchInput = document.getElementById('outbound-history-search');
    if (outboundHistorySearchInput) {
        outboundHistorySearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadOutboundHistory(searchTerm);
        });
    }
    
    // 교체 히스토리 검색 기능 초기화
    const historySearchInput = document.getElementById('history-search');
    if (historySearchInput) {
        historySearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            const selectedHospitalId = document.getElementById('history-hospital').value;
            loadHistory(selectedHospitalId, 1, searchTerm);
        });
    }
    
    // 코일 검색 기능 초기화
    const coilSearchInput = document.getElementById('coil-search');
    if (coilSearchInput) {
        coilSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadCoils(searchTerm);
        });
    }
    
    // 코일 히스토리 검색 기능 초기화
    const coilHistorySearchInput = document.getElementById('coil-history-search');
    if (coilHistorySearchInput) {
        coilHistorySearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            loadCoilHistory(1, searchTerm);
        });
    }
    

    
    // 창고 입고자 필드 초기화
    const warehouseAuthorField = document.getElementById('warehouse-author');
    if (warehouseAuthorField) {
        warehouseAuthorField.value = '';
    }
    
    // 코일 입고자 필드 초기화
    const coilAuthorField = document.getElementById('coil-author');
    if (coilAuthorField) {
        coilAuthorField.value = '';
    }
    
    // 창고 폼 유효성 검사 및 버튼 활성화
    const warehouseForm = document.getElementById('warehouse-form');
    const warehouseSubmitBtn = document.getElementById('warehouse-submit-btn');
    
    if (warehouseForm && warehouseSubmitBtn) {
        const formFields = [
            'warehouse-part-name',
            'warehouse-part-number',
            'warehouse-serial-number',
            'warehouse-location',
            'warehouse-date',
            'warehouse-status',
            'warehouse-author',
            'warehouse-description'
        ];
        
        function checkFormValidity() {
            const allFieldsFilled = formFields.every(fieldId => {
                const field = document.getElementById(fieldId);
                if (!field) return false;
                
                if (field.type === 'select-one') {
                    return field.value !== '';
                } else if (field.type === 'textarea') {
                    return field.value.trim() !== '';
                } else {
                    return field.value.trim() !== '';
                }
            });
            
            warehouseSubmitBtn.disabled = !allFieldsFilled;
        }
        
        // 각 필드에 이벤트 리스너 추가
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', checkFormValidity);
                field.addEventListener('change', checkFormValidity);
            }
        });
        
        // 초기 상태 확인
        checkFormValidity();
    }
    
    // 창고 재고 추가
    document.getElementById('warehouse-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const status = document.getElementById('warehouse-status').value;
    const description = document.getElementById('warehouse-description').value.trim();
    
    // 수리입고 상태일 때 입고내용 필수 체크
    if (status === '수리입고' && !description) {
        alert('수리입고 상태일 때는 입고내용을 필수로 입력해주세요.');
        document.getElementById('warehouse-description').focus();
        return;
    }
    
    const warehouseItem = {
        id: Date.now().toString(),
        partName: document.getElementById('warehouse-part-name').value.trim(),
        partNumber: document.getElementById('warehouse-part-number').value.trim(),
        serialNumber: document.getElementById('warehouse-serial-number').value.trim(),
        location: document.getElementById('warehouse-location').value.trim(),
        date: document.getElementById('warehouse-date').value,
        status: status,
        description: description,
        author: document.getElementById('warehouse-author').value.trim()
    };
    
    warehouse.push(warehouseItem);
    localStorage.setItem('warehouse', JSON.stringify(warehouse));
    
    // 입출고 히스토리 생성
    const inoutItem = {
        id: Date.now().toString(),
        date: warehouseItem.date,
        partName: warehouseItem.partName,
        partNumber: warehouseItem.partNumber,
        serialNumber: warehouseItem.serialNumber,
        location: warehouseItem.location,
        type: '입고',
        status: warehouseItem.status,
        worker: currentUser ? currentUser.name : '관리자',
        description: warehouseItem.description,
        author: warehouseItem.author
    };
    
    inoutHistory.push(inoutItem);
    localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
    
    loadWarehouse('');
    loadInoutHistory('');
    this.reset();
    
    alert('재고가 성공적으로 추가되었습니다!');
});

// 코일 재고 추가
document.getElementById('coil-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const coilItem = {
        id: Date.now().toString(),
        coilName: document.getElementById('coil-name').value.trim(),
        coilNumber: document.getElementById('coil-number').value.trim(),
        serialNumber: document.getElementById('coil-serial').value.trim(),
        location: document.getElementById('coil-location').value.trim(),
        date: document.getElementById('coil-date').value,
        status: document.getElementById('coil-status').value,
        description: document.getElementById('coil-description').value.trim(),
        author: document.getElementById('coil-author').value.trim()
    };
    
    coils.push(coilItem);
    localStorage.setItem('coils', JSON.stringify(coils));
    
    // 입출고 히스토리 생성
    const inoutItem = {
        id: Date.now().toString(),
        date: coilItem.date,
        partName: coilItem.coilName,
        partNumber: coilItem.coilNumber,
        serialNumber: coilItem.serialNumber,
        location: coilItem.location,
        type: '입고',
        status: coilItem.status,
        worker: currentUser ? currentUser.name : '관리자',
        description: coilItem.description,
        author: coilItem.author
    };
    
    inoutHistory.push(inoutItem);
    localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
    
    loadCoils('');
    loadInoutHistory('');
    loadCoilHistory(1, '');
    this.reset();
    
    alert('코일이 성공적으로 추가되었습니다!');
});

// 코일 관리
function loadCoils(searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('coil-list');
    container.innerHTML = '';
    
    if (coils.length === 0) {
        container.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">코일 재고가 없습니다. 위의 폼에서 코일을 추가해주세요.</td></tr>';
        return;
    }
    
    // 코일명 알파벳순 정렬, 같은 코일명은 입고일 오름차순 정렬 (빠른 순)
    let sortedCoils = coils.sort((a, b) => {
        // 먼저 코일명으로 알파벳순 정렬
        const nameComparison = a.coilName.localeCompare(b.coilName);
        if (nameComparison !== 0) {
            return nameComparison;
        }
        // 같은 코일명이면 입고일 오름차순 정렬 (빠른 순) - 빠른 것이 위에
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB; // 빠른(오래된 날짜)이 위에 오도록
    });
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        sortedCoils = sortedCoils.filter(item =>
            (item.coilName && item.coilName.toLowerCase().includes(searchLower)) ||
            (item.coilNumber && item.coilNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.location && item.location.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            (item.author && item.author.toLowerCase().includes(searchLower))
        );
    }
    
    if (sortedCoils.length === 0) {
        container.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    sortedCoils.forEach(item => {
        const coilRow = document.createElement('tr');
        coilRow.className = 'coil-row';
        
        // 상태별 배지 색상
        const statusBadge = getCoilStatusBadge(item.status);
        
        coilRow.innerHTML = `
            <td>${item.coilName}</td>
            <td>${item.coilNumber || '미등록'}</td>
            <td>${item.serialNumber || '미등록'}</td>
            <td>${item.location || '미등록'}</td>
            <td>${item.date}</td>
            <td>${statusBadge}</td>
            <td>${item.description || '-'}</td>
            <td>${item.author || '미등록'}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editCoilItem('${item.id}')">수정</button>
                <button class="btn-out" onclick="showCoilOutboundForm('${item.id}')" ${!item.author ? 'disabled' : ''}>출고</button>
            </td>
        `;
        container.appendChild(coilRow);
    });
}

// 코일 상태별 배지 생성
function getCoilStatusBadge(status) {
    const statusColors = {
        'Good': 'status-good',
        'Bad': 'status-bad'
    };
    
    const colorClass = statusColors[status] || 'status-default';
    return `<span class="status-badge ${colorClass}">${status}</span>`;
}

// 코일 히스토리 로드
function loadCoilHistory(currentPage = 1, searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('coil-history-list');
    const paginationContainer = document.getElementById('coil-history-pagination');
    
    if (!container) return;
    
    container.innerHTML = '';
    paginationContainer.innerHTML = '';
    
    // 입출고 히스토리에서 코일 관련 데이터만 필터링
    const coilHistory = inoutHistory.filter(item => 
        item.partName && (item.partName.toLowerCase().includes('coil') || 
                         item.partName.toLowerCase().includes('코일') ||
                         item.partNumber && item.partNumber.toLowerCase().includes('coil'))
    );
    
    if (coilHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="11" style="text-align: center; color: #666;">코일 히스토리가 없습니다.</td></tr>';
        return;
    }
    
    // 검색어가 있으면 필터링
    let filteredHistory = coilHistory;
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredHistory = coilHistory.filter(item =>
            (item.date && item.date.toLowerCase().includes(searchLower)) ||
            (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.location && item.location.toLowerCase().includes(searchLower)) ||
            (item.hospital && item.hospital.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            (item.author && item.author.toLowerCase().includes(searchLower)) ||
            (item.outboundAuthor && item.outboundAuthor.toLowerCase().includes(searchLower))
        );
    }
    
    if (filteredHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="11" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    // 날짜 역순으로 정렬 (최신순)
    const sortedHistory = filteredHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 페이지네이션 설정
    const itemsPerPage = 20;
    const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = sortedHistory.slice(startIndex, endIndex);
    
    // 현재 페이지 아이템들 표시
    currentPageItems.forEach(item => {
        const historyRow = document.createElement('tr');
        historyRow.className = 'coil-history-row';
        
        // 구분별 배지 생성
        const typeBadge = getCoilTypeBadge(item.type);
        
        historyRow.innerHTML = `
            <td>${item.date}</td>
            <td>${item.partName || '-'}</td>
            <td>${item.partNumber || '미등록'}</td>
            <td>${item.serialNumber || '미등록'}</td>
            <td>${item.location || '미등록'}</td>
            <td>${typeBadge}</td>
            <td>${item.hospital || '-'}</td>
            <td>${item.status || '-'}</td>
            <td>${item.description || '-'}</td>
            <td>${item.author || '-'}</td>
            <td>${item.outboundAuthor || '-'}</td>
        `;
        container.appendChild(historyRow);
    });
    
    // 페이지네이션 생성 (20개 이상일 때만)
    if (totalPages > 1) {
        createCoilHistoryPagination(totalPages, currentPage, searchTerm);
    }
}

// 코일 구분별 배지 생성
function getCoilTypeBadge(type) {
    const typeColors = {
        '입고': 'type-in',
        '출고': 'type-out',
        '삭제': 'type-delete'
    };
    
    const colorClass = typeColors[type] || 'type-default';
    return `<span class="type-badge ${colorClass}">${type}</span>`;
}

// 코일 히스토리 페이지네이션 생성
function createCoilHistoryPagination(totalPages, currentPage, searchTerm) {
    const paginationContainer = document.getElementById('coil-history-pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '◀ 이전';
        prevButton.className = 'pagination-btn';
        prevButton.onclick = () => loadCoilHistory(currentPage - 1, searchTerm);
        paginationDiv.appendChild(prevButton);
    }
    
    // 페이지 번호 버튼들
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        pageButton.onclick = () => loadCoilHistory(i, searchTerm);
        paginationDiv.appendChild(pageButton);
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '다음 ▶';
        nextButton.className = 'pagination-btn';
        nextButton.onclick = () => loadCoilHistory(currentPage + 1, searchTerm);
        paginationDiv.appendChild(nextButton);
    }
    
    // 페이지 정보 표시
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${currentPage} / ${totalPages} 페이지`;
    paginationDiv.appendChild(pageInfo);
    
    paginationContainer.appendChild(paginationDiv);
}

// 코일 항목 수정
function editCoilItem(itemId) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const coilItem = coils.find(c => c.id === itemId);
    if (!coilItem) return;
    
    // 모달 폼 표시
    const formHtml = `
        <div class="edit-coil-form">
            <h4>코일 정보 수정</h4>
            <form id="edit-coil-form">
                <input type="text" id="edit-coil-name" placeholder="코일명" value="${coilItem.coilName}" required>
                <input type="text" id="edit-coil-number" placeholder="코일번호" value="${coilItem.coilNumber}" required>
                <input type="text" id="edit-coil-serial" placeholder="시리얼번호" value="${coilItem.serialNumber}" required>
                <input type="text" id="edit-coil-location" placeholder="위치" value="${coilItem.location}" required>
                <input type="date" id="edit-coil-date" value="${coilItem.date}" required>
                <select id="edit-coil-status" required>
                    <option value="Good" ${coilItem.status === 'Good' ? 'selected' : ''}>Good</option>
                    <option value="Bad" ${coilItem.status === 'Bad' ? 'selected' : ''}>Bad</option>
                </select>
                <input type="text" id="edit-coil-author" placeholder="입고자" value="${coilItem.author}" required>
                <textarea id="edit-coil-description" placeholder="입고내용" rows="3" required>${coilItem.description}</textarea>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('edit-coil-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const index = coils.findIndex(c => c.id === itemId);
        if (index === -1) return;
        
        coils[index] = {
            ...coils[index],
            coilName: document.getElementById('edit-coil-name').value.trim(),
            coilNumber: document.getElementById('edit-coil-number').value.trim(),
            serialNumber: document.getElementById('edit-coil-serial').value.trim(),
            location: document.getElementById('edit-coil-location').value.trim(),
            date: document.getElementById('edit-coil-date').value,
            status: document.getElementById('edit-coil-status').value,
            author: document.getElementById('edit-coil-author').value.trim(),
            description: document.getElementById('edit-coil-description').value.trim()
        };
        
        localStorage.setItem('coils', JSON.stringify(coils));
        loadCoils('');
        closeModal();
        alert('코일 정보가 수정되었습니다.');
    });
}

// 코일 출고 폼 표시
function showCoilOutboundForm(itemId) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const coilItem = coils.find(c => c.id === itemId);
    if (!coilItem) return;
    
    const formHtml = `
        <div class="outbound-form">
            <h4>코일 출고</h4>
            <form id="coil-outbound-form">
                <input type="text" id="coil-outbound-hospital" placeholder="병원명" required>
                <input type="text" id="coil-outbound-author" placeholder="출고자" required>
                <input type="date" id="coil-outbound-date" required>
                <textarea id="coil-outbound-notes" placeholder="출고 사유" rows="3"></textarea>
                <div class="form-buttons">
                    <button type="submit">출고</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('coil-outbound-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const hospital = document.getElementById('coil-outbound-hospital').value.trim();
        const outboundAuthor = document.getElementById('coil-outbound-author').value.trim();
        const outboundDate = document.getElementById('coil-outbound-date').value;
        const notes = document.getElementById('coil-outbound-notes').value.trim();
        
        if (!hospital || !outboundAuthor || !outboundDate) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        // 코일 재고에서 제거
        const index = coils.findIndex(c => c.id === itemId);
        if (index !== -1) {
            coils.splice(index, 1);
            localStorage.setItem('coils', JSON.stringify(coils));
        }
        
        // 입출고 히스토리에 출고 기록 추가
        const inoutItem = {
            id: Date.now().toString(),
            date: outboundDate,
            partName: coilItem.coilName,
            partNumber: coilItem.coilNumber,
            serialNumber: coilItem.serialNumber,
            location: coilItem.location,
            type: '출고',
            hospital: hospital,
            status: '출고완료',
            description: notes,
            author: coilItem.author,
            outboundAuthor: outboundAuthor,
            worker: outboundAuthor
        };
        
        inoutHistory.push(inoutItem);
        localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
        
        loadCoils('');
        loadInoutHistory('');
        loadCoilHistory(1, '');
        closeModal();
        alert('코일이 출고되었습니다.');
    });
}

// 교체 히스토리 관리
function loadHistory(selectedHospitalId = null, currentPage = 1, searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('history-list');
    const paginationContainer = document.getElementById('history-pagination');
    const titleElement = document.getElementById('history-title');
    
    container.innerHTML = '';
    paginationContainer.innerHTML = '';
    
    // 병원 셀렉트 업데이트
    updateHistoryHospitalSelect();
    
    // 제목 업데이트
    if (selectedHospitalId) {
        const hospital = hospitals.find(h => h.id === selectedHospitalId);
        titleElement.textContent = hospital ? `${hospital.name} 교체 히스토리` : '교체 히스토리';
    } else {
        titleElement.textContent = '교체 히스토리';
    }
    
    if (history.length === 0) {
        container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">교체 히스토리가 없습니다.</td></tr>';
        return;
    }
    
    // 필터링된 히스토리 가져오기
    let filteredHistory = history;
    if (selectedHospitalId) {
        filteredHistory = history.filter(item => item.hospitalId === selectedHospitalId);
    }
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredHistory = filteredHistory.filter(item => {
            const hospital = hospitals.find(h => h.id === item.hospitalId);
            return (item.date && item.date.toLowerCase().includes(searchLower)) ||
                   (hospital && hospital.name && hospital.name.toLowerCase().includes(searchLower)) ||
                   (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
                   (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
                   (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
                   (item.worker && item.worker.toLowerCase().includes(searchLower)) ||
                   (item.notes && item.notes.toLowerCase().includes(searchLower));
        });
    }
    
    if (filteredHistory.length === 0) {
        if (selectedHospitalId || searchTerm) {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        } else {
            container.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #666;">교체 히스토리가 없습니다. 병원을 선택해주세요.</td></tr>';
        }
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...filteredHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 페이지네이션 설정
    const itemsPerPage = 20;
    const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = sortedHistory.slice(startIndex, endIndex);
    
    // 현재 페이지 아이템들 표시
    currentPageItems.forEach(item => {
        const hospital = hospitals.find(h => h.id === item.hospitalId);
        
        // 새로운 형식의 히스토리 (partName, partNumber, serialNumber, worker)
        if (item.partName) {
            const historyRow = document.createElement('tr');
            historyRow.className = 'history-row';
            
            // 관리자만 수정/삭제 버튼 표시
            const editButton = isAdmin() ? `<button class="btn-edit" onclick="editHistoryItem('${item.id}')">수정</button>` : '';
            const deleteButton = isAdmin() ? `<button class="btn-delete" onclick="deleteHistoryItem('${item.id}')">삭제</button>` : '';
            const actionButtons = isAdmin() ? `<div class="action-buttons">${editButton} ${deleteButton}</div>` : '';
            
            historyRow.innerHTML = `
                <td>${item.date}</td>
                <td>${hospital ? hospital.name : '알 수 없음'}</td>
                <td>${item.partName}</td>
                <td>${item.partNumber || '미등록'}</td>
                <td>${item.serialNumber || '미등록'}</td>
                <td>${item.worker || '미등록'}</td>
                <td>${item.notes || '-'}</td>
                <td class="action-buttons">
                    ${actionButtons}
                </td>
            `;
            container.appendChild(historyRow);
        } else {
            // 기존 형식의 히스토리 (quantity, notes)
            const part = parts.find(p => p.id === item.partId);
            if (hospital && part) {
                const historyRow = document.createElement('tr');
                historyRow.className = 'history-row';
                
                historyRow.innerHTML = `
                    <td>${item.date}</td>
                    <td>${hospital.name}</td>
                    <td>${part.name}</td>
                    <td>수량: ${item.quantity}개</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${item.notes || '-'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" onclick="editHistory('${item.id}')">수정</button>
                        <button class="btn-delete" onclick="deleteHistory('${item.id}')">삭제</button>
                    </td>
                `;
                container.appendChild(historyRow);
            }
        }
    });
    
    // 페이지네이션 생성 (20개 이상일 때만)
    if (totalPages > 1) {
        createPagination(totalPages, currentPage, selectedHospitalId, searchTerm);
    }
    
    // 현재 필터링된 히스토리를 전역 변수에 저장 (엑셀 추출용)
    window.currentFilteredHistory = sortedHistory;
}

// 페이지네이션 생성
function createPagination(totalPages, currentPage, selectedHospitalId, searchTerm = '') {
    const paginationContainer = document.getElementById('history-pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '◀ 이전';
        prevButton.className = 'pagination-btn';
        prevButton.onclick = () => loadHistory(selectedHospitalId, currentPage - 1, searchTerm);
        paginationDiv.appendChild(prevButton);
    }
    
    // 페이지 번호 버튼들
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'pagination-btn active' : 'pagination-btn';
        pageButton.onclick = () => loadHistory(selectedHospitalId, i, searchTerm);
        paginationDiv.appendChild(pageButton);
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '다음 ▶';
        nextButton.className = 'pagination-btn';
        nextButton.onclick = () => loadHistory(selectedHospitalId, currentPage + 1, searchTerm);
        paginationDiv.appendChild(nextButton);
    }
    
    // 페이지 정보 표시
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${currentPage} / ${totalPages} 페이지`;
    paginationDiv.appendChild(pageInfo);
    
    paginationContainer.appendChild(paginationDiv);
}

// 교체 히스토리 엑셀 추출
function exportHistoryToExcel() {
    if (!isLoggedIn) return;
    
    // 현재 필터링된 히스토리 가져오기
    const historyToExport = window.currentFilteredHistory || history;
    
    if (historyToExport.length === 0) {
        alert('내보낼 교체 히스토리가 없습니다.');
        return;
    }
    
    // CSV 헤더 생성
    const headers = [
        '병원명',
        '부품명',
        '부품번호',
        '시리얼번호',
        '교체일',
        '작업자',
        '자동생성여부',
        '비고'
    ];
    
    // CSV 데이터 생성
    const csvData = [];
    csvData.push(headers.join(','));
    
    historyToExport.forEach(item => {
        const hospital = hospitals.find(h => h.id === item.hospitalId);
        const part = parts.find(p => p.id === item.partId);
        
        // 새로운 형식의 히스토리 (partName, partNumber, serialNumber, worker)
        if (item.partName) {
            const row = [
                hospital ? hospital.name : '알 수 없음',
                item.partName,
                item.partNumber || '미등록',
                item.serialNumber || '미등록',
                item.date,
                item.worker || '미등록',
                item.isAutoGenerated ? '자동생성' : '수동입력',
                item.notes || ''
            ];
            csvData.push(row.join(','));
        } else {
            // 기존 형식의 히스토리 (quantity, notes)
            if (hospital && part) {
                const row = [
                    hospital.name,
                    part.name,
                    '',
                    '',
                    item.date,
                    '',
                    '수동입력',
                    item.notes || ''
                ];
                csvData.push(row.join(','));
            }
        }
    });
    
    // 파일명 생성
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const fileName = `교체히스토리_${dateStr}_${timeStr}.csv`;
    
    // CSV 파일 다운로드
    const csvContent = csvData.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    alert(`${fileName} 파일이 성공적으로 다운로드되었습니다!`);
}

// 교체 히스토리 병원 셀렉트 업데이트
function updateHistoryHospitalSelect() {
    const hospitalSelect = document.getElementById('history-hospital');
    if (hospitalSelect) {
        hospitalSelect.innerHTML = '<option value="">병원을 선택하세요</option>';
        hospitals.forEach(hospital => {
            const option = document.createElement('option');
            option.value = hospital.id;
            option.textContent = hospital.name;
            hospitalSelect.appendChild(option);
        });
    }
}

// 선택한 병원의 히스토리 필터링
function filterHistoryBySelectedHospital() {
    const selectedHospitalId = document.getElementById('history-hospital').value;
    const searchTerm = document.getElementById('history-search').value.trim();
    loadHistory(selectedHospitalId, 1, searchTerm); // 첫 번째 페이지부터 시작, 검색어 유지
}



// 셀렉트 박스 업데이트
function updateSelects() {
    if (!isLoggedIn) return;
    
    // 부품 셀렉트 업데이트
    const partSelects = ['warehouse-part'];
    partSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">부품 선택</option>';
            parts.forEach(part => {
                const option = document.createElement('option');
                option.value = part.id;
                option.textContent = `${part.name} (${part.code})`;
                select.appendChild(option);
            });
        }
    });
}

// 삭제 함수들
function deleteHospital(id) {
    if (!isLoggedIn) return;
    
    if (!checkAdminPermission()) {
        return;
    }
    
    if (confirm('정말로 이 병원을 삭제하시겠습니까? 관련된 모든 교체 히스토리와 장착된 부품도 함께 삭제됩니다.')) {
        hospitals = hospitals.filter(h => h.id !== id);
        history = history.filter(h => h.hospitalId !== id);
        currentParts = currentParts.filter(cp => cp.hospitalId !== id);
        localStorage.setItem('hospitals', JSON.stringify(hospitals));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('currentParts', JSON.stringify(currentParts));
        loadHospitals();
        loadHospitalList();
        loadHistory();
        updateSelects();
    }
}

function deletePart(id) {
    if (!isLoggedIn) return;
    
    if (confirm('정말로 이 부품을 삭제하시겠습니까? 관련된 모든 창고 재고, 교체 히스토리, 장착된 부품도 함께 삭제됩니다.')) {
        parts = parts.filter(p => p.id !== id);
        warehouse = warehouse.filter(w => w.partId !== id);
        history = history.filter(h => h.partId !== id);
        currentParts = currentParts.filter(cp => cp.partId !== id);
        localStorage.setItem('parts', JSON.stringify(parts));
        localStorage.setItem('warehouse', JSON.stringify(warehouse));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('currentParts', JSON.stringify(currentParts));
        loadParts();
        loadWarehouse('');
        loadHistory();
        updateSelects();
    }
}

function deleteHistory(id) {
    if (!isLoggedIn) return;
    
    if (confirm('정말로 이 교체 기록을 삭제하시겠습니까?')) {
        history = history.filter(h => h.id !== id);
        localStorage.setItem('history', JSON.stringify(history));
        loadHistory();
        alert('교체 기록이 삭제되었습니다.');
    }
}

// 병원별 교체 히스토리 항목 삭제
function deleteHistoryItem(historyId) {
    if (!checkAdminPermission()) return;
    
    if (confirm('정말로 이 교체 기록을 삭제하시겠습니까?')) {
        history = history.filter(h => h.id !== historyId);
        localStorage.setItem('history', JSON.stringify(history));
        loadReplacedPartsSheet(currentHospitalId);
        alert('교체 기록이 삭제되었습니다.');
    }
}

// 교체 히스토리를 CSV로 내보내기
function exportHistoryToCSV() {
    if (!isLoggedIn || !currentHospitalId) {
        alert('로그인이 필요하거나 병원이 선택되지 않았습니다.');
        return;
    }
    
    const hospital = hospitals.find(h => h.id === currentHospitalId);
    if (!hospital) {
        alert('병원 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 해당 병원의 교체 히스토리만 필터링
    const hospitalHistory = history.filter(h => h.hospitalId === currentHospitalId);
    
    if (hospitalHistory.length === 0) {
        alert('내보낼 교체 히스토리가 없습니다.');
        return;
    }
    
    // 최신 순으로 정렬
    const sortedHistory = [...hospitalHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // CSV 헤더
    const headers = [
        '병원명',
        'System ID',
        '장비명',
        '부품명',
        '부품번호',
        '시리얼번호',
        '교체일',
        '작업자',
        '교체사유'
    ];
    
    // CSV 데이터 생성
    const csvData = sortedHistory.map(item => [
        hospital.name,
        hospital.systemId || '',
        hospital.equipment || '',
        item.partName,
        item.partNumber || '',
        item.serialNumber || '',
        item.date,
        item.worker || '',
        item.notes || ''
    ]);
    
    // CSV 문자열 생성
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 파일명 생성 (병원명_교체히스토리_날짜.csv)
    const today = new Date().toISOString().split('T')[0];
    const fileName = `${hospital.name}_교체히스토리_${today}.csv`;
    
    // 파일 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${hospital.name}의 교체 히스토리가 성공적으로 내보내졌습니다!`);
}

// 테스트용 샘플 데이터 추가 함수
function addSampleData() {
    if (!currentHospitalId) {
        alert('먼저 병원을 선택해주세요.');
        return;
    }
    
    const sampleParts = [
        {
            id: Date.now().toString() + '1',
            hospitalId: currentHospitalId,
            partName: 'CPU 모듈',
            partNumber: 'CPU-001',
            serialNumber: 'SN-CPU-2024-001',
            installDate: '2024-01-15',
            worker: '홍길동'
        },
        {
            id: Date.now().toString() + '2',
            hospitalId: currentHospitalId,
            partName: '메모리 모듈',
            partNumber: 'MEM-002',
            serialNumber: 'SN-MEM-2024-002',
            installDate: '2024-01-10',
            worker: '김철수'
        },
        {
            id: Date.now().toString() + '3',
            hospitalId: currentHospitalId,
            partName: '전원 공급 장치',
            partNumber: 'PSU-003',
            serialNumber: 'SN-PSU-2024-003',
            installDate: '2024-01-05',
            worker: '이영희'
        }
    ];
    
    sampleParts.forEach(part => {
        currentParts.push(part);
        generateReplacementHistory(part.hospitalId, part.partName, part.partNumber, part.serialNumber, part.installDate, part.worker);
    });
    
    localStorage.setItem('currentParts', JSON.stringify(currentParts));
    localStorage.setItem('history', JSON.stringify(history));
    
    loadCurrentParts(currentHospitalId, 1);
    loadReplacedPartsSheet(currentHospitalId);
    
    alert('샘플 데이터가 추가되었습니다!');
}

// 관리자 계정 재설정 함수
function resetAdminAccount() {
    const adminAccount = {
        id: '1',
        name: '관리자',
        username: 'admin',
        password: 'admin',
        role: 'admin'
    };
    
    // 기존 계정 데이터 가져오기
    let currentAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    
    // 관리자 계정이 있는지 확인
    const adminExists = currentAccounts.find(acc => acc.username === 'admin');
    
    if (!adminExists) {
        // 관리자 계정 추가
        currentAccounts.push(adminAccount);
        localStorage.setItem('accounts', JSON.stringify(currentAccounts));
        accounts = currentAccounts;
        console.log('관리자 계정이 추가되었습니다:', accounts);
        alert('관리자 계정이 재설정되었습니다!\n아이디: admin\n비밀번호: admin');
    } else {
        console.log('관리자 계정이 이미 존재합니다:', accounts);
        alert('관리자 계정이 이미 존재합니다!\n아이디: admin\n비밀번호: admin');
    }
}

// 현재 사용자 정보 확인 함수
function checkCurrentUser() {
    console.log('=== 현재 사용자 정보 ===');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('currentUser:', currentUser);
    console.log('isAdmin():', isAdmin());
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('localStorage accounts:', localStorage.getItem('accounts'));
    console.log('=====================');
}

// 강제 관리자 모드 활성화 함수
function forceAdminMode() {
    currentUser = {
        id: '1',
        name: '관리자',
        username: 'admin',
        role: 'admin'
    };
    isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    console.log('강제 관리자 모드 활성화 완료:', currentUser);
    console.log('isAdmin():', isAdmin());
    
    // UI 새로고침 (페이지 이동 없이)
    initializeSystem();
    
    // 알림창 제거
    // alert('관리자 모드가 강제로 활성화되었습니다!');
}

// 관리자 권한 즉시 확인 및 UI 새로고침
function refreshAdminUI() {
    console.log('관리자 UI 새로고침 시작');
    
    // 관리자 권한 강제 활성화 (조용히)
    if (currentUser && currentUser.username === 'admin') {
        forceAdminMode();
    }
    
    // 병원 목록 새로고침
    loadHospitals();
    
    console.log('관리자 UI 새로고침 완료');
}

// 수정 함수들
function editHospital(id) {
    if (!isLoggedIn) return;
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const hospital = hospitals.find(h => h.id === id);
    if (hospital) {
        // 모달 폼으로 병원 수정
        const formHtml = `
            <div class="edit-hospital-form">
                <h4>병원 정보 수정</h4>
                <form id="edit-hospital-form">
                    <input type="text" id="edit-hospital-name" placeholder="병원명" value="${hospital.name}" required>
                    <input type="text" id="edit-hospital-modality" placeholder="Modality" value="${hospital.modality || ''}" required>
                    <input type="text" id="edit-hospital-system-id" placeholder="System ID" value="${hospital.systemId || ''}" required>
                    <input type="text" id="edit-hospital-equipment" placeholder="장비명" value="${hospital.equipment || ''}" required>
                    <input type="text" id="edit-hospital-software-version" placeholder="Software Version" value="${hospital.softwareVersion || ''}" required>
                    <input type="text" id="edit-hospital-address" placeholder="주소" value="${hospital.address}" required>
                    <input type="text" id="edit-hospital-phone" placeholder="연락처" value="${hospital.phone}" required>
                    <div class="form-buttons">
                        <button type="submit">수정</button>
                        <button type="button" onclick="closeModal()">취소</button>
                    </div>
                </form>
            </div>
        `;
        
        showModal(formHtml);
        
        // 폼 제출 이벤트
        document.getElementById('edit-hospital-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newName = document.getElementById('edit-hospital-name').value.trim();
            const newModality = document.getElementById('edit-hospital-modality').value.trim();
            const newSystemId = document.getElementById('edit-hospital-system-id').value.trim();
            const newEquipment = document.getElementById('edit-hospital-equipment').value.trim();
            const newSoftwareVersion = document.getElementById('edit-hospital-software-version').value.trim();
            const newAddress = document.getElementById('edit-hospital-address').value.trim();
            const newPhone = document.getElementById('edit-hospital-phone').value.trim();
            
            if (newName && newAddress && newPhone) {
                hospital.name = newName;
                hospital.modality = newModality;
                hospital.systemId = newSystemId;
                hospital.equipment = newEquipment;
                hospital.softwareVersion = newSoftwareVersion;
                hospital.address = newAddress;
                hospital.phone = newPhone;
                
                localStorage.setItem('hospitals', JSON.stringify(hospitals));
                loadHospitals();
                loadHospitalList();
                updateSelects();
                closeModal();
                
                alert('병원 정보가 성공적으로 수정되었습니다!');
            } else {
                alert('필수 항목을 모두 입력해주세요.');
            }
        });
    }
}

function editPart(id) {
    if (!isLoggedIn) return;
    
    const part = parts.find(p => p.id === id);
    if (part) {
        const newName = prompt('부품명을 입력하세요:', part.name);
        const newCode = prompt('부품코드를 입력하세요:', part.code);
        const newPrice = prompt('가격을 입력하세요:', part.price);
        
        if (newName && newCode && newPrice) {
            part.name = newName;
            part.code = newCode;
            part.price = parseInt(newPrice);
            localStorage.setItem('parts', JSON.stringify(parts));
            loadParts();
            updateSelects();
        }
    }
}

function editHistory(id) {
    if (!isLoggedIn) return;
    
    const historyItem = history.find(h => h.id === id);
    if (historyItem) {
        const newQuantity = prompt('교체 수량을 입력하세요:', historyItem.quantity);
        const newDate = prompt('교체일을 입력하세요 (YYYY-MM-DD):', historyItem.date);
        const newNotes = prompt('비고를 입력하세요:', historyItem.notes);
        
        if (newQuantity && newDate) {
            historyItem.quantity = parseInt(newQuantity);
            historyItem.date = newDate;
            historyItem.notes = newNotes;
            localStorage.setItem('history', JSON.stringify(history));
            loadHistory();
        }
    }
}

// 모달 창 표시
function showModal(content) {
    if (!isLoggedIn) return;
    
    // 기존 모달이 있으면 제거
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 모달 창 닫기
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// 데이터 내보내기 기능
function exportData() {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const data = {
        hospitals,
        parts,
        warehouse,
        history,
        currentParts,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `병원부품관리_데이터_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 데이터 가져오기 기능
function importData() {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.hospitals) hospitals = data.hospitals;
                    if (data.parts) parts = data.parts;
                    if (data.warehouse) warehouse = data.warehouse;
                    if (data.history) history = data.history;
                    if (data.currentParts) currentParts = data.currentParts;
                    
                    localStorage.setItem('hospitals', JSON.stringify(hospitals));
                    localStorage.setItem('parts', JSON.stringify(parts));
                    localStorage.setItem('warehouse', JSON.stringify(warehouse));
                    localStorage.setItem('history', JSON.stringify(history));
                    localStorage.setItem('currentParts', JSON.stringify(currentParts));
                    
                    loadHospitals();
                    loadParts();
                    loadWarehouse('');
                    loadHistory();
                    updateSelects();
                    
                    alert('데이터가 성공적으로 가져와졌습니다!');
                } catch (error) {
                    alert('파일 형식이 올바르지 않습니다.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// 계정 관리
function loadAccounts() {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('accounts-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (accounts.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 계정이 없습니다.</p>';
        return;
    }
    
    accounts.forEach(account => {
        const accountDiv = document.createElement('div');
        accountDiv.className = 'item-card';
        // 관리자만 수정/삭제 버튼 표시
        const adminButtons = isAdmin() ? `
            <button class="btn-edit" onclick="startEditAccount('${account.id}')">수정</button>
            <button class="btn-delete" onclick="deleteAccount('${account.id}')">삭제</button>
        ` : '';

        accountDiv.innerHTML = `
            <div class="account-display" id="account-display-${account.id}">
                <h4>${account.name}</h4>
                <p><strong>아이디:</strong> ${account.username}</p>
                <p><strong>계정 유형:</strong> ${account.role === 'admin' ? '관리자' : '일반사용자'}</p>
                <div class="item-actions">
                    ${adminButtons}
                </div>
            </div>
            <div class="account-edit" id="account-edit-${account.id}" style="display: none;">
                <form id="edit-account-form-${account.id}" class="inline-edit-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>이름:</label>
                            <input type="text" id="edit-name-${account.id}" value="${account.name}" required>
                        </div>
                        <div class="form-group">
                            <label>아이디:</label>
                            <input type="text" id="edit-username-${account.id}" value="${account.username}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>비밀번호:</label>
                            <input type="password" id="edit-password-${account.id}" placeholder="새 비밀번호 (변경시에만 입력)">
                        </div>
                        <div class="form-group">
                            <label>계정 유형:</label>
                            <select id="edit-role-${account.id}" required>
                                <option value="user" ${account.role === 'user' ? 'selected' : ''}>일반사용자</option>
                                <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>관리자</option>
                            </select>
                        </div>
                    </div>
                    <div class="edit-actions">
                        <button type="submit" class="btn-save">저장</button>
                        <button type="button" class="btn-cancel" onclick="cancelEditAccount('${account.id}')">취소</button>
                    </div>
                </form>
            </div>
        `;
        container.appendChild(accountDiv);
    });
}

// 계정 추가
document.getElementById('account-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    if (!checkAdminPermission()) {
        return;
    }
    
    const username = document.getElementById('account-username').value.trim();
    const name = document.getElementById('account-name').value.trim();
    const password = document.getElementById('account-password').value;
    const role = document.getElementById('account-role').value;
    
    // 중복 아이디 체크
    if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
        alert('이미 등록된 아이디입니다.');
        return;
    }
    
    const account = {
        id: Date.now().toString(),
        name: name,
        username: username,
        password: password,
        role: role
    };
    
    accounts.push(account);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    loadAccounts();
    this.reset();
    
    alert('계정이 성공적으로 추가되었습니다!');
});

// 인라인 편집 시작 함수
function startEditAccount(accountId) {
    if (!checkAdminPermission()) return;
    
    // 편집 모드로 전환
    document.getElementById(`account-display-${accountId}`).style.display = 'none';
    document.getElementById(`account-edit-${accountId}`).style.display = 'block';
    
    // 폼 제출 이벤트 리스너 추가
    const form = document.getElementById(`edit-account-form-${accountId}`);
    form.onsubmit = function(e) {
        e.preventDefault();
        saveEditAccount(accountId);
    };
}

// 인라인 편집 저장 함수
function saveEditAccount(accountId) {
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
        alert('해당 계정을 찾을 수 없습니다.');
        return;
    }
    
    const newName = document.getElementById(`edit-name-${accountId}`).value.trim();
    const newUsername = document.getElementById(`edit-username-${accountId}`).value.trim();
    const newPassword = document.getElementById(`edit-password-${accountId}`).value;
    const newRole = document.getElementById(`edit-role-${accountId}`).value;
    
    if (!newName || !newUsername) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 아이디 중복 확인 (자신 제외)
    const existingAccount = accounts.find(a => a.username === newUsername && a.id !== accountId);
    if (existingAccount) {
        alert('이미 사용 중인 아이디입니다.');
        return;
    }
    
    // 기존 계정 정보 업데이트
    account.name = newName;
    account.username = newUsername;
    if (newPassword) {
        account.password = newPassword;
    }
    account.role = newRole;
    
    // localStorage 업데이트
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    // 표시 모드로 전환
    document.getElementById(`account-display-${accountId}`).style.display = 'block';
    document.getElementById(`account-edit-${accountId}`).style.display = 'none';
    
    // 계정 목록 새로고침
    loadAccounts();
    alert('계정 정보가 수정되었습니다.');
}

// 인라인 편집 취소 함수
function cancelEditAccount(accountId) {
    // 표시 모드로 전환
    document.getElementById(`account-display-${accountId}`).style.display = 'block';
    document.getElementById(`account-edit-${accountId}`).style.display = 'none';
}

// 계정 삭제 함수
function deleteAccount(accountId) {
    if (!checkAdminPermission()) return;
    
    const account = accounts.find(a => a.id === accountId);
    if (!account) {
        alert('해당 계정을 찾을 수 없습니다.');
        return;
    }
    
    if (!confirm(`정말로 '${account.name}' 계정을 삭제하시겠습니까?`)) {
        return;
    }
    
    const index = accounts.findIndex(a => a.id === accountId);
    if (index === -1) {
        alert('해당 계정을 찾을 수 없습니다.');
        return;
    }
    
    accounts.splice(index, 1);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    loadAccounts();
    alert('계정이 삭제되었습니다.');
}

// 검색 기능
document.getElementById('hospital-search')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    loadHospitals(searchTerm, 1); // 검색 시 첫 페이지로 이동
});

// 전역 함수로 등록
window.exportData = exportData;
window.importData = importData;
window.closeModal = closeModal;
window.backToHospitals = backToHospitals;
window.showAddPartForm = showAddPartForm;
window.closeAddPartForm = closeAddPartForm;
window.login = login;
window.logout = logout;
window.demoLogin = demoLogin;
window.startEditAccount = startEditAccount;
window.saveEditAccount = saveEditAccount;
window.cancelEditAccount = cancelEditAccount;
window.deleteAccount = deleteAccount;
window.deleteOutboundPart = deleteOutboundPart;
window.editCoilItem = editCoilItem;
window.showCoilOutboundForm = showCoilOutboundForm;

// 관리자 권한이 필요한 함수들
window.deleteHospital = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 병원을 삭제하시겠습니까?')) {
        return;
    }
    
    hospitals = hospitals.filter(h => h.id !== id);
    localStorage.setItem('hospitals', JSON.stringify(hospitals));
    
    // 관련 데이터도 삭제
    currentParts = currentParts.filter(cp => cp.hospitalId !== id);
    localStorage.setItem('currentParts', JSON.stringify(currentParts));
    
    history = history.filter(h => h.hospitalId !== id);
    localStorage.setItem('history', JSON.stringify(history));
    
    loadHospitals();
    updateSelects();
    alert('병원이 삭제되었습니다.');
};

window.deletePart = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 부품을 삭제하시겠습니까?')) {
        return;
    }
    
    parts = parts.filter(p => p.id !== id);
    localStorage.setItem('parts', JSON.stringify(parts));
    
    // 관련 데이터도 삭제
    currentParts = currentParts.filter(cp => cp.partId !== id);
    localStorage.setItem('currentParts', JSON.stringify(currentParts));
    
    loadParts();
    updateSelects();
    alert('부품이 삭제되었습니다.');
};

window.deleteHistory = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) {
        return;
    }
    
    history = history.filter(h => h.id !== id);
    localStorage.setItem('history', JSON.stringify(history));
    
    loadHistory();
    alert('기록이 삭제되었습니다.');
};

window.editHospital = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const hospital = hospitals.find(h => h.id === id);
    if (!hospital) return;
    
    // 모달 폼으로 병원 수정
    const formHtml = `
        <div class="edit-hospital-form">
            <h4>병원 정보 수정</h4>
            <form id="edit-hospital-form">
                <input type="text" id="edit-hospital-name" placeholder="병원명" value="${hospital.name}" required>
                <input type="text" id="edit-hospital-modality" placeholder="Modality" value="${hospital.modality || ''}" required>
                <input type="text" id="edit-hospital-system-id" placeholder="System ID" value="${hospital.systemId || ''}" required>
                <input type="text" id="edit-hospital-equipment" placeholder="장비명" value="${hospital.equipment || ''}" required>
                <input type="text" id="edit-hospital-software-version" placeholder="Software Version" value="${hospital.softwareVersion || ''}" required>
                <input type="text" id="edit-hospital-address" placeholder="주소" value="${hospital.address}" required>
                <input type="text" id="edit-hospital-phone" placeholder="연락처" value="${hospital.phone}" required>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('edit-hospital-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newName = document.getElementById('edit-hospital-name').value.trim();
        const newModality = document.getElementById('edit-hospital-modality').value.trim();
        const newSystemId = document.getElementById('edit-hospital-system-id').value.trim();
        const newEquipment = document.getElementById('edit-hospital-equipment').value.trim();
        const newSoftwareVersion = document.getElementById('edit-hospital-software-version').value.trim();
        const newAddress = document.getElementById('edit-hospital-address').value.trim();
        const newPhone = document.getElementById('edit-hospital-phone').value.trim();
        
        if (newName && newAddress && newPhone) {
            hospital.name = newName;
            hospital.modality = newModality;
            hospital.systemId = newSystemId;
            hospital.equipment = newEquipment;
            hospital.softwareVersion = newSoftwareVersion;
            hospital.address = newAddress;
            hospital.phone = newPhone;
            
            localStorage.setItem('hospitals', JSON.stringify(hospitals));
            loadHospitals();
            updateSelects();
            closeModal();
            
            alert('병원 정보가 성공적으로 수정되었습니다!');
        } else {
            alert('필수 항목을 모두 입력해주세요.');
        }
    });
};

window.editPart = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const part = parts.find(p => p.id === id);
    if (!part) return;
    
    const newName = prompt('부품명을 입력하세요:', part.name);
    if (newName && newName.trim()) {
        part.name = newName.trim();
        part.code = prompt('부품코드를 입력하세요:', part.code) || '';
        part.category = prompt('카테고리를 입력하세요:', part.category) || '';
        part.price = parseInt(prompt('가격을 입력하세요:', part.price)) || 0;
        
        localStorage.setItem('parts', JSON.stringify(parts));
        loadParts();
        updateSelects();
        alert('부품 정보가 수정되었습니다.');
    }
};

window.editHistory = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const historyItem = history.find(h => h.id === id);
    if (!historyItem) return;
    
    const newDate = prompt('날짜를 입력하세요 (YYYY-MM-DD):', historyItem.date);
    if (newDate && newDate.trim()) {
        historyItem.date = newDate.trim();
        historyItem.partName = prompt('부품명을 입력하세요:', historyItem.partName) || '';
        historyItem.quantity = parseInt(prompt('수량을 입력하세요:', historyItem.quantity)) || 1;
        historyItem.notes = prompt('비고를 입력하세요:', historyItem.notes) || '';
        
        localStorage.setItem('history', JSON.stringify(history));
        loadHistory();
        alert('기록이 수정되었습니다.');
    }
};

window.removeCurrentPart = function(currentPartId) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    if (!confirm('정말로 이 부품을 제거하시겠습니까?')) {
        return;
    }
    
    currentParts = currentParts.filter(cp => cp.id !== currentPartId);
    localStorage.setItem('currentParts', JSON.stringify(currentParts));
    
    loadCurrentParts(currentHospitalId, 1);
    alert('부품이 제거되었습니다.');
};

window.editAccount = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    const newName = prompt('이름을 입력하세요:', account.name);
    if (newName && newName.trim()) {
        account.name = newName.trim();
        account.username = prompt('아이디를 입력하세요:', account.username) || '';
        account.password = prompt('비밀번호를 입력하세요:', account.password) || '';
        account.role = prompt('계정 유형을 입력하세요 (user/admin):', account.role) || 'user';
        
        localStorage.setItem('accounts', JSON.stringify(accounts));
        loadAccounts();
        alert('계정 정보가 수정되었습니다.');
    }
};

window.deleteAccount = function(id) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const account = accounts.find(a => a.id === id);
    if (!account) return;
    
    // 자신의 계정은 삭제할 수 없음
    if (account.id === currentUser.id) {
        alert('자신의 계정은 삭제할 수 없습니다.');
        return;
    }
    
    if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) {
        return;
    }
    
    accounts = accounts.filter(a => a.id !== id);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    
    loadAccounts();
    alert('계정이 삭제되었습니다.');
};

// 교체 히스토리 수정
function editHistoryItem(historyId) {
    if (!isLoggedIn) return;
    if (!checkAdminPermission()) return;
    
    const historyItem = history.find(h => h.id === historyId);
    if (!historyItem) return;
    
    const hospital = hospitals.find(h => h.id === historyItem.hospitalId);
    
    // 모달 폼 표시
    const formHtml = `
        <div class="add-part-form">
            <h4>교체 히스토리 수정</h4>
            <form id="edit-history-form">
                <input type="text" id="edit-history-part-name" placeholder="부품명" value="${historyItem.partName}" required>
                <input type="text" id="edit-history-part-number" placeholder="부품번호" value="${historyItem.partNumber || ''}" required>
                <input type="text" id="edit-history-serial-number" placeholder="시리얼번호" value="${historyItem.serialNumber || ''}" required>
                <input type="date" id="edit-history-date" value="${historyItem.date}" required>
                <input type="text" id="edit-history-worker" placeholder="작업자" value="${historyItem.worker || ''}" required>
                <textarea id="edit-history-notes" placeholder="에러 내용을 입력하세요 (선택사항)">${historyItem.notes || ''}</textarea>
                <div class="form-buttons">
                    <button type="submit">수정</button>
                    <button type="button" onclick="closeModal()">취소</button>
                </div>
            </form>
        </div>
    `;
    
    showModal(formHtml);
    
    // 폼 제출 이벤트
    document.getElementById('edit-history-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPartName = document.getElementById('edit-history-part-name').value.trim();
        const newPartNumber = document.getElementById('edit-history-part-number').value.trim();
        const newSerialNumber = document.getElementById('edit-history-serial-number').value.trim();
        const newDate = document.getElementById('edit-history-date').value;
        const newWorker = document.getElementById('edit-history-worker').value.trim();
        const newNotes = document.getElementById('edit-history-notes').value.trim();
        
        if (newPartName && newDate) {
            // 히스토리 아이템 업데이트
            historyItem.partName = newPartName;
            historyItem.partNumber = newPartNumber;
            historyItem.serialNumber = newSerialNumber;
            historyItem.date = newDate;
            historyItem.worker = newWorker;
            historyItem.notes = newNotes;
            
            localStorage.setItem('history', JSON.stringify(history));
            
            // 현재 표시 중인 히스토리 새로고침
            const selectedHospitalId = document.getElementById('history-hospital').value;
            loadHistory(selectedHospitalId, 1);
            
            closeModal();
            alert('교체 히스토리가 수정되었습니다.');
        }
    });
}

// 입출고 히스토리 로드
function loadInoutHistory(searchTerm = '') {
    if (!isLoggedIn) return;
    
    const container = document.getElementById('inout-history-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (inoutHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">입출고 기록이 없습니다.</td></tr>';
        return;
    }
    
    // 날짜 내림차순 정렬 (최신순)
    let sortedHistory = inoutHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 검색어가 있으면 필터링
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        sortedHistory = sortedHistory.filter(item =>
            (item.partName && item.partName.toLowerCase().includes(searchLower)) ||
            (item.partNumber && item.partNumber.toLowerCase().includes(searchLower)) ||
            (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
            (item.location && item.location.toLowerCase().includes(searchLower)) ||
            (item.hospital && item.hospital.toLowerCase().includes(searchLower)) ||
            (item.description && item.description.toLowerCase().includes(searchLower)) ||
            (item.author && item.author.toLowerCase().includes(searchLower)) ||
            (item.outboundAuthor && item.outboundAuthor.toLowerCase().includes(searchLower)) ||
            (item.worker && item.worker.toLowerCase().includes(searchLower))
        );
    }
    
    if (sortedHistory.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    // 현재 필터링된 히스토리를 전역 변수에 저장 (엑셀 추출용)
    window.currentFilteredInoutHistory = sortedHistory;
    
    sortedHistory.forEach(item => {
        const historyRow = document.createElement('tr');
        historyRow.className = 'inout-history-row';
        
        // 구분별 배지 색상
        const typeBadge = getInoutTypeBadge(item.type);
        
        // 관리자만 수정/삭제 버튼 표시
        const adminButtons = isAdmin() ? `
            <button class="btn-edit" onclick="editInoutHistory('${item.id}')">수정</button>
            <button class="btn-delete" onclick="deleteInoutHistory('${item.id}')">삭제</button>
        ` : '';

        historyRow.innerHTML = `
            <td>${item.date}</td>
            <td>${item.partName}</td>
            <td>${item.partNumber || '미등록'}</td>
            <td>${item.serialNumber || '미등록'}</td>
            <td>${item.location || '미등록'}</td>
            <td>${typeBadge}</td>
            <td>${item.hospital || '-'}</td>
            <td>${item.status}</td>
            <td>${item.description || '-'}</td>
            <td>${item.author || '-'}</td>
            <td>${item.outboundAuthor || '-'}</td>
            <td>${item.worker || '미등록'}</td>
            <td>${adminButtons}</td>
        `;
        container.appendChild(historyRow);
    });
}

// 입출고 구분별 배지 생성
function getInoutTypeBadge(type) {
    const typeColors = {
        '입고': 'type-in',
        '출고': 'type-out',
        '삭제': 'type-delete'
    };
    
    const colorClass = typeColors[type] || 'type-default';
    return `<span class="type-badge ${colorClass}">${type}</span>`;
}

    // 입출고 히스토리 수정
    function editInoutHistory(itemId) {
        if (!checkAdminPermission()) return;
        
        const item = inoutHistory.find(h => h.id === itemId);
        if (!item) {
            alert('해당 기록을 찾을 수 없습니다.');
            return;
        }
        
        const modalContent = `
            <div class="modal-content">
                <h3>📝 입출고 기록 수정</h3>
                <form id="edit-inout-form">
                    <div class="form-group">
                        <label for="edit-inout-date">날짜</label>
                        <input type="date" id="edit-inout-date" value="${item.date}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-partName">부품명</label>
                        <input type="text" id="edit-inout-partName" value="${item.partName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-partNumber">부품번호</label>
                        <input type="text" id="edit-inout-partNumber" value="${item.partNumber || ''}" placeholder="부품번호">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-serialNumber">시리얼번호</label>
                        <input type="text" id="edit-inout-serialNumber" value="${item.serialNumber || ''}" placeholder="시리얼번호">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-location">위치</label>
                        <input type="text" id="edit-inout-location" value="${item.location || ''}" placeholder="위치">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-type">구분</label>
                        <select id="edit-inout-type" required>
                            <option value="입고" ${item.type === '입고' ? 'selected' : ''}>입고</option>
                            <option value="출고" ${item.type === '출고' ? 'selected' : ''}>출고</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-hospital">병원명</label>
                        <input type="text" id="edit-inout-hospital" value="${item.hospital || ''}" placeholder="병원명">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-status">상태</label>
                        <select id="edit-inout-status" required>
                            <option value="Good" ${item.status === 'Good' ? 'selected' : ''}>Good</option>
                            <option value="Bad" ${item.status === 'Bad' ? 'selected' : ''}>Bad</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-description">입고내용</label>
                        <textarea id="edit-inout-description" placeholder="입고내용">${item.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-author">입고자</label>
                        <input type="text" id="edit-inout-author" value="${item.author || ''}" placeholder="입고자">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-outboundAuthor">출고자</label>
                        <input type="text" id="edit-inout-outboundAuthor" value="${item.outboundAuthor || ''}" placeholder="출고자">
                    </div>
                    <div class="form-group">
                        <label for="edit-inout-worker">작업자</label>
                        <input type="text" id="edit-inout-worker" value="${item.worker || ''}" placeholder="작업자">
                    </div>
                    <div class="form-buttons">
                        <button type="submit">수정 완료</button>
                        <button type="button" onclick="closeModal()">취소</button>
                    </div>
                </form>
            </div>
        `;
        
        showModal(modalContent);
        
        // 수정 폼 제출 처리
        document.getElementById('edit-inout-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newDate = document.getElementById('edit-inout-date').value;
            const newPartName = document.getElementById('edit-inout-partName').value.trim();
            const newPartNumber = document.getElementById('edit-inout-partNumber').value.trim();
            const newSerialNumber = document.getElementById('edit-inout-serialNumber').value.trim();
            const newLocation = document.getElementById('edit-inout-location').value.trim();
            const newType = document.getElementById('edit-inout-type').value;
            const newHospital = document.getElementById('edit-inout-hospital').value.trim();
            const newStatus = document.getElementById('edit-inout-status').value;
            const newDescription = document.getElementById('edit-inout-description').value.trim();
            const newAuthor = document.getElementById('edit-inout-author').value.trim();
            const newOutboundAuthor = document.getElementById('edit-inout-outboundAuthor').value.trim();
            const newWorker = document.getElementById('edit-inout-worker').value.trim();
            
            if (!newPartName) {
                alert('부품명을 입력해주세요.');
                return;
            }
            
            // 기존 항목 업데이트
            item.date = newDate;
            item.partName = newPartName;
            item.partNumber = newPartNumber;
            item.serialNumber = newSerialNumber;
            item.location = newLocation;
            item.type = newType;
            item.hospital = newHospital;
            item.status = newStatus;
            item.description = newDescription;
            item.author = newAuthor;
            item.outboundAuthor = newOutboundAuthor;
            item.worker = newWorker;
            
            // localStorage 업데이트
            localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
            
            closeModal();
            loadInoutHistory();
            alert('입출고 기록이 수정되었습니다.');
        });
    }
    
    // 입출고 히스토리 삭제
    function deleteInoutHistory(itemId) {
        if (!checkAdminPermission()) return;
        
        if (!confirm('정말로 이 입출고 기록을 삭제하시겠습니까?')) {
            return;
        }
        
        const index = inoutHistory.findIndex(h => h.id === itemId);
        if (index === -1) {
            alert('해당 기록을 찾을 수 없습니다.');
            return;
        }
        
        inoutHistory.splice(index, 1);
        localStorage.setItem('inoutHistory', JSON.stringify(inoutHistory));
        loadInoutHistory();
        alert('입출고 기록이 삭제되었습니다.');
    }
    
    // 입출고 히스토리 엑셀 추출
    function exportInoutHistoryToExcel() {
    if (!isLoggedIn) return;
    
    // 현재 필터링된 히스토리 가져오기
    const historyToExport = window.currentFilteredInoutHistory || inoutHistory;
    
    if (historyToExport.length === 0) {
        alert('내보낼 입출고 히스토리가 없습니다.');
        return;
    }
    
    // CSV 헤더 생성
    const headers = [
        '날짜',
        '부품명',
        '부품번호',
        '시리얼번호',
        '위치',
        '구분',
        '병원명',
        '상태',
        '입고내용',
        '입고자',
        '출고자',
        '작업자'
    ];
    
    // CSV 데이터 생성
    const csvData = historyToExport.map(item => [
        item.date,
        item.partName,
        item.partNumber || '',
        item.serialNumber || '',
        item.location || '',
        item.type,
        item.hospital || '',
        item.status,
        item.description || '',
        item.author || '',
        item.outboundAuthor || '',
        item.worker || ''
    ]);
    
    // CSV 문자열 생성
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 파일명 생성 (입출고히스토리_날짜.csv)
    const today = new Date().toISOString().split('T')[0];
    const fileName = `입출고히스토리_${today}.csv`;
    
    // 파일 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`${fileName} 파일이 성공적으로 다운로드되었습니다!`);
}