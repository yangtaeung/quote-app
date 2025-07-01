import React, { useState } from 'react';

const productsData = {
  '주방소모품': [
    { id: 1, name: '3색주방행주', price: 300, icon: "/images/category1/3색주방행주.png" },
    { id: 2, name: '곡물주방세제', price: 5000, icon: "/images/category1/곡물주방세제.png" },
    { id: 3, name: '도마행주용세정제', price: 5000, icon: "/images/category1/500g.jpg" },
    { id: 4, name: '기구살균세정제450ml', price: 5000, icon: "/images/category1/450ml.png" },
    { id: 5, name: '고무장갑', price: 2200, icon: "/images/category1/고무장갑.png" },
    { id: 6, name: '드라이수세미2P', price: 3000, icon: "/images/category1/드라이수세미2P.png" },
    { id: 7, name: '위생비닐장갑100매', price: 2200, icon: "/images/category1/위생장갑100매.jpg" },
    { id: 8, name: '핸드워시250ml', price: 3800, icon: "/images/category1/핸드워시25ml.jpg" },
    { id: 9, name: '더블지퍼백(중)', price: 2200, icon: "/images/category1/더블지퍼백(중).png" },
    { id: 10, name: '뉴롤백 대형 200매', price: 4500, icon: "/images/category1/뉴롤백 대형 200매.png" },
    { id: 11, name: '다용도비닐봉투', price: 5000, icon: "/images/category1/다용도비닐봉투.png" },
    { id: 12, name: '더블지퍼백(대)', price: 2500, icon: "/images/category1/더블지퍼백(대).jpg" },
    { id: 13, name: '천연펄프수세미', price: 2800, icon: "/images/category1/천연펄프수세미.png" },
    { id: 14, name: '유한 크린텍청소박사 60매', price: 1600, icon: "/images/category1/유한 크린텍청소박사 60매.png" },
    { id: 15, name: '케이스형 라벨지 냉동형', price: 7000, icon: "/images/category1/케이스형 라벨지 냉동형.png" },
    { id: 16, name: '케이스형 라벨지 냉장형', price: 6000, icon: "/images/category1/케이스형 라벨지 냉장형.png" },
    { id: 17, name: '무지개행주', price: 3800, icon: "/images/category1/무지개행주.jpg" },


  ],
  '주방용품': [
    { id: 5, name: '용품1', price: 1000, img: '🍗' },
    { id: 6, name: '용품2', price: 1200, img: '🍗' },
  ],
  '주방기구': [
    { id: 7, name: '기구1', price: 3000, img: '🥩' },
    { id: 8, name: '기구2', price: 3200, img: '🥩' },
  ],
};

export default function QuoteBuilder() {
  const [selectedCategory, setSelectedCategory] = useState('주방소모품');
  const [quoteItems, setQuoteItems] = useState([]);
  const [shopCount, setShopCount] = useState(1);

  const handleAddItem = (product) => {
    const existing = quoteItems.find(item => item.id === product.id);
    if (existing) {
      setQuoteItems(quoteItems.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setQuoteItems([...quoteItems, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    setQuoteItems(quoteItems.map(item =>
      item.id === id ? { ...item, qty: Number(qty) } : item
    ));
  };

  const removeItem = (id) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const totalPerShop = quoteItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const totalAllShops = totalPerShop * shopCount;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      
      {/* 견적표 */}
      <div style={{ flexBasis: '48%', border: '1px solid #ddd', padding: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          업소별 지원품목안 (우측에서 제품 클릭)
        </h2>
        {quoteItems.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {item.icon ? (
              <div style={{
                width: '60px', height: '60px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '8px'
              }}>
                <img 
                  src={item.icon} 
                  alt={item.name}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            ) : (
              <span style={{ fontSize: '24px', marginRight: '8px' }}>{item.img}</span>
            )}
            <span style={{ flexGrow: 1 }}>{idx + 1}. {item.name}</span>
            <input
              type="number"
              value={item.qty}
              min="1"
              onChange={(e) => updateQty(item.id, e.target.value)}
              style={{ width: '50px', marginRight: '8px' }}
            />
            <span>{(item.qty * item.price).toLocaleString()}원</span>
            <button 
              onClick={() => removeItem(item.id)}
              style={{
                marginLeft: '8px', color: '#fff', background: '#e03131', 
                border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                cursor: 'pointer', fontSize: '14px', lineHeight: '24px', textAlign: 'center'
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div style={{ marginTop: '12px' }}>
          <div>총 업소 수: 
            <input 
              type="number" 
              value={shopCount}
              onChange={e => setShopCount(Number(e.target.value))}
              style={{ width: '50px', marginLeft: '5px' }}
            />
          </div>
          <div>업소당 합계: {totalPerShop.toLocaleString()}원</div>
          <div style={{ fontWeight: 'bold' }}>전체 합계: {totalAllShops.toLocaleString()}원</div>
        </div>
      </div>

      {/* 제품 리스트 */}
      <div style={{ flexBasis: '48%' }}>
        <div style={{ marginBottom: '10px' }}>
          {Object.keys(productsData).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 10px', marginRight: '5px',
                background: selectedCategory === cat ? '#b2f2bb' : '#eee',
                border: '1px solid #ccc', borderRadius: '5px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {productsData[selectedCategory].map(product => (
            <div 
              key={product.id}
              onClick={() => handleAddItem(product)}
              style={{
                width: '110px', height: '150px', border: '1px solid #ddd',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}
            >
              {product.icon ? (
                <div style={{
                  width: '100px', height: '100px', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img 
                    src={product.icon}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '36px' }}>{product.img}</div>
              )}
              <div style={{ fontSize: '13px', textAlign: 'center' }}>{product.name}</div>
              <div style={{ fontSize: '13px' }}>{product.price.toLocaleString()}원</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
