import generateQuoteNamesFromGPT from '../utils/generateQuoteNamesFromGPT';

export default function useGptQuote(productsData, gptForm, setQuoteItems, setGptResult) {
  const handleGPTClick = async () => {
    const lowerBound = Math.floor(Number(gptForm.shopBudget) * 0.9);
    const upperBound = Math.ceil(Number(gptForm.shopBudget) * 1.1);
    const allProductsFlat = Object.values(productsData).flat();
    const productNames = allProductsFlat.map(p => p.name);

    const mustProductCandidates = {};
    gptForm.mustItems.split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(keyword => {
        mustProductCandidates[keyword] = allProductsFlat
          .filter(p => p.name.includes(keyword))
          .map(p => p.name);
      });

    const gptNames = await generateQuoteNamesFromGPT({
      projectType: gptForm.projectType,
      shopBudget: Number(gptForm.shopBudget),
      shopCount: gptForm.shopCount,
      mustItems: gptForm.mustItems,
      productNames, lowerBound, upperBound, mustProductCandidates
    });

    // ✅ GPT 결과 없으면 안전 탈출
    if (!gptNames || !Array.isArray(gptNames) || gptNames.length === 0) {
      setGptResult("GPT에서 유효한 추천 품목을 받지 못했습니다. 필수 품목을 추가하거나 다시 시도해주세요.");
      return;
    }

    let finalQuoteItems = [], total = 0;
    let iterations = 0;
    const maxIterations = 1000; // safeguard

    while (total < lowerBound && iterations < maxIterations) {
      iterations++;
      for (let name of gptNames) {
        const product = allProductsFlat.find(p => p.name === name);
        if (!product) continue;
        const existing = finalQuoteItems.find(q => q.name === product.name);

        if (product.name.includes('부직포앞치마') || product.name.includes('포장용기')) {
          if (existing) {
            if (total + product.price * 100 <= upperBound) {
              existing.qty += 100;
              total += product.price * 100;
            }
          } else {
            if (total + product.price * 100 <= upperBound) {
              finalQuoteItems.push({ ...product, qty: 100 });
              total += product.price * 100;
            }
          }
        } else {
          if (existing) {
            if (total + product.price <= upperBound) {
              existing.qty += 1;
              total += product.price;
            }
          } else {
            if (total + product.price <= upperBound) {
              finalQuoteItems.push({ ...product, qty: 1 });
              total += product.price;
            }
          }
        }
        if (total >= lowerBound) break;
      }
      if (total >= upperBound) break;
    }

    // ⭐ 필수 포함 품목 강제 삽입
    for (let keyword of gptForm.mustItems.split(',').map(s => s.trim()).filter(Boolean)) {
      const candidateNames = mustProductCandidates[keyword] || [];
      const alreadyIncluded = finalQuoteItems.some(item => candidateNames.includes(item.name));
      if (!alreadyIncluded && candidateNames.length > 0) {
        const chosen = allProductsFlat.find(p => p.name === candidateNames[0]);
        if (chosen) {
          if (chosen.name.includes('부직포앞치마') || chosen.name.includes('포장용기')) {
            finalQuoteItems.push({ ...chosen, qty: 100 });
            total += chosen.price * 100;
          } else {
            finalQuoteItems.push({ ...chosen, qty: 1 });
            total += chosen.price;
          }
        }
      }
    }

    setQuoteItems(finalQuoteItems);

    // ✅ 출력 텍스트
    let textResult = finalQuoteItems.map((item, idx) =>
      `${idx + 1}. ${item.name}, ${item.price.toLocaleString()}원, ${item.qty}개`
    ).join('\n');

    const totalPerShop = finalQuoteItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const overallTotal = totalPerShop * (parseInt(gptForm.shopCount, 10) || 1);
    textResult += `\n업소당 지원금액: ${totalPerShop.toLocaleString()}원`;
    textResult += `\n총 예산: ${overallTotal.toLocaleString()}원 (${gptForm.shopCount} * ${totalPerShop.toLocaleString()}원)`;

    setGptResult(textResult);
  };

  return { handleGPTClick };
}


