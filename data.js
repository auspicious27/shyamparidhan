// ============================================================
// SHYAM PARIDHAN - Product Data
// Admin can edit products through admin.html
// ============================================================

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Premium Rajputi Poshak", category: "rajputi_poshak", tag: "new", price: 4999, oldPrice: 7999, rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop", colors: ["#d32f2f","#1976d2","#388e3c"], stock: 15, description: "Authentic handcrafted Rajputi Poshak with intricate embroidery. Perfect for weddings and festivals." },
  { id: 2, name: "Designer Silk Saree", category: "odhni", tag: "sale", price: 2999, oldPrice: 5999, rating: 5, reviews: 256, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop", colors: ["#ff1744","#ffd600","#00e676"], stock: 20, description: "Elegant designer silk saree with traditional motifs. Ideal for all occasions." },
  { id: 3, name: "Bridal Lehenga Choli", category: "rajputi_poshak", tag: "trending", price: 12999, oldPrice: 18999, rating: 5, reviews: 342, image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=500&fit=crop", colors: ["#d32f2f","#c2185b","#7b1fa2"], stock: 8, description: "Exquisite bridal lehenga choli with heavy embroidery and mirror work." },
  { id: 4, name: "Designer Anarkali Suit", category: "work_suit", tag: "new", price: 3499, oldPrice: 5999, rating: 4.5, reviews: 189, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop", colors: ["#1976d2","#388e3c","#f57c00"], stock: 25, description: "Stylish designer Anarkali suit perfect for parties and festive occasions." },
  { id: 5, name: "Pure Cotton Suit Set", category: "cotton_suit", tag: "sale", price: 1649, oldPrice: 2999, rating: 4, reviews: 95, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop&q=80", colors: ["#fff","#ffc107","#e91e63"], stock: 30, description: "Comfortable pure cotton suit set, ideal for daily wear and summer season." },
  { id: 6, name: "Banarasi Silk Saree", category: "banarasi_suit", tag: "trending", price: 8999, oldPrice: 14999, rating: 5, reviews: 412, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop&q=80", colors: ["#d32f2f","#1976d2","#388e3c"], stock: 12, description: "Authentic Banarasi silk saree with golden zari work. A timeless classic." },
  { id: 7, name: "Party Wear Gown", category: "work_suit", tag: "new", price: 5499, oldPrice: 8999, rating: 4.5, reviews: 167, image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=500&fit=crop&q=80", colors: ["#000","#d32f2f","#1976d2"], stock: 18, description: "Glamorous party wear gown with beautiful embellishments and flowy silhouette." },
  { id: 8, name: "Designer Kurti Set", category: "cotton_suit", tag: "sale", price: 899, oldPrice: 1999, rating: 4, reviews: 203, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop&q=80", colors: ["#e91e63","#9c27b0","#00bcd4"], stock: 40, description: "Trendy designer kurti set with block print work. Perfect for casual and festive wear." },
  { id: 9, name: "Kota Doriya Suit", category: "kota_doriya", tag: "trending", price: 3299, oldPrice: 5499, rating: 4.5, reviews: 178, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=600&fit=crop", colors: ["#6a1b9a","#1976d2","#d32f2f"], stock: 22, description: "Genuine Kota Doriya suit with intricate check weave. Lightweight and breathable." },
  { id: 10, name: "Hamrai Pure Silk", category: "hamrai_pure", tag: "new", price: 6499, oldPrice: 9999, rating: 5, reviews: 234, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=600&fit=crop", colors: ["#388e3c","#f57c00","#d32f2f"], stock: 10, description: "Premium Hamrai pure silk fabric suit, perfect for all special occasions." },
  { id: 11, name: "Gold Jhumka Set", category: "jewellery", tag: "new", price: 1299, oldPrice: 2499, rating: 4.5, reviews: 98, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=500&fit=crop", colors: ["#ffd700","#c0a840"], stock: 35, description: "Handcrafted gold-plated jhumka earring set with traditional Rajasthani design." },
  { id: 12, name: "Colorful Bangle Set", category: "bangles", tag: "sale", price: 499, oldPrice: 999, rating: 4, reviews: 145, image: "https://images.unsplash.com/photo-1611085583191-a3b181a88558?w=400&h=500&fit=crop", colors: ["#d32f2f","#1976d2","#388e3c","#f57c00"], stock: 50, description: "Beautiful set of 12 colorful bangles, perfect for festive occasions and weddings." }
];

function getProducts() {
  const stored = localStorage.getItem('sp_products');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('sp_products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function saveProducts(products) {
  localStorage.setItem('sp_products', JSON.stringify(products));
}
