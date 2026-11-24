export const DEFAULT_SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  "shippingRate": {
    "@type": "MonetaryAmount",
    "value": "0",
    "currency": "XOF"
  },
  "shippingDestination": {
    "@type": "DefinedRegion",
    "addressCountry": "TG"
  },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "handlingTime": {
      "@type": "QuantitativeValue",
      "minValue": 0,
      "maxValue": 1,
      "unitCode": "DAY"
    },
    "transitTime": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 2,
      "unitCode": "DAY"
    }
  }
};

export const DEFAULT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "TG",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 2,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn"
};
