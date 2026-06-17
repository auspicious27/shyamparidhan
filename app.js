// ============================================================
// SHYAM PARIDHAN - Main Application (Complete)
// ============================================================

let cart = JSON.parse(localStorage.getItem('sp_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('sp_wishlist') || '[]');
let currentUser = JSON.parse(localStorage.getItem('sp_user') || 'null');
let allProducts = getProducts();
let currentFilter = 'all';
let currentCategory = null;
let visibleCount = 8;
let selectedAddressIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateWishlistUI();
  updateAuthUI();
  renderProducts();
  setupNavigation();
  setupSearch();
  setupCarousel();
  setupScrollTop();
  setupPaymentOptions();
  setupFilterTabs();
});

// Auto-refresh products when user comes back to this tab (after admin adds products)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    allProducts = getProducts();
    renderProducts();
    updateCartUI();
  }
});
// Also refresh on window focus
window.addEventListener('focus', () => {
  allProducts = getProducts();
  renderProducts();
  updateCartUI();
});

// ============ NAVIGATION ============
function setupNavigation() {
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('active');
    document.getElementById('hamburger').classList.toggle('active');
  });
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navMenu').classList.remove('active');
      document.getElementById('hamburger').classList.remove('active');
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
  document.getElementById('accountBtn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('userDropdown').classList.toggle('active');
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#userDropdown') && !e.target.closest('#accountBtn'))
      document.getElementById('userDropdown').classList.remove('active');
  });
  document.getElementById('cartBtn').addEventListener('click', () => toggleCart());
  document.getElementById('wishlistNavBtn').addEventListener('click', () => openWishlistPage());
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    nav.classList.toggle('scrolled', window.scrollY > 80);
    const st = document.getElementById('scrollTop');
    st.style.opacity = window.scrollY > 400 ? '1' : '0';
    st.style.pointerEvents = window.scrollY > 400 ? 'all' : 'none';
  });
}

function setupScrollTop() {
  const btn = document.getElementById('scrollTop');
  btn.style.opacity = '0'; btn.style.pointerEvents = 'none';
}

// ============ SEARCH ============
function setupSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  document.getElementById('searchBtn').addEventListener('click', () => {
    overlay.classList.add('active');
    setTimeout(() => input.focus(), 100);
  });
  document.getElementById('searchClose').addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('active'); });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const res = document.getElementById('searchResults');
    if (!q) { res.innerHTML = ''; return; }
    const m = allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q));
    if (!m.length) { res.innerHTML = '<p class="no-results">No products found</p>'; return; }
    res.innerHTML = m.slice(0, 6).map(p => `
      <div class="search-result-item" onclick="document.getElementById('searchOverlay').classList.remove('active');openQuickView(${p.id})">
        <img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><span>₹${p.price.toLocaleString()}</span></div>
      </div>`).join('');
  });
}

// ============ CAROUSEL ============
function setupCarousel() {
  const track = document.getElementById('carouselTrack');
  let pos = 0, amt = 300;
  document.getElementById('nextBtn').addEventListener('click', () => {
    pos = Math.min(pos + amt, track.scrollWidth - track.parentElement.clientWidth);
    track.style.transform = `translateX(-${pos}px)`;
  });
  document.getElementById('prevBtn').addEventListener('click', () => {
    pos = Math.max(pos - amt, 0);
    track.style.transform = `translateX(-${pos}px)`;
  });
  let auto = setInterval(() => {
    const max = track.scrollWidth - track.parentElement.clientWidth;
    pos = pos >= max ? 0 : pos + amt;
    track.style.transform = `translateX(-${pos}px)`;
  }, 3500);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  track.parentElement.addEventListener('mouseleave', () => {
    auto = setInterval(() => {
      const max = track.scrollWidth - track.parentElement.clientWidth;
      pos = pos >= max ? 0 : pos + amt;
      track.style.transform = `translateX(-${pos}px)`;
    }, 3500);
  });
}

// ============ FILTER TABS ============
function setupFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      currentCategory = null;
      visibleCount = 8;
      renderProducts();
    });
  });
}

