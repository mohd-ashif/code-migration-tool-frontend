import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BillingUIState {
  checkoutDialogOpen: boolean;
  selectedPlanSlug: string | null;
  paymentModalOpen: boolean;
  paymentModalData: any | null;
  invoicePreviewOpen: boolean;
  selectedInvoiceId: string | null;
}

const initialState: BillingUIState = {
  checkoutDialogOpen: false,
  selectedPlanSlug: null,
  paymentModalOpen: false,
  paymentModalData: null,
  invoicePreviewOpen: false,
  selectedInvoiceId: null,
};

export const billingSlice = createSlice({
  name: 'billingUI',
  initialState,
  reducers: {
    openCheckoutDialog: (state, action: PayloadAction<string>) => {
      state.checkoutDialogOpen = true;
      state.selectedPlanSlug = action.payload;
    },
    closeCheckoutDialog: (state) => {
      state.checkoutDialogOpen = false;
      state.selectedPlanSlug = null;
    },
    openPaymentModal: (state, action: PayloadAction<any>) => {
      state.paymentModalOpen = true;
      state.paymentModalData = action.payload;
    },
    closePaymentModal: (state) => {
      state.paymentModalOpen = false;
      state.paymentModalData = null;
    },
    openInvoicePreview: (state, action: PayloadAction<string>) => {
      state.invoicePreviewOpen = true;
      state.selectedInvoiceId = action.payload;
    },
    closeInvoicePreview: (state) => {
      state.invoicePreviewOpen = false;
      state.selectedInvoiceId = null;
    },
  },
});

export const {
  openCheckoutDialog,
  closeCheckoutDialog,
  openPaymentModal,
  closePaymentModal,
  openInvoicePreview,
  closeInvoicePreview,
} = billingSlice.actions;

export default billingSlice.reducer;
