import classNames from 'classnames'
import { Link, createSearchParams } from 'react-router-dom'
import path from 'src/constants/path'
import { QueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QueryConfig
  pageSize: number
}
const RANGE = 2
export default function Pagination({ queryConfig, pageSize }: Props) {
  const pageCurrent = Number(queryConfig.page)

  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span key={index} className='bg-white rounded px-3 py-2 shadow-sm mx-2  border'>
            ...
          </span>
        )
      }
      return null
    }
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span key={index} className='bg-white rounded px-3 py-2 shadow-sm mx-2  border'>
            ...
          </span>
        )
      }
      return null
    }
    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        // Neu pageCurrent <= 5 va pageNumber > pageCurrent RANGE don vi && pageNumber < pageSize - RANGE - 1 don vi (hien thi 2 page cuoi)
        if (pageCurrent <= RANGE * 2 + 1 && pageNumber > pageCurrent + RANGE && pageNumber < pageSize - RANGE - 1) {
          return renderDotAfter(index)
        } else if (pageCurrent > RANGE * 2 + 1 && pageCurrent < pageSize - RANGE * 2) {
          if (pageNumber < pageCurrent - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } else if (pageNumber > pageCurrent + RANGE && pageNumber < pageSize - RANGE + 1) {
            return renderDotAfter(index)
          }
        } else if (pageCurrent >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < pageCurrent - RANGE) {
          return renderDotBefore(index)
        }
        return (
          <Link
            to={{
              pathname: path.home,
              search: createSearchParams({
                ...queryConfig,
                page: pageNumber.toString()
              }).toString()
            }}
            key={index}
            className={classNames('bg-white rounded px-3 py-2 shadow-sm mx-2 cursor-pointer border', {
              'border-cyan-500': pageNumber === pageCurrent,
              'border-transparent': pageNumber !== pageCurrent
            })}
          >
            {pageNumber}
          </Link>
        )
      })
  }
  return (
    <div className='flex flex-wrap mt-6 justify-center'>
      {pageCurrent === 1 ? (
        <span className='bg-white rounded px-3 py-2 shadow-sm mx-2 cursor-not-allowed border'>Prev</span>
      ) : (
        <Link
          to={{
            pathname: path.home,
            search: createSearchParams({
              ...queryConfig,
              page: (pageCurrent - 1).toString()
            }).toString()
          }}
          className='bg-white rounded px-3 py-2 shadow-sm mx-2 cursor-pointer border'
        >
          Prev
        </Link>
      )}
      {renderPagination()}
      {pageCurrent === pageSize ? (
        <span className='bg-white rounded px-3 py-2 shadow-sm mx-2 cursor-not-allowed border'>Next</span>
      ) : (
        <Link
          to={{
            pathname: path.home,
            search: createSearchParams({
              ...queryConfig,
              page: (pageCurrent + 1).toString()
            }).toString()
          }}
          className='bg-white rounded px-3 py-2 shadow-sm mx-2 cursor-pointer border'
        >
          Next
        </Link>
      )}
    </div>
  )
}