function filterByCategory(cat) {
  currentCategory = cat;
  currentFilter = 'all';
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.filter-tab')[0].classList.add('active');
  visibleCount = 8;
  renderProducts();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

// ============ PRODUCTS ============
function getFilteredProducts() {
  let prods = [...allProducts];
  if (currentCategory) prods = prods.filter(p => p.category === currentCategory);
  if (currentFilter !== 'all') prods = prods.filter(p => p.tag === currentFilter);
  const sort = document.getElementById('sortSelect')?.value || 'default';
  if (sort === 'price-low') prods.sort((a, b) => a.price - b.price);
  else if (sort === 'price-high') prods.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') prods.sort((a, b) => b.rating - a.rating);
  else if (sort === 'newest') prods.sort((a, b) => b.id - a.id);
  return prods;
}

function sortProducts() { renderProducts(); }

function renderProducts() {
  allProducts = getProducts();
  const prods = getFilteredProducts();
  const grid = document.getElementById('productGrid');
  const visible = prods.slice(0, visibleCount);
  document.getElementById('productCount').textContent = `Showing ${visible.length} of ${prods.length} products`;
  document.getElementById('loadMoreBtn').style.display = visibleCount >= prods.length ? 'none' : 'inline-block';

  grid.innerHTML = visible.map(p => {
    const inWish = wishlist.includes(p.id);
    const disc = Math.round((1 - p.price / p.oldPrice) * 100);
    const stars = renderStars(p.rating);
    return `<div class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-badge ${p.tag}">${p.tag === 'sale' ? `Sale ${disc}%` : p.tag === 'new' ? 'New' : 'Trending'}</div>
        <div class="product-actions">
          <button class="btn-icon ${inWish ? 'active' : ''}" onclick="toggleWishlist(${p.id})" title="Wishlist"><i class="fa${inWish ? 's' : 'r'} fa-heart"></i></button>
          <button class="btn-icon" onclick="openQuickView(${p.id})" title="Quick View"><i class="fas fa-eye"></i></button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-vendor">Shyam Paridhan</div>
        <h3>${p.name}</h3>
        <div class="product-rating">${stars}<span>(${p.reviews})</span></div>
        <div class="product-price">
          <span class="price">₹${p.price.toLocaleString()}</span>
          <span class="old-price">₹${p.oldPrice.toLocaleString()}</span>
          <span class="discount">${disc}% OFF</span>
        </div>
        <div class="product-colors">${p.colors.map(c => `<span class="color-dot" style="background:${c}"></span>`).join('')}</div>
        <button class="btn-add-cart" onclick="addToCart(${p.id})"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
      </div>
    </div>`;
  }).join('');
}

function renderStars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(r)) s += '<i class="fas fa-star"></i>';
    else if (i - r < 1) s += '<i class="fas fa-star-half-alt"></i>';
    else s += '<i class="far fa-star"></i>';
  }
  return s;
}

function loadMoreProducts() { visibleCount += 4; renderProducts(); }

// ============ CART ============
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
  document.body.style.overflow = document.getElementById('cartSidebar').classList.contains('open') ? 'hidden' : '';
}

