import type { RegisterOptions, UseFormGetValues } from 'react-hook-form'
import * as yup from 'yup'
type Rules = { [key in 'email' | 'password' | 'confirm_password']?: RegisterOptions }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRules = (getValues?: UseFormGetValues<any>): Rules => ({
  email: {
    required: {
      value: true,
      message: 'Email la bat buoc'
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Email khong hop le'
    },
    maxLength: {
      value: 160,
      message: 'Do dai 5-160 ky tu'
    },
    minLength: {
      value: 5,
      message: 'Do dai 5-160 ky tu'
    }
  },
  password: {
    required: {
      value: true,
      message: 'Mat khau la bat buoc'
    },
    maxLength: {
      value: 160,
      message: 'Do dai 6-160 ky tu'
    },
    minLength: {
      value: 6,
      message: 'Do dai 6-160 ky tu'
    }
  },
  confirm_password: {
    required: {
      value: true,
      message: 'Nhap lai mat khau la bat buoc'
    },
    maxLength: {
      value: 160,
      message: 'Do dai 6-160 ky tu'
    },
    minLength: {
      value: 6,
      message: 'Do dai 6-160 ky tu'
    },
    validate:
      typeof getValues == 'function' ? (value) => value === getValues('password') || 'Mat khau khong khop' : undefined
  }
})

export const schema = yup.object({
  email: yup
    .string()
    .required('Email la bat buoc')
    .email('Email khong dung dinh dang')
    .min(5, 'Do dai tu 5-160 ky tu')
    .max(160, 'Do dai tu 5-160 ky tu'),
  password: yup
    .string()
    .required('Mat khau la bat buoc')
    .min(6, 'Do dai tu 6-160 ky tu')
    .max(160, 'Do dai tu 6-160 ky tu'),
  confirm_password: yup
    .string()
    .required('Nhap lai mat khau la bat buoc')
    .min(6, 'Do dai tu 6-160 ky tu')
    .max(160, 'Do dai tu 6-160 ky tu')
    .oneOf([yup.ref('password')], 'Nhap lai password khong khop'),
  price_min: yup
    .string()
    .required()
    .test({
      name: 'price-not-allowed',
      message: 'Giá không phù hợp',
      test: function (value) {
        const price_min = value
        const { price_max } = this.parent as { price_min: string; price_max: string }
        if (price_min !== '' && price_max !== '') {
          return Number(price_max) >= Number(price_min)
        }
        return price_min !== '' || price_max !== ''
      }
    }),
  price_max: yup
    .string()
    .required()
    .test({
      name: 'price-not-allowed',
      message: 'Giá không phù hợp',
      test: function (value) {
        const price_max = value
        const { price_min } = this.parent as { price_min: string; price_max: string }
        if (price_min !== '' && price_max !== '') {
          return Number(price_max) >= Number(price_min)
        }
        return price_min !== '' || price_max !== ''
      }
    }),
  name: yup.string().trim().required('Tên là bắt buộc')
})

export const userSchema = yup.object({
  name: yup.string().required().max(160, 'Độ dài tối đa là 160 kí tự'),
  phone: yup.string().required().max(20, 'Độ dài tối đa là 20 kí tự'),
  avatar: yup.string().required().max(1000, 'avatar'),
  address: yup.string().required().max(160, 'Độ dài tối đa là 160 kí tự'),
  date_of_birth: yup.date().required().max(new Date(), 'Hãy chọn một ngày trước hôm nay'),
  password: yup
    .string()
    .required('Mat khau la bat buoc')
    .min(6, 'Do dai tu 6-160 ky tu')
    .max(160, 'Do dai tu 6-160 ky tu'),
  new_password: yup
    .string()
    .required('Mat khau la bat buoc')
    .min(6, 'Do dai tu 6-160 ky tu')
    .max(160, 'Do dai tu 6-160 ky tu'),
  confirm_password: yup
    .string()
    .required('Nhap lai mat khau la bat buoc')
    .min(6, 'Do dai tu 6-160 ky tu')
    .max(160, 'Do dai tu 6-160 ky tu')
    .oneOf([yup.ref('new_password')], 'Nhap lai password khong khop')
})

const loginSchema = schema.omit(['confirm_password'])
export type LoginSchema = yup.InferType<typeof loginSchema>
export type Schema = yup.InferType<typeof schema>
export type UserSchema = yup.InferType<typeof userSchema>
