import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 64,
    index: true,
  },
  visitorName: {
    type: String,
    trim: true,
    maxlength: 120,
    default: "",
  },
  visitorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 160,
    default: "",
  },
  visitorPhone: {
    type: String,
    trim: true,
    maxlength: 40,
    default: "",
  },
  visitorCity: {
    type: String,
    trim: true,
    maxlength: 120,
    default: "",
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      "page_view",
      "product_view",
      "add_to_cart",
      "add_to_favorites",
      "checkout_start",
      "whatsapp_click",
      "identify",
    ],
    index: true,
  },
  path: {
    type: String,
    trim: true,
    maxlength: 240,
    default: "/",
  },
  pageLabel: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "Page",
  },
  produitId: {
    type: String,
    trim: true,
    maxlength: 64,
  },
  produitNom: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  device: {
    type: String,
    enum: ["Mobile", "Tablette", "Ordinateur"],
    default: "Mobile",
  },
  osBrowser: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
  },
  country: {
    type: String,
    trim: true,
    maxlength: 80,
    default: "",
  },
  source: {
    type: String,
    trim: true,
    maxlength: 64,
    default: "Direct",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const analyticsEventModel =
  mongoose.models.analyticsEvent ||
  mongoose.model("analyticsEvent", analyticsEventSchema);

export default analyticsEventModel;
