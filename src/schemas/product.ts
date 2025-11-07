import { z } from 'zod/v3'

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
})

export type Product = z.infer<typeof productSchema>