function addToCart(id) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  showToast('Product added to cart!');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateCartQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem('sp_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartItemCount').textContent = count;
  const items = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');

  if (!cart.length) {
    items.innerHTML = '';
    empty.style.display = 'flex';
    footer.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  footer.style.display = 'block';

  let subtotal = 0;
  items.innerHTML = cart.map(ci => {
    const p = allProducts.find(pr => pr.id === ci.id);
    if (!p) return '';
    subtotal += p.price * ci.qty;
    return `<div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <span class="cart-item-price">₹${p.price.toLocaleString()}</span>
        <div class="qty-controls">
          <button onclick="updateCartQty(${p.id},-1)">−</button>
          <span>${ci.qty}</span>
          <button onclick="updateCartQty(${p.id},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${p.id})"><i class="fas fa-trash"></i></button>
    </div>`;
  }).join('');

  const shipping = subtotal >= 999 ? 0 : 49;
  document.getElementById('cartSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('cartShipping').textContent = shipping ? `₹${shipping}` : 'FREE';
  document.getElementById('cartTotal').textContent = `₹${(subtotal + shipping).toLocaleString()}`;
}

// ============ WISHLIST ============
function toggleWishlist(id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) { wishlist.splice(idx, 1); showToast('Removed from wishlist'); }
  else { wishlist.push(id); showToast('Added to wishlist!'); }
  localStorage.setItem('sp_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
  renderProducts();
}

function updateWishlistUI() {
  document.getElementById('wishlistCount').textContent = wishlist.length;
}

function openWishlistPage() {
  if (!currentUser) { openAuthModal('login'); showToast('Please login to view wishlist'); return; }
  openProfile(); switchProfileTab('wishlist');
}

// ============ AUTH ============
function openAuthModal(tab) {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('userDropdown').classList.remove('active');
  switchAuthTab(tab || 'login');
}

function switchAuthTab(tab) {
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value;
  if (!email || !pw) { showToast('Please fill all fields', 'error'); return; }

  // Check if admin credentials — redirect to admin panel
  if (email === 'admin' && pw === 'shyam@2024') {
    sessionStorage.setItem('sp_admin_logged_in', 'true');
    window.location.href = 'admin.html';
    return;
  }

  // Check stored users
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.email === email && u.password === pw);
  if (!user) { showToast('Invalid email or password', 'error'); return; }
  currentUser = user;
  localStorage.setItem('sp_user', JSON.stringify(user));
  closeModal('authModal');
  updateAuthUI();
  showToast(`Welcome back, ${user.name}!`);
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pw = document.getElementById('regPassword').value;
  const cpw = document.getElementById('regConfirmPassword').value;
  if (!name || !email || !phone || !pw) { showToast('Please fill all fields', 'error'); return; }
  if (pw !== cpw) { showToast('Passwords do not match', 'error'); return; }
  if (pw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  if (users.find(u => u.email === email)) { showToast('Email already registered', 'error'); return; }
  const user = { id: Date.now(), name, email, phone, password: pw, addresses: [], orders: [] };
  users.push(user);
  localStorage.setItem('sp_users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('sp_user', JSON.stringify(user));
  closeModal('authModal');
  updateAuthUI();
  showToast(`Welcome, ${name}! Account created successfully.`);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('sp_user');
  updateAuthUI();
  document.getElementById('userDropdown').classList.remove('active');
  showToast('Logged out successfully');
}

function updateAuthUI() {
  const guestMenu = document.getElementById('guestMenu');
  const userMenu = document.getElementById('userMenu');
  if (currentUser) {
    guestMenu.style.display = 'none';
    userMenu.style.display = 'block';
    document.getElementById('userInfoDropdown').innerHTML = `<div class="user-mini-avatar">${currentUser.name[0]}</div><div><strong>${currentUser.name}</strong><small>${currentUser.email}</small></div>`;
  } else {
    guestMenu.style.display = 'block';
    userMenu.style.display = 'none';
  }
}

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ============ PROFILE ============
function openProfile() {
  if (!currentUser) { openAuthModal('login'); return; }
  document.getElementById('profileModal').classList.add('active');
  switchProfileTab('info');
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileAvatar').textContent = currentUser.name[0].toUpperCase();
  document.getElementById('editName').value = currentUser.name;
  document.getElementById('editEmail').value = currentUser.email;
  document.getElementById('editPhone').value = currentUser.phone || '';
}

function openOrders() {
  if (!currentUser) { openAuthModal('login'); return; }
  openProfile(); switchProfileTab('orders');
}

function openAddresses() {
  if (!currentUser) { openAuthModal('login'); return; }
  openProfile(); switchProfileTab('addresses');
}

function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach((t,i) => t.classList.remove('active'));
  document.querySelectorAll('.profile-content').forEach(c => c.style.display = 'none');
  const tabs = ['info','orders','addresses','wishlist'];
  const idx = tabs.indexOf(tab);
  document.querySelectorAll('.profile-tab')[idx].classList.add('active');
  document.querySelectorAll('.profile-content')[idx].style.display = 'block';
  if (tab === 'orders') renderOrders();
  if (tab === 'addresses') renderAddresses();
  if (tab === 'wishlist') renderWishlistGrid();
}

function saveProfile() {
  currentUser.name = document.getElementById('editName').value.trim();
  currentUser.email = document.getElementById('editEmail').value.trim();
  currentUser.phone = document.getElementById('editPhone').value.trim();
  localStorage.setItem('sp_user', JSON.stringify(currentUser));
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx > -1) { users[idx] = {...users[idx], ...currentUser}; localStorage.setItem('sp_users', JSON.stringify(users)); }
  updateAuthUI();
  showToast('Profile updated!');
}

