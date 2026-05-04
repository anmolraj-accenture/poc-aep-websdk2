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
  // 1) Persist preference (simple value)
  // ------------------------------------------------------------
  localStorage.setItem("PreferredInterest", preferredInterest);

  // ------------------------------------------------------------
  // 2) Deterministic scoring inputs (NO recompute on page 2)
  // ------------------------------------------------------------
  const scoreMap = {
    Stocks: { m1: 0.85, m2: 0.45 },
    Bonds:  { m1: 0.25, m2: 0.60 },
    CD:     { m1: 0.10, m2: 0.15 }
  };

  const picked = scoreMap[preferredInterest] || { m1: 0.20, m2: 0.20 };
  const m1 = picked.m1;
  const m2 = picked.m2;

  const totalScore = m1 + m2;
  const expOfNegTotal = Math.exp(-totalScore);

  // ✅ small random epsilon — computed ONCE only
  const randEpsilon = Math.random() * 0.000001;
  const normalizationScore = (0.95 / (1 + expOfNegTotal)) + randEpsilon;

  // ------------------------------------------------------------
  // 3) Persist ALL decision inputs for Page 2
  // ------------------------------------------------------------
  const decisionInputs = {

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
  };

  localStorage.setItem(
    "AJO_DecisionInputs",
    JSON.stringify(decisionInputs)
  );

  console.log("✅ Stored AJO_DecisionInputs:", decisionInputs);

  // (Optional) analytics / debugging only
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
