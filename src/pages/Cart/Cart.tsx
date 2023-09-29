import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useEffect, useContext, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import Button from 'src/components/Button'
import QuantityController from 'src/components/QuantityController'
import path from 'src/constants/path'
import { purchasesStatus } from 'src/constants/purchase'
import { Purchase } from 'src/types/purchase.type'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import { produce } from 'immer'
import { keyBy } from 'lodash'
import { toast } from 'react-toastify'
import { AppContext } from 'src/contexts/app.context'
import noproduct from 'src/assets/images/noproduct.png'

export default function Cart() {
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const { data: purchasesInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: () => purchaseApi.getPurchases({ status: purchasesStatus.inCart })
  })

  const updatePurchasMutation = useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onSuccess: () => {
      refetch()
    }
  })
  const buyProductMutation = useMutation({
    mutationFn: purchaseApi.buyProducts,
    onSuccess: (data) => {
      refetch()
      toast.success(data.data.message, {
        position: 'top-center',
        autoClose: 1000
      })
    }
  })
  const deletePurchasesMutation = useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onSuccess: () => {
      refetch()
    }
  })
  const location = useLocation()
  const choosenPurchaseIdFromLocation = (location.state as { purchaseId: string | null })?.purchaseId

  const purchasesInCart = purchasesInCartData?.data.data
  // console.log(purchasesInCartData?.config.headers.authorization)

  const isAllChecked = useMemo(() => extendedPurchases.every((purchase) => purchase.checked), [extendedPurchases])
  const checkedPurchase = useMemo(() => extendedPurchases.filter((purchase) => purchase.checked), [extendedPurchases])
  const checkedPurchaseCount = checkedPurchase.length
  const totalCheckedPurchasePrice = useMemo(
    () =>
      checkedPurchase.reduce((result, current) => {
        return result + current.product.price * current.buy_count
      }, 0),
    [checkedPurchase]
  )
  const totalCheckedPurchaseSavingPrice = useMemo(
    () =>
      checkedPurchase.reduce((result, current) => {
        return result + (current.price_before_discount - current.product.price) * current.buy_count
      }, 0),
    [checkedPurchase]
  )
  // UseEffect...
  useEffect(() => {
    setExtendedPurchases((prev) => {
      const extendedPurchaseObject = keyBy(prev, '_id')
      // console.log(extendedPurchaseObject)

      return (
        purchasesInCart?.map((purchase) => {
          const isChoosenPurchaseFromLocation = choosenPurchaseIdFromLocation === purchase._id
          return {
            ...purchase,
            disabled: false,
            checked: isChoosenPurchaseFromLocation || Boolean(extendedPurchaseObject[purchase._id]?.checked)
          }
        }) || []
      )
    })
  }, [purchasesInCart, choosenPurchaseIdFromLocation])

  useEffect(() => {
    return () => {
      history.replaceState(null, '')
    }
  }, [])

  // Function
  const handleChecked = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].checked = event.target.checked
        // console.log('Checked product:' + productIndex)
      })
    )
  }
  const handleCheckedAll = () => {
    setExtendedPurchases((prev) =>
      prev.map((purchase) => ({
        ...purchase,
        checked: !isAllChecked
      }))
    )
  }

  const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      })
    )
  }

  // purchaseIndex: lay ra vi tri san pham, value: truyen gia tri quantity moi
  const handleQuantity = (purchaseIndex: number, value: number, enabled: boolean) => {
    if (enabled) {
      // san pham tai vi tri purchaseIndex

      const purchase = extendedPurchases[purchaseIndex]
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      updatePurchasMutation.mutate({
        product_id: purchase.product._id,
        buy_count: value
      })
    }
  }

  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchasesMutation.mutate([purchaseId])
  }
  const handleDeleteManyPurchases = () => {
    const purchaseIds = checkedPurchase.map((purchase) => purchase._id)
    deletePurchasesMutation.mutate(purchaseIds)
  }
  const handleBuyProduct = () => {
    if (checkedPurchase.length > 0) {
      const body = checkedPurchase.map((purchase) => ({
        product_id: purchase.product._id,
        buy_count: purchase.buy_count
      }))
      buyProductMutation.mutate(body as any)
    }
  }

  return (
    <div className='bg-neutral-100 py-16 '>
      <div className='container'>
        {extendedPurchases.length > 0 ? (
          <>
            <div className='overflow-auto'>
              <div className='min-w-[1000px]'>
                <div className='grid grid-cols-12 rounded-sm bg-white py-5 px-9 text-sm capitalize text-gray-500 shadow'>
                  <div className='col-span-6 '>
                    <div className='flex items-center'>
                      <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                        <input
                          type='checkbox'
                          className='h-5 w-5 accent-orangeShopee'
                          checked={isAllChecked}
                          onChange={handleCheckedAll}
                        />
                      </div>
                      <div className='flex-grow text-black'>Sản phẩm</div>
                    </div>
                  </div>
                  <div className='col-span-6'>
                    <div className='grid-cols-5 grid text-center'>
                      <div className='col-span-2'>Đơn giá</div>
                      <div className='col-span-1'>Số lượng</div>
                      <div className='col-span-1'>Số Tiền</div>
                      <div className='col-span-1'>Thao tác</div>
                    </div>
                  </div>
                </div>
                {/* Body */}
                {extendedPurchases.length > 0 && (
                  <div className='my-3 rounded-sm bg-white p-5 shadow'>
                    {extendedPurchases.map((purchase, index) => (
                      <div
                        key={purchase._id}
                        className='grid grid-cols-12 text-center rounded-sm border border-gray-200 bg-white py-5 px-4 text-sm text-gray-500 mb-5 items-center first:mt-0'
                      >
                        <div className='col-span-6'>
                          <div className='flex'>
                            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                              <input
                                type='checkbox'
                                className='h-5 w-5 accent-orangeShopee'
                                checked={purchase.checked}
                                onChange={handleChecked(index)}
                              />
                            </div>
                            <div className='flex-grow'>
                              <div className='flex'>
                                <Link
                                  to={`${path.home}${generateNameId({
                                    name: purchase.product.name,
                                    id: purchase.product._id
                                  })}`}
                                  className='h-20 w-20 flex-shrink-0 '
                                >
                                  <img src={purchase.product.image} alt={purchase.product.name} />
                                </Link>
                                <div className='flex-grow px-5 pt-1 pb-2'>
                                  <Link
                                    to={`${path.home}${generateNameId({
                                      name: purchase.product.name,
                                      id: purchase.product._id
                                    })}`}
                                    className='line-clamp-2 text-left '
                                  >
                                    {purchase.product.name}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='col-span-6'>
                          <div className='grid grid-cols-5 items-center'>
                            <div className='col-span-2'>
                              <div className='flex items-center justify-center'>
                                <span className='text-gray-300 line-through'>
                                  ₫{formatCurrency(purchase.product.price_before_discount)}
                                </span>
                                <span className='ml-3'>₫{formatCurrency(purchase.product.price)}</span>
                              </div>
                            </div>
                            <div className='col-span-1'>
                              <QuantityController
                                max={purchase.product.quantity}
                                value={purchase.buy_count}
                                classNameWrapper='flex items-center'
                                onIncrease={(value) => handleQuantity(index, value, value <= purchase.product.quantity)}
                                onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                                onType={handleTypeQuantity(index)}
                                onFocusOut={(value) =>
                                  handleQuantity(
                                    index,
                                    value,
                                    value >= 1 &&
                                      value <= purchase.product.quantity &&
                                      value !== (purchasesInCart as Purchase[])[index].buy_count
                                  )
                                }
                                disabled={purchase.disabled}
                              ></QuantityController>
                            </div>
                            <div className='col-span-1'>
                              <span className='text-orangeShopee'>
                                ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                              </span>
                            </div>
                            <div className='col-span-1'>
                              <button
                                className='bg-none text-black transition-colors hover:text-orangeShopee'
                                onClick={handleDelete(index)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Sticky */}
            <div className='sticky bottom-0 z-10 flex flex-col sm:flex-row sm:items-center rounded-sm bg-white p-5 shadow border-gray-100 mt-8'>
              <div className='flex items-center'>
                <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                  <input
                    type='checkbox'
                    className='h-5 w-5 accent-orangeShopee'
                    checked={isAllChecked}
                    onChange={handleCheckedAll}
                  />
                </div>
                <button className='mx-3 border-none bg-none'>Chọn tất cả ({extendedPurchases.length})</button>
                <button className='mx-3 border-none bg-none' onClick={handleDeleteManyPurchases}>
                  Xóa
                </button>
              </div>

              <div className='sm:ml-auto flex flex-col sm:flex-row sm:items-center mt-5 sm:mt-0'>
                <div className=''>
                  <div className='flex items-center sm:justify-end'>
                    <div className=''>Tổng thanh toán ({checkedPurchaseCount} sản phẩm):</div>
                    <div className='ml-2 text-2xl text-orangeShopee'>₫{formatCurrency(totalCheckedPurchasePrice)} </div>
                  </div>
                  <div className='flex items-center sm:justify-end text-sm'>
                    <div className='text-gray-500'>Tiết kiệm</div>
                    <div className='ml-6 text-orangeShopee'>₫{formatCurrency(totalCheckedPurchaseSavingPrice)}</div>
                  </div>
                </div>
                <Button
                  className='ml-4 mt-5 sm:mt-0 flex h-10 w-52  items-center justify-center bg-red-500 text-sm uppercase text-white hover:bg-red-600'
                  onClick={handleBuyProduct}
                  disabled={buyProductMutation.isLoading}
                >
                  Mua hàng
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='text-center'>
            <img src={noproduct} alt='no purchase' className='h-24 w-24 mx-auto' />
            <div className='font-bold mt-5 text-gray-400'>Giỏ hàng của bạn còn trống</div>
            <div className='text-center mt-5'>
              <Link
                to={path.home}
                className=' bg-orangeShopee rounded-sm px-10 py-2 uppercase text-white hover:bg-orangeShopee/80 transition-all'
              >
                Mua ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