function renderOrders() {
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  const orders = user?.orders || [];
  const el = document.getElementById('ordersList');
  if (!orders.length) { el.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No orders yet</p></div>'; return; }
  el.innerHTML = orders.slice().reverse().map(o => `
    <div class="order-card">
      <div class="order-header">
        <div><strong>Order #${o.id}</strong><span class="order-date">${o.date}</span></div>
        <span class="order-status status-${o.status}">${o.status}</span>
      </div>
      <div class="order-items">${o.items.map(i => {
        const p = allProducts.find(pr => pr.id === i.id);
        return p ? `<div class="order-item-mini"><img src="${p.image}" alt="${p.name}"><span>${p.name} x${i.qty}</span></div>` : '';
      }).join('')}</div>
      <div class="order-footer"><span>Total: ₹${o.total.toLocaleString()}</span><span>Payment: ${o.payment}</span></div>
    </div>`).join('');
}

function renderAddresses() {
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  const addrs = user?.addresses || [];
  const el = document.getElementById('addressesList');
  if (!addrs.length) { el.innerHTML = '<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>No addresses saved</p></div>'; return; }
  el.innerHTML = addrs.map((a, i) => `
    <div class="address-card">
      <div class="addr-badge">${a.type}</div>
      <strong>${a.name}</strong>
      <p>${a.line1}${a.line2 ? ', ' + a.line2 : ''}<br>${a.city}, ${a.state} – ${a.pincode}</p>
      <span>Phone: ${a.phone}</span>
      <div class="addr-actions">
        <button onclick="editAddress(${i})"><i class="fas fa-edit"></i> Edit</button>
        <button onclick="deleteAddress(${i})"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>`).join('');
}

function renderWishlistGrid() {
  const el = document.getElementById('wishlistGrid');
  if (!wishlist.length) { el.innerHTML = '<div class="empty-state"><i class="fas fa-heart"></i><p>Your wishlist is empty</p></div>'; return; }
  el.innerHTML = wishlist.map(id => {
    const p = allProducts.find(pr => pr.id === id);
    if (!p) return '';
    return `<div class="product-card mini">
      <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-price"><span class="price">₹${p.price.toLocaleString()}</span></div>
        <button class="btn-add-cart" onclick="addToCart(${p.id})"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
        <button class="btn-outline btn-sm" onclick="toggleWishlist(${p.id});renderWishlistGrid()"><i class="fas fa-trash"></i> Remove</button>
      </div>
    </div>`;
  }).join('');
}

// ============ ADDRESS ============
function openAddressForm() {
  document.getElementById('addressModal').classList.add('active');
  document.getElementById('addressModalTitle').textContent = 'Add New Address';
  document.getElementById('addrEditIndex').value = '-1';
  clearAddressForm();
}

function openAddressFromCheckout() {
  openAddressForm();
}

function clearAddressForm() {
  ['addrName','addrPhone','addrLine1','addrLine2','addrCity','addrState','addrPincode'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('addrType').value = 'home';
  document.querySelectorAll('.addr-type').forEach(b => b.classList.remove('active'));
  document.querySelector('.addr-type[data-type="home"]').classList.add('active');
}

function selectAddrType(btn) {
  document.querySelectorAll('.addr-type').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('addrType').value = btn.dataset.type;
}

function saveAddress() {
  const addr = {
    name: document.getElementById('addrName').value.trim(),
    phone: document.getElementById('addrPhone').value.trim(),
    line1: document.getElementById('addrLine1').value.trim(),
    line2: document.getElementById('addrLine2').value.trim(),
    city: document.getElementById('addrCity').value.trim(),
    state: document.getElementById('addrState').value.trim(),
    pincode: document.getElementById('addrPincode').value.trim(),
    type: document.getElementById('addrType').value
  };
  if (!addr.name || !addr.phone || !addr.line1 || !addr.city || !addr.state || !addr.pincode) {
    showToast('Please fill all required fields', 'error'); return;
  }
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx === -1) return;
  if (!users[idx].addresses) users[idx].addresses = [];
  const editIdx = parseInt(document.getElementById('addrEditIndex').value);
  if (editIdx >= 0) users[idx].addresses[editIdx] = addr;
  else users[idx].addresses.push(addr);
  localStorage.setItem('sp_users', JSON.stringify(users));
  currentUser = users[idx];
  localStorage.setItem('sp_user', JSON.stringify(currentUser));
  closeModal('addressModal');
  renderAddresses();
  renderCheckoutAddresses();
  showToast(editIdx >= 0 ? 'Address updated!' : 'Address added!');
}

function editAddress(i) {
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  const addr = user.addresses[i];
  document.getElementById('addressModal').classList.add('active');
  document.getElementById('addressModalTitle').textContent = 'Edit Address';
  document.getElementById('addrEditIndex').value = i;
  document.getElementById('addrName').value = addr.name;
  document.getElementById('addrPhone').value = addr.phone;
  document.getElementById('addrLine1').value = addr.line1;
  document.getElementById('addrLine2').value = addr.line2 || '';
  document.getElementById('addrCity').value = addr.city;
  document.getElementById('addrState').value = addr.state;
  document.getElementById('addrPincode').value = addr.pincode;
  document.getElementById('addrType').value = addr.type;
  document.querySelectorAll('.addr-type').forEach(b => b.classList.toggle('active', b.dataset.type === addr.type));
}

function deleteAddress(i) {
  if (!confirm('Delete this address?')) return;
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const idx = users.findIndex(u => u.id === currentUser.id);
  users[idx].addresses.splice(i, 1);
  localStorage.setItem('sp_users', JSON.stringify(users));
  currentUser = users[idx];
  localStorage.setItem('sp_user', JSON.stringify(currentUser));
  renderAddresses();
  showToast('Address deleted');
}

// ============ CHECKOUT ============
function proceedToCheckout() {
  if (!currentUser) { toggleCart(); openAuthModal('login'); showToast('Please login to checkout'); return; }
  if (!cart.length) { showToast('Your cart is empty', 'error'); return; }
  toggleCart();
  document.getElementById('checkoutModal').classList.add('active');
  goToStep(1);
  renderCheckoutAddresses();
}

function goToStep(step) {
  document.getElementById('checkoutStep1').style.display = step === 1 ? 'block' : 'none';
  document.getElementById('checkoutStep2').style.display = step === 2 ? 'block' : 'none';
  document.getElementById('checkoutStep3').style.display = step === 3 ? 'block' : 'none';
  document.getElementById('step1Indicator').classList.toggle('active', step >= 1);
  document.getElementById('step2Indicator').classList.toggle('active', step >= 2);
  document.getElementById('step3Indicator').classList.toggle('active', step >= 3);
}

function renderCheckoutAddresses() {
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  const addrs = user?.addresses || [];
  const el = document.getElementById('checkoutAddresses');
  if (!addrs.length) { el.innerHTML = '<p>No addresses saved. Please add one.</p>'; return; }
  el.innerHTML = addrs.map((a, i) => `
    <label class="checkout-addr-card ${i === selectedAddressIndex ? 'selected' : ''}" onclick="selectedAddressIndex=${i};renderCheckoutAddresses()">
      <input type="radio" name="checkout_addr" ${i === selectedAddressIndex ? 'checked' : ''}>
      <div>
        <strong>${a.name}</strong> <span class="addr-badge-sm">${a.type}</span>
        <p>${a.line1}${a.line2 ? ', ' + a.line2 : ''}, ${a.city}, ${a.state} – ${a.pincode}</p>
        <span>Phone: ${a.phone}</span>
      </div>
    </label>`).join('');
}

function goToPayment() {
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const user = users.find(u => u.id === currentUser.id);
  if (!user?.addresses?.length) { showToast('Please add a delivery address', 'error'); return; }
  goToStep(2);
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  let subtotal = cart.reduce((s, ci) => { const p = allProducts.find(pr => pr.id === ci.id); return s + (p ? p.price * ci.qty : 0); }, 0);
  const shipping = subtotal >= 999 ? 0 : 49;
  document.getElementById('checkoutSummary').innerHTML = `
    <div class="checkout-sum-row"><span>Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} items)</span><span>₹${subtotal.toLocaleString()}</span></div>
    <div class="checkout-sum-row"><span>Shipping</span><span>${shipping ? '₹' + shipping : 'FREE'}</span></div>
    <div class="checkout-sum-row total"><span>Total</span><span>₹${(subtotal + shipping).toLocaleString()}</span></div>`;
}

function setupPaymentOptions() {
  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('upiSection').style.display = r.value === 'upi' ? 'block' : 'none';
      document.getElementById('cardSection').style.display = r.value === 'card' ? 'block' : 'none';
    });
  });
}

