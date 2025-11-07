import { db } from '@/db/rxdb'
import { productSchema } from '@/schemas/product'
import { createCollection } from '@tanstack/react-db'
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection'

/**
 * Collection for rxdb
 * offline first solution, the data will store locally and then synced by their replicate
 */
export const rxProductCollection = createCollection(
  rxdbCollectionOptions({
    rxCollection: db.products,
    startSync: true,
    schema: productSchema,
  }),
)
