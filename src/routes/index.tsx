import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useGetAllProducts, useGetRxProducts } from '@/queries/useProduct'
import { Spinner } from '@/components/ui/spinner'
import { CreateDialog } from '@/components/create-dialog'
import { ProductCard } from '@/components/product-card'
import { replicationState } from '@/db/rxdb'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon, RefreshCcwIcon } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data: rxData, isLoading: rxLoading } = useGetRxProducts()
  const { data: productData, isLoading: productLoading } = useGetAllProducts()
  const [isSyncRx, setIsSyncRx] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const activeSubscription = replicationState.active$.subscribe((active) =>
      setIsSyncRx(active),
    )

    const errorSubscription = replicationState.error$.subscribe((error) =>
      setSyncError(error.message),
    )

    return () => {
      activeSubscription.unsubscribe()
      errorSubscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h2>RX Product list</h2>
        <CreateDialog variant="rx">
          <Button className="bg-blue-500">Add Dummy</Button>
        </CreateDialog>
      </div>
      {syncError && !isSyncRx && (
        <Alert variant={'destructive'}>
          <AlertCircleIcon />
          <AlertTitle>Failed Sync Data</AlertTitle>
          <AlertDescription>
            {syncError}
            <Button
              onClick={() => replicationState.reSync()}
              className="mt-2"
              variant={'secondary'}
            >
              Retry Sync
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {isSyncRx && (
        <Alert>
          <RefreshCcwIcon className="animate-spin" />
          <AlertTitle>Sync is Running...</AlertTitle>
        </Alert>
      )}
      <div className="grid grid-cols-3 lg:grid-cols-6 mt-6 gap-4">
        {rxLoading ? (
          <div className="col-span-3 lg:col-span-6 flex justify-center items-center mt-8">
            <Spinner className="size-10 text-blue-500" />
          </div>
        ) : (
          rxData.map((product, index) => (
            <ProductCard {...product} key={index} variant="rx" />
          ))
        )}
      </div>
      <div className="flex justify-between items-center mt-14">
        <h2>Product list</h2>
        <CreateDialog variant="query">
          <Button className="bg-blue-500">Add Dummy</Button>
        </CreateDialog>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 mt-6 gap-4">
        {productLoading ? (
          <div className="col-span-3 lg:col-span-6 flex justify-center items-center mt-8">
            <Spinner className="size-10 text-blue-500" />
          </div>
        ) : (
          productData.map((product, index) => (
            <ProductCard {...product} key={index} variant="query" />
          ))
        )}
      </div>
    </div>
  )
}
