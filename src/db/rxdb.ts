import { createRxDatabase } from 'rxdb/plugins/core'
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv'
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage'
import { replicateRxCollection } from 'rxdb/plugins/replication'

/**
 * Creating database with rxdb, the data will be stored on localStorage
 */
export const db = await createRxDatabase({
  name: 'my-db',
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage(),
  }),
  multiInstance: false,
  eventReduce: true,
})

/**
 * Creating product collection with schema options
 */
await db.addCollections({
  products: {
    schema: {
      version: 0,
      primaryKey: 'id',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          maxLength: 1000,
        },
        name: {
          type: 'string',
        },
        price: {
          type: 'number',
        },
        stock: {
          type: 'number',
        },
        category: {
          type: 'string',
        },
      },
      required: ['id', 'price', 'name', 'stock', 'category'],
    },
  },
})

/**
 * Replication for sync data between local and server
 */
export const replicationState = await replicateRxCollection({
  collection: db.products,
  replicationIdentifier: 'products-replication',
  // pulling data from server
  pull: {
    handler: async (lastCheckpoint) => {
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'GET',
      })

      const data = await response.json()

      // cleaning data from server
      const cleanedDocs = data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        price: doc.price,
        stock: doc.stock,
        category: doc.category,
      }))

      return {
        documents: cleanedDocs,
        checkpoint: lastCheckpoint,
      }
    },
  },
  // pushing local changes to server
  push: {
    handler: async (docs) => {
      console.log('push handler', docs)

      const conflicts: any = []

      await Promise.all(
        docs.map(async (changeRow) => {
          try {
            const doc = changeRow.newDocumentState
            const previousDoc = changeRow.assumedMasterState

            const isDelete = doc._deleted
            const isUpdate = previousDoc && !isDelete
            const isCreate = !previousDoc && !isDelete

            // delete when data alrady deleted on local
            if (isDelete) {
              const rawResponse = await fetch(
                `http://localhost:8000/api/products/${doc.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              )

              if (!rawResponse.ok) {
                const error = await rawResponse.json()
                console.error('Failed to delete document:', error)
                conflicts.push({
                  assumedMasterState: changeRow.assumedMasterState,
                  newDocumentState: changeRow.newDocumentState,
                })
              } else {
                console.log('Successfully deleted:', doc.id)
              }
              // update conflict data (local data is the real data)
            } else if (isUpdate) {
              console.log('Updating document:', doc.id)

              const body = {
                name: doc.name,
                category: doc.category,
                price: doc.price,
                stock: doc.stock,
              }

              const rawResponse = await fetch(
                `http://localhost:8000/api/products/${doc.id}`,
                {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(body),
                },
              )

              if (!rawResponse.ok) {
                const error = await rawResponse.json()
                console.error('Failed to update document:', error)
                conflicts.push({
                  assumedMasterState: changeRow.assumedMasterState,
                  newDocumentState: changeRow.newDocumentState,
                })
              } else {
                const response = await rawResponse.json()
                console.log('Successfully updated:', response)
              }
              // Insert new data from local to server
            } else if (isCreate) {
              console.log('Creating document:', doc.id)

              const body = {
                id: doc.id,
                name: doc.name,
                category: doc.category,
                price: doc.price,
                stock: doc.stock,
              }

              const rawResponse = await fetch(
                'http://localhost:8000/api/products',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(body),
                },
              )

              if (!rawResponse.ok) {
                const error = await rawResponse.json()
                console.error('Failed to create document:', error)
                conflicts.push({
                  assumedMasterState: changeRow.assumedMasterState,
                  newDocumentState: changeRow.newDocumentState,
                })
              } else {
                const response = await rawResponse.json()
                console.log('Successfully created:', response)
              }
            }
          } catch (error) {
            console.error('Error in push handler:', error)
            conflicts.push({
              assumedMasterState: changeRow.assumedMasterState,
              newDocumentState: changeRow.newDocumentState,
            })
          }
        }),
      )

      // Return empty array if all successful, or array of conflicts
      return conflicts
    },
  },
  autoStart: true,
  retryTime: 8000,
  waitForLeadership: false,
})

// get online status
let isOnline = navigator.onLine

// Subscribing events
replicationState.received$.subscribe((doc) => {
  console.log('received docs', doc)
})

replicationState.sent$.subscribe((doc) => {
  console.log('push doc to server', doc)
})

replicationState.error$.subscribe((error) => {
  console.log('error when running sync', error)
})

replicationState.active$.subscribe((status) => {
  console.log('is replication cycle running?', status)
})

// set online status and reSync when online
window.addEventListener('online', () => {
  isOnline = true
  replicationState.reSync()
})

// set online status
window.addEventListener('offline', () => {
  isOnline = false
})

// helper function to get online status
export const getOnlineStatus = () => {
  return isOnline
}
