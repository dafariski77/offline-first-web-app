import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { productSchema, type Product } from '@/schemas/product'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

/**
 * Collection for tanstack query
 * optimize the tanstack query utility with data store
 * not offline first solution but for optimistic state
 */
export const productCollection = createCollection(
  queryCollectionOptions({
    id: 'products',
    getKey: (item) => item.id,
    schema: productSchema,
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/products')

      return response.json() as Product[]
    },
    queryClient,
    onInsert: async ({ transaction }) => {
      const mutation = transaction.mutations[0].modified

      await fetch('http://localhost:8000/api/products', {
        body: JSON.stringify(mutation),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
    onDelete: async ({ transaction }) => {
      const mutation = transaction.mutations[0].key

      await fetch(`http://localhost:8000/api/products/${mutation}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
    onUpdate: async ({ transaction }) => {
      const mutation = transaction.mutations[0].modified

      await fetch(`http://localhost:8000/api/products/${mutation.id}`, {
        method: 'PUT',
        body: JSON.stringify(mutation),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
    select: (item) => item,
  }),
)
