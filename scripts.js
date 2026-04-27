function handleSubmission() {
  const selectedAssetClass =
    document.querySelector('input[name="assetclass"]:checked');
  
  const errorMessage = document.getElementById("error-message");
  const messageBox = document.getElementById("message");

  if (!selectedAssetClass) {
    errorMessage.textContent = "Please select a financial instrument.";
    messageBox.textContent = "";
    return;
  }

  const preferredInterest = selectedAssetClass.value;

  errorMessage.textContent = "";

  // 1) Store preference (unchanged)
  localStorage.setItem("PreferredInterest", selectedAssetClass.value);
  console.log("✅ Stored in localStorage:", localStorage.getItem("PreferredInterest"));

  // 2) Simple demo math utils (client-side "data layer" compute)
  const adobeMathUtils = {
    sum: (arr) => (arr || []).reduce((a, b) => a + b, 0),
    exp: (val) => Math.exp(val),
    random: (scale = 1) => Math.random() * scale
  };

  // 3) Dummy inputs (single M1/M2 doubles for POC)
  //    You can make these deterministic per selection (helps repeatability in demos)
  const scoreMap = {
    Stocks: { m1: 0.85, m2: 0.45 },
    Bonds:  { m1: 0.25, m2: 0.60 },
    CD:     { m1: 0.10, m2: 0.15 }
  };

  const picked = scoreMap[selectedAssetClass.value] || { m1: 0.20, m2: 0.20 };
  const m1 = picked.m1;
  const m2 = picked.m2;

  // 4) Calculate total + normalizationScore
  const totalScore = m1 + m2;
  const expOfNegTotal = adobeMathUtils.exp(-totalScore);

  // same structure you described: 0.95/(1+EXP(-SUM)) + rand*0.000001
  const randEpsilon = adobeMathUtils.random() * 0.000001;
  const normalizationScore = (0.95 / (1 + expOfNegTotal)) + randEpsilon;

  console.log("🧮 Scores:", { m1, m2, totalScore, expOfNegTotal, randEpsilon, normalizationScore });

  // 5) Push event to adobeDataLayer (same as you do today), now enriched with Scoring1 fields
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: "assetClassSelection",
    xdm: {
      eventType: "assetClassSelection",
      _accenture_partner: {
        Interest: {
          PreferredInterest: preferredInterest
        },
        Scoring1: {
          M1Score: m1,
          M2Score: m2,
          TotalScore: totalScore,
          ExpOfNegTotal: expOfNegTotal,
          RandEpsilon: randEpsilon,
          NormalizationScore: normalizationScore
        }
      }
    }
  });
  messageBox.textContent = `Thank you for selecting "${selectedAssetClass.value}".`;
}
