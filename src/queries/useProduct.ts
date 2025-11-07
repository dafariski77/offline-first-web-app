import { productCollection } from '@/collections/product'
import { rxProductCollection } from '@/collections/rx-product'
import { useLiveQuery } from '@tanstack/react-db'

/**
 * Query to get all products from query collection
 *
 * @returns
 */
export const useGetAllProducts = () => {
  return useLiveQuery((q) => q.from({ product: productCollection }))
}

/**
 * Query to get all products from local rxdb collection
 *
 * @returns
 */
export const useGetRxProducts = () => {
  return useLiveQuery((q) => q.from({ products: rxProductCollection }))
}
