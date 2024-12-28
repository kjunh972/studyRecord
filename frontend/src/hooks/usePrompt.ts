import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useBlocker } from 'react-router-dom'

export function usePrompt(message: string, when = true) {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [nextLocation, setNextLocation] = useState<string | null>(null)
  const [isBlocking, setIsBlocking] = useState(false)

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (when) {
        e.preventDefault()
        return message
      }
    },
    [when, message]
  )

  const handleBlock = useCallback(
    ({ currentLocation, nextLocation }: { currentLocation: any, nextLocation: any }) => {
      if (when && !isBlocking && nextLocation.pathname !== currentLocation.pathname) {
        setIsBlocking(true)
        setShowDialog(true)
        setNextLocation(nextLocation.pathname)
        return true
      }
      return false
    },
    [when, isBlocking]
  )

  const handleConfirm = useCallback(() => {
    setShowDialog(false)
    setIsBlocking(false)
    if (nextLocation) {
      navigate(nextLocation)
    }
  }, [navigate, nextLocation])

  const handleCancel = useCallback(() => {
    setShowDialog(false)
    setIsBlocking(false)
    setNextLocation(null)
  }, [])

  useBlocker(handleBlock)

  useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [when, handleBeforeUnload])

  return {
    showDialog,
    handleCancel,
    handleConfirm,
    message
  }
} 