import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import useGptQuote from './hooks/useGptQuote';

export default function QuoteBuilder() {
  const [productsData, setProductsData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('주방소모품');
  const [quoteItems, setQuoteItems] = useState([]);
  const [shopCount, setShopCount] = useState(1);
  const [gptForm, setGptForm] = useState({ projectType: '', shopBudget: '', shopCount: '', mustItems: '' });
  const [gptResult, setGptResult] = useState('');

  useEffect(() => {
    fetch('/products.json')
      .then(res => res.json())
      .then(data => {
        const newData = {};
        Object.entries(data).forEach(([category, items]) => {
          newData[category] = items.map(item => ({ ...item, id: `${category}-${item.id}` }));
        });
        setProductsData(newData);
      })
      .catch(err => console.error('JSON 로드 실패:', err));
  }, []);

  const handleAddItem = (product) => {
    const existing = quoteItems.find(item => item.id === product.id);
    if (existing) {
      setQuoteItems(quoteItems.map(item =>
        item.id === product.id ? { ...item, qty: (parseInt(item.qty, 10) || 1) + 1 } : item
      ));
    } else {
      setQuoteItems([...quoteItems, { ...product, qty: "1" }]);
    }
  };

  const updateQty = (id, qty) => {
    setQuoteItems(quoteItems.map(item => item.id === id ? { ...item, qty } : item));
  };

  const totalPerShop = quoteItems.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 1) * item.price, 0);
  const totalAllShops = totalPerShop * shopCount;

  const downloadExcel = () => {
    const data = [["No", "제품명", "수량", "단가", "합계"]];
    quoteItems.forEach((item, idx) => {
      data.push([idx + 1, item.name, `${item.qty}`, item.price, (parseInt(item.qty, 10) || 1) * item.price]);
    });
    data.push([]);
    data.push(["총 업소 수", shopCount]);
    data.push(["업소당 합계", totalPerShop]);
    data.push(["전체 합계", totalAllShops]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 8 }, { wch: 10 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "견적서");
    XLSX.writeFile(wb, "견적서.xlsx");
  };

  const { handleGPTClick } = useGptQuote(productsData, gptForm, setQuoteItems, setGptResult);

  if (!productsData[selectedCategory])
    return <div style={{ padding: '20px' }}>로딩중...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      <div style={{ flexBasis: '48%', border: '1px solid #ddd', padding: '15px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
          업소별 지원품목안 (우측에서 제품 클릭)
        </h2>
        {quoteItems.map((item, idx) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            {item.icon && (
              <div style={{
                width: '60px', height: '60px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '8px'
              }}>
                <img src={item.icon} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
            )}
            <span style={{ flexGrow: 1 }}>{idx + 1}. {item.name}</span>
            <input
              type="number"
              value={item.qty}
              onChange={(e) => updateQty(item.id, e.target.value)}
              onBlur={(e) => {
                const clean = Math.max(parseInt(e.target.value || '1', 10), 1);
                updateQty(item.id, clean.toString());
              }}
              style={{ minWidth: '50px', maxWidth: '50px', textAlign: 'center', marginRight: '8px' }}
            />
            <button 
              onClick={() => setQuoteItems(quoteItems.filter(it => it.id !== item.id))}
              style={{
                minWidth: '30px', marginLeft: '8px', color: '#fff', background: '#e03131',
                border: 'none', borderRadius: '50%', height: '24px', cursor: 'pointer',
                fontSize: '14px', lineHeight: '24px', textAlign: 'center'
              }}
            >×</button>
            <span style={{
              width: '100px', textAlign: 'right', whiteSpace: 'nowrap', display: 'inline-block',
              marginLeft: '8px'
            }}>
              {((parseInt(item.qty, 10) || 1) * item.price).toLocaleString()}원
            </span>
          </div>
        ))}
        <div style={{ marginTop: '20px' }}>
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
          <div style={{ marginTop: '15px' }}>
            <button onClick={downloadExcel} style={{
              background: '#2f9e44', color: '#fff', padding: '8px 16px',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px'
            }}>
              📊 EXCEL 다운로드
            </button>

            {/* ✅ 홈페이지 버튼 */}
            <a href="https://foodlinestore.com" target="_blank" rel="noopener noreferrer" style={{
              marginLeft: '8px', background: '#1c7ed6', color: '#fff', padding: '8px 16px',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px',
              textDecoration: 'none', display: 'inline-block'
            }}>
              🏠 홈페이지 바로가기
            </a>

            {/* ✅ 블로그 버튼 */}
            <a href="https://blog.naver.com/foodline5436" target="_blank" rel="noopener noreferrer" style={{
              marginLeft: '8px', background: '#12b886', color: '#fff', padding: '8px 16px',
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px',
              textDecoration: 'none', display: 'inline-block'
            }}>
              📚 블로그 바로가기
            </a>
          </div>
        </div>
      </div>

      <div style={{ flexBasis: '48%' }}>
        <div style={{ marginBottom: '10px' }}>
          {Object.keys(productsData).map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '5px 10px', marginRight: '5px',
                background: selectedCategory === cat ? '#b2f2bb' : '#eee',
                border: '1px solid #ccc', borderRadius: '5px'
              }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {productsData[selectedCategory].map(product => (
            <div key={product.id}
              onClick={() => handleAddItem(product)}
              style={{
                width: '110px', height: '150px', border: '1px solid #ddd',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer'
              }}>
              <div style={{
                width: '100px', height: '100px', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img src={product.icon} alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: '100%' }} />
              </div>
              <div style={{ fontSize: '13px', textAlign: 'center' }}>{product.name}</div>
              <div style={{ fontSize: '13px' }}>{product.price.toLocaleString()}원</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ddd' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>지원물품 구성안 요청서</h3>
          <div style={{ marginBottom: '8px' }}>
            <label>사업 주제:</label>
            <input
              type="text"
              value={gptForm.projectType}
              onChange={e => setGptForm({ ...gptForm, projectType: e.target.value })}
              placeholder="ex: 안심식당, 위생등급제 등"
              style={{ marginLeft: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label>업소당 지원금(원):</label>
            <input
              type="number"
              value={gptForm.shopBudget}
              onChange={e => setGptForm({ ...gptForm, shopBudget: e.target.value })}
              placeholder="ex: 50000"
              style={{ marginLeft: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label>지원 업소 수:</label>
            <input
              type="number"
              value={gptForm.shopCount}
              onChange={e => setGptForm({ ...gptForm, shopCount: e.target.value })}
              placeholder="ex: 10"
              style={{ marginLeft: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label>필수 포함 품목:</label>
            <input
              type="text"
              value={gptForm.mustItems}
              onChange={e => setGptForm({ ...gptForm, mustItems: e.target.value })}
              placeholder="ex) 수세미, 고무장갑"
              style={{ marginLeft: '5px' }}
            />
          </div>
          <button
            onClick={handleGPTClick}
            style={{
              background: '#228be6', color: '#fff', padding: '8px 16px',
              border: 'none', borderRadius: '5px', cursor: 'pointer'
            }}
          >
            구성안 만들기
          </button>

          {gptResult && (
            <div style={{
              marginTop: '15px', whiteSpace: 'pre-line',
              background: '#f8f9fa', padding: '10px', borderRadius: '5px'
            }}>
              <strong>GPT 구성안 결과:</strong>
              <br />
              {gptResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



