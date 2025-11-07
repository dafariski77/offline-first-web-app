import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { productSchema, type Product } from '@/schemas/product'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { toast } from 'sonner'
import { rxProductCollection } from '@/collections/rx-product'
import { productCollection } from '@/collections/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 } from 'uuid'
import { useEffect, useState } from 'react'

interface CreateDialogProps {
  children: ReactNode
  variant: 'rx' | 'query'
  id?: string
}

export function CreateDialog({ children, variant, id }: CreateDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
  })

  // fill form with existing data
  useEffect(() => {
    if (id) {
      let collection

      if (variant === 'query') {
        collection = productCollection.get(id)
      } else {
        collection = rxProductCollection.get(id)
      }

      if (collection) {
        form.setValue('name', collection.name)
        form.setValue('category', collection.category)
        form.setValue('price', collection.price)
        form.setValue('stock', collection.stock)
      }
    }
  }, [id, open])

  // helper for insert data to collection
  const insertData = async (values: Product) => {
    try {
      const data = {
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
        id: v4(),
      }

      let tx

      // checking variant
      if (variant === 'rx') {
        tx = rxProductCollection.insert(data)
      } else {
        tx = productCollection.insert(data)
      }
      toast.success('Insert success')
      form.reset()
      setOpen(false)

      await tx.isPersisted.promise
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  // helper for update existing data
  const updateData = async (id: string, values: Product) => {
    try {
      const data = {
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
      }

      let tx

      // checking variant
      if (variant === 'rx') {
        tx = rxProductCollection.update(id, (draft) => {
          draft.category = data.category
          draft.name = data.name
          draft.price = data.price
          draft.stock = data.stock
        })
      } else {
        tx = productCollection.update(id, (draft) => {
          draft.category = data.category
          draft.name = data.name
          draft.price = data.price
          draft.stock = data.stock
        })
      }
      toast.success('Update success')
      form.reset()
      setOpen(false)

      await tx.isPersisted.promise
    } catch (error) {
      console.error(error)
      toast.error((error as Error).message)
    }
  }

  // submit handler
  const onSubmit = async (values: Product) => {
    if (id) {
      updateData(id, values)

      return
    }

    insertData(values)

    return
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama produk..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category produk..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="20000"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
