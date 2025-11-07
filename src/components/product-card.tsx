import type { Product } from '@/schemas/product'
import { Card, CardContent } from './ui/card'
import { Edit, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { productCollection } from '@/collections/product'
import { rxProductCollection } from '@/collections/rx-product'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { CreateDialog } from './create-dialog'

export function ProductCard({
  name,
  category,
  price,
  stock,
  id,
  variant,
}: Product & { variant: 'rx' | 'query' }) {
  // delete handler
  const handleDelete = useCallback(async () => {
    try {
      let tx

      // checking variant
      if (variant === 'rx') {
        tx = rxProductCollection.delete(id!)
      } else {
        tx = productCollection.delete(id!)
      }

      toast.success('Delete success')

      await tx.isPersisted.promise
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [id])

  return (
    <Card className="p-4">
      <CardContent className="space-y-1 p-0">
        <h3 className="text-lg font-semibold">
          {name} ({stock})
        </h3>
        <p>{category}</p>
        <p className="font-semibold">Rp {price}</p>
        <div className="flex flex-row items-center size-12 gap-x-3 justify-end w-full">
          <CreateDialog variant={variant} id={id}>
            <Edit strokeWidth={1.5} className="text-green-700" />
          </CreateDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Trash2 strokeWidth={1.5} className="text-red-500" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
