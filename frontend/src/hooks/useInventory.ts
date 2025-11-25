
// Transfer Stok Hooks
// export const useTransfers = (filters?: any) => {
//   return useQuery({
//     queryKey: ['transfers', filters],
//     queryFn: () => inventoryService.getTransfers(filters),
//   })
// }

// export const useTransfer = (id: number) => {
//   return useQuery({
//     queryKey: ['transfer', id],
//     queryFn: () => inventoryService.getTransfer(id),
//     enabled: !!id,
//   })
// }

// export const useCreateTransfer = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: any) => inventoryService.createTransfer(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['transfers'] })
//       toast.success('Transfer stok berhasil dibuat!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal membuat transfer stok')
//     },
//   })
// }

// export const useApproveTransfer = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: number) => inventoryService.approveTransfer(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['transfers'] })
//       toast.success('Transfer stok berhasil disetujui!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal menyetujui transfer stok')
//     },
//   })
// }

// export const useShipTransfer = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: number) => inventoryService.shipTransfer(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['transfers'] })
//       toast.success('Transfer stok berhasil dikirim!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal mengirim transfer stok')
//     },
//   })
// }

// export const useDeliverTransfer = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: number) => inventoryService.deliverTransfer(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['transfers'] })
//       toast.success('Transfer stok berhasil diterima!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal menerima transfer stok')
//     },
//   })
// }

// // Pergerakan Stok Hooks
// export const useStockMovements = (filters?: any) => {
//   return useQuery({
//     queryKey: ['stock-movements', filters],
//     queryFn: () => inventoryService.getStockMovements(filters)
//   })
// }

// export const useStockMovement = (id: number) => {
//   return useQuery({
//     queryKey: ['stock-movement', id],
//     queryFn: () => inventoryService.getStockMovement(id),
//     enabled: !!id,
//   })
// }

// export const useCreateStockAdjustment = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (data: any) => inventoryService.createStockAdjustment(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
//       toast.success('Penyesuaian stok berhasil dibuat!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal membuat penyesuaian stok')
//     },
//   })
// }

// // Alert Stok Hooks
// export const useStockAlerts = (filters?: any) => {
//   return useQuery({
//     queryKey: ['stock-alerts', filters],
//     queryFn: () => inventoryService.getStockAlerts(filters),
//   })
// }

// export const useUnresolvedAlerts = () => {
//   return useQuery({
//     queryKey: ['unresolved-alerts'],
//     queryFn: () => inventoryService.getUnresolvedAlerts()
//   })
// }

// export const useResolveAlert = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: (id: number) => inventoryService.resolveAlert(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['stock-alerts'] })
//       queryClient.invalidateQueries({ queryKey: ['unresolved-alerts'] })
//       toast.success('Alert stok berhasil diselesaikan!')
//     },
//     onError: (error: any) => {
//       toast.error(error.response?.data?.message || 'Gagal menyelesaikan alert stok')
//     },
//   })
// }