function placeOrder() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const users = JSON.parse(localStorage.getItem('sp_users') || '[]');
  const userIdx = users.findIndex(u => u.id === currentUser.id);
  const addr = users[userIdx].addresses[selectedAddressIndex];
  let subtotal = cart.reduce((s, ci) => { const p = allProducts.find(pr => pr.id === ci.id); return s + (p ? p.price * ci.qty : 0); }, 0);
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  const order = {
    id: 'SP' + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    items: [...cart],
    total,
    payment: paymentMethod.toUpperCase(),
    address: addr,
    status: 'confirmed'
  };

  if (!users[userIdx].orders) users[userIdx].orders = [];
  users[userIdx].orders.push(order);
  localStorage.setItem('sp_users', JSON.stringify(users));
  currentUser = users[userIdx];
  localStorage.setItem('sp_user', JSON.stringify(currentUser));

  // Clear cart
  cart = [];
  saveCart();
  goToStep(3);
  document.getElementById('orderIdText').textContent = `Order ID: ${order.id}`;
  document.getElementById('orderDetailsConfirm').innerHTML = `
    <p><strong>Delivering to:</strong> ${addr.name}, ${addr.line1}, ${addr.city} – ${addr.pincode}</p>
    <p><strong>Payment:</strong> ${order.payment}</p>
    <p><strong>Total:</strong> ₹${total.toLocaleString()}</p>`;
}

