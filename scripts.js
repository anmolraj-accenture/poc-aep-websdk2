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

  // ------------------------------------------------------------
  // 1) Persist preference (used as test scenario)
  // ------------------------------------------------------------
  localStorage.setItem("PreferredInterest", preferredInterest);

  // ------------------------------------------------------------
  // 2) Deterministic scoring inputs (TEST DATA)
  // ------------------------------------------------------------
  const scoreMap = {
    Stocks: { m1: 0.85, m2: 0.45 }, // total = 1.30
    Bonds:  { m1: 0.25, m2: 0.60 }, // total = 0.85
    CD:     { m1: 0.10, m2: 0.15 }  // total = 0.25
  };

  const picked = scoreMap[preferredInterest] || { m1: 0.20, m2: 0.20 };
  const m1 = picked.m1;
  const m2 = picked.m2;

  const totalScore = m1 + m2;
  const expOfNegTotal = Math.exp(-totalScore);

  // ✅ IMPORTANT: deterministic for testing
  const randEpsilon = 0;
  const normalizationScore = 0.95 / (1 + expOfNegTotal);

  // ------------------------------------------------------------
  // 3) Persist decision inputs for Page 2
  // ------------------------------------------------------------
  const decisionInputs = {
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
  };

  localStorage.setItem(
    "AJO_DecisionInputs",
    JSON.stringify(decisionInputs)
  );

  console.log("✅ Stored AJO_DecisionInputs:", decisionInputs);

  // Optional debug event
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: "assetClassSelection",
    xdm: {
      eventType: "assetClassSelection",
      _accenture_partner: decisionInputs
    }
  });

  messageBox.textContent =
    `Thank you for selecting "${preferredInterest}". You may proceed to offers.`;
}
