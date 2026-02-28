// ========== PAYMENT CONFIGURATION ==========
const UPI_ID = "paytmqr5gdfap@ptys";        // <-- Replace with your UPI ID
const MERCHANT_NAME = "HIMANSHU YADAV";           // <-- Optional, can be empty string

// Build PhonePe deep link
function buildPhonePeUrl({ amount, note = "" }) {
  const rupees = Number(amount);
  const paise = Math.round(rupees * 100);     // PhonePe expects paise

  const payload = {
    contact: {
      cbsName: "",
      nickName: "",
      type: "VPA",
      vpa: UPI_ID,
    },
    p2pPaymentCheckoutParams: {
      checkoutType: "DEFAULT",
      initialAmount: paise,
      note: note,
      isByDefaultKnownContact: true,
      disableViewHistory: true,
      shouldShowMaskedNumber: true,
      shouldShowUnsavedContactBanner: false,
      showKeyboard: false,
      allowAmountEdit: false,
      disableNotesEdit: true,
      currency: "INR",
      showQrCodeOption: false,
      enableSpeechToText: false,
      transactionContext: "p2p",
      isRecurring: false,
    },
  };

  const jsonStr = JSON.stringify(payload);
  const base64 = btoa(jsonStr);
  const encodedData = encodeURIComponent(base64);
  return `phonepe://native?data=${encodedData}&id=p2ppayment`;
}

// Build Paytm deep link
function buildPaytmUrl({ amount, note = "" }) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME || "null",               // if no merchant name, use "null"
    cu: "INR",
    tn: note,
    am: Number(amount).toFixed(2),             // Paytm requires decimal format (e.g., 199.00)
    featuretype: "money_transfer",
  });
  return `paytmmp://cash_wallet?${params.toString()}`;
}

// Updated processPayment function
function processPayment(method) {
  const paymentBtn = event.currentTarget; // button that was clicked
  const originalContent = paymentBtn.innerHTML;
  paymentBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
  paymentBtn.disabled = true;

  // Read order summary values
  const totalElement = document.getElementById('paymentTotal');
  const usernameElement = document.getElementById('paymentUsername');

  if (!totalElement || !usernameElement) {
    alert('Payment information missing.');
    paymentBtn.innerHTML = originalContent;
    paymentBtn.disabled = false;
    return;
  }

  // Extract numeric amount (remove currency symbols, commas, etc.)
  const totalText = totalElement.innerText;
  const amountMatch = totalText.match(/[\d,]+(\.\d+)?/);
  if (!amountMatch) {
    alert('Invalid amount format.');
    paymentBtn.innerHTML = originalContent;
    paymentBtn.disabled = false;
    return;
  }
  const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
  const note = usernameElement.innerText.trim(); // username or post URL

  let url = '';
  if (method === 'phonepe') {
    url = buildPhonePeUrl({ amount, note });
  } else if (method === 'paytm') {
    url = buildPaytmUrl({ amount, note });
  } else {
    // Should not happen – only phonepe and paytm buttons exist
    paymentBtn.innerHTML = originalContent;
    paymentBtn.disabled = false;
    return;
  }

  // Simulate a short delay then redirect
  setTimeout(() => {
    window.location.href = url;
    // Note: The redirection will happen immediately; if you want to keep the loading spinner,
    // you can remove the setTimeout and directly redirect.
  }, 500);
}