function openOrdersAfterPlacing() {
  closeModal('checkoutModal');
  openOrders();
}

// ============ QUICK VIEW ============
function openQuickView(id) {
  const p = allProducts.find(pr => pr.id === id);
  if (!p) return;
  const disc = Math.round((1 - p.price / p.oldPrice) * 100);
  document.getElementById('quickViewModal').classList.add('active');
  document.getElementById('quickViewContent').innerHTML = `
    <div class="qv-grid">
      <div class="qv-image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="qv-info">
        <span class="product-vendor">Shyam Paridhan</span>
        <h2>${p.name}</h2>
        <div class="product-rating">${renderStars(p.rating)}<span>(${p.reviews} reviews)</span></div>
        <div class="product-price">
          <span class="price">₹${p.price.toLocaleString()}</span>
          <span class="old-price">₹${p.oldPrice.toLocaleString()}</span>
          <span class="discount">${disc}% OFF</span>
        </div>
        <p class="qv-desc">${p.description}</p>
        <div class="qv-meta"><span><strong>Category:</strong> ${p.category.replace(/_/g,' ')}</span>
        <span><strong>Stock:</strong> ${p.stock > 0 ? p.stock + ' available' : 'Out of stock'}</span></div>
        <div class="product-colors">${p.colors.map(c => `<span class="color-dot" style="background:${c}"></span>`).join('')}</div>
        <div class="qv-actions">
          <button class="btn-primary" onclick="addToCart(${p.id});closeModal('quickViewModal')"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
          <button class="btn-outline" onclick="toggleWishlist(${p.id})"><i class="fa${wishlist.includes(p.id)?'s':'r'} fa-heart"></i> Wishlist</button>
        </div>
      </div>
    </div>`;
}

// ============ MODALS ============
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('authModalClose')?.addEventListener('click', () => closeModal('authModal'));
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
});

// ============ UTILITIES ============
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.className = `toast show ${type}`;
  t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${msg}`;
  setTimeout(() => t.className = 'toast', 3000);
}

function subscribeNewsletter(e) {
  e.preventDefault();
  showToast('Thank you for subscribing! Get 10% off on your first order.');
  e.target.reset();
}

function submitContact(e) {
  e.preventDefault();
  showToast('Message sent! We will get back to you soon.');
  e.target.reset();
}

console.log('Shyam Paridhan - Website loaded successfully! 🎉');
