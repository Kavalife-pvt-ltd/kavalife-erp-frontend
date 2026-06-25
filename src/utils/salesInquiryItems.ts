import type {
  CreateSalesInquiryItemPayload,
  SalesInquiryDraftItem,
} from '@/types/sales';

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function optionalTrimmed(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function createBlankSalesInquiryItem(): SalesInquiryDraftItem {
  return {
    clientId: createClientId(),
    productName: '',
    requestType: 'purchase',
    quantity: '',
    quantityUnit: '',
    purity: '',
    grade: '',
    askingPrice: '',
    comments: '',
  };
}

export function toCreateSalesInquiryItemPayload(
  item: SalesInquiryDraftItem
): CreateSalesInquiryItemPayload {
  const productName = item.productName.trim();
  const quantityText = item.quantity.trim();
  const quantity = Number(quantityText);
  const askingPriceText = item.askingPrice.trim();

  if (productName === '') {
    throw new Error('Sales inquiry item product name is required');
  }

  if (quantityText === '' || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Sales inquiry item quantity must be greater than 0');
  }

  const payload: CreateSalesInquiryItemPayload = {
    productName,
    requestType: item.requestType,
    quantity,
  };

  const quantityUnit = optionalTrimmed(item.quantityUnit);
  if (quantityUnit !== undefined) {
    payload.quantityUnit = quantityUnit;
  }

  const purity = optionalTrimmed(item.purity);
  if (purity !== undefined) {
    payload.purity = purity;
  }

  const grade = optionalTrimmed(item.grade);
  if (grade !== undefined) {
    payload.grade = grade;
  }

  if (askingPriceText !== '') {
    const askingPrice = Number(askingPriceText);
    if (!Number.isFinite(askingPrice)) {
      throw new Error('Sales inquiry item asking price must be a valid number');
    }
    payload.askingPrice = askingPrice;
  }

  const comments = optionalTrimmed(item.comments);
  if (comments !== undefined) {
    payload.comments = comments;
  }

  return payload;
}
