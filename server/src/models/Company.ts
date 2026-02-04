
import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pinCode: String
  },
  contacts: {
    phones: [String],
    emails: [String],
    website: String
  },
  legal: {
    gstNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    state: String
  },
  branding: {
    logoUrl: String,
    primaryColor: { type: String, default: '#2563eb' },
    authorizedSignatory: String,
    signatoryDesignation: String
  },
  defaults: {
    retentionPercent: { type: Number, default: 5 },
    invoicePrefix: String,
    invoiceCounter: { type: Number, default: 1 }
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Company', companySchema);
