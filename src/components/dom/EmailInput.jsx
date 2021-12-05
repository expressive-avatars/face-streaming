import { useLocalStorage } from '@/hooks/useLocalStorate'
import { useState } from 'react'
import { tw } from 'twind'

export function EmailInput({ onChange = () => {} }) {
  const [value, setValue] = useLocalStorage('email')
  return (
    <div className={tw`bg-gray-200 border rounded-lg p-4 flex gap-2`}>
      <input className={tw`px-2 py-1`} onChange={(e) => setValue(e.target.value)} value={value} placeholder="Enter your email" />
      <button className={tw`bg-blue-500 px-2 py-1 text-white font-semibold rounded`} onClick={() => onChange(value)}>
        Start
      </button>
    </div>
  )
}
