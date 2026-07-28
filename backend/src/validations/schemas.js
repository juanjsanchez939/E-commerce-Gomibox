import { z } from 'zod';

export const isLuhnValid = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'rating-desc', 'name-asc', 'newest']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
});

export const cartAddSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1).default(1),
  selectedColor: z.string().optional().default(''),
});

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(0),
});

export const checkoutSchema = z
  .object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(7, 'Phone must be at least 7 digits'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    address: z.string().min(5, 'Address is required'),
    apartment: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(4, 'Zip code is required'),
    country: z.string().min(2, 'Country is required'),
    shippingMethod: z.enum(['standard', 'express', 'overnight']),
    paymentMethod: z.enum(['card', 'apple_pay', 'upi', 'cod']),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    cardHolder: z.string().optional(),
    promoCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'card') {
      if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardNumber'],
          message: 'Valid card number is required',
        });
      } else if (!isLuhnValid(data.cardNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardNumber'],
          message: 'Invalid card number',
        });
      }

      if (!data.cardExpiry || !/^\d{2}\/\d{2}$/.test(data.cardExpiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardExpiry'],
          message: 'Expiry must be MM/YY format',
        });
      } else {
        const [month, year] = data.cardExpiry.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cardExpiry'],
            message: 'Card is expired',
          });
        }
      }

      if (!data.cardCvc || !/^\d{3,4}$/.test(data.cardCvc)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardCvc'],
          message: 'CVC must be 3 or 4 digits',
        });
      }

      if (!data.cardHolder || data.cardHolder.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cardHolder'],
          message: 'Cardholder name is required',
        });
      }
    }
  });

export const promoValidateSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  subtotal: z.number().min(0, 'Subtotal is required'),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(500),
});
